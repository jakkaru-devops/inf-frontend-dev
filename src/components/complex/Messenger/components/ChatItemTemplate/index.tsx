import { Avatar, Badge } from 'antd';
import classNames from 'classnames';
import { FC, ReactNode } from 'react';
import { replaceHashToEmoji } from '../../utils/messenger.utils';
import { renderHtml } from 'utils/common.utils';

interface IProps {
  name: string;
  avatar?: string;
  isOnline?: boolean;
  lastMessage?: {
    isFromAuthUser?: boolean;
    isUnread?: boolean;
    creationTime?: string;
    preview?: string;
  };
  text?: string | ReactNode;
  unreadMessagesCount?: number;
  onClick: () => void;
}

const ChatItemTemplate: FC<IProps> = ({
  name,
  avatar,
  isOnline,
  lastMessage,
  text,
  unreadMessagesCount,
  onClick,
}) => {
  let messageText =
    typeof text === 'string'
      ? replaceHashToEmoji(text?.toString() || '')
      : null;

  return (
    <li className="messenger-window__chat-item" onClick={onClick}>
      <div className="messenger-window__chat-item__col messenger-window__chat-item__col-left">
        <Badge
          dot={isOnline}
          className="messenger-window__chat-item__avatar-badge"
        >
          <Avatar
            className="messenger-window__chat-item__avatar"
            src={avatar || '/img/default-avatar.png'}
            shape="circle"
            size="default"
          />
        </Badge>
      </div>
      <div className="messenger-window__chat-item__col messenger-window__chat-item__col-right">
        <div className="messenger-window__chat-item__top">
          <div className="messenger-window__chat-item__username">{name}</div>
          {lastMessage && (
            <div className="messenger-window__chat-item__info">
              {typeof lastMessage?.isUnread === 'boolean' &&
                lastMessage.isFromAuthUser && (
                  <img
                    className="messenger-window__chat-item__status"
                    src={`/img/icons/${
                      lastMessage.isUnread ? 'unread' : 'read'
                    }-message.svg`}
                    alt={
                      lastMessage.isUnread
                        ? 'Сообщение не прочитано'
                        : 'Сообщение прочитано'
                    }
                  />
                )}
              {lastMessage?.creationTime && (
                <div className="messenger-window__chat-item__time">
                  {lastMessage.creationTime}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="messenger-window__chat-item__bottom">
          <div
            className={classNames('messenger-window__chat-item__last-message', {
              'no-message': !lastMessage,
            })}
          >
            {lastMessage?.preview && (
              <img
                src={lastMessage.preview}
                className="mr-10"
                width="15px"
                height="100%"
                alt="preview"
              />
            )}
            {text &&
              (typeof text === 'string'
                ? renderHtml(
                    lastMessage?.isFromAuthUser
                      ? messageText.replace('<p>', '<p>Я: ')
                      : messageText,
                  )
                : text)}
          </div>
          <Badge
            count={unreadMessagesCount || 0}
            className="messenger-window__chat-item__unread-counter"
          />
        </div>
      </div>
    </li>
  );
};

export default ChatItemTemplate;
