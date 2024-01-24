import { FC } from 'react';
import { Modal } from 'components/common';
import { IOrderAttachmentGroupedListProps } from '../OrderAttachmentGroupedList/interfaces';
import { IModalPropsBasic } from 'components/common/Modal/interfaces';
import OrderAttachmentGroupedList from '../OrderAttachmentGroupedList';

type IProps = IOrderAttachmentGroupedListProps & IModalPropsBasic;

const OrderAttachmentListModal: FC<IProps> = ({
  order,
  setOrder,
  offer,
  attachments,
  setAttachments,
  withUploads,
  ...modalProps
}) => {
  return (
    <Modal {...modalProps} centered hideFooter title="Вложения">
      <OrderAttachmentGroupedList
        attachments={attachments}
        setAttachments={setAttachments}
        order={order}
        setOrder={setOrder}
        offer={offer}
        withUploads
      />
    </Modal>
  );
};

export default OrderAttachmentListModal;
