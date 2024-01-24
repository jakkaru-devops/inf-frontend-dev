import { API_ENDPOINTS } from 'data/paths.data';
import { APIRequest } from 'utils/api.utils';
import { IUser } from '../interfaces';

export const fetchSellerService = async (
  id: IUser['id'],
): Promise<{
  user: IUser;
  refundsNumber: number;
}> => {
  const res = await APIRequest({
    method: 'get',
    url: API_ENDPOINTS.USER_INFO,
    params: {
      id,
      include: [
        'sellerAutoBrands',
        'sellerRegisterFiles',
        'requisites',
        'address',
        'sellerRefundsNumber',
        'roles',
      ],
    },
    requireAuth: true,
  });

  return {
    user: res?.data?.user,
    refundsNumber: res?.data?.sellerRefundsNumber,
  };
};
