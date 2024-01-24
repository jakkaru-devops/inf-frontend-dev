import { Button } from 'antd';
import { Modal } from 'components/common';
import { useLocale } from 'hooks/locale.hook';
import { FC, ReactNode } from 'react';

interface IProps {
  open: boolean;
  onClose: () => void;
  onCancel?: () => void;
  title: ReactNode;
  confirmButtonText?: ReactNode;
  cancelButtonText?: ReactNode;
  onConfirm: () => void;
  submitAwaiting?: boolean;
  width?: string | number;
}

const ConfirmModal: FC<IProps> = ({
  open,
  onClose,
  onCancel,
  title,
  confirmButtonText,
  cancelButtonText,
  onConfirm,
  submitAwaiting,
  width,
}) => {
  const { locale } = useLocale();
  confirmButtonText = confirmButtonText || locale.common.confirm;
  cancelButtonText = cancelButtonText || locale.common.cancel;

  return (
    <Modal
      open={open}
      onClose={onClose}
      width={width || 'auto'}
      title={title}
      centered
      hideHeader
      hideHeaderBorder
      hideCloseIcon
      hideFooter
    >
      <h3 className="text-center mb-20">{title}</h3>
      <div className="d-flex justify-content-center">
        <Button type="primary" onClick={onCancel || onClose} className="mr-10">
          {cancelButtonText}
        </Button>
        <Button type="primary" onClick={onConfirm} loading={submitAwaiting}>
          {confirmButtonText}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
