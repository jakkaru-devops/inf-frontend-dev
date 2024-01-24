import { API_ENDPOINTS } from 'data/paths.data';
import { IUser } from 'sections/Users/interfaces';
import { useEffect, useState } from 'react';
import { APIRequest } from 'utils/api.utils';
import CustomerListPageContent from './content';
import { useRouter } from 'next/router';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import PageContainer from 'components/containers/PageContainer';
import { useNotifications } from 'hooks/notifications.hooks';
import socketService from 'services/socket';
import { STRINGS } from 'data/strings.data';
import { INotification } from 'hooks/notifications.hooks/interfaces';
import { generateUrl } from 'utils/common.utils';

const CustomerListPage = () => {
  const router = useRouter();
  const { handleNewNotification } = useNotifications();

  const [users, setUsers] = useState<IRowsWithCount<IUser[]>>(null);
  const [newItemsCount, setNewItemsCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const { data, isSucceed } = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.USER_LIST,
        params: {
          page: router.query.page,
          pageSize: router.query.pageSize || 10,
          role: 'customer',
        },
        requireAuth: true,
      });

      console.log(data);
      if (isSucceed) {
        setUsers(data);
      }
    };
    fetchData();
  }, [router.query]);

  useEffect(() => {
    if (!users?.rows?.length) return;

    // Notification listener
    socketService.socket
      .off(STRINGS.SERVER_NEW_NOTIFICATION)
      .on(
        STRINGS.SERVER_NEW_NOTIFICATION,
        async (notification: INotification) => {
          handleNewNotification(notification);
          if (
            (['customerRegistered'] as INotification['type'][]).includes(
              notification?.type,
            )
          ) {
            if (!router?.query?.page || router?.query?.page === '1') {
              router.push(generateUrl({ page: 1 }));
            } else {
              setNewItemsCount(prev => prev + 1);
            }
          }
        },
      );
  }, [users]);

  return (
    <PageContainer contentLoaded={!!users}>
      <CustomerListPageContent
        users={users}
        setUsers={setUsers}
        newItemsCount={newItemsCount}
        setNewItemsCount={setNewItemsCount}
      />
    </PageContainer>
  );
};

export default CustomerListPage;
