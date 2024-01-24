import { useRouter } from 'next/router';
import { ModalType } from 'components/complex/ModalWrapper/interfaces';
import { ReactNode, useState } from 'react';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import { useLocale } from 'hooks/locale.hook';
import { openNotification, renderHtml } from 'utils/common.utils';

interface IProps {
  openModal: (type: ModalType) => void;
}

const useHandlers = ({ openModal }: IProps) => {
  const { locale } = useLocale();
  const router = useRouter();

  const [deleteOrgAlertMessage, setDeleteOrgAlertMessage] =
    useState<string>(null);
  const [deleteOrgAgreeState, setDeleteOrgAgreeState] = useState<{
    orgId: string;
    message: ReactNode;
  }>(null);

  const handleDeleteAlert = async (orgId: string) => {
    const res = await APIRequest({
      method: 'delete',
      url: API_ENDPOINTS.USER_JURISTIC_SUBJECT,
      params: { id: orgId },
      requireAuth: true,
    });

    if (!res.isSucceed && res.status !== 406) return;

    if (res.status === 406) {
      setDeleteOrgAlertMessage(res.data?.message || res?.message);
      return;
    }

    setDeleteOrgAgreeState({
      orgId,
      message: renderHtml(res.data?.message),
    });
  };

  const handleDelete = async (orgId: string) => {
    const res = await APIRequest({
      method: 'delete',
      url: API_ENDPOINTS.USER_JURISTIC_SUBJECT,
      params: { id: orgId, agreed: true },
      requireAuth: true,
    });

    if (!res.isSucceed) {
      openNotification(res.message);
      return;
    }

    setDeleteOrgAgreeState(null);
    openNotification(res.data.message);
    router.push(location.href);
  };

  return {
    locale,
    deleteOrgAlertMessage,
    setDeleteOrgAlertMessage,
    handleDeleteAlert,
    deleteOrgAgreeState,
    setDeleteOrgAgreeState,
    handleDelete,
  };
};

export default useHandlers;
