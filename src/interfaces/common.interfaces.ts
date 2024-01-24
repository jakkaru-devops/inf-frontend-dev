import { CSSProperties, Dispatch, ReactNode, SetStateAction } from 'react';

export interface IComponentCommonProps {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export type IEntityId = number | string;

export interface IRandomCodeType {
  length: number;
  numbers?: boolean;
  symbols?: boolean;
  lowercase?: boolean;
  uppercase?: boolean;
  excludeSimilarCharacters?: boolean;
}

export interface IAddress extends IDBEntity {
  country: string;
  region?: string;
  regionFiasId?: string;
  area?: string;
  areaFiasId?: string;
  city?: string;
  cityFiasId?: string;
  settlement?: string;
  settlementFiasId?: string;
  street?: string;
  building?: string;
  apartment?: string;
  postcode?: string;
}

export interface IDBEntity {
  id?: string;
  idInt?: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

declare global {
  interface Window {
    opera: string;
  }
}

export type IRowsWithCount<T> = { rows: T; count: number };

export interface IGenerateUrlParams {
  domain?: string;
  pathname?: string;
  /**
   * Remove all params except searchParams from 1st prop
   */
  removeCurrentParams?: boolean;
}

export type ISetState<T> = Dispatch<SetStateAction<T>>;
