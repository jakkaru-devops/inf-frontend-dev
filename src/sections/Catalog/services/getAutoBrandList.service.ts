import { IEntityId, IRowsWithCount } from 'interfaces/common.interfaces';
import { IAutoBrand } from '../interfaces/categories.interfaces';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS_V2 } from 'data/api.data';

interface IProps {
  search?: string;
  includeHidden?: boolean;
  autoType?: IEntityId;
}

export const getAutoBrandListService = async (
  params?: IProps,
): Promise<IRowsWithCount<IAutoBrand[]>> => {
  const res = await APIRequest({
    method: 'get',
    url: API_ENDPOINTS_V2.productCategories.autoBrands,
    params,
  });
  return res?.data;
};
