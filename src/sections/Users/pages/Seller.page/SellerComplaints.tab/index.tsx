import PageContainer from 'components/containers/PageContainer';
import { API_ENDPOINTS } from 'data/paths.data';
import { STRINGS } from 'data/strings.data';
import { useNotifications } from 'hooks/notifications.hooks';
import { INotification } from 'hooks/notifications.hooks/interfaces';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { useRouter } from 'next/router';
import { FC, useEffect, useState } from 'react';
import { IComplaint, IUser } from 'sections/Users/interfaces';
import socketService from 'services/socket';
import { APIRequest } from 'utils/api.utils';
import SellerComplaintsTabContent from './Content';

interface IProps {
  user: IUser;
}

const SellerComplaintsTab: FC<IProps> = ({ user }) => {
  const router = useRouter();
  const { handleNewNotification, fetchUnreadNotificationsCount } =
    useNotifications();

  const [complaints, setComplaints] =
    useState<IRowsWithCount<IComplaint[]>>(null);

  const fetchComplaints = async () => {
    const { isSucceed, data } = await APIRequest({
      method: 'get',
      url: API_ENDPOINTS.COMPLAINT_LIST,
      params: {
        defendantId: user.id,
        defendantRoleLabel: 'seller',
        page: router?.query?.page || 1,
      },
      requireAuth: true,
    });
    if (isSucceed) {
      setComplaints(data);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [router?.query]);

  // Handle notifications
  useEffect(() => {
    if (!complaints) return;

    socketService.socket
      .off(STRINGS.SERVER_NEW_NOTIFICATION)
      .on(
        STRINGS.SERVER_NEW_NOTIFICATION,
        async (notification: INotification) => {
          handleNewNotification(notification);

          if (notification.type === 'newUserComplaint') {
            fetchComplaints();
          }
        },
      );

    const notifications = complaints.rows.flatMap(el => el.unreadNotifications);
    if (!notifications.length) return;

    const notificationIds = notifications.map(({ id }) => id);
    APIRequest({
      method: 'post',
      url: API_ENDPOINTS.NOTIFICATION_UNREAD,
      data: {
        notificationIds: notifications.map(({ id }) => id),
      },
      requireAuth: true,
    }).then(async res => {
      if (!res.isSucceed) return;
      await fetchUnreadNotificationsCount(notificationIds);
    });
  }, [complaints]);

  return (
    <PageContainer contentLoaded={!!complaints}>
      <SellerComplaintsTabContent complaints={complaints} />
    </PageContainer>
  );
};

export default SellerComplaintsTab;
