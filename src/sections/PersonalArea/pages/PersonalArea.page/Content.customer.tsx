import { BreadCrumbs, Page, PageContent, PageTop } from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import PersonalAreaNavItem from 'sections/PersonalArea/components/PersonalAreaNavItem';
import { isUserRequestsBanned } from 'sections/Users/utils';
import { RequestsBannedAlert } from 'sections/PersonalArea/components/RequestsBannedAlert';
import { useLocale } from 'hooks/locale.hook';
import { IPersonalAreaNavItem } from 'sections/PersonalArea/interfaces';
import { generateInnerUrl } from 'utils/common.utils';
import { useAuth } from 'hooks/auth.hook';
import { useMessenger } from 'hooks/messenger.hook';
import { FC } from 'react';

interface IProps {
  pendingPostponedPaymentsNumber: number;
}

const PersonalAreaCustomerContent: FC<IProps> = ({
  pendingPostponedPaymentsNumber,
}) => {
  const auth = useAuth();
  const { unreadNotificationsCount } = useMessenger();
  const { locale } = useLocale();

  const menuLarge: IPersonalAreaNavItem[] = [
    {
      path: generateInnerUrl(APP_PATHS.CUSTOM_ORDER),
      text: locale.navigation.neworder,
      img: '/img/camera.svg',
    },
    {
      path: generateInnerUrl(APP_PATHS.CATALOG),
      text: locale.catalog.spareParts,
      img: '/img/catalog.svg',
    },
    {
      path: generateInnerUrl(APP_PATHS.CATALOG_EXTERNAL),
      text: locale.pages.catalogExternal.title,
      img: '/img/icons/catalog.svg',
    },
  ];
  const menu: IPersonalAreaNavItem[] = [
    {
      path: generateInnerUrl(APP_PATHS.ORDER_REQUEST_LIST, {
        searchParams: { page: null },
      }),
      text: locale.other.requests,
      img: '/img/icons/requests.svg',
      notificationsNumber: unreadNotificationsCount.orderRequests,
      isBlocked:
        auth.isAuthenticated &&
        isUserRequestsBanned(auth.user, auth.currentRole.id),
    },
    {
      path: generateInnerUrl(APP_PATHS.ORDER_LIST, {
        searchParams: { page: null },
      }),
      text: locale.navigation.orders,
      img: '/img/icons/orders.svg',
      notificationsNumber: unreadNotificationsCount.orders,
    },
    {
      path: generateInnerUrl(APP_PATHS.ORDER_HISTORY_LIST, {
        text: locale.navigation['orders-history'],
        searchParams: { page: null },
      }),
      text: locale.orders.ordersHistoryList,
      img: '/img/icons/order-history.svg',
      notificationsNumber: unreadNotificationsCount.orderHistory,
    },
    {
      path: generateInnerUrl(APP_PATHS.REFUND_LIST, {
        searchParams: { page: null },
      }),
      text: locale.navigation.refunds,
      img: '/img/icons/refunds.svg',
      notificationsNumber: unreadNotificationsCount.refunds,
    },
    {
      path: generateInnerUrl(APP_PATHS.USER_SETTINGS, {
        text: locale.navigation['user-settings'],
      }),
      text: locale.navigation['user-settings'],
      img: '/img/icons/user-data.svg',
    },
    {
      path: generateInnerUrl(APP_PATHS.FAVORITES),
      text: locale.navigation.favorites,
      img: '/img/icons/bookmarks.svg',
    },
    {
      path: generateInnerUrl(APP_PATHS.SALE_PRODUCT_LIST),
      text: locale.common.productSale,
      img: '/img/icons/sale.svg',
    },
    {
      path: generateInnerUrl(APP_PATHS.POSTPONED_PAYMENT_LIST),
      text: locale.common.postponedPayments,
      img: '/img/icons/postponed-payments.svg',
      notificationsNumber: pendingPostponedPaymentsNumber || 0,
    },
  ];

  return (
    <Page className="personal-area-page">
      <BreadCrumbs list={[]} />
      <PageTop title={locale.common.personalArea} />
      <PageContent>
        <ul className="personal-area-page__nav-list nav-list--large">
          {menuLarge.map((item, i) => (
            <PersonalAreaNavItem key={i} {...item} />
          ))}
        </ul>
        <ul className="personal-area-page__nav-list">
          {menu.map((item, i) => (
            <PersonalAreaNavItem key={i} {...item} />
          ))}
        </ul>

        {auth.isAuthenticated &&
          isUserRequestsBanned(auth.user, auth.currentRole.id) && (
            <RequestsBannedAlert />
          )}
      </PageContent>
    </Page>
  );
};

export default PersonalAreaCustomerContent;
