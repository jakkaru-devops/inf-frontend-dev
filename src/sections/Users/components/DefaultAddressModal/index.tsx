import { Modal } from 'antd';
import YandexMap from 'components/common/YandexMap';
import { IAddress } from 'interfaces/common.interfaces';
import { FC } from 'react';

interface IProps {
  address: IAddress;
  setAddress?: (address: IAddress) => void;
  open: boolean;
  onCancel: () => void;
  allowControl?: boolean;
  title: string;
}

const DefaultAddressModal: FC<IProps> = ({
  address,
  setAddress,
  open,
  onCancel,
  allowControl,
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
      className="cart-delivery-address-modal"
      width="100%"
    >
      <YandexMap
        coords={[52.27799, 104.28818]}
        zoom={10}
        hasSearch={allowControl}
        defaultAddress={address}
        onAddressChange={setAddress ? address => setAddress(address) : () => {}}
        onModalCancel={onCancel}
      />
    </Modal>
  );
};

export default DefaultAddressModal;
