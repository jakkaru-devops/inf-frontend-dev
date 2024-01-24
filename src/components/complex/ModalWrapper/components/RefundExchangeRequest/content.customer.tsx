import { Button } from 'antd';
import { useModalsState } from 'hooks/modal.hook';
import {
  IOrder,
  IRefundExchangeRequest,
  IRequestProduct,
} from 'sections/Orders/interfaces';
import { RefundExchangeDataFragment } from './components/RefundExchangeDataFragment';
import useHandlers from './handlers';
import { KeyValueItem } from 'components/common';
import { FC, Fragment } from 'react';
import { renderHtml } from 'utils/common.utils';

export const RefundExchangeRequestCustomer: FC<{
  requestProduct: IRequestProduct;
  order: IOrder;
  refundExchangeRequest: IRefundExchangeRequest;
}> = ({ requestProduct, order, refundExchangeRequest }) => {
  const { locale, handleSubmit } = useHandlers({ refundExchangeRequest });
  const { Modal: AttachmentsModal, openModal } = useModalsState();

  return (
    <Fragment>
      {refundExchangeRequest?.attachments && (
        <AttachmentsModal attachmentList={refundExchangeRequest.attachments} />
      )}

      <RefundExchangeDataFragment
        refundExchangeRequest={refundExchangeRequest}
        locale={locale}
      />

      {refundExchangeRequest.reply && (
        <KeyValueItem
          keyText="Комментарий продавца"
          value={renderHtml(refundExchangeRequest.reply)}
          inline={false}
          className="mb-15"
        />
      )}

      <div className="d-flex justify-content-end">
        {!!refundExchangeRequest?.attachments?.length && (
          <Button
            type="primary"
            className="color-white"
            onClick={() => openModal('attachments')}
          >
            Вложения
          </Button>
        )}
        {refundExchangeRequest.status === 'AGREED' && (
          <Button
            type="primary"
            className="color-white gray ml-5"
            onClick={() => handleSubmit()}
          >
            {(refundExchangeRequest.disputeResolution === 'REFUND' &&
              'Деньги получил') ||
              (refundExchangeRequest.disputeResolution === 'EXCHANGE' &&
                'Товар получил')}
          </Button>
        )}
        {refundExchangeRequest.status === 'REJECTED' && (
          <Button
            type="primary"
            className="color-white gray ml-5"
            onClick={() => handleSubmit()}
          >
            Принять
          </Button>
        )}
      </div>
    </Fragment>
  );
};
