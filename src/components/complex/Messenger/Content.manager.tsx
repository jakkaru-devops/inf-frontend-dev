import { Fragment, useContext } from 'react';
import { Context } from './context';
import { IChat } from './interfaces';
import ChatList from './components/ChatList';
import Chat from './components/Chat';
import SystemChat from './components/SystemChat';
import { useMessenger } from 'hooks/messenger.hook';

const MessengerContentManager = () => {
  const { notifications, activeChat } = useMessenger();
  const { activeSideChat, messages, handlers, chatContentRef } =
    useContext(Context);

  return (
    <Fragment>
      {!!activeSideChat ? (
        <>
          {activeSideChat === 'system' && (
            <SystemChat
              notifications={notifications}
              chatContentRef={chatContentRef}
            />
          )}
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

export default MessengerContentManager;
