import { API_ENDPOINTS_V2 } from 'data/api.data';
import { IAPIResponse } from 'interfaces/api.types';
import { IAddress } from 'interfaces/common.interfaces';
import { IJuristicSubject } from 'sections/JuristicSubject/interfaces';
import { IOrderRequest } from 'sections/Orders/interfaces';
import { APIRequest } from 'utils/api.utils';

interface IProps {
  customerOrganizationId: IJuristicSubject['id'];
  deliveryAddress: IAddress;
}

export const payCartProductsByCardService = ({
  customerOrganizationId,
  deliveryAddress,
}: IProps): Promise<
  IAPIResponse<{
    order: IOrderRequest;
    paymentId: string;
    paymentLink: string;
  }>
> =>
  APIRequest({
    method: 'post',
    url: API_ENDPOINTS_V2.cart.payCartProductsByCard,
    data: {
      customerOrganizationId,
      deliveryAddress,
    },
  });
