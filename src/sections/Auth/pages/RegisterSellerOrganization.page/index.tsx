import _ from 'lodash';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { IOrganization } from 'sections/Organizations/interfaces';
import { useEffect, useState } from 'react';
import { APIRequest } from 'utils/api.utils';
import PageContainer from 'components/containers/PageContainer';
import RegisterSellerOrganizationPageContent from './content';
import { useNotifications } from 'hooks/notifications.hooks';
import { useRouter } from 'next/router';
import socketService from 'services/socket';
import { STRINGS } from 'data/strings.data';
import { INotification } from 'hooks/notifications.hooks/interfaces';
import { generateUrl } from 'utils/common.utils';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';
import { useAuth } from 'hooks/auth.hook';

const RegisterSellerOrganizationPage = () => {
  const [org, setOrg] = useState<IOrganization>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const auth = useAuth();
  const { handleNewNotification } = useNotifications();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      if (auth.user.sellers && auth.user.sellers.length > 0) {
        const { data, isSucceed } = await APIRequest({
          method: 'get',
          url: API_ENDPOINTS.ORGANIZATION,
          params: {
            id: auth.user.sellers[0].organizationId,
          },
          requireAuth: true,
        });
        if (isSucceed) {
          setOrg(data);
        }
      }
      setDataLoaded(true);
    };
    fetchData();

    socketService.socket
      .off(STRINGS.SERVER_NEW_NOTIFICATION)
      .on(
        STRINGS.SERVER_NEW_NOTIFICATION,
        async (notification: INotification) => {
          handleNewNotification(notification);

          if (notification?.type === 'organizationRegisterConfirmed') {
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
    <PageContainer contentLoaded={dataLoaded}>
      <RegisterSellerOrganizationPageContent org={org} />
    </PageContainer>
  );
};

export default RegisterSellerOrganizationPage;
