import { downloadFileByPath } from 'utils/files.utils';
import { IRegisterFileExtended } from 'sections/Auth/interfaces';
import { FC } from 'react';

export const DocumentModalContent: FC<{
  doc: IRegisterFileExtended;
  closeModal: () => void;
}> = ({ doc, closeModal }) => {
  const url = doc.path;

  return (
    <>
      <div className="attachment-modal__header">
        <div className="attachment-modal__title">{doc.name}</div>
        <div className="attachment-modal__controls">
          <button onClick={() => downloadFileByPath(url, doc.name)}>
            <img src="/img/icons/download-white.svg" />
          </button>
          <button className="close-button" onClick={closeModal}>
            <img src="/img/icons/close-white.svg" />
          </button>
        </div>
      </div>
      <div className="attachment-modal__content">
        {url.includes('.pdf') ? (
          <object>
            <embed
              src={doc.path}
              width="100%"
              style={{ height: '90vh' }}
              type="application/pdf"
            />
          </object>
        ) : (
          <div className="attachment-modal__content__img">
            <img src={url} alt={doc.name} width="100%" />
          </div>
        )}
      </div>
    </>
  );
};
