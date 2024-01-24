import { API_ENDPOINTS } from 'data/paths.data';
import { APIRequest } from 'utils/api.utils';
import { IOrderRequest } from '../interfaces';
import { IAuthState } from 'store/reducers/auth.reducer';

export const fetchOrderRequestService = async (
  id: IOrderRequest['id'],
  auth: IAuthState,
) => {
  const res = await APIRequest({
    method: 'get',
    url:
      auth?.currentRole?.label === 'seller'
        ? API_ENDPOINTS.ORDER_REQUEST_AS_SELLER
        : API_ENDPOINTS.ORDER_REQUEST,
    params: {
      id,
    },
    requireAuth: true,
  });

  return res?.data as IOrderRequest;
};
