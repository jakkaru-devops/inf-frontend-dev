import { IRowsWithCount } from 'interfaces/common.interfaces';
import { IAutoType } from '../interfaces/categories.interfaces';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS_V2 } from 'data/api.data';

interface IProps {
  search?: string;
}

export const getAutoTypeListService = async (
  params?: IProps,
): Promise<IRowsWithCount<IAutoType[]>> => {
  const res = await APIRequest({
    method: 'get',
    url: API_ENDPOINTS_V2.productCategories.autoTypes,
    params,
  });
  return res?.data;
};
