import formatDate from 'date-fns/format';
import { INotification } from 'hooks/notifications.hooks/interfaces';
import ChatItemTemplate from '../ChatItemTemplate';
import { FC } from 'react';

interface IProps {
  unreadNotificationsCount: number;
  lastNotification: INotification;
  onItemClick: () => void;
}

const SystemChatItem: FC<IProps> = ({
  unreadNotificationsCount,
  lastNotification,
  onItemClick,
}) => {
  return (
    <ChatItemTemplate
      name="Inf"
      lastMessage={
        lastNotification && {
          creationTime: formatDate(
            new Date(lastNotification.updatedAt),
            'dd.MM.yyyy',
          ),
        }
      }
      text={lastNotification?.text || 'Ещё нет уведомлений'}
      unreadMessagesCount={unreadNotificationsCount || 0}
      onClick={onItemClick}
    />
  );
};

export default SystemChatItem;
