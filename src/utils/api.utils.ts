import axios from 'axios';
import jsCookie from 'js-cookie';
import { API_SERVER_URL } from 'config/env';
import { IAPIResponse, IAPIRequest } from 'interfaces/api.types';
import { openNotification } from './common.utils';
import { STRINGS } from 'data/strings.data';

export function apiUrl(path?: string) {
  const middleStr = path ? (path[0] === '/' ? '' : '/') : '';
  return API_SERVER_URL + middleStr + path;
}

export function fileUrl(path: string) {
  const middleStr = path ? (path[0] === '/' ? '' : '/') : '';
  return API_SERVER_URL + '/files' + middleStr + path;
}

/**
 * Sends request to API SERVER
 */
export const APIRequest = async <T>({
  method,
  url,
  params,
  data,
  headers,
  onUploadProgress,
  onError,
  serverCookies,
}: IAPIRequest) => {
  const result: Promise<IAPIResponse<T | any>> = new Promise(
    async (resolve, reject) => {
      headers = headers || {};

      // Add auth token to headers
      const authToken = serverCookies
        ? serverCookies.get(STRINGS.AUTH_TOKEN)
        : jsCookie.get(STRINGS.AUTH_TOKEN);
      if (!!authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      // Add user current role to headers
      const userRole = serverCookies
        ? serverCookies.get(STRINGS.CURRENT_ROLE)
        : jsCookie.get(STRINGS.CURRENT_ROLE);
      if (!!userRole) {
        headers['user-role'] = userRole;
      }

      // Add user content language to headers
      const languageLabel = serverCookies
        ? serverCookies.get('language')
        : jsCookie.get('language');
      if (!!languageLabel) {
        headers['content-language'] = languageLabel;
      }

      // Request to API
      const res = await axios({
        method,
        url: apiUrl(url),
        params,
        data,
        headers,
        onUploadProgress,
      });
      if (!res) {
        if (onError) {
          onError(res);
        }
        return resolve({
          ...res,
          isSucceed: false,
        });
      }

      res.data.config = res.config;

      if (res.data.status === 403) {
        openNotification('Недостаточно прав для выполнения операции');

        if (onError) {
          onError(res);
        }

        return resolve({
          ...res,
          isSucceed: false,
        });
      }

      if (res.data.status === 200) {
        return resolve({
          ...res.data,
          isSucceed: true,
        });
      } else {
        if (onError) {
          onError(res.data);
        }
        return resolve({
          ...res.data,
          isSucceed: false,
        });
        // reject(res.data as APIErrorType)
      }
    },
  );
  return result;
};
