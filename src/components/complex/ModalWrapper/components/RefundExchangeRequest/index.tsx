import {
  IOrder,
  IRefundExchangeRequest,
  IRequestProduct,
} from 'sections/Orders/interfaces';
import RefundExchangeRequestMainFragment from './components/RefundExchangeMainFragment';
import { RequestRefundExchangeForm } from '../RequestRefundExchange/Form';
import { Container } from 'components/common';
import { useAuth } from 'hooks/auth.hook';
import { FC } from 'react';

export const RefundExchangeRequest: FC<{
  requestProduct: IRequestProduct;
  order: IOrder;
  refundExchangeRequest: IRefundExchangeRequest;
  refundExchangeHistory: IRefundExchangeRequest[];
}> = ({
  requestProduct,
  order,
  refundExchangeRequest,
  refundExchangeHistory,
}) => {
  const auth = useAuth();

  return (
    <Container size="small">
      {refundExchangeHistory.filter(Boolean).map(item => (
        <>
          <RefundExchangeRequestMainFragment
            requestProduct={requestProduct}
            order={order}
            refundExchangeRequest={item}
          />
          <hr />
          <br />
        </>
      ))}
      <RefundExchangeRequestMainFragment
        requestProduct={requestProduct}
        order={order}
        refundExchangeRequest={refundExchangeRequest}
      />
      {refundExchangeRequest.status === 'CLOSED' &&
        auth.currentRole.label === 'customer' &&
        requestProduct.count > 0 && (
          <>
            <br />
            <hr />
            <br />
            <RequestRefundExchangeForm
              requestProduct={requestProduct}
              order={order}
              title="Оформить возврат/обмен повторно"
            />
          </>
        )}
    </Container>
  );
};
