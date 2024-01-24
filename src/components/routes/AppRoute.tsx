import { PagePreloader } from 'components/common';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';
import { APP_PATHS } from 'data/paths.data';
import { STRINGS } from 'data/strings.data';
import { useAuth } from 'hooks/auth.hook';
import { useMessenger } from 'hooks/messenger.hook';
import { useNotifications } from 'hooks/notifications.hooks';
import { INotification } from 'hooks/notifications.hooks/interfaces';
import { useRouter } from 'next/router';
import { FC, ReactNode, useEffect, useState } from 'react';
import { IUserRoleLabelsDefault } from 'sections/Users/interfaces';
import { isUserBanned, isUserRequestsBanned } from 'sections/Users/utils';
import socketService from 'services/socket';
import { generateUrl } from 'utils/common.utils';

interface IProps {
  // 1 - only authenticated users, 0 - everyone, -1 - only non authenticated users
  authIsRequired: 1 | 0 | -1;
  requiredUserRole?: IUserRoleLabelsDefault | IUserRoleLabelsDefault[];
  waitTillOnload?: boolean;
  children: ReactNode;
}

const AppRoute: FC<IProps> = ({
  authIsRequired,
  requiredUserRole,
  waitTillOnload = true,
  children,
}) => {
  const auth = useAuth();
  const { newUnreadNotifications } = useMessenger();
  const router = useRouter();
  const { handleNewNotification } = useNotifications();
  const [contentAccess, setContentAccess] = useState(false);

  useEffect(() => {
    if (!auth.isLoaded) return;

    if (authIsRequired === 1) {
      // Redirect to login page if user is not authenticated
      if (!auth.isAuthenticated || !auth.user) {
        redirectUser(
          generateUrl(
            { history: DEFAULT_NAV_PATHS.LOGIN_CUSTOMER },
            { pathname: APP_PATHS.LOGIN_CUSTOMER },
          ),
        );
        return;
      }

      // Redirect to ban page if user or current user role is banned
      if (isUserBanned(auth.user, auth.currentRole.id)) {
        redirectUser(
          generateUrl(
            { history: DEFAULT_NAV_PATHS.BAN },
            { pathname: APP_PATHS.BAN },
          ),
        );
        return;
      }

      // Redirect to personal area page if user with banned requests is on a page related to requests
      if (
        router.pathname.includes(APP_PATHS.ORDER_REQUEST_LIST) &&
        isUserRequestsBanned(auth.user, auth.currentRole.id)
      ) {
        redirectUser(
          generateUrl(
            { history: DEFAULT_NAV_PATHS.PERSONAL_AREA, page: null },
            { pathname: APP_PATHS.PERSONAL_AREA },
          ),
        );
        return;
      }

      // SELLER
      if (auth?.currentRole?.label === 'seller') {
        if (!auth.user.sellerConfirmationDate) {
          // Check if seller sent application to register to an organization
          if (
            !auth.user?.sellerRegisterOrganizationId &&
            !auth.user?.sellers?.length
          ) {
            redirectUser(
              generateUrl(
                { history: DEFAULT_NAV_PATHS.REGISTER_SELLER_ORGANIZATION },
                { pathname: APP_PATHS.REGISTER_SELLER_ORGANIZATION },
              ),
            );
            return;
          }

          // Check if seller has filled information about himself
          if (!auth.user?.sellers?.length) {
            redirectUser(
              generateUrl(
                { history: DEFAULT_NAV_PATHS.REGISTER_SELLER_COMPLETE },
                { pathname: APP_PATHS.REGISTER_SELLER_COMPLETE },
              ),
            );
            return;
          }

          // Check if organization created by seller has rejections
          if (
            auth.user.createdOrganizations[0] &&
            auth.user.createdOrganizations[0].rejections.filter(
              el => !el.isResponded,
            ).length > 0
          ) {
            redirectUser(
              generateUrl(
                { history: DEFAULT_NAV_PATHS.REGISTER_SELLER_ORGANIZATION },
                { pathname: APP_PATHS.REGISTER_SELLER_ORGANIZATION },
              ),
            );
            return;
          }

          // Check if seller has rejections
          if (
            !!auth.user?.sellers[0]?.rejections.filter(el => !el.isResponded)
              ?.length
          ) {
            redirectUser(
              generateUrl(
                { history: DEFAULT_NAV_PATHS.REGISTER_SELLER_COMPLETE },
                { pathname: APP_PATHS.REGISTER_SELLER_COMPLETE },
              ),
            );
            return;
          }

          // Seller waits for account confirmation
          redirectUser(
            generateUrl(
              { history: DEFAULT_NAV_PATHS.ACCOUNT_REVIEW },
              { pathname: APP_PATHS.ACCOUNT_REVIEW },
            ),
          );
          return;
        }

        // Check if all seller's organization are banned
        /* if (
          auth?.user?.sellers?.filter(
            seller => !!seller?.organization?.bannedUntil,
          )?.length === auth?.user?.sellers?.length
        ) {
          redirectUser(
            generateUrl(
              {
                history: DEFAULT_NAV_PATHS.BAN,
              },
              {
                pathname: APP_PATHS.BAN,
              },
            ),
          );
          return;
        } */

        // Redirect from account review to personal area if seller is confirmed
        if (
          [
            APP_PATHS.ACCOUNT_REVIEW,
            APP_PATHS.REGISTER_SELLER_ORGANIZATION,
            APP_PATHS.REGISTER_SELLER_COMPLETE,
          ].includes(router.pathname)
        ) {
          redirectUser(
            generateUrl(
              { history: DEFAULT_NAV_PATHS.PERSONAL_AREA },
              { pathname: APP_PATHS.PERSONAL_AREA },
            ),
          );
          return;
        }
      }

      // Redirect to personal area page from ban page if user is not banned
      if (router.pathname === APP_PATHS.BAN) {
        redirectUser(
          generateUrl(
            { history: DEFAULT_NAV_PATHS.PERSONAL_AREA },
            { pathname: APP_PATHS.PERSONAL_AREA },
          ),
        );
        return;
      }

      // Redirect user to home page if he doesn't have required role
      if (typeof requiredUserRole !== 'undefined') {
        const requiredRolesArr: IUserRoleLabelsDefault[] = [].concat(
          requiredUserRole,
        );
        if (!requiredRolesArr.includes(auth?.currentRole?.label)) {
          redirectUser(
            generateUrl(
              { history: DEFAULT_NAV_PATHS.HOME },
              { pathname: APP_PATHS.HOME },
            ),
          );
          return;
        }
      }
    } else if (authIsRequired === -1 && auth.isAuthenticated) {
      redirectUser(
        generateUrl(
          { history: DEFAULT_NAV_PATHS.PERSONAL_AREA },
          { pathname: APP_PATHS.PERSONAL_AREA },
        ),
      );
      return;
    } else {
      if (
        auth.isAuthenticated &&
        isUserBanned(auth.user, auth.currentRole.id)
      ) {
        redirectUser(
          generateUrl(
            { history: DEFAULT_NAV_PATHS.BAN },
            { pathname: APP_PATHS.BAN },
          ),
        );
        return;
      }
    }

    if (
      auth.isAuthenticated &&
      (router.pathname.includes(APP_PATHS.CART) ||
        router.pathname.includes(APP_PATHS.CUSTOM_ORDER)) &&
      (isUserRequestsBanned(auth.user, auth.currentRole.id) ||
        isUserBanned(auth.user, auth.currentRole.id))
    ) {
      redirectUser(
        generateUrl(
          { history: DEFAULT_NAV_PATHS.HOME },
          { pathname: APP_PATHS.HOME },
        ),
      );
      return;
    }

    setContentAccess(true);

    try {
      (window as any)?.ym(93869993, 'hit', router.pathname, {
        params: {},
      });
    } catch (err) {
      console.log('Error while initialization Yandex metrics');
    }
  }, [auth.isLoaded]);

  useEffect(() => {
    if (!auth.isAuthenticated) return;
    // Notification listener
    socketService.socket
      .off(STRINGS.SERVER_NEW_NOTIFICATION)
      .on(STRINGS.SERVER_NEW_NOTIFICATION, (notification: INotification) => {
        handleNewNotification(notification);
      });
  }, [auth.isAuthenticated, newUnreadNotifications]);

  const redirectUser = (path: string) => {
    if (!path.includes(router.pathname)) {
      router.push(path);
    } else {
      setContentAccess(true);
    }
  };

  if (waitTillOnload && (!contentAccess || !router.isReady)) {
    return <PagePreloader />;
  }

  return <>{children}</>;
};

export default AppRoute;
