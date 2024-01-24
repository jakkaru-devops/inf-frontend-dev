import { Button, Modal } from 'antd';
import { FC } from 'react';

interface IProps {
  open: boolean;
  onCancel: () => void;
  message: string;
  width?: number | string;
}

const AlertModal: FC<IProps> = ({ open, onCancel, message, width }) => {
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

      <Button
        type="primary"
        className="mt-30"
        style={{ margin: 'auto', width: 200 }}
        onClick={onCancel}
      >
        Ок
      </Button>
    </Modal>
  );
};

export default AlertModal;
