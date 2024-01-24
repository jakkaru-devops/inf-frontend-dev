import { AxiosRequestConfig } from 'axios';
import Cookies from 'cookies';

import { IServerFile } from './files.interfaces';

export interface IAPIResponse<T> {
  status: number;
  data: T;
  config: AxiosRequestConfig;
  message?: string;
  uploadedFile?: IServerFile;
  isSucceed: boolean;
}

export interface IAPIError {
  res: Response;
  status: number;
  error?: Error | null;
  message: string;
}

export interface IAPIBadRequestError {
  message: string;
}

export interface IAPIRequest extends AxiosRequestConfig {
  requireAuth?: boolean;
  onError?: (err: any) => void;
  serverCookies?: Cookies;
}
