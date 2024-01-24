import { EyeOutlined } from '@ant-design/icons';
import { useModalsState } from 'hooks/modal.hook';
import { FC } from 'react';
import { IAttachment } from 'sections/Catalog/interfaces/products.interfaces';

export const AttachmentItem: FC<{ attachment: IAttachment }> = ({
  attachment,
}) => {
  const { Modal, openModal } = useModalsState();

  return (
    <>
      <Modal attachment={attachment} />
      <div
        style={{ cursor: 'pointer', marginBottom: 5 }}
        className="d-flex align-items-center"
        onClick={() => openModal('image')}
      >
        <EyeOutlined className="text__24Low" style={{ height: 20 }} />{' '}
        <span className="text_18 ml-10">{attachment.name}</span>
      </div>
    </>
  );
};
