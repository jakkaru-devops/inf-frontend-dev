import { UploadFile } from 'antd/lib/upload/interface';
import { API_ENDPOINTS } from 'data/paths.data';
import { useAuth } from 'hooks/auth.hook';
import { useLocale } from 'hooks/locale.hook';
import { ISetState } from 'interfaces/common.interfaces';
import { useState } from 'react';
import { IAttachment } from 'sections/Catalog/interfaces/products.interfaces';
import {
  IOrder,
  IOrderAttachment,
  IOrderRequest,
} from 'sections/Orders/interfaces';
import { APIRequest } from 'utils/api.utils';
import { openNotification } from 'utils/common.utils';

export const useHandlers = ({
  attachments,
  setAttachments,
  order,
  setOrder,
  offer,
}: {
  attachments: IAttachment[];
  setAttachments?: ISetState<IAttachment[]>;
  order?: IOrderRequest;
  setOrder?: ISetState<IOrderRequest>;
  offer?: IOrder;
}) => {
  const auth = useAuth();
  const { locale } = useLocale();

  const [fileList, setFileList] = useState(attachments || []);

  const onFileUpload = async (
    file: UploadFile,
    group: IAttachment['group'],
  ) => {
    if (!order) return;

    if (file.status === 'uploading') {
      const formData = new FormData();

      if (file?.size / 1024 / 1024 > 20) {
        openNotification(
          'Размер загружаемого файла превышает максимальный - 20 мб',
        );
        return;
      }

      formData.append('file', file.originFileObj);
      formData.append('filename', file.originFileObj.name);
      formData.append('orderId', order.id);
      formData.append('offerId', offer?.id);
      formData.append('group', group);

      const res = await APIRequest<{ result: IAttachment }>({
        method: 'post',
        url: API_ENDPOINTS.ATTACHMENT_UPLOAD,
        data: formData,
        requireAuth: true,
      });

      if (!res.isSucceed) return;

      const uploadedFile = res.data.result;

      setFileList(fileList =>
        fileList
          ? [...fileList, { uid: uploadedFile.id, ...uploadedFile }]
          : [{ uid: uploadedFile.id, ...uploadedFile }],
      );
      if (!!setOrder) {
        setOrder(prev => ({
          ...prev,
          attachments: prev.attachments.concat({
            ...uploadedFile,
            orderId: offer?.id,
          }),
        }));
      }
    }
  };

  const onAttachmentDelete = (attachmentId: IOrderAttachment['id']) => {
    if (!setAttachments) return;
    setAttachments(prev => prev.filter(el => el.id !== attachmentId));
    setFileList(prev => prev.filter(el => el.id !== attachmentId));
  };

  return {
    locale,
    auth,
    fileList,
    handlers: {
      onFileUpload,
      onAttachmentDelete,
    },
  };
};
