import { Upload } from 'antd';
import { IMAGE_EXTENSIONS } from 'data/files.data';
import { IUploadFileExtended } from 'interfaces/files.interfaces';
import { IAttachment } from 'sections/Catalog/interfaces/products.interfaces';
import { AttachmentItem } from './AttachmentItem';
import { PaperClipOutlined } from '@ant-design/icons';
import { IOrder, IOrderRequest } from 'sections/Orders/interfaces';
import { useHandlers } from '../handlers';
import { ISetState } from 'interfaces/common.interfaces';
import { FC } from 'react';

export const AttachmentList: FC<{
  group: IAttachment['group'];
  attachmentList: IAttachment[];
  setAttachments: ISetState<IAttachment[]>;
  withUpload?: boolean;
  orderId?: IOrderRequest['id'];
  setOrder: ISetState<IOrderRequest>;
  offer?: IOrder;
}> = ({
  group,
  attachmentList,
  setAttachments,
  withUpload,
  orderId,
  setOrder,
  offer,
}) => {
  // if (offer && attachmentList) {
  //   attachmentList = attachmentList.filter(
  //     attachment => !attachment.orderId || attachment.orderId === offer?.id,
  //   );
  // }

  const { locale, fileList, handlers } = useHandlers({
    attachmentList,
    setAttachments,
    orderId,
    setOrder,
    offer,
  });

  return withUpload ? (
    <div className="mb-20">
      <Upload
        listType="text"
        fileList={fileList as any[]}
        onChange={({ file }) => handlers.onFileChange(file as any, group)}
        accept={[...IMAGE_EXTENSIONS, 'pdf'].map(ext => `.${ext}`).join(',')}
        itemRender={(_, file: IUploadFileExtended) => (
          <AttachmentItem attachment={file} className="ml-25" />
        )}
      >
        <div
          className="d-flex align-items-center"
          style={{ cursor: 'pointer' }}
        >
          <PaperClipOutlined
            className="color-primary"
            style={{ fontSize: 20 }}
          />
          <span className="ml-5">{locale.attachment.group[group]}</span>
        </div>
      </Upload>
    </div>
  ) : (
    (fileList.length > 0 && (
      <div className="mb-20">
        <span className="block mb-5">{locale.attachment.group[group]}</span>

        {fileList.map((attachment, i) => (
          <AttachmentItem key={i} attachment={attachment} />
        ))}
      </div>
    )) || <></>
  );
};
