import { Upload } from 'antd';
import { IMAGE_EXTENSIONS } from 'data/files.data';
import { IUploadFileExtended } from 'interfaces/files.interfaces';
import { PaperClipOutlined } from '@ant-design/icons';
import {
  IOrder,
  IOrderAttachment,
  IOrderRequest,
} from 'sections/Orders/interfaces';
import { ISetState } from 'interfaces/common.interfaces';
import { FC } from 'react';
import { useHandlers } from './handlers';
import OrderAttachmentItem from './item';

const OrderAttachmentsGroup: FC<{
  group: IOrderAttachment['group'];
  attachments: IOrderAttachment[];
  setAttachments?: ISetState<IOrderAttachment[]>;
  withUpload?: boolean;
  order?: IOrderRequest;
  setOrder?: ISetState<IOrderRequest>;
  offer?: IOrder;
  hideTitle?: boolean;
  maxWidth?: number | string;
}> = ({
  group,
  attachments,
  setAttachments,
  withUpload,
  order,
  setOrder,
  offer,
  hideTitle,
  maxWidth,
}) => {
  const { locale, fileList, handlers } = useHandlers({
    attachments,
    setAttachments,
    order,
    setOrder,
    offer,
  });

  return withUpload && !!order ? (
    <div
      style={{
        maxWidth,
      }}
    >
      <Upload
        listType="text"
        fileList={fileList as any[]}
        onChange={({ file }) => handlers.onFileUpload(file as any, group)}
        accept={[...IMAGE_EXTENSIONS, 'pdf'].map(ext => `.${ext}`).join(',')}
        itemRender={(_, file: IUploadFileExtended) => (
          <OrderAttachmentItem
            attachment={file}
            className="ml-25"
            onAttachmentDelete={id => handlers.onAttachmentDelete(id)}
          />
        )}
      >
        <div
          className="d-flex align-items-center"
          style={{ cursor: 'pointer', fontWeight: 600 }}
        >
          <PaperClipOutlined
            className="color-primary"
            style={{ fontSize: 16 }}
          />
          <span className="ml-5">{locale.attachment.group[group]}</span>
        </div>
      </Upload>
    </div>
  ) : (
    (fileList.length > 0 && (
      <div>
        {!hideTitle && (
          <span className="block" style={{ fontWeight: 600 }}>
            {locale.attachment.group[group]}
          </span>
        )}

        {fileList.map((attachment, i) => (
          <OrderAttachmentItem
            key={i}
            attachment={attachment}
            onAttachmentDelete={id => handlers.onAttachmentDelete(id)}
          />
        ))}
      </div>
    )) || <></>
  );
};

export default OrderAttachmentsGroup;
