import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from 'data/paths.data';
import { ICustomerCounters, IUser } from 'sections/Users/interfaces';
import { APIRequest } from 'utils/api.utils';
import PageContainer from 'components/containers/PageContainer';
import CustomerPageContent from './Content';
import { useRouter } from 'next/router';
import ContextProvider from './context';
import socketService from 'services/socket';
import { STRINGS } from 'data/strings.data';
import { useNotifications } from 'hooks/notifications.hooks';
import { useAuth } from 'hooks/auth.hook';

const CustomerPage = () => {
  const [data, setData] = useState<{
    user: IUser;
    counters: ICustomerCounters;
  }>(null);

  const auth = useAuth();
  const router = useRouter();
  const { handleNewNotification, fetchUnreadNotificationsCount } =
    useNotifications();

  useEffect(() => {
    const fetchData = async () => {
      const customerRes = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.USER_INFO,
        params: {
          id:
            auth?.currentRole?.label !== 'customer'
              ? router.query.userId
              : auth.user.id,
          include: ['counters', 'roles'],
          role: 'customer',
        },
        requireAuth: true,
      });

      const { user, counters } = customerRes.isSucceed
        ? customerRes.data
        : null;

      setData({
        user,
        counters,
      });
    };
    fetchData();
  }, []);

  useEffect(() => {
    // Notification listener
    socketService.socket
      .off(STRINGS.SERVER_NEW_NOTIFICATION)
      .on(STRINGS.SERVER_NEW_NOTIFICATION, handleNewNotification);
  }, [router?.query?.tab]);

  useEffect(() => {
    if (!data?.user) return;
    const { user } = data;
    const unreadNotifications = async () => {
      if (!!user?.unreadNotifications?.length) {
        const notificationIds = user.unreadNotifications
          .filter(Boolean)
          .map(({ id }) => id);
        await APIRequest({
          method: 'post',
          url: API_ENDPOINTS.NOTIFICATION_UNREAD,
          data: {
            notificationIds,
          },
          requireAuth: true,
        }).then(async res => {
          if (!res.isSucceed) return;
          await fetchUnreadNotificationsCount(notificationIds);
        });
      }
    };
    unreadNotifications();
  }, [data?.user]);

  return (
    <PageContainer contentLoaded={!!data}>
      <ContextProvider>
        <CustomerPageContent
          {...data}
          setUser={user => setData({ ...data, user })}
        />
      </ContextProvider>
    </PageContainer>
  );
};

export default CustomerPage;
