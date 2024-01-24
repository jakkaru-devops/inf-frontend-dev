import { FC } from 'react';
import { IAttachment } from 'sections/Catalog/interfaces/products.interfaces';
import { downloadFileByPath, printFileByPath } from 'utils/files.utils';

export const AttachmentModalContent: FC<{
  attachment: IAttachment;
  closeModal: () => void;
}> = ({ attachment, closeModal }) => {
  const url = attachment?.localUrl || attachment?.url;
  const isPdf = url?.includes('.pdf');

  return (
    <div style={isPdf ? { minWidth: 750 } : null}>
      <div className="attachment-modal__header">
        <div className="attachment-modal__title">{attachment.name}</div>
        <div className="attachment-modal__controls">
          <button onClick={() => printFileByPath(url)}>
            <img src="/img/icons/print-white.svg" />
          </button>
          <button onClick={() => downloadFileByPath(url, attachment.name)}>
            <img src="/img/icons/download-white.svg" />
          </button>
          <button className="close-button" onClick={closeModal}>
            <img src="/img/icons/close-white.svg" />
          </button>
        </div>
      </div>
      <div className="attachment-modal__content">
        {isPdf ? (
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
    </div>
  );
};
