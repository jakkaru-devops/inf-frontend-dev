import { IEntityId, IRowsWithCount } from 'interfaces/common.interfaces';
import { IAutoModel } from '../interfaces/categories.interfaces';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS_V2 } from 'data/api.data';

interface IProps {
  search?: string;
  includeHidden?: boolean;
  autoType?: IEntityId;
  autoBrand: IEntityId;
}

export const getAutoModelListService = async (
  params?: IProps,
): Promise<IRowsWithCount<IAutoModel[]>> => {
  const res = await APIRequest({
    method: 'get',
    url: API_ENDPOINTS_V2.productCategories.autoModels,
    params,
  });
  return res?.data;
};
