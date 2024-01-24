import formatDate from 'date-fns/format';
import { IChat } from '../../interfaces';
import {
  getMessagePreview,
  replaceHashToEmoji,
} from '../../utils/messenger.utils';
import ChatItemTemplate from '../ChatItemTemplate';
import { fileUrl } from 'utils/api.utils';
import { useAuth } from 'hooks/auth.hook';
import { FC } from 'react';
import { useMessenger } from 'hooks/messenger.hook';

interface IProps {
  chatItem: IChat;
  onItemClick: () => void;
}

const ChatItem: FC<IProps> = ({ chatItem, onItemClick }) => {
  const auth = useAuth();
  const { usersOnline } = useMessenger();

  const lastMessage = getMessagePreview(chatItem.lastMessage);
  let messageText = replaceHashToEmoji(lastMessage?.text || '');

  return (
    <ChatItemTemplate
      name={chatItem.name}
      isOnline={
        !!chatItem?.companion &&
        usersOnline.includes(chatItem?.companion?.userId)
      }
      lastMessage={
        lastMessage && {
          isFromAuthUser: lastMessage.authorId === auth.user.id,
          isUnread: lastMessage?.isUnread,
          creationTime: formatDate(
            new Date(lastMessage.updatedAt),
            'dd.MM.yyyy',
          ),
          preview: lastMessage?.preview,
        }
      }
      avatar={
        chatItem.companion?.user?.avatar
          ? fileUrl(chatItem.companion?.user?.avatar)
          : '/img/default-avatar.png'
      }
      text={messageText || 'Ещё нет сообщений'}
      unreadMessagesCount={chatItem?.unreadMessagesCount || 0}
      onClick={onItemClick}
    />
  );
};

export default ChatItem;
