import { Modal } from 'antd';
import { AttachmentItem } from './item';
import { IAttachmentsModalProps } from './interfaces';
import { FC } from 'react';

const AttachmentsModal: FC<IAttachmentsModalProps> = ({
  open,
  onCancel,
  attachments,
}) => {
  if (!attachments && attachments.length === 0) {
    return <></>;
  }

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      centered
      footer={null}
      title="Вложения"
    >
      {attachments.map((attachment, i) => (
        <AttachmentItem key={i} attachment={attachment} />
      ))}
    </Modal>
  );
};

export default AttachmentsModal;
