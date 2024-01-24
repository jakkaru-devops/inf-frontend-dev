import {
  IOrder,
  IRefundExchangeRequest,
  IRequestProduct,
} from 'sections/Orders/interfaces';
import formatDate from 'date-fns/format';
import { RefundExchangeRequestCustomer } from './../content.customer';
import { RefundExchangeRequestSeller } from './../content.seller';
import { RefundExchangeRequestManager } from './../content.manager';
import { millisecondsToMdhm } from 'utils/common.utils';
import { useLocale } from 'hooks/locale.hook';
import { FC, Fragment } from 'react';
import { useAuth } from 'hooks/auth.hook';

const getModalTitle = ({ disputeResolution, isRejected, status }, locale) =>
  locale.refundExchange.titles[
    `${disputeResolution}_${
      isRejected && status !== 'CLOSED' ? 'REJECTED' : status
    }`
  ];

const RefundExchangeRequestMainFragment: FC<{
  requestProduct: IRequestProduct;
  order: IOrder;
  refundExchangeRequest: IRefundExchangeRequest;
}> = ({ requestProduct, order, refundExchangeRequest }) => {
  const auth = useAuth();
  const { locale } = useLocale();

  const requestTerm =
    refundExchangeRequest &&
    new Date(refundExchangeRequest.createdAt).setDate(
      new Date(refundExchangeRequest.createdAt).getDate() + 10,
    ) - Number(new Date());

  return (
    <Fragment>
      <h2 className="text_24 color-black mb-5">
        {refundExchangeRequest && getModalTitle(refundExchangeRequest, locale)}
      </h2>
      <span className="block text_13 mb-5">
        дата запроса:{' '}
        {formatDate(new Date(refundExchangeRequest?.createdAt), 'dd.MM.yyyy')}
      </span>
      <span className="block text_13 mb-20">
        {refundExchangeRequest?.status === 'PENDING' &&
          requestTerm > 0 &&
          'осталось на ответ: ' +
            millisecondsToMdhm(requestTerm, locale, false)}
      </span>

      {auth?.currentRole?.label === 'customer' && (
        <RefundExchangeRequestCustomer
          requestProduct={requestProduct}
          order={order}
          refundExchangeRequest={refundExchangeRequest}
        />
      )}
      {auth?.currentRole?.label === 'seller' && (
        <RefundExchangeRequestSeller
          refundExchangeRequest={refundExchangeRequest}
        />
      )}
      {['manager', 'operator'].includes(auth?.currentRole?.label) && (
        <RefundExchangeRequestManager
          refundExchangeRequest={refundExchangeRequest}
        />
      )}
    </Fragment>
  );
};

export default RefundExchangeRequestMainFragment;
