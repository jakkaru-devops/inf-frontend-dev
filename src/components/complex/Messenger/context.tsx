import { API_ENDPOINTS } from 'data/paths.data';
import { useNotifications } from 'hooks/notifications.hooks';
import { INotification } from 'hooks/notifications.hooks/interfaces';
import { ISetState, IRowsWithCount } from 'interfaces/common.interfaces';
import {
  createContext,
  FC,
  ReactNode,
  RefObject,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import InfiniteScroll from 'react-infinite-scroller';
import { useDispatch } from 'react-redux';
import { CLIENT_ROLES } from 'sections/Users/data';
import { getUserName } from 'sections/Users/utils';
import socketService from 'services/socket';
import {
  openSideChat,
  setActiveChat,
  setMessengerExpanded,
  setMessengerOrderRequestId,
  setMessengerUnreadMessagesCount,
  setMessengerUnreadSupportMessagesCount,
  setMessengerUsersOnline,
  setNewUnreadMessages,
} from 'store/reducers/messenger.reducer';
import { APIRequest } from 'utils/api.utils';
import { openNotification, renderHtml } from 'utils/common.utils';
import { CHAT_TYPES, MESSENGER_STRINGS } from './data';
import { IChat, IChatMessage } from './interfaces';
import {
  getMessagePreview,
  replaceHashToEmoji,
  startChatWithUser,
} from './utils/messenger.utils';
import { useAuth } from 'hooks/auth.hook';
import { useMessenger } from 'hooks/messenger.hook';

interface IContext {
  search: string;
  setSearch: ISetState<IContext['search']>;
  chats: IRowsWithCount<IChat[]>;
  setChats: ISetState<IContext['chats']>;
  lastSupportMessage: IChatMessage;
  setLastSupportMessage: ISetState<IChatMessage>;
  activeSideChat: 'system' | 'support';
  messages: IRowsWithCount<IChatMessage[]>;
  setMessages: ISetState<IContext['messages']>;
  deleteMessageId: string;
  setDeleteMessageId: ISetState<IContext['deleteMessageId']>;
  replyToMessage: IChatMessage;
  setReplyToMessage: ISetState<IContext['replyToMessage']>;
  lastNotification: INotification;
  setLastNotification: ISetState<IContext['lastNotification']>;
  scrollRef: RefObject<InfiniteScroll>;
  chatContentRef: RefObject<Scrollbars>;
  handlers: {
    toggleChatExpanded: (value?: boolean) => void;
    openChat: (chatId: IChat['id']) => void;
    fetchLastNotification: () => Promise<void>;
    fetchLastSupportMessage: () => Promise<void>;
    fetchInitialChatList: () => Promise<void>;
    fetchChatList: ({
      page,
      search,
    }: {
      page?: number;
      search?: string;
    }) => Promise<void>;
    fetchChat: (chatId: IChat['id']) => Promise<void>;
    handleSearch: (value: string) => void;
    fetchMessages: (chatId: IChat['id'], page?: number) => Promise<void>;
    fetchTotalUnreadMessagesCount: () => Promise<void>;
    fetchUnreadSupportMessagesCount: () => Promise<void>;
    deleteMessage: (messageId: string) => Promise<void>;
    handleNewMessage: (
      data: { chat: IChat; message: IChatMessage },
      fromMe?: boolean,
    ) => void;
    findAndScrollToRepliedMessage: (repliedMessageId: string) => void;
  };
}

export const Context = createContext<IContext>(null);

export const MESSAGES_PAGE_SIZE = 20;

const ContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const {
    messengerExpanded,
    activeSideChat,
    activeChat,
    notifications,
    newUnreadMessages,
  } = useMessenger();
  const dispatch = useDispatch();
  const { fetchNotifications } = useNotifications();

  const [search, setSearch] = useState('');
  const [chats, setChats] = useState<IContext['chats']>({
    rows: [],
    count: 0,
  });
  const [lastSupportMessage, setLastSupportMessage] = useState(null);

  const [messages, setMessages] = useState<IContext['messages']>({
    rows: [],
    count: 0,
  });
  const [deleteMessageId, setDeleteMessageId] = useState<string>(null);
  const [replyToMessage, setReplyToMessage] = useState<IChatMessage>(null);
  const [lastNotification, setLastNotification] =
    useState<IContext['lastNotification']>(null);

  const scrollRef: IContext['scrollRef'] = useRef();
  const chatContentRef: IContext['chatContentRef'] = useRef();

  useEffect(() => {
    setMessages({
      count: 0,
      rows: [],
    });
    if (activeSideChat === 'system') fetchNotifications(null);
    if (activeSideChat === 'support') fetchMessages('support', null);
  }, [activeSideChat]);

  useEffect(() => {
    if (!activeChat?.id) return;
    fetchMessages(activeChat?.id, 0);
  }, [activeChat?.id]);

  useEffect(() => {
    if (!activeChat?.id && !activeSideChat) {
      fetchInitialChatList();

      fetchUnreadSupportMessagesCount();
    }
  }, [activeChat?.id, activeSideChat]);

  useEffect(() => {
    if (!!chatContentRef?.current && !!messages?.rows?.length) {
      if (messages?.rows?.length > MESSAGES_PAGE_SIZE * 2) return;
      chatContentRef?.current.scrollToBottom();
    }
  }, [chatContentRef?.current, messages]);

  useEffect(() => {
    if (!!chatContentRef?.current && !!notifications?.rows?.length) {
      if (notifications?.rows?.length > MESSAGES_PAGE_SIZE * 2) return;
      chatContentRef?.current.scrollToBottom();
    }
  }, [chatContentRef?.current, notifications]);

  useEffect(() => {
    if (!replyToMessage) return;
    if (!!chatContentRef?.current && !!messages?.rows?.length) {
      chatContentRef?.current.scrollToBottom();
    }
  }, [replyToMessage]);

  useEffect(() => {
    if (!socketService.socket) return;

    // New chat listener
    socketService.socket
      .off(MESSENGER_STRINGS.SERVER_NEW_CHAT)
      .on(MESSENGER_STRINGS.SERVER_NEW_CHAT, () => fetchChatList({}));

    // New message listener
    socketService.socket
      .off(MESSENGER_STRINGS.SERVER_NEW_CHAT_MESSAGE)
      .on(MESSENGER_STRINGS.SERVER_NEW_CHAT_MESSAGE, handleNewMessage);

    // Read message listener
    socketService.socket
      .off(MESSENGER_STRINGS.SERVER_READ_CHAT_MESSAGES)
      .on(MESSENGER_STRINGS.SERVER_READ_CHAT_MESSAGES, handleReadChatMessage);

    // Open chat listener
    socketService.socket
      .off(MESSENGER_STRINGS.SERVER_OPEN_CHAT)
      .on(
        MESSENGER_STRINGS.SERVER_OPEN_CHAT,
        (data: {
          chatId: string;
          chatType: number;
          orderRequestId?: string;
        }) => {
          console.log(data);
          if (
            data.chatType === 300 &&
            CLIENT_ROLES.includes(auth.currentRole.label)
          ) {
            dispatch(openSideChat('support'));
          } else {
            openChat(data.chatId);
          }
          dispatch(setMessengerOrderRequestId(data?.orderRequestId || null));
        },
      );

    socketService.socket
      .off('SERVER:ONLINE_STATUS')
      .on('SERVER:ONLINE_STATUS', (userList: string[]) => {
        dispatch(setMessengerUsersOnline(userList));
      });

    // User's typing listener
    // const TYPING_DELAY = 3000;
    // let typingTimeout: any = null;
    // socketService.socket
    //   .off(MESSENGER_STRINGS.SERVER_CHAT_TYPING)
    //   .on(MESSENGER_STRINGS.SERVER_CHAT_TYPING, handleUserTyping);
  }, [socketService.socket, chatContentRef?.current, newUnreadMessages]);

  useEffect(() => {
    if (!socketService.socket) return;

    socketService.socket
      .off(MESSENGER_STRINGS.SERVER_CHAT_MESSAGE_DELETED)
      .on(
        MESSENGER_STRINGS.SERVER_CHAT_MESSAGE_DELETED,
        ({ message }: { message: IChatMessage }) => {
          if (!activeChat && !activeSideChat) return;
          if (activeChat?.id !== message?.chatId) return;
          console.log('CHECK DELETE');
          setMessages(prev => ({
            count: prev.count - 1,
            rows: prev.rows.filter(el => el.id !== message?.id),
          }));
        },
      );
  }, [
    [socketService.socket, chatContentRef?.current, activeChat, activeSideChat],
  ]);

  // Handlers
  const handleNewMessage = async ({
    chat,
    message,
  }: {
    chat: IChat;
    message: IChatMessage;
  }) => {
    if (message.authorId === auth.user.id) return;

    const messagePreview = getMessagePreview(message);

    // Show message notification
    openNotification(
      <>
        <div>
          <strong>
            {chat?.type === CHAT_TYPES.SUPPORT &&
            CLIENT_ROLES.includes(auth.currentRole?.label)
              ? 'Менеджер'
              : getUserName(messagePreview.author, 'fl')}
          </strong>
        </div>
        <div>{renderHtml(replaceHashToEmoji(messagePreview?.text || ''))}</div>
      </>,
      {
        onClick: () =>
          startChatWithUser({
            companionId: messagePreview.authorId,
            companionRole: message.authorRoleId as any,
            chatId:
              chat.type === 300 && CLIENT_ROLES.includes(auth.currentRole.label)
                ? 'support'
                : chat.id,
          }),
        sound: 'message',
      },
    );
    dispatch(setNewUnreadMessages(newUnreadMessages.concat(message.id)));

    if (!!activeChat && activeChat?.id === message?.chatId) {
      // if (!!chatContentRef.current) {
      fetchChat(message.chatId);
      setMessages(prev => ({
        count: prev.count + 1,
        rows: prev.rows.concat(message),
      }));
      await APIRequest<any>({
        method: 'post',
        url: API_ENDPOINTS.CHAT_UNREAD,
        params: { chatId: chat.id },
        requireAuth: true,
      });
      // }
    }

    fetchInitialChatList();
    fetchTotalUnreadMessagesCount();
    if (chat.type === 300) {
      fetchUnreadSupportMessagesCount();
      fetchLastSupportMessage();
    }
  };

  const handleReadChatMessage = ({ userId, chatId }) => {
    if (userId === auth?.user?.id) return;
    if (!!chatContentRef?.current) {
      if (activeChat?.id !== chatId) return;
      setMessages(prev => ({
        ...prev,
        rows: prev.rows.map(message => ({
          ...message,
          isUnread: false,
        })),
      }));
    } else {
      fetchInitialChatList();
      fetchUnreadSupportMessagesCount();
    }
  };

  // const handleUserTyping = ({ chatId, userId }) => {
  //   setChatUserTyping({ ...chatId, userId, isTyping: true });

  //   if (chatContentRef.current) {
  //     chatContentRef.current.scrollToBottom();
  //   }

  //   if (typingTimeout) clearTimeout(typingTimeout);

  //   typingTimeout = setTimeout(() => {
  //     setChatUserTyping({ ...{ chatId, userId }, isTyping: false });
  //   }, TYPING_DELAY);

  //   return () => clearTimeout(typingTimeout);
  // };

  const toggleChatExpanded = (value?: boolean) =>
    dispatch(setMessengerExpanded(value ? value : !messengerExpanded));

  const openChat = (chatId: IChat['id']) => {
    if (['system', 'support'].includes(chatId)) return;
    toggleChatExpanded(true);
    fetchChat(chatId);
  };

  const handleSearch = (value: string) => setSearch(value);

  const fetchLastNotification = async () => {
    const lastNotificationRes = await APIRequest<
      IRowsWithCount<INotification[]>
    >({
      method: 'get',
      url: API_ENDPOINTS.NOTIFICATION_LIST,
      params: { page: 1, pageSize: 1 },
      requireAuth: true,
    });

    if (lastNotificationRes.isSucceed && lastNotificationRes.data.count > 0)
      setLastNotification(lastNotificationRes.data.rows[0]);
  };

  const fetchInitialChatList = async () => {
    const chatsRes = await APIRequest<IRowsWithCount<IChat[]>>({
      method: 'get',
      url: API_ENDPOINTS.CHAT_LIST,
      params: { limit: 10 },
      requireAuth: true,
    });
    const chats = chatsRes.data;

    if (chatsRes.isSucceed) {
      setChats(chats);
      dispatch(
        setMessengerUsersOnline(
          chats.rows
            .map(chat => chat.companion.user)
            .flat()
            .filter(user => user.isOnline && user.id !== auth.user.id)
            .map(user => user.id),
        ),
      );
    }
  };

  const fetchChatList = async ({
    page,
    search,
  }: {
    page?: number;
    search?: string;
  }) => {
    console.log('FETCH CHAT LIST', page);
    if (page <= 1) return;
    const res = await APIRequest<IRowsWithCount<IChat[]>>({
      method: 'get',
      url: API_ENDPOINTS.CHAT_LIST,
      params: {
        search,
        page,
        pageSize: 10,
      },
      requireAuth: true,
    });
    if (!res.isSucceed) return;

    /* // Если в компоненте InfiniteScroll параметр pageLoaded
    // погнал куда то не туда то обнуляем его через ref
    if (params['offset'] > res.data.count) {
      // fetchInitialChatList();
      if (scrollRef.current) {
        scrollRef.current['pageLoaded'] = 1;
      }
      return;
    } */

    setChats(chats => ({
      rows: search ? res.data.rows : chats.rows.concat(res.data.rows),
      count: res.data.count,
    }));

    // setChats(chats => ({
    //   rows: search ? res.data.rows : chats.rows.concat(res.data.rows),
    //   count: res.data.count,
    // }));
  };

  const fetchLastSupportMessage = async () => {
    if (['manager', 'operator'].includes(auth?.currentRole?.label)) return;

    const messageRes = await APIRequest<IRowsWithCount<IChatMessage[]>>({
      method: 'get',
      url: API_ENDPOINTS.SUPPORT_CHAT_MESSAGE,
      params: { page: 1, pageSize: 1 },
      requireAuth: true,
    });

    if (messageRes.isSucceed && messageRes.data.count > 0)
      setLastSupportMessage(messageRes.data.rows[0]);
  };

  const fetchChat = async (chatId: IChat['id']) => {
    const res = await APIRequest<IChat>({
      method: 'get',
      url: API_ENDPOINTS.CHAT,
      params: { chatId },
      requireAuth: true,
    });

    if (!res.isSucceed) return;
    const chatData = res.data;

    dispatch(setActiveChat(chatData));
  };

  const fetchMessages = async (chatId: IChat['id'], page: number) => {
    if (!chatId) {
      setMessages({ rows: [], count: 0 });
      return;
    }

    console.log('PAGE', page, !!page);

    const res = await APIRequest<IRowsWithCount<IChatMessage[]>>({
      method: 'get',
      url: API_ENDPOINTS.CHAT_MESSAGE,
      params: {
        chatId,
        offset: messages?.rows?.length,
        pageSize: MESSAGES_PAGE_SIZE,
      },
      requireAuth: true,
    });
    if (!res.isSucceed) return;
    const resData = res?.data;

    const isInit = !page;

    setMessages(prevMessages => {
      const mewMessages = resData.rows.filter(
        newMessage => !prevMessages.rows?.find(el => el?.id === newMessage?.id),
      );
      return {
        rows: isInit ? [] : mewMessages.concat(prevMessages.rows),
        count: resData.count,
      };
    });
    // Remove unread messages count from the browser tab
    dispatch(
      setNewUnreadMessages(
        newUnreadMessages.filter(
          messageId => !resData?.rows?.find(el => el.id === messageId),
        ),
      ),
    );

    if (isInit) {
      if (
        resData.count > 0 &&
        resData.rows.some(
          (message: IChatMessage) =>
            message.authorId !== auth.user.id && message.isUnread,
        )
      ) {
        await APIRequest<any>({
          method: 'post',
          url: API_ENDPOINTS.CHAT_UNREAD,
          params: { chatId },
          requireAuth: true,
        });
        fetchTotalUnreadMessagesCount();
        fetchInitialChatList();
      }
    }
  };

  const fetchTotalUnreadMessagesCount = async () => {
    const res = await APIRequest<number>({
      method: 'get',
      url: API_ENDPOINTS.CHAT_UNREAD,
      requireAuth: true,
    });

    dispatch(setMessengerUnreadMessagesCount(res.data));
  };

  const fetchUnreadSupportMessagesCount = async () => {
    if (!CLIENT_ROLES.includes(auth.currentRole.label)) return;

    const res = await APIRequest<number>({
      method: 'get',
      url: API_ENDPOINTS.CHAT_UNREAD_SUPPORT,
      requireAuth: true,
    });

    dispatch(setMessengerUnreadSupportMessagesCount(res.data));
  };

  const deleteMessage = async (messageId: string) => {
    const res = await APIRequest<any>({
      method: 'delete',
      url: API_ENDPOINTS.CHAT_MESSAGE,
      params: {
        id: messageId,
      },
      requireAuth: true,
    });
    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }
    setDeleteMessageId(null);
    if (!!messages.rows.find(el => el.id === messageId)) {
      setMessages(prev => ({
        count: prev.count - 1,
        rows: prev.rows.filter(el => el.id !== messageId),
      }));
    }
  };

  const scrollToMessage = (messageId: string) => {
    const scrollContainer: HTMLDivElement = document.querySelector(
      '.messenger-window__track-vertical > div',
    );
    const row: HTMLDivElement = document.querySelector(
      `.chat-message-${messageId}`,
    );
    if (!row) return;
    const offset = row.offsetTop;
    scrollContainer.scrollTo({ top: offset - 50, behavior: 'smooth' });
  };

  const findAndScrollToRepliedMessage = async (repliedMessageId: string) => {
    if (!!messages.rows.find(el => el.id === repliedMessageId)) {
      scrollToMessage(repliedMessageId);
      return;
    }

    const res = await APIRequest<IRowsWithCount<IChatMessage[]>>({
      method: 'get',
      url: API_ENDPOINTS.CHAT_MESSAGE,
      params: {
        chatId: activeChat?.id || 'support',
        offset: messages.rows.length,
        pageSize: 'all',
      },
      requireAuth: true,
    });
    if (!res.isSucceed) return;
    const resData = res.data;

    const messageIndex = resData.rows.findIndex(
      el => el.id === repliedMessageId,
    );
    if (messageIndex === -1 || !chatContentRef?.current) return;

    const rowsNumber =
      Math.ceil(resData.rows.length / MESSAGES_PAGE_SIZE) * MESSAGES_PAGE_SIZE;
    resData.rows = resData.rows.filter((__, i) => i < rowsNumber);
    console.log(resData);

    setMessages(messages => ({
      rows: resData.rows.concat(messages.rows),
      count: resData.count,
    }));
    scrollToMessage(repliedMessageId);
  };

  return (
    <Context.Provider
      value={{
        search,
        setSearch,
        chats,
        setChats,
        lastSupportMessage,
        setLastSupportMessage,
        activeSideChat,
        messages,
        setMessages,
        deleteMessageId,
        setDeleteMessageId,
        replyToMessage,
        setReplyToMessage,
        lastNotification,
        setLastNotification,
        scrollRef,
        chatContentRef,
        handlers: {
          toggleChatExpanded,
          openChat,
          fetchLastNotification,
          fetchLastSupportMessage,
          fetchInitialChatList,
          fetchChatList,
          fetchChat,
          handleSearch,
          fetchMessages,
          fetchTotalUnreadMessagesCount,
          fetchUnreadSupportMessagesCount,
          deleteMessage,
          handleNewMessage,
          findAndScrollToRepliedMessage,
        },
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default ContextProvider;
