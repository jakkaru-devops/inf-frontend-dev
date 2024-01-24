import { IOrganization } from 'sections/Organizations/interfaces';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import PageContainer from 'components/containers/PageContainer';
import OrganizationPageContent from './Content';
import socketService from 'services/socket';
import { STRINGS } from 'data/strings.data';
import { INotification } from 'hooks/notifications.hooks/interfaces';
import { useNotifications } from 'hooks/notifications.hooks';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import organizationsService from 'sections/Organizations/organizations.service';

const OrganizationPage = () => {
  const router = useRouter();
  const { handleNewNotification, fetchUnreadNotificationsCount } =
    useNotifications();

  const [data, setData] = useState<{ organization: IOrganization }>(null);

  useEffect(() => {
    const fetchData = async () => {
      const organization = await organizationsService.fetchOrganization(
        router.query?.organizationId as string,
      );

      setData({
        organization,
      });
    };
    fetchData();
  }, [router.query?.organizationId]);

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
            const organization = await organizationsService.fetchOrganization(
              data?.organization?.id,
            );
            setData({
              organization,
            });
          }
        },
      );
  }, [data?.organization]);

  useEffect(() => {
    if (!data?.organization) return;

    const notifications = data?.organization?.unreadNotifications.filter(
      el =>
        el.type === 'registerOrganizationApplication' ||
        el.type === 'registerOrganizationApplicationUpdated',
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
  }, [data?.organization?.id]);

  return (
    <PageContainer contentLoaded={!!data}>
      <OrganizationPageContent {...data} />
    </PageContainer>
  );
};

export default OrganizationPage;
