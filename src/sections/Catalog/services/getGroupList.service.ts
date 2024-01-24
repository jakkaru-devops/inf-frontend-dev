import { IProductGroup } from '../interfaces/categories.interfaces';
import { APIRequest } from 'utils/api.utils';
import { IEntityId, IRowsWithCount } from 'interfaces/common.interfaces';
import { API_ENDPOINTS_V2 } from 'data/api.data';

export interface IGetProductGroupListProps {
  search?: string;
  includeHidden?: boolean;
  autoType?: IEntityId;
  autoBrand?: IEntityId;
  parent?: IEntityId;
  catalog?: 'main' | 'side';
}

export const getGroupListService = async (
  params?: IGetProductGroupListProps,
): Promise<IRowsWithCount<IProductGroup[]>> => {
  const res = await APIRequest({
    method: 'get',
    url: API_ENDPOINTS_V2.productCategories.groups,
    params,
  });
  return res?.data;
};
