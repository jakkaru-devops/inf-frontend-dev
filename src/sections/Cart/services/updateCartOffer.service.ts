import { IAPIResponse } from 'interfaces/api.types';
import { ICartProduct } from '../interfaces/interfaces';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS_V2 } from 'data/api.data';

interface IProps {
  warehouseId: string;
  deliveryMethod: string;
}

export const updateCartOfferService = async ({
  warehouseId,
  deliveryMethod,
}: IProps): Promise<IAPIResponse<ICartProduct[]>> =>
  APIRequest({
    method: 'put',
    url: API_ENDPOINTS_V2.cart.updateCartOffer(warehouseId),
    data: {
      deliveryMethod,
    },
  });
