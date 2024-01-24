import { Container } from 'components/common';
import { IOrder, IRequestProduct } from 'sections/Orders/interfaces';
import { RequestRefundExchangeForm } from './Form';
import { FC } from 'react';

export const RequestRefundExchange: FC<{
  requestProduct: IRequestProduct;
  order: IOrder;
}> = ({ requestProduct, order }) => {
  return (
    <Container size="small">
      <RequestRefundExchangeForm
        requestProduct={requestProduct}
        order={order}
        title="Возврат/обмен"
      />
    </Container>
  );
};
