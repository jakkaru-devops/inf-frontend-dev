import { Button } from 'antd';
import { KeyValueItem, TextEditor } from 'components/common';
import { useModalsState } from 'hooks/modal.hook';
import { IRefundExchangeRequest } from 'sections/Orders/interfaces';
import { RefundExchangeDataFragment } from './components/RefundExchangeDataFragment';
import useHandlers from './handlers';
import { FC } from 'react';

export const RefundExchangeRequestSeller: FC<{
  refundExchangeRequest: IRefundExchangeRequest;
}> = ({ refundExchangeRequest }) => {
  const { locale, reply, handlers, handleSubmit } = useHandlers({
    refundExchangeRequest,
  });
  const { Modal: AttachmentsModal, openModal } = useModalsState();

  return (
    <>
      {refundExchangeRequest.attachments && (
        <AttachmentsModal attachmentList={refundExchangeRequest.attachments} />
      )}

      <RefundExchangeDataFragment
        refundExchangeRequest={refundExchangeRequest}
        locale={locale}
      />

      <KeyValueItem
        keyText="Комментарий"
        value={
          <TextEditor
            value={reply}
            name="reply"
            height="150px"
            width="364px"
            onChange={reply => handlers.handleReplyChange(reply)}
          />
        }
        inline={false}
        className="mt-20 mb-20"
      />

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
        {(refundExchangeRequest.isRejected ||
          refundExchangeRequest.status === 'PENDING') && (
          <Button
            type="primary"
            className="color-white gray ml-5"
            onClick={() => handleSubmit()}
          >
            Согласовать
          </Button>
        )}
        {refundExchangeRequest.status === 'PENDING' && (
          <Button
            type="primary"
            className="color-white gray ml-5"
            onClick={() => handleSubmit(true)}
          >
            Отказать
          </Button>
        )}
      </div>
    </>
  );
};
