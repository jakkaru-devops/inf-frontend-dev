import { createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { IUser, IUserRoleOption } from 'sections/Users/interfaces';
import { TRegion } from 'components/common/SelectSettlementsModal/interfaces';
import { getInitialUser } from 'sections/Users/data';
import socketService from 'services/socket';
import { IAppState } from 'store';
import { STRINGS } from 'data/strings.data';
import jsCookie from 'js-cookie';

export interface IAuthState {
  user: IUser;
  currentRole: IUserRoleOption;
  isAuthenticated: boolean;
  isLoaded: boolean;
  savedRegions: TRegion[];
  hideSellerRewards: boolean;
  sellerRegisterSimplified: boolean;
}

const initialState: IAuthState = {
  user: getInitialUser(),
  currentRole: null,
  isAuthenticated: false,
  isLoaded: false,
  savedRegions: [],
  hideSellerRewards: false,
  sellerRegisterSimplified: false,
};
const reducerName = 'auth';

export const authSlice = createSlice({
  name: reducerName,
  initialState,
  reducers: {
    setAuth(state, action: { payload: IAuthState }) {
      return {
        user: action.payload.user,
        currentRole: action.payload.currentRole,
        isAuthenticated: action.payload.isAuthenticated,
        isLoaded: action.payload.isLoaded,
        savedRegions: action.payload.savedRegions,
        hideSellerRewards: action.payload.hideSellerRewards,
        sellerRegisterSimplified: action.payload.sellerRegisterSimplified,
      };
    },
    setAuthUser(state, action) {
      return {
        ...state,
        user: action.payload,
      };
    },
    setAuthIsLoaded(state, action) {
      return {
        ...state,
        isLoaded: action.payload,
      };
    },
    setAuthIsAuthenticated(state, action) {
      return {
        ...state,
        isAuthenticated: action.payload,
      };
    },
    setAuthUserRole(state, action) {
      return {
        ...state,
        currentRole: action.payload,
      };
    },
    setAuthSavedRegions(state, action) {
      return {
        ...state,
        savedRegions: action.payload,
      };
    },
    logout(state) {
      return {
        ...state,
        user: getInitialUser(),
        currentRole: null,
        isAuthenticated: false,
        savedRegions: [],
        hideSellerRewards: false,
        sellerRegisterSimplified: false,
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
  setAuth,
  setAuthIsLoaded,
  setAuthIsAuthenticated,
  setAuthUserRole,
  setAuthSavedRegions,
} = authSlice.actions;

export const setAuthUser = (user: IUser) => {
  socketService.socket.emit('CLIENT:ONLINE_STATUS', user.id);
  return authSlice.actions.setAuthUser(user);
};

export const logout = () => {
  localStorage.removeItem(STRINGS.CART.PRODUCTS);
  localStorage.removeItem(STRINGS.OFFER_PRODUCT_SELECTION);
  jsCookie.remove(STRINGS.AUTH_TOKEN);
  jsCookie.remove(STRINGS.CURRENT_ROLE);
  socketService.socket.disconnect();

  return authSlice.actions.logout();
};

export const getAuth = (state: IAppState) => state.auth;
