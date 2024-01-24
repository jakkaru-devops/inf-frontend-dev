import _ from 'lodash';
import { API_ENDPOINTS } from 'data/paths.data';
import { IOrganization } from 'sections/Organizations/interfaces';
import { useEffect, useState } from 'react';
import { APIRequest } from 'utils/api.utils';
import { useRouter } from 'next/router';
import { IUser } from 'sections/Users/interfaces';
import PageContainer from 'components/containers/PageContainer';
import OrganizationSellerApplicationPageContent from './Content';
import { useNotifications } from 'hooks/notifications.hooks';
import socketService from 'services/socket';
import { STRINGS } from 'data/strings.data';
import { INotification } from 'hooks/notifications.hooks/interfaces';

const OrganizationSellerApplicationPage = () => {
  const router = useRouter();
  const { handleNewNotification, fetchUnreadNotificationsCount } =
    useNotifications();

  const [data, setData] = useState<{
    organization: IOrganization;
    user: IUser;
  }>(null);

  const fetchSeller = async (userId: string) => {
    const res = await APIRequest({
      method: 'get',
      url: API_ENDPOINTS.USER,
      params: {
        id: userId,
        include: [
          'address',
          'requisites',
          'sellerAutoBrands',
          'sellerProductGroups',
          'sellers',
          'sellers.rejections',
          'sellerRegisterFiles',
        ],
        organizationId: router.query.organizationId,
      },
      requireAuth: true,
    });
    return res.data.user as IUser;
  };

  useEffect(() => {
    if (Object.keys(router.query).length === 0) return;

    const fetchData = async () => {
      const organizationRes = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.ORGANIZATION,
        params: {
          id: router.query.organizationId,
        },
        requireAuth: true,
      });
      const organization: IOrganization = organizationRes.data;

      const user = await fetchSeller(router.query.userId as string);

      setData({
        organization,
        user,
      });
    };
    fetchData();
  }, [router.query]);

  // Handle notifications
  useEffect(() => {
    if (!data?.organization) return;

    socketService.socket
      .off(STRINGS.SERVER_NEW_NOTIFICATION)
      .on(
        STRINGS.SERVER_NEW_NOTIFICATION,
        async (notification: INotification) => {
          handleNewNotification(notification);

          if (data?.organization?.id === notification?.data?.organization?.id) {
            const user = await fetchSeller(data?.user?.id);
            setData(prev => ({
              ...prev,
              user,
            }));
          }
        },
      );

    const notifications = data?.organization?.unreadNotifications.filter(
      el =>
        el?.data?.seller?.userId === data?.user?.id &&
        (el.type === 'registerSellerApplication' ||
          el.type === 'registerSellerApplicationUpdated'),
    );
    if (!notifications.length) return;

    const notificationIds = notifications.map(({ id }) => id);
    APIRequest({
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
  }, [data?.organization]);

  return (
    <PageContainer contentLoaded={!!data}>
      <OrganizationSellerApplicationPageContent
        {...data}
        setUser={user =>
          setData(prev => ({
            ...prev,
            user,
          }))
        }
      />
    </PageContainer>
  );
};

export default OrganizationSellerApplicationPage;
