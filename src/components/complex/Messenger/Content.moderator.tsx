import { Fragment, useContext } from 'react';
import { Context } from './context';
import ChatList from './components/ChatList';
import SystemChat from './components/SystemChat';
import { useMessenger } from 'hooks/messenger.hook';

const MessengerContentModerator = () => {
  const { notifications } = useMessenger();
  const { activeSideChat, chatContentRef } = useContext(Context);

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
      ) : (
        <ChatList />
      )}
    </Fragment>
  );
};

export default MessengerContentModerator;
