import { ClockCircleOutlined } from '@ant-design/icons';
import { BreadCrumbs, Page, PageContent } from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import socketService from 'services/socket';
import { useLocale } from 'hooks/locale.hook';
import { STRINGS } from 'data/strings.data';
import {
  INotification,
  INotificationDataType,
} from 'hooks/notifications.hooks/interfaces';
import { useNotifications } from 'hooks/notifications.hooks';

const AccountReviewSellerPage = () => {
  const { locale } = useLocale();
  const router = useRouter();
  const { handleNewNotification } = useNotifications();

  useEffect(() => {
    socketService.socket
      .off(STRINGS.SERVER_NEW_NOTIFICATION)
      .on(
        STRINGS.SERVER_NEW_NOTIFICATION,
        async (notification: INotification) => {
          handleNewNotification(notification);

          if (
            (
              [
                'organizationRegisterConfirmed',
                'organizationSellerRegisterConfirmed',
                'organizationRegisterRejected',
                'organizationSellerRegisterRejected',
              ] as (keyof INotificationDataType)[]
            ).includes(notification?.type)
          ) {
            router.reload();
          }
          /* if (
            (
              [
                'organizationRegisterConfirmed',
                'organizationSellerRegisterConfirmed',
              ] as (keyof INotificationDataType)[]
            ).includes(notification?.type)
          ) {
            router.push(
              generateUrl(
                {
                  history: DEFAULT_NAV_PATHS.PERSONAL_AREA,
                },
                {
                  pathname: APP_PATHS.PERSONAL_AREA,
                },
              ),
            );
          }
          if (notification?.type === 'organizationRegisterRejected') {
            router.push(
              generateUrl(
                {
                  history: DEFAULT_NAV_PATHS.REGISTER_SELLER_ORGANIZATION,
                },
                {
                  pathname: APP_PATHS.REGISTER_SELLER_ORGANIZATION,
                },
              ),
            );
          }
          if (notification?.type === 'organizationSellerRegisterRejected') {
            console.log('REDIRECT');
            router.push(
              generateUrl(
                {
                  history: DEFAULT_NAV_PATHS.REGISTER_SELLER_COMPLETE,
                },
                {
                  pathname: APP_PATHS.REGISTER_SELLER_COMPLETE,
                },
              ),
            );
          } */
        },
      );
  }, []);

  return (
    <Page>
      <BreadCrumbs
        list={[
          {
            link: APP_PATHS.ACCOUNT_REVIEW,
            text: locale.pages.accountReview.title,
          },
        ]}
        showPersonalAreaLink={false}
      />
      <PageContent containerProps={{ style: { height: '100%' } }}>
        <div
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ClockCircleOutlined
            style={{
              fontSize: 70,
              color: '#999',
              marginTop: -30,
              marginBottom: 30,
            }}
          />
          <h2 className="mb-10">
            {locale.pages.accountReview.dataCheckedAdmin}
          </h2>
          <h3>{locale.pages.accountReview.waitAlert}</h3>
        </div>
      </PageContent>
    </Page>
  );
};

export default AccountReviewSellerPage;
