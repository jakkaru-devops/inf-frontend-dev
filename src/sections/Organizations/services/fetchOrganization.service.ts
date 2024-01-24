import { API_ENDPOINTS } from 'data/paths.data';
import { APIRequest } from 'utils/api.utils';
import { IOrganization } from '../interfaces';
import { IEntityId } from 'interfaces/common.interfaces';

export const fetchOrganizationService = async (id: IEntityId) => {
  const res = await APIRequest({
    method: 'get',
    url: API_ENDPOINTS.ORGANIZATION,
    params: {
      id,
    },
    requireAuth: true,
  });

  return res?.data as IOrganization;
};
