import _ from 'lodash';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { IUser } from 'sections/Users/interfaces';
import { useEffect, useState } from 'react';
import { APIRequest } from 'utils/api.utils';
import PageContainer from 'components/containers/PageContainer';
import RegisterSellerCompletePageContent from './Content';
import { useNotifications } from 'hooks/notifications.hooks';
import socketService from 'services/socket';
import { STRINGS } from 'data/strings.data';
import { INotification } from 'hooks/notifications.hooks/interfaces';
import { useRouter } from 'next/router';
import { generateUrl } from 'utils/common.utils';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';
import { useAuth } from 'hooks/auth.hook';

const RegisterSellerCompletePage = () => {
  const [data, setData] = useState<{
    user: IUser;
  }>(null);

  const auth = useAuth();
  const { handleNewNotification } = useNotifications();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const userRes = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.USER,
        params: {
          id: auth.user.id,
          include: [
            'address',
            'requisites',
            'sellerAutoBrands',
            'sellerProductGroups',
            'sellers',
            'sellers.rejections',
            'sellerRegisterFiles',
          ],
        },
        requireAuth: true,
      });
      const user = userRes.isSucceed ? userRes.data.user : null;

      setData({
        user,
      });
    };
    fetchData();

    socketService.socket
      .off(STRINGS.SERVER_NEW_NOTIFICATION)
      .on(
        STRINGS.SERVER_NEW_NOTIFICATION,
        async (notification: INotification) => {
          handleNewNotification(notification);

          if (notification?.type === 'organizationSellerRegisterConfirmed') {
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
        },
      );
  }, []);

  return (
    <PageContainer contentLoaded={!!data}>
      <RegisterSellerCompletePageContent {...data} />
    </PageContainer>
  );
};

export default RegisterSellerCompletePage;
