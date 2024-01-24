import { useModalsState } from 'hooks/modal.hook';
import { IAttachment } from 'sections/Catalog/interfaces/products.interfaces';
import classNames from 'classnames';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import { useRouter } from 'next/router';
import { IServerFile } from 'interfaces/files.interfaces';
import { DeleteOutlined } from '@ant-design/icons';
import { IMAGE_EXTENSIONS } from 'data/files.data';
import {
  downloadFileByPath,
  handleAttachmentClick,
  openFileByPath,
} from 'utils/files.utils';
import { useAuth } from 'hooks/auth.hook';
import { FC } from 'react';

export const AttachmentItem: FC<{
  attachment: IAttachment;
  className?: string;
}> = ({ attachment, className }) => {
  const auth = useAuth();

  const { Modal, openModal } = useModalsState();

  const router = useRouter();

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

    router.reload();
  };

  return (
    <>
      {attachment.url && <Modal attachment={attachment} />}

      <div
        className="d-flex justify-content-between align-items-center"
        style={{ overflow: 'hidden' }}
      >
        <span
          style={attachment.url && { cursor: 'pointer' }}
          className={classNames([className, 'one-line-text'], {
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
          <DeleteOutlined
            className="color-primary"
            style={{ fontSize: 20 }}
            onClick={() => removeFile(attachment.id)}
          />
        )}
      </div>
    </>
  );
};
