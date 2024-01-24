import { useContext, useEffect } from 'react';
import { Badge, Button } from 'antd';
import { MessageOutlined, CloseOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { Context } from './context';
import MessengerContentManager from './Content.manager';
import { CLIENT_ROLES } from 'sections/Users/data';
import MessengerContentClient from './Content.client';
import { useNotifications } from 'hooks/notifications.hooks';
import { isUserBanned } from 'sections/Users/utils';
import MessengerContentModerator from './Content.moderator';
import { useAuth } from 'hooks/auth.hook';
import { useMessenger } from 'hooks/messenger.hook';

const MessengerContent = () => {
  const auth = useAuth();
  const { messengerExpanded, unreadMessagesCount, unreadNotificationsCount } =
    useMessenger();
  const { deleteMessageId, setDeleteMessageId, handlers } = useContext(Context);
  const { fetchUnreadNotificationsCount } = useNotifications();

  useEffect(() => {
    if (isUserBanned(auth.user, auth.currentRole.id)) {
      handlers.fetchUnreadSupportMessagesCount();
    } else {
      handlers.fetchTotalUnreadMessagesCount();
      fetchUnreadNotificationsCount();
      handlers.fetchUnreadSupportMessagesCount();
    }
  }, []);

  useEffect(() => {
    if (!messengerExpanded) return;
    handlers.fetchInitialChatList();
  }, [messengerExpanded]);

  return (
    <div className="messenger-wrapper">
      <Badge
        size="small"
        overflowCount={99}
        count={unreadMessagesCount + unreadNotificationsCount.total}
        style={{ background: '#E6332A' }}
      >
        <Button
          className="messenger-window__visible-trigger"
          shape="circle"
          type="primary"
          size="large"
          onClick={() => handlers.toggleChatExpanded()}
        >
          {!messengerExpanded ? <MessageOutlined /> : <CloseOutlined />}
        </Button>
      </Badge>

      <div
        className={classNames('messenger-window', {
          'is-visible': messengerExpanded,
        })}
      >
        <div className="messenger-window__content">
          {['manager', 'operator'].includes(auth?.currentRole?.label) && (
            <MessengerContentManager />
          )}
          {auth.currentRole.label === 'moderator' && (
            <MessengerContentModerator />
          )}
          {CLIENT_ROLES.includes(auth.currentRole.label) && (
            <MessengerContentClient />
          )}
          {!!deleteMessageId && (
            <div className="messenger-window__delete-message-wrapper">
              <div
                className="messenger-window__delete-message-overlay"
                onClick={() => setDeleteMessageId(null)}
              />
              <div className="messenger-window__delete-message">
                <div className="messenger-window__delete-message-top">
                  Удалить сообщение?
                </div>
                <div className="messenger-window__delete-message-bottom">
                  <button onClick={() => setDeleteMessageId(null)}>Нет</button>
                  <button
                    onClick={() => handlers.deleteMessage(deleteMessageId)}
                  >
                    Да
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessengerContent;
