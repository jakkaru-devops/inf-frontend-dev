import classNames from 'classnames';
import { API_ENDPOINTS } from 'data/paths.data';
import { useAuth } from 'hooks/auth.hook';
import { useModalsState } from 'hooks/modal.hook';
import { IServerFile } from 'interfaces/files.interfaces';
import { FC, Fragment } from 'react';
import { IOrderAttachment } from 'sections/Orders/interfaces';
import { APIRequest } from 'utils/api.utils';
import { handleAttachmentClick } from 'utils/files.utils';

const OrderAttachmentItem: FC<{
  attachment: IOrderAttachment;
  className?: string;
  onAttachmentDelete?: (attachmentId: IOrderAttachment['id']) => void;
}> = ({ attachment, className, onAttachmentDelete }) => {
  const auth = useAuth();
  const { Modal, openModal } = useModalsState();

  const removeFile = async (fileId: IServerFile['id']) => {
    const res = await APIRequest<any>({
      method: 'delete',
      url: API_ENDPOINTS.ATTACHMENT_UPLOAD,
      params: {
        orderRequestFileId: fileId,
      },
      requireAuth: true,
    });

    if (!res.isSucceed) return;

    if (!!onAttachmentDelete) onAttachmentDelete(fileId);
  };

  return (
    <Fragment>
      {attachment.url && <Modal attachment={attachment} />}

      <div
        className="order-attachment-item d-flex justify-content-between align-items-center"
        style={{ overflow: 'hidden' }}
      >
        <span
          style={attachment.url && { cursor: 'pointer' }}
          className={classNames([className], {
            'text-underline color-primary': attachment.url,
          })}
          onClick={() =>
            handleAttachmentClick(attachment, () => openModal('image'))
          }
          title={attachment?.name}
        >
          {attachment.name}
        </span>

        {attachment.userId === auth.user.id && (
          <span
            className="order-attachment-item__delete"
            onClick={() => removeFile(attachment.id)}
          >
            <img src="/img/close.svg" alt="" />
          </span>
        )}
      </div>
    </Fragment>
  );
};

export default OrderAttachmentItem;
