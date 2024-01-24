import { IProductGroup } from 'sections/Catalog/interfaces/categories.interfaces';
import { ISellerAutoBrand } from '../interfaces';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS_V2 } from 'data/api.data';
import { IEntityId } from 'interfaces/common.interfaces';

interface IProps {
  /**
   * Get categories of authenticated user if ```userId``` is not provided
   */
  userId?: IEntityId;
}

export const getSellerProductCategoriesService = async (
  params?: IProps,
): Promise<{
  sellerAutoBrands: ISellerAutoBrand[];
  sellerGroupIds: IProductGroup['id'][];
}> => {
  const userId = params?.userId;
  const response = await APIRequest({
    method: 'get',
    url: !!userId
      ? API_ENDPOINTS_V2.sellers.productCategories(userId)
      : API_ENDPOINTS_V2.profile.sellerProductCategories,
  });
  return response.data;
};
