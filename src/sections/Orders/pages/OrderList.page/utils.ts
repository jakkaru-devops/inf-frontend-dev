import { IOrderRequest } from 'sections/Orders/interfaces';

export const hasOrderRefunds = (order: IOrderRequest): boolean =>
  order.orders.some(({ products }) =>
    products.some(({ refundExchangeRequest }) => refundExchangeRequest),
  );
