import { API_ENDPOINTS } from 'data/paths.data';
import { useLocale } from 'hooks/locale.hook';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import {
  setMessengerUnreadNotificationsCount,
  setNewUnreadNotifications,
  setNotifications,
} from 'store/reducers/messenger.reducer';
import { APIRequest } from 'utils/api.utils';
import { openNotification } from 'utils/common.utils';
import { INotification, INotificationDataType } from './interfaces';
import { getNotificationPreview } from './utils';
import { setAuthUser } from 'store/reducers/auth.reducer';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { useEffect, useState } from 'react';
import { IMessengerState } from 'store/reducers/messenger.reducer';
import { useAuth } from 'hooks/auth.hook';
import { useMessenger } from 'hooks/messenger.hook';

export const useNotifications = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { locale } = useLocale();
  const auth = useAuth();
  const {
    notifications,
    unreadNotificationsCount,
    newUnreadNotifications,
    activeSideChat,
  } = useMessenger();
  const [lastNotification, setLastNotification] = useState<INotification>(null);

  useEffect(() => {
    if (!lastNotification?.id) return;
    // Update unread notifications count
    const newNnreadNotificationsCount = {
      ...unreadNotificationsCount,
      total: unreadNotificationsCount.total + 1,
    };
    const notificationModule = lastNotification?.module;
    if (
      !!notificationModule &&
      typeof unreadNotificationsCount?.[notificationModule] === 'number'
    ) {
      newNnreadNotificationsCount.personalArea =
        unreadNotificationsCount.personalArea + 1;
      newNnreadNotificationsCount[notificationModule] =
        unreadNotificationsCount[notificationModule] + 1;
    }
    dispatch(setMessengerUnreadNotificationsCount(newNnreadNotificationsCount));
  }, [lastNotification?.id]);

  const handleNewNotification = async (notification: INotification) => {
    if (notification?.roleId !== auth.currentRole.id) return;
    if (
      notification.type === 'userRoleBanned' &&
      notification.roleId === auth.currentRole.id
    ) {
      router.reload();
    }
    if (
      notification.type === 'sellerDowngraded' &&
      notification.roleId === auth.currentRole.id
    ) {
      dispatch(
        setAuthUser({
          ...auth.user,
          ratingValue: notification?.data?.newRatingValue,
        }),
      );
    }
    if (
      notification.type === 'newSellerReview' &&
      notification.roleId === auth.currentRole.id
    ) {
      const { review } =
        notification.data as INotificationDataType['newSellerReview'];
      dispatch(
        setAuthUser({
          ...auth.user,
          ratingValue: review.ratingValue,
        }),
      );
    }

    const notificationPreview = getNotificationPreview(notification, {
      router,
      auth,
      locale,
    });
    if (!!notificationPreview) {
      // Show message notification
      openNotification(notificationPreview.text, {
        onClick: notificationPreview.onClick,
        sound: 'notification',
      });
      dispatch(
        setNewUnreadNotifications(
          newUnreadNotifications.concat(notification.id),
        ),
      );
    }

    !!notificationPreview?.action && notificationPreview.action();

    // To update unread notifications count
    setLastNotification(notification);

    // for messenger
    if (activeSideChat === 'system') {
      fetchNotifications(1);
    }
  };

  const fetchNotifications = async (page: number) => {
    const res = await APIRequest<IRowsWithCount<INotification[]>>({
      method: 'get',
      url: API_ENDPOINTS.NOTIFICATION_LIST,
      params: { page, pageSize: 20 },
      requireAuth: true,
    });
    console.log(page, res);
    if (!res.isSucceed) return;
    const resData = res.data;

    const isInit = !page;

    dispatch(
      setNotifications({
        rows: isInit
          ? []
          : resData.rows.filter(Boolean).concat(notifications.rows),
        count: resData.count,
      }),
    );

    const unreadNotifications = resData.rows.filter(
      el => !el.viewedAt && el.autoread,
    );
    if (!!resData.count && !!unreadNotifications.length) {
      const notificationIds = unreadNotifications.map(el => el.id);
      await APIRequest<any>({
        method: 'post',
        url: API_ENDPOINTS.NOTIFICATION_UNREAD,
        data: {
          notificationIds,
        },
        requireAuth: true,
      });
      fetchUnreadNotificationsCount(notificationIds);
    }
  };

  const fetchUnreadNotificationsCount = async (notificationIds?: string[]) => {
    const res = await APIRequest<IMessengerState['unreadNotificationsCount']>({
      method: 'get',
      url: API_ENDPOINTS.NOTIFICATION_UNREAD,
      requireAuth: true,
    });

    dispatch(setMessengerUnreadNotificationsCount(res.data));

    if (!!notificationIds?.length) {
      dispatch(
        setNewUnreadNotifications(
          newUnreadNotifications.filter(
            notificationId => !notificationIds?.includes(notificationId),
          ),
        ),
      );
    }
  };

  return {
    newUnreadNotifications,
    fetchNotifications,
    fetchUnreadNotificationsCount,
    handleNewNotification,
  };
};
