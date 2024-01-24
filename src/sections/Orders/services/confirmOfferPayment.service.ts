import { APIRequest } from 'utils/api.utils';
import { IOrder, IOrderRequest } from '../interfaces';
import { IEntityId } from 'interfaces/common.interfaces';
import { API_ENDPOINTS_V2 } from 'data/api.data';

interface IProps {
  orderId: IEntityId;
  offerId: IEntityId;
}

export const confirmOfferPaymentService = async ({
  orderId,
  offerId,
}: IProps) =>
  await APIRequest<{ order: IOrderRequest; offer: IOrder }>({
    method: 'patch',
    url: API_ENDPOINTS_V2.orders.confirmOfferPayment(orderId, offerId),
  });
