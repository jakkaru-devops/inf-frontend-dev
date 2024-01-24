import { IEntityId } from 'interfaces/common.interfaces';
import { API_ENDPOINTS_V2 } from 'data/api.data';
import { APIRequest } from 'utils/api.utils';
import { IProductPriceOfferGroup } from '../interfaces/products.interfaces';
import { IAPIResponse } from 'interfaces/api.types';

interface IProps {
  productId: IEntityId;
}

export const getProductsPricesService = async ({
  productId,
}: IProps): Promise<IAPIResponse<IProductPriceOfferGroup[]>> => {
  const res = await APIRequest({
    method: 'get',
    url: API_ENDPOINTS_V2.products.productPrices(productId),
  });
  return res;
};
