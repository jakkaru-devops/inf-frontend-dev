import PersonalAreaCustomerContent from './Content.customer';
import PersonalAreaSellerContent from './Content.seller';
import PersonalAreaManagerContent from './Content.manager';
import PersonalAreaModeratorContent from './Content.moderator';
import PersonalAreaSuperadminContent from './Content.superadmin';
import { useLocale } from 'hooks/locale.hook';
import { useEffect, useState } from 'react';
import socketService from 'services/socket';
import { STRINGS } from 'data/strings.data';
import { INotification } from 'hooks/notifications.hooks/interfaces';
import { useNotifications } from 'hooks/notifications.hooks';
import { useRouter } from 'next/router';
import { useAuth } from 'hooks/auth.hook';
import { APIRequest } from 'utils/api.utils';
import { openNotification } from 'utils/common.utils';
import PageContainer from 'components/containers/PageContainer';
import { API_ENDPOINTS_V2 } from 'data/api.data';

const PersonalAreaPage = () => {
  const auth = useAuth();
  const { locale } = useLocale();
  const router = useRouter();
  const { handleNewNotification } = useNotifications();

  const [data, setData] = useState<{ pendingPostponedPaymentsNumber: number }>(
    null,
  );

  useEffect(() => {
    const fetchData = async () => {
      const res = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS_V2.profile.personalArea,
      });
      if (!res.isSucceed) {
        openNotification(res?.message);
        return;
      }
      setData(res.data);
    };
    fetchData();

    socketService.socket
      .off(STRINGS.SERVER_NEW_NOTIFICATION)
      .on(
        STRINGS.SERVER_NEW_NOTIFICATION,
        async (notification: INotification) => {
          handleNewNotification(notification);

          if (
            (notification?.type === 'userOrderRequestsBanned' ||
              notification?.type === 'userOrderRequestsUnbanned') &&
            notification?.roleId === auth.currentRole.id
          ) {
            router.reload();
          }
        },
      );
  }, []);

  const pageContent = (label: string) => {
    switch (label) {
      case 'customer':
        return <PersonalAreaCustomerContent {...data} />;
      case 'seller':
        return <PersonalAreaSellerContent {...data} />;
      case 'operator':
        return <PersonalAreaManagerContent />;
      case 'manager':
        return <PersonalAreaManagerContent />;
      case 'moderator':
        return <PersonalAreaModeratorContent />;
      case 'superadmin':
        return <PersonalAreaSuperadminContent />;
      default:
        return <div>{locale.errors.userRoleNotDefined}</div>;
    }
  };

  return (
    <PageContainer contentLoaded={!!data}>
      {pageContent(auth.currentRole?.label)}
    </PageContainer>
  );
};

export default PersonalAreaPage;
