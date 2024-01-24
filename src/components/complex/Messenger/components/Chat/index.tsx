import { FC, Fragment, RefObject, useContext } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import Avatar from 'antd/lib/avatar/avatar';
import formatDate from 'date-fns/format';
import ChatTextField from '../ChatTextField';
import ChatMessage from '../ChatMessage';
import { useDispatch } from 'react-redux';
import { IChat, IChatMessage } from '../../interfaces';
import { Preloader } from 'components/common';
import InfiniteScroll from 'react-infinite-scroller';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { useLocale } from 'hooks/locale.hook';
import { Context } from '../../context';
import { fileUrl } from 'utils/api.utils';
import { useAuth } from 'hooks/auth.hook';
import { goToMessengerRoot } from 'store/reducers/messenger.reducer';
import { formatPhoneNumber } from 'utils/common.utils';

interface IProps {
  activeChat: IChat;
  messages: IRowsWithCount<IChatMessage[]>;
  chatContentRef: RefObject<Scrollbars>;
  handlers: {
    fetchMessages: (chatId: IChat['id'], page: number) => void;
  };
}

const Chat: FC<IProps> = ({
  activeChat,
  messages,
  chatContentRef,
  handlers,
}) => {
  const auth = useAuth();
  const dispatch = useDispatch();
  const { locale } = useLocale();
  const { setMessages } = useContext(Context);

  return (
    <div className="messenger-window__chat">
      <div className="messenger-window__chat__top">
        <button
          className="messenger-window__chat__back no-bg no-border"
          onClick={() => {
            dispatch(goToMessengerRoot());
            setMessages({ count: 0, rows: [] });
          }}
        >
          <img src="/img/icons/arrow-left.svg" alt="arrow-left" />
        </button>
        <Avatar
          className="messenger-window__chat__avatar"
          src={
            activeChat.companion.user.avatar
              ? fileUrl(activeChat.companion.user.avatar)
              : '/img/default-avatar.png'
          }
          shape="circle"
          size="small"
        />
        <div className="ml-15">
          <div className="messenger-window__username">{activeChat.name}</div>
          <div className="messenger-window__userphone">
            {formatPhoneNumber(activeChat?.companion?.user?.phone)}
          </div>
        </div>
      </div>
      <div className="messenger-window__chat__content">
        {!!messages ? (
          <Scrollbars
            autoHeightMin={0}
            autoHeightMax={499}
            style={{ position: 'relative', zIndex: 20, maxHeight: 499 }}
            universal={true}
            renderTrackHorizontal={props => (
              <div
                {...props}
                style={{ display: 'none' }}
                className="track-horizontal"
              />
            )}
            className="messenger-window__track-vertical"
            ref={chatContentRef}
          >
            {messages.count === 0 && (
              <div className="messenger-window__alert mt-20">
                Еще нет сообщений
              </div>
            )}
            <InfiniteScroll
              loadMore={(page: number) =>
                handlers.fetchMessages(activeChat.id, page)
              }
              isReverse={true}
              useWindow={false}
              threshold={10}
              pageStart={0}
              loader={
                <div key={0} className="mt-10">
                  <Preloader size="small" />
                </div>
              }
              hasMore={messages.count > messages.rows.length}
            >
              {messages.rows.map((message, i) => (
                <Fragment key={i}>
                  {(i === 0 ||
                    new Date(message.createdAt).getDate() !==
                      new Date(messages.rows[i - 1].createdAt).getDate()) && (
                    <div className="messenger-window__chat__date">
                      {formatDate(new Date(message.createdAt), 'dd.MM.yyyy')}
                    </div>
                  )}
                  <ChatMessage
                    message={message}
                    showMessageAuthor={
                      ['manager', 'operator'].includes(
                        auth?.currentRole?.label,
                      ) &&
                      (i === 0 ||
                        messages.rows[i - 1].authorId !== message.authorId)
                    }
                    offsetLarge={
                      i === 0 ||
                      new Date(message.createdAt).getDate() !==
                        new Date(messages.rows[i - 1].createdAt).getDate() ||
                      message.authorId !== messages.rows?.[i - 1].authorId
                    }
                    showOrderRequest={
                      i === 0 ||
                      message?.orderRequestId !==
                        messages.rows?.[i - 1]?.orderRequestId
                    }
                    onItemClick={() => console.log('on message click')}
                  />
                </Fragment>
              ))}
            </InfiniteScroll>
            {/* {activeChat.members
              .filter(member => member.isTyping)
              .map(member => (
                <div
                  key={member.id}
                  className="messenger-window__chat__user-is-typing"
                >
                  {locale.messenger.companionTyping}...
                </div>
              ))} */}
          </Scrollbars>
        ) : (
          <div className="messenger-window__alert mt-20">
            {locale.messenger.errors.messageListNotLoaded}
          </div>
        )}
      </div>
      <ChatTextField chatId={activeChat.id} />
    </div>
  );
};

export default Chat;
