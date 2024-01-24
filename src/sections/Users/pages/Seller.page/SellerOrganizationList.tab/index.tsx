import { API_ENDPOINTS } from 'data/paths.data';
import { IOrganization } from 'sections/Organizations/interfaces';
import { useRouter } from 'next/router';
import { IUser } from 'sections/Users/interfaces';
import { FC, useEffect, useState } from 'react';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { APIRequest } from 'utils/api.utils';
import PageContainer from 'components/containers/PageContainer';
import SellerOrganizationListTabContent from './Content';
import { useNotifications } from 'hooks/notifications.hooks';
import socketService from 'services/socket';
import { STRINGS } from 'data/strings.data';
import { INotification } from 'hooks/notifications.hooks/interfaces';
import { useAuth } from 'hooks/auth.hook';
import organizationsService from 'sections/Organizations/organizations.service';

interface IProps {
  user: IUser;
}

const SellerOrganizationListTab: FC<IProps> = ({ user }) => {
  const auth = useAuth();
  const router = useRouter();
  const { handleNewNotification } = useNotifications();

  const [organizations, setOrganizations] =
    useState<IRowsWithCount<IOrganization[]>>(null);
  const [stateCounter, setStateCounter] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const res = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.ORGANIZATION_LIST,
        params: {
          sellerUserId:
            auth.currentRole.label === 'seller'
              ? auth.user.id
              : router.query.userId,
          confirmed: auth.currentRole.label === 'customer',
        },
        requireAuth: true,
      });
      if (res.isSucceed) {
        console.log('DATA', res.data);
        setOrganizations(res.data);
      }
    };
    fetchData();
  }, []);

  // Handle notifications
  useEffect(() => {
    if (auth.currentRole.label !== 'seller' || !organizations?.rows?.length)
      return;

    socketService.socket
      .off(STRINGS.SERVER_NEW_NOTIFICATION)
      .on(
        STRINGS.SERVER_NEW_NOTIFICATION,
        async (notification: INotification) => {
          handleNewNotification(notification);
          const index = organizations.rows.findIndex(
            org => org.id === notification?.data?.organization?.id,
          );
          if (index !== -1) {
            const org = await organizationsService.fetchOrganization(
              organizations.rows[index].id,
            );
            const rows = organizations.rows;
            rows[index] = org;
            setOrganizations({
              ...organizations,
              rows,
            });
            setStateCounter(prev => prev + 1);
          }
        },
      );
  }, [organizations]);

  return (
    <PageContainer contentLoaded={!!organizations}>
      <SellerOrganizationListTabContent
        organizations={organizations}
        setOrganizations={setOrganizations}
        setStateCounter={setStateCounter}
        user={user}
      />
    </PageContainer>
  );
};

export default SellerOrganizationListTab;
