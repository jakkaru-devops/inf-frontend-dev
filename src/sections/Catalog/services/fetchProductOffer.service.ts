import { API_ENDPOINTS } from 'data/paths.data';
import { APIRequest } from 'utils/api.utils';
import { IProductOffer } from '../interfaces/products.interfaces';

export const fetchProductOfferService = async (id: IProductOffer['id']) => {
  const res = await APIRequest({
    method: 'get',
    url: API_ENDPOINTS.PRODUCT_OFFER(id),
    params: {
      id,
    },
    requireAuth: true,
  });

  return res?.data as IProductOffer;
};
