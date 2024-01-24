import { Button, Modal } from 'antd';
import { AvatarUpload } from 'components/common/FileUpload/AvatarUpload';
import { FC } from 'react';

interface IProps {
  open: boolean;
  onCancel: () => void;
  handleAvatarUpdate: (avatarPath: string) => Promise<void>;
}

const AvatarModal: FC<IProps> = ({ open, onCancel, handleAvatarUpdate }) => {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={null}
      footer={null}
      className="close-icon-hidden footer-hidden"
      centered
    >
      <div className="d-flex">
        <AvatarUpload onUploaded={path => handleAvatarUpdate(path)} change>
          <Button type="primary" style={{ width: 236 }}>
            Выбрать новое фото
          </Button>
        </AvatarUpload>
        <Button
          type="primary"
          style={{ width: '50%', marginLeft: 10 }}
          onClick={() => {
            handleAvatarUpdate(null);
            onCancel();
          }}
        >
          Удалить фотографию
        </Button>
      </div>
    </Modal>
  );
};

export default AvatarModal;
