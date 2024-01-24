import { MouseEvent } from 'react';
import { NextRouter } from 'next/router';
import {
  IProduct,
  IProductCategory,
  IProductCategoryType,
  IProductOffer,
} from './products.interfaces';
import { IAuthState } from 'store/reducers/auth.reducer';

export interface ICatalogRouteProps {
  categoryTypeList: IProductCategoryType[];
  favoriteCategoryList?: IProductCategory[];
  products: {
    count: number;
    rows: IProduct[];
  };
}

export interface ICatalogRouter extends NextRouter {
  query: {
    layout?: ICatalogLayout;
    orderBy?: ICatalogOrder;
    orderDirection?: string;
    pageSize?: string;
    autoType?: string;
    autoBrand?: string;
    autoModel?: string;
    category?: string;
    subcategory?: string;
    popularCategory?: string;
    search?: string;
    history: string;
  };
}

export type ICatalogLayout = 'tile' | 'row';
export type ICatalogOrder = 'price' | 'date' | 'name';
export type IProductItemFormat = 'default' | 'min';

export interface IProductItemViewProps {
  auth: IAuthState;
  product: IProduct;
  format: IProductItemFormat;
  imageUrl: string;
  isInCart: boolean;
  handleCartButtonClick: (
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
  ) => void;
  isInFavorites: boolean;
  handleFavoriteButtonClick: (
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
  ) => void;
}

export interface IProductOfferListRouteProps {
  apiRes: {
    categoryTypes: {
      [key: string]: {
        rows: IProductCategory[];
        count: number;
      };
    };
    productOffers: {
      count: number;
      rows: IProductOffer[];
    };
  };
}
