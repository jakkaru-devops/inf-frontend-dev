import { FC, Fragment } from 'react';
import { IRefundExchangeRequest } from 'sections/Orders/interfaces';
import { renderHtml } from 'utils/common.utils';

export const RefundExchangeDataFragment: FC<{
  refundExchangeRequest: IRefundExchangeRequest;
  locale: any;
}> = ({ refundExchangeRequest, locale }) => {
  return (
    <>
      <span className="block text_18_bold text-left">
        {refundExchangeRequest.requestProduct.product.name}
      </span>
      <span className="block mb-15">
        {refundExchangeRequest.requestProduct.product.article}
      </span>

      <div className="d-flex mb-20">
        <div className="pr-10">
          <span className="block">
            {`количество в заказе: ${
              refundExchangeRequest.orderedQuantity ||
              refundExchangeRequest.requestProduct.count
            } шт.`}
          </span>
          <span className="block">
            {`количество к ${
              refundExchangeRequest.disputeResolution === 'REFUND'
                ? 'возврату'
                : 'обмену'
            }: ${refundExchangeRequest.quantity} шт.`}
          </span>
        </div>
        {refundExchangeRequest.disputeResolution === 'REFUND' && (
          <div className="pl-10" style={{ borderLeft: '1px solid black' }}>
            <span className="block">
              Сумма:{' '}
              {(
                (refundExchangeRequest.orderedQuantity ||
                  refundExchangeRequest.requestProduct.count) *
                refundExchangeRequest.requestProduct.unitPrice
              )
                .gaussRound()
                .separateBy(' ')}{' '}
              ₽
            </span>
            <span className="block">
              Сумма:{' '}
              {(
                refundExchangeRequest.quantity *
                refundExchangeRequest.requestProduct.unitPrice
              )
                .gaussRound()
                .separateBy(' ')}{' '}
              ₽
            </span>
          </div>
        )}
      </div>

      <span className="block text-bold mb-15">
        {refundExchangeRequest.reason.map(reason => (
          <Fragment key={reason}>
            {locale.refundExchange.reasons[reason]} <br />
          </Fragment>
        ))}
      </span>

      {refundExchangeRequest.comment && (
        <div className="mb-15">{renderHtml(refundExchangeRequest.comment)}</div>
      )}
    </>
  );
};
