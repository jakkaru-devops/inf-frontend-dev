import classNames from 'classnames';
import { API_ENDPOINTS } from 'data/paths.data';
import formatDate from 'date-fns/format';
import { useNotifications } from 'hooks/notifications.hooks';
import { INotification } from 'hooks/notifications.hooks/interfaces';
import { FC } from 'react';
import { APIRequest } from 'utils/api.utils';

interface IProps {
  notification: INotification;
  offsetLarge?: boolean;
}

const NotificationMessage: FC<IProps> = ({ notification, offsetLarge }) => {
  if (!notification) return <></>;

  const { fetchUnreadNotificationsCount } = useNotifications();

  const handleClick = async () => {
    const notificationIds = [notification.id];
    await APIRequest<any>({
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
  };

  return (
    <div
      className={classNames('messenger-window__chat__message-wrapper', {
        'offset-large': offsetLarge,
      })}
    >
      <li className="messenger-window__chat__message">
        <div className="messenger-window__chat__message__body">
          {
            <img
              src={`/img/icons/${
                !notification?.viewedAt ? 'unread' : 'read'
              }-message.svg`}
              alt="isUnread"
              className="messenger-window__chat__message__status position-right"
            />
          }
          <div
            className={classNames('messenger-window__chat__message__text', {
              clickable: !!notification.onClick,
            })}
            onClick={() => {
              handleClick();
              notification.onClick();
            }}
          >
            {notification?.textFull || notification.text}
          </div>
          <div className="messenger-window__chat__message__bottom">
            <div className="messenger-window__chat__message__time">
              {formatDate(new Date(notification.createdAt), 'HH:mm')}
            </div>
          </div>
        </div>
      </li>
    </div>
  );
};

export default NotificationMessage;
