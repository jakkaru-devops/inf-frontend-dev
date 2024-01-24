import { API_ENDPOINTS_V2 } from 'data/api.data';
import { IAPIResponse } from 'interfaces/api.types';
import { IAddress } from 'interfaces/common.interfaces';
import { IOrderRequest } from 'sections/Orders/interfaces';
import { APIRequest } from 'utils/api.utils';

interface IProps {
  deliveryAddress: IAddress;
}

export const createPricedOrderService = ({
  deliveryAddress,
}: IProps): Promise<IAPIResponse<{ order: IOrderRequest }>> =>
  APIRequest({
    method: 'post',
    url: API_ENDPOINTS_V2.orders.createPricedOrder,
    data: {
      deliveryAddress,
    },
  });
