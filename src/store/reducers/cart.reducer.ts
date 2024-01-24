import { createSlice } from '@reduxjs/toolkit';
import { STRINGS } from 'data/strings.data';
import { IAddress } from 'interfaces/common.interfaces';
import jsCookie from 'js-cookie';
import { HYDRATE } from 'next-redux-wrapper';
import { ICartProductBasic } from 'sections/Cart/interfaces/interfaces';
import { IAppState } from 'store';
import { getInitialAddress, isClientSide } from 'utils/common.utils';

export interface ICartState {
  products: ICartProductBasic[];
  deliveryAddress: IAddress;
  productsUpdatedAt: string;
}

const initialState: ICartState = {
  products: [],
  deliveryAddress: getInitialAddress(),
  productsUpdatedAt: new Date().toString(),
};
const reducerName = 'cart';

export const cartSlice = createSlice({
  name: reducerName,
  initialState,
  reducers: {
    setProducts(state, action) {
      state.products = action.payload;
      state.productsUpdatedAt = new Date().toString();
    },
    setDeliveryAddress(state, action) {
      state.deliveryAddress = action.payload;
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

export const setCartProducts = (cartProducts: ICartState['products']) => {
  if (isClientSide()) {
    localStorage.setItem(STRINGS.CART.PRODUCTS, JSON.stringify(cartProducts));
    localStorage.setItem(
      STRINGS.CART.PRODUCTS_UPDATED_AT,
      new Date().toString(),
    );
  }
  return cartSlice.actions.setProducts(cartProducts);
};

export const setCartDeliveryAddress = (
  address: ICartState['deliveryAddress'],
) => {
  if (isClientSide()) {
    jsCookie.set(STRINGS.DELIVERY_ADDRESS, address);
  }
  return cartSlice.actions.setDeliveryAddress(address);
};

export const getCart = (state: IAppState) => state.cart;
