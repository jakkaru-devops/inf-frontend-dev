import { createSlice } from '@reduxjs/toolkit';
import { IChat } from 'components/complex/Messenger/interfaces';
import { INotification } from 'hooks/notifications.hooks/interfaces';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { HYDRATE } from 'next-redux-wrapper';
import { IAppState } from 'store';

export interface IMessengerState {
  unreadMessagesCount: number;
  unreadSupportMessagesCount: number;
  unreadNotificationsCount: {
    total: number;
    personalArea: number;
    orderRequests: number;
    orders: number;
    orderHistory: number;
    refunds: number;
    organizations: number;
    userComplaints: number;
    customers: number;
    sellers: number;
    productOffers: number;
  };
  notifications: IRowsWithCount<INotification[]>;
  messengerExpanded: boolean;
  usersOnline: string[];
  activeSideChat: 'system' | 'support';
  activeChat: IChat;
  orderRequestId?: string;
  newUnreadNotifications: string[];
  newUnreadMessages: string[];
}

const initialState: IMessengerState = {
  unreadMessagesCount: 0,
  unreadSupportMessagesCount: 0,
  unreadNotificationsCount: {
    total: 0,
    personalArea: 0,
    orderRequests: 0,
    orders: 0,
    orderHistory: 0,
    refunds: 0,
    organizations: 0,
    userComplaints: 0,
    customers: 0,
    sellers: 0,
    productOffers: 0,
  },
  notifications: {
    rows: [],
    count: 0,
  },
  messengerExpanded: false,
  usersOnline: [],
  activeSideChat: null,
  activeChat: null,
  orderRequestId: null,
  newUnreadNotifications: [],
  newUnreadMessages: [],
};
const reducerName = 'messenger';

export const messengerSlice = createSlice({
  name: reducerName,
  initialState,
  reducers: {
    setMessengerUnreadMessagesCount(state, action) {
      return {
        ...state,
        unreadMessagesCount: action.payload,
      };
    },
    setMessengerUnreadSupportMessagesCount(state, action) {
      return {
        ...state,
        unreadSupportMessagesCount: action.payload,
      };
    },
    setMessengerUnreadNotificationsCount(state, action) {
      return {
        ...state,
        unreadNotificationsCount: action.payload,
      };
    },
    setMessengerExpanded(state, action) {
      return {
        ...state,
        messengerExpanded: action.payload,
      };
    },
    setMessengerUsersOnline(state, action) {
      return {
        ...state,
        usersOnline: action.payload,
      };
    },
    setNotifications(state, action) {
      return {
        ...state,
        notifications: action.payload,
      };
    },
    openSideChat(state, action) {
      return {
        ...state,
        activeSideChat: action.payload,
        messengerExpanded: true,
      };
    },
    setActiveChat(state, action) {
      return {
        ...state,
        activeChat: action.payload,
        activeSideChat: null,
      };
    },
    goToMessengerRoot(state) {
      return {
        ...state,
        activeSideChat: null,
        activeChat: null,
        notifications: { rows: [], count: 0 },
        orderRequestId: null,
      };
    },
    setMessengerOrderRequestId(state, action) {
      return {
        ...state,
        orderRequestId: action.payload,
      };
    },
    setNewUnreadNotifications(state, action) {
      return {
        ...state,
        newUnreadNotifications: action.payload,
      };
    },
    setNewUnreadMessages(state, action) {
      return {
        ...state,
        newUnreadMessages: action.payload,
      };
    },
  },
  extraReducers: builder => {
    builder.addCase(HYDRATE, (state, action: any) => {
      return {
        ...state,
        ...action.payload[reducerName],
      };
    });
  },
});

export const {
  setMessengerUnreadMessagesCount,
  setMessengerUnreadSupportMessagesCount,
  setMessengerUnreadNotificationsCount,
  setMessengerExpanded,
  setMessengerUsersOnline,
  setNotifications,
  openSideChat,
  setActiveChat,
  goToMessengerRoot,
  setMessengerOrderRequestId,
  setNewUnreadNotifications,
  setNewUnreadMessages,
} = messengerSlice.actions;

export const getMessenger = (state: IAppState) => state.messenger;
