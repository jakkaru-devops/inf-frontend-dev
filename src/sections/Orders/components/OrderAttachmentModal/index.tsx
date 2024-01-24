import { Modal } from 'components/common';
import { IModalPropsBasic } from 'components/common/Modal/interfaces';
import { FC } from 'react';
import { IAttachment } from 'sections/Catalog/interfaces/products.interfaces';
import { downloadFileByPath, printFileByPath } from 'utils/files.utils';

interface IProps extends IModalPropsBasic {
  attachment: IAttachment;
}

const OrderAttachmentModal: FC<IProps> = ({ attachment, ...modalProps }) => {
  if (!modalProps.open) return <></>;

  const url = attachment?.localUrl || attachment?.url;

  return (
    <Modal
      {...modalProps}
      centered
      hideFooter
      width={800}
      title={null}
      className="attachment-modal"
    >
      <div className="attachment-modal__header">
        <div className="attachment-modal__title">{attachment.name}</div>
        <div className="attachment-modal__controls">
          <button onClick={() => printFileByPath(url)}>
            <img src="/img/icons/print-white.svg" />
          </button>
          <button onClick={() => downloadFileByPath(url, attachment.name)}>
            <img src="/img/icons/download-white.svg" />
          </button>
          <button className="close-button" onClick={modalProps.onClose}>
            <img src="/img/icons/close-white.svg" />
          </button>
        </div>
      </div>
      <div className="attachment-modal__content">
        {url.includes('.pdf') ? (
          <embed
            src={attachment.url}
            width="100%"
            style={{ height: '90vh' }}
            type="application/pdf"
          />
        ) : (
          <div className="attachment-modal__content__img">
            <img src={url} alt={attachment.name} width="100%" />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default OrderAttachmentModal;
