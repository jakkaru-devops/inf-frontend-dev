import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import { authSlice } from './reducers/auth.reducer';
import { cartSlice } from './reducers/cart.reducer';
import { localesSlice } from './reducers/locales.reducer';
import { messengerSlice } from './reducers/messenger.reducer';
import { offerProductSelectionSlice } from './reducers/offerProductSelection.reducer';
import { catalogExternalSlice } from './reducers/catalogExternal.reducer';

const makeStore = () =>
  configureStore({
    reducer: {
      [authSlice.name]: authSlice.reducer,
      [cartSlice.name]: cartSlice.reducer,
      [localesSlice.name]: localesSlice.reducer,
      [messengerSlice.name]: messengerSlice.reducer,
      [offerProductSelectionSlice.name]: offerProductSelectionSlice.reducer,
      [catalogExternalSlice.name]: catalogExternalSlice.reducer,
    },
    devTools: true,
    // middleware: [logger],
  });

export type IAppStore = ReturnType<typeof makeStore>;
export type IAppState = ReturnType<IAppStore['getState']>;
export type IAppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  IAppState,
  unknown,
  Action
>;

export const wrapper = createWrapper<IAppStore>(makeStore, {
  debug: false,
});
