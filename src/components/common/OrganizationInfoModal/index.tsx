import { Modal } from 'antd';
import { IOrderRequest } from 'sections/Orders/interfaces';
import { API_SERVER_URL } from 'config/env';
import { FC } from 'react';

interface IProps {
  order: IOrderRequest;
  open: boolean;
  onCancel: () => void;
  allowControl?: boolean;
  title: string;
}

const OrganizationInfoModal: FC<IProps> = ({
  order,
  open,
  onCancel,
  title,
}) => {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      destroyOnClose
      centered
      title={title}
      footer={null}
      width="1000px"
    >
      <object>
        <embed
          src={`${API_SERVER_URL}/files/${order.payer.path}`}
          width="100%"
          style={{ height: '90vh' }}
          type="application/pdf"
        />
      </object>
    </Modal>
  );
};

export default OrganizationInfoModal;
