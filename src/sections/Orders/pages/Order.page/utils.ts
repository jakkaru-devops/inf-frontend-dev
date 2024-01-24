import { IOrder } from './../../interfaces';

export const hasOfferRefunds = (offer: IOrder): boolean =>
  offer.products.some(({ refundExchangeRequest }) => refundExchangeRequest);
