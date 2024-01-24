import { APIRequest } from 'utils/api.utils';
import {
  IOrder,
  IOrderAttachment,
  IOrderRequest,
  IRequestProduct,
} from '../interfaces';
import { API_ENDPOINTS_V2 } from 'data/api.data';
import { IAPIResponse } from 'interfaces/api.types';

interface IProps {
  orderId: IOrderRequest['id'];
  offerId: IOrder['id'];
  products: Array<{
    id: IRequestProduct['id'];
    quantity: number;
  }>;
}

export const getAcceptanceActDocumentService = async ({
  orderId,
  offerId,
  products,
}: IProps): Promise<
  IAPIResponse<{ title: string; file: any; attachment: IOrderAttachment }>
> =>
  APIRequest({
    method: 'post',
    url: API_ENDPOINTS_V2.orders.acceptanceActDocument(orderId, offerId),
    data: { products },
  });
