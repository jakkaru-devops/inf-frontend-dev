import { IUser, IUserRoleLabelsDefault } from 'sections/Users/interfaces';
import { useState } from 'react';
import { API_ENDPOINTS } from 'data/paths.data';
import { APIRequest } from 'utils/api.utils';
import { IComplainReason } from 'sections/Users/interfaces';
import { useLocale } from 'hooks/locale.hook';
import { openNotification } from 'utils/common.utils';

const useHandlers = ({
  defendantId,
  defendantRoleLabel,
  closeModal,
}: {
  defendantId: IUser['id'];
  defendantRoleLabel: IUserRoleLabelsDefault;
  closeModal: () => void;
}) => {
  const { locale } = useLocale();

  const [reasonList, setReasonList] = useState<IComplainReason[]>([]);
  const [comment, setComment] = useState('');
  const [uploadedFileIds, setUploadedFileIds] = useState<string[] | []>([]);

  const allowComplain = reasonList.length > 0;

  // handlers
  const handleReasonListChange = (reason: IComplainReason) =>
    setReasonList(reasonList =>
      reasonList.includes(reason)
        ? reasonList.filter(deleteReason => deleteReason !== reason)
        : [...reasonList, reason],
    );

  const handleCommentChange = comment => setComment(comment);

  const handleFilesUpload = fileIds =>
    setUploadedFileIds(uploadedFileIds => [
      ...uploadedFileIds.filter(id => !fileIds.includes(id)),
      ...fileIds,
    ]);

  const handleFileDelete = fileId =>
    setUploadedFileIds(uploadedFileIds =>
      uploadedFileIds.filter(id => fileId !== id),
    );

  const createComplaint = async () => {
    if (!allowComplain) return;

    const res = await APIRequest<any>({
      method: 'post',
      url: API_ENDPOINTS.COMPLAIN_USER,
      data: {
        defendantId,
        defendantRoleLabel,
        reason: reasonList,
        comment,
        fileIds: uploadedFileIds,
      },
      requireAuth: true,
    });

    if (!res.isSucceed) return;

    openNotification(`Жалоба на пользователя подана`);

    closeModal();
  };

  return {
    locale,
    comment,
    reasonList,
    handlers: {
      handleReasonListChange,
      handleCommentChange,
      handleFilesUpload,
      handleFileDelete,
    },
    allowComplain,
    createComplaint,
  };
};

export default useHandlers;
