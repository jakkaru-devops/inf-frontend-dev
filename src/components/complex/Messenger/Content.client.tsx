import { Fragment, useContext } from 'react';
import { Context } from './context';
import ChatList from './components/ChatList';
import { useSelector } from 'react-redux';
import SystemChat from './components/SystemChat';
import Chat from './components/Chat';
import { IChat } from './interfaces';
import SupportChat from './components/SupportChat';
import { isUserBanned } from 'sections/Users/utils';
import { useAuth } from 'hooks/auth.hook';
import { useMessenger } from 'hooks/messenger.hook';

const MessengerContentClient = () => {
  const auth = useAuth();
  const { notifications, activeChat } = useMessenger();
  const { activeSideChat, handlers, messages, chatContentRef } =
    useContext(Context);

  return (
    <Fragment>
      {!!activeSideChat ? (
        <>
          {activeSideChat === 'system' &&
            !isUserBanned(auth.user, auth.currentRole.id) && (
              <SystemChat
                notifications={notifications}
                chatContentRef={chatContentRef}
              />
            )}
          {activeSideChat === 'support' && <SupportChat />}
        </>
      ) : !activeChat ? (
        <ChatList />
      ) : (
        <Chat
          activeChat={activeChat as IChat}
          messages={messages}
          chatContentRef={chatContentRef}
          handlers={handlers}
        />
      )}
    </Fragment>
  );
};

export default MessengerContentClient;
