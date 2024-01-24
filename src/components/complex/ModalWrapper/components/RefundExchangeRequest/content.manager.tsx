import { Button, Checkbox, Modal } from 'antd';
import { Container, KeyValueItem } from 'components/common';
import { useModalsState } from 'hooks/modal.hook';
import { FC, useState } from 'react';
import { IRefundExchangeRequest } from 'sections/Orders/interfaces';
import { RefundExchangeDataFragment } from './components/RefundExchangeDataFragment';
import useHandlers from './handlers';
import { renderHtml } from 'utils/common.utils';

export const RefundExchangeRequestManager: FC<{
  refundExchangeRequest: IRefundExchangeRequest;
}> = ({ refundExchangeRequest }) => {
  const { locale, handleSubmit } = useHandlers({ refundExchangeRequest });

  const customersChioceDefault = ['RESOLVED', 'CLOSED'].includes(
    refundExchangeRequest.status,
  );

  const [customersChioce, setCustomersChioce] = useState(
    customersChioceDefault,
  );

  const [modalVisible, setModalVisible] = useState(false);

  const { Modal: AttachmentsModal, openModal } = useModalsState();

  return (
    <>
      <Modal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Container size="small" className="text-center">
          <h2 className="text_18">
            Вы уверены, что хотите закрыть возврат/обмен для этого заказа?
            {/* {refundExchangeRequest.requestProduct.orderRequest.idOrder} */}
          </h2>

          <div className="d-flex justify-content-center mt-15">
            <Button
              type="primary"
              className="mr-5 gray"
              onClick={() => setModalVisible(false)}
            >
              Отмена
            </Button>
            <Button
              type="primary"
              className="ml-5 gray"
              onClick={() => handleSubmit()}
            >
              Закрыть
            </Button>
          </div>
        </Container>
      </Modal>

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

      {refundExchangeRequest.status !== 'PENDING' && (
        <Checkbox
          className="mb-15"
          checked={customersChioce}
          onChange={() => setCustomersChioce(value => !value)}
          disabled={customersChioceDefault}
        >
          {(refundExchangeRequest.isRejected &&
            'Покупатель согласен с отказом') ||
            (refundExchangeRequest.disputeResolution === 'REFUND' &&
              'Покупатель получил деньги') ||
            (refundExchangeRequest.disputeResolution === 'EXCHANGE' &&
              'Покупатель получил товар')}
        </Checkbox>
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
        {(refundExchangeRequest.status === 'RESOLVED' ||
          (customersChioce && !customersChioceDefault)) && (
          <Button
            type="primary"
            className="color-white ml-5 gray"
            onClick={() => setModalVisible(true)}
          >
            Закрыть спор
          </Button>
        )}
      </div>

      {/* {refundExchangeRequest.attachments &&
        refundExchangeRequest.attachments.map(({ name, url }) => (
          <img className="mr-10" src={url} width="80px" alt={name} />
        ))} */}
    </>
  );
};
