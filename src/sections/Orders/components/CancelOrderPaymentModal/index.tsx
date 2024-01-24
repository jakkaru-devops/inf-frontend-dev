import { Button, Input } from 'antd';
import { Modal } from 'components/common';
import { IModalProps } from 'components/common/Modal/interfaces';
import { FC, useState } from 'react';
import { openNotification } from 'utils/common.utils';

interface IProps extends IModalProps {
  onSubmit: ({ message }: { message: string }) => Promise<void>;
}

const CancelOrderPaymentModal: FC<IProps> = ({ open, onClose, onSubmit }) => {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;

    if (!message?.trim()) {
      openNotification('Необходимо заполнить комментарий');
      return;
    }

    setSubmitting(true);
    await onSubmit({ message });
    setSubmitting(false);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Укажите комментарий"
      hideHeaderBorder
      className="register-form"
    >
      <Input.TextArea
        value={message}
        onChange={e => setMessage(e.target.value)}
        maxLength={500}
        style={{ width: '100%', minHeight: 100 }}
        className="mb-15"
      />

      <Button type="primary" onClick={handleSubmit} loading={submitting}>
        Подтвердить отмену оплаты
      </Button>
    </Modal>
  );
};

export default CancelOrderPaymentModal;
