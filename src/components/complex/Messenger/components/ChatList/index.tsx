import { Fragment, useContext, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import ChatItem from '../ChatItem';
import { Preloader } from 'components/common';
import SystemChatItem from '../SystemChatItem';
import SearchInput from '../SearchInput';
import { Context } from '../../context';
import ChatItemTemplate from '../ChatItemTemplate';
import { useDispatch } from 'react-redux';
import formatDate from 'date-fns/format';
import { CLIENT_ROLES } from 'sections/Users/data';
import { getNotificationPreview } from 'hooks/notifications.hooks/utils';
import { getMessagePreview } from '../../utils/messenger.utils';
import { useRouter } from 'next/router';
import { isUserBanned } from 'sections/Users/utils';
import { useLocale } from 'hooks/locale.hook';
import { useAuth } from 'hooks/auth.hook';
import { openSideChat } from 'store/reducers/messenger.reducer';
import { useMessenger } from 'hooks/messenger.hook';

const ChatList = () => {
  const auth = useAuth();
  const { unreadNotificationsCount, unreadSupportMessagesCount } =
    useMessenger();
  const dispatch = useDispatch();
  const router = useRouter();
  const { locale } = useLocale();
  const {
    search,
    chats,
    lastSupportMessage,
    lastNotification,
    handlers,
    scrollRef,
  } = useContext(Context);

  useEffect(() => {
    if (!search) {
      // handlers.fetchInitialChatList();
      handlers.fetchLastNotification();
      handlers.fetchLastSupportMessage();
      return;
    }

    handlers.fetchChatList({ search });
  }, [search]);

  if (!chats) return <Preloader />;

  const userBanned = isUserBanned(auth.user, auth.currentRole.id);

  return (
    <Fragment>
      {!userBanned && (
        <div className="messenger-window__top-wrapper">
          {/* {activeSection === 'myChats' && (
          <div className="messenger-window__top">
            <button
              className="messenger-window__chat__back no-bg no-border"
              onClick={() => dispatch(goToMessengerRoot())}
            >
              <img src="/img/icons/arrow-left.svg" alt="arrow-left" />
            </button>
            <div className="messenger-window__username messenger-window__top-name">
              Мои чаты
            </div>
          </div>
        )} */}
          <SearchInput
            value={search}
            handleSearch={value => handlers.handleSearch(value)}
          />
        </div>
      )}
      {!userBanned && search && chats.count === 0 && (
        <div className="messenger-window__alert mt-20">
          По запросу "{search}" нет результатов
        </div>
      )}
      <ul id="scrollable" className="messenger-window__chat-list">
        <InfiniteScroll
          // ref={scrollRef}
          loadMore={page => handlers.fetchChatList({ page, search })}
          useWindow={false}
          threshold={250}
          pageStart={0}
          loader={<></>}
          hasMore={!search && chats.count > chats.rows.length}
        >
          {!search && (
            <>
              {!userBanned && (
                <SystemChatItem
                  unreadNotificationsCount={unreadNotificationsCount.total}
                  lastNotification={getNotificationPreview(lastNotification, {
                    router,
                    auth,
                    locale,
                  })}
                  onItemClick={() => dispatch(openSideChat('system'))}
                />
              )}
              {CLIENT_ROLES.includes(auth.currentRole.label) && (
                <ChatItemTemplate
                  name="Менеджер сервиса"
                  lastMessage={
                    lastSupportMessage && {
                      isFromAuthUser:
                        lastSupportMessage.authorId === auth.user.id,
                      isUnread: lastSupportMessage?.isUnread,
                      preview: getMessagePreview(lastSupportMessage).preview,
                      creationTime: formatDate(
                        new Date(lastSupportMessage.createdAt),
                        'dd.MM.yyyy',
                      ),
                    }
                  }
                  text={
                    lastSupportMessage?.text
                      ? lastSupportMessage?.text
                      : 'Еще нет сообщений'
                  }
                  unreadMessagesCount={unreadSupportMessagesCount}
                  onClick={() => dispatch(openSideChat('support'))}
                />
              )}
            </>
          )}
          {!userBanned &&
            chats.rows.map((chatItem, i) => (
              <ChatItem
                key={i}
                chatItem={chatItem}
                onItemClick={() => handlers.openChat(chatItem.id)}
              />
            ))}
        </InfiniteScroll>
      </ul>
    </Fragment>
  );
};

export default ChatList;
