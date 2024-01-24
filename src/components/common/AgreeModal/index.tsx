import { Button, Modal } from 'antd';
import { FC, ReactNode } from 'react';

interface IProps {
  open: boolean;
  onCancel: () => void;
  message: ReactNode;
  okButtonText: string;
  onAgree: () => void;
  width?: number | string;
}

const AgreeModal: FC<IProps> = ({
  open,
  onCancel,
  message,
  okButtonText,
  onAgree,
  width,
}) => {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={null}
      footer={<></>}
      className="footer-hidden close-icon-hidden"
      centered
      width={width}
    >
      <h2
        className="text-center"
        style={{ fontSize: 30, lineHeight: 1.2, fontWeight: 700 }}
      >
        {message}
      </h2>

      <div className="d-flex mt-30">
        <Button type="primary" className="w-100 mr-5" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="primary" className="w-100 ml-5" onClick={onAgree}>
          {okButtonText}
        </Button>
      </div>
    </Modal>
  );
};

export default AgreeModal;
