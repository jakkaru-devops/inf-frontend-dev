import { APIRequest } from 'utils/api.utils';
import { IOrder, IOrderRequest } from '../interfaces';
import { IAPIResponse } from 'interfaces/api.types';
import { API_ENDPOINTS_V2 } from 'data/api.data';

interface IProps {
  orderId: IOrderRequest['id'];
  offerId: IOrder['id'];
}

export const fetchOfferService = async ({
  orderId,
  offerId,
}: IProps): Promise<IAPIResponse<IOrder>> =>
  await APIRequest({
    method: 'get',
    url: API_ENDPOINTS_V2.orders.getOffer(orderId, offerId),
  });
