import { API_ENDPOINTS_V2 } from 'data/api.data';
import { APIRequest } from 'utils/api.utils';
import { ICartProductBasic } from '../interfaces/interfaces';

export const getCartProductBySellersService = ({
  cartProducts,
}: {
  cartProducts: ICartProductBasic[];
}) =>
  APIRequest({
    method: 'post',
    url: API_ENDPOINTS_V2.cart.productsBySellers,
    data: {
      cartProducts,
    },
  });
