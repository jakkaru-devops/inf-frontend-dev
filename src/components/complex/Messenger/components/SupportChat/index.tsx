import { Avatar } from 'antd';
import { Preloader } from 'components/common';
import { Fragment, useContext } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import InfiniteScroll from 'react-infinite-scroller';
import { Context } from '../../context';
import ChatMessage from '../ChatMessage';
import ChatTextField from '../ChatTextField';
import formatDate from 'date-fns/format';
import { useDispatch } from 'react-redux';
import { isUserBanned } from 'sections/Users/utils';
import { useAuth } from 'hooks/auth.hook';
import { goToMessengerRoot } from 'store/reducers/messenger.reducer';

const SupportChat = () => {
  const { handlers, messages, chatContentRef } = useContext(Context);
  const auth = useAuth();
  const dispatch = useDispatch();

  return (
    <div className="messenger-window__chat">
      <div className="messenger-window__chat__top">
        {!isUserBanned(auth.user, auth.currentRole.id) && (
          <button
            className="messenger-window__chat__back no-bg no-border"
            onClick={() => dispatch(goToMessengerRoot())}
          >
            <img src="/img/icons/arrow-left.svg" alt="arrow-left" />
          </button>
        )}
        <Avatar
          className="messenger-window__chat__avatar"
          src="/img/default-avatar.png"
          shape="circle"
          size="small"
        />
        <div className="messenger-window__username messenger-window__chat__username">
          Менеджер сервиса
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
                handlers.fetchMessages('support', page)
              }
              isReverse={true}
              useWindow={false}
              threshold={10}
              pageStart={0}
              loader={
                <div key={0} className="mt-15">
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
                    offsetLarge={false}
                    onItemClick={() => console.log('on message click', i)}
                    showOrderRequest={
                      i === 0 ||
                      message?.orderRequestId !==
                        messages.rows?.[i - 1]?.orderRequestId
                    }
                  />
                </Fragment>
              ))}
            </InfiniteScroll>
          </Scrollbars>
        ) : (
          <div className="messenger-window__alert mt-20">Еще нет сообщений</div>
        )}
      </div>
      <ChatTextField chatId="support" />
    </div>
  );
};

export default SupportChat;
