import { API_ENDPOINTS } from 'data/paths.data';
import { APIRequest } from 'utils/api.utils';
import { IOrder } from '../interfaces';

export const fetchOrderService = async (id: IOrder['id']) => {
  const res = await APIRequest({
    method: 'get',
    url: API_ENDPOINTS.ORDER,
    params: {
      id,
    },
    requireAuth: true,
  });

  return res?.data as IOrder;
};
