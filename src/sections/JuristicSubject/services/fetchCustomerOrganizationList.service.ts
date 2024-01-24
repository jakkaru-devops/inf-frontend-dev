import { API_ENDPOINTS } from 'data/paths.data';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { IUser } from 'sections/Users/interfaces';
import { APIRequest } from 'utils/api.utils';
import { IJuristicSubject } from '../interfaces';
import { IAPIResponse } from 'interfaces/api.types';

interface IProps {
  userId: IUser['id'];
}

export const fetchCustomerOrganizationListService = async ({
  userId,
}: IProps) =>
  APIRequest<IRowsWithCount<IJuristicSubject[]>>({
    method: 'get',
    url: API_ENDPOINTS.USER_JURISTIC_SUBJECT_LIST,
    params: { userId },
  }) as Promise<IAPIResponse<IRowsWithCount<IJuristicSubject[]>>>;
