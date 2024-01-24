import { createSlice } from '@reduxjs/toolkit';
import { STRINGS } from 'data/strings.data';
import _ from 'lodash';
import { HYDRATE } from 'next-redux-wrapper';
import {
  IDescribedProduct,
  IProduct,
} from 'sections/Catalog/interfaces/products.interfaces';
import { IOrderRequest } from 'sections/Orders/interfaces';
import { IAppState } from 'store';

export interface IOfferProductSelectionState {
  orderRequestId?: IOrderRequest['id'];
  orderRequest?: IOrderRequest;
  activeProductIndex?: number;
  products: IOfferSelectedProduct[];
  describedProduct: IDescribedProduct;
  isVisible: boolean;
}

export interface IOfferSelectedProduct {
  orderRequestId: string;
  requestProductId?: IProduct['id'];
  offerProductId?: IProduct['id'];
  productId?: IProduct['id'];
  acatProductId?: string;
  product?: IProduct;
  /** Requested quantity */
  quantity?: number;
  /** Offered quantity */
  count?: number;
  unitPrice?: number;
  deliveryQuantity?: number;
  deliveryTerm?: number;
  altName?: string;
  altManufacturer?: string;
  altArticle?: string;
  reserveName?: string;
  reserveManufacturer?: string;
  reserveArticle?: string;
  productCategoryId?: string;
  newProduct?: {
    article: string;
    name: string;
    manufacturer: string;
  };
}

export const initialState: IOfferProductSelectionState = {
  orderRequestId: null,
  orderRequest: null,
  activeProductIndex: null,
  products: [],
  describedProduct: null,
  isVisible: true,
};
const reducerName = 'offerProductSelection';

export const offerProductSelectionSlice = createSlice({
  name: reducerName,
  initialState,
  reducers: {
    setOfferProductSelection(
      state,
      action: { payload: IOfferProductSelectionState },
    ) {
      state.orderRequestId = action.payload.orderRequestId;
      state.orderRequest = action.payload.orderRequest;
      state.activeProductIndex = action.payload.activeProductIndex;
      state.products = action.payload.products;
      state.isVisible = action.payload.isVisible;
    },
    setOfferProductSelectionOrderRequest(
      state,
      action: { payload: IOrderRequest },
    ) {
      state.orderRequestId = action.payload?.id;
      state.orderRequest = action.payload;
    },
    setOfferProductSelectionProducts(state, action) {
      state.products = action.payload;
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

export const { setOfferProductSelectionOrderRequest } =
  offerProductSelectionSlice.actions;

export const setOfferProductSelection = (data: IOfferProductSelectionState) => {
  if (!data) return;

  localStorage.setItem(
    STRINGS.OFFER_PRODUCT_SELECTION,
    JSON.stringify({
      orderRequestId: data?.orderRequestId || data?.orderRequest?.id,
      activeProductIndex: data?.activeProductIndex,
      products: data?.products,
    }),
  );

  return offerProductSelectionSlice.actions.setOfferProductSelection(data);
};

export const setOfferProductSelectionProduct = (
  data: {
    orderRequestId: IOrderRequest['id'];
    product: IProduct;
    newProduct?: IOfferSelectedProduct['newProduct'];
    productId?: IProduct['id'];
    unitPrice?: number;
    count?: number;
    deliveryQuantity?: number;
    deliveryTerm?: number;
    acatProductId?: string;
  },
  index: number,
  state: IOfferProductSelectionState,
) => {
  const newProducts = _.cloneDeep(state.products || []);
  newProducts[index] = data;

  localStorage.setItem(
    STRINGS.OFFER_PRODUCT_SELECTION,
    JSON.stringify({
      ...state,
      products: newProducts,
    }),
  );

  return offerProductSelectionSlice.actions.setOfferProductSelectionProducts(
    newProducts,
  );
};

export const getOfferProductSelection = (state: IAppState) =>
  state.offerProductSelection;
