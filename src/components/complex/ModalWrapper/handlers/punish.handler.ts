import { IUser, IUserRoleLabelsDefault } from 'sections/Users/interfaces';
import { useRouter } from 'next/router';
import { IUserRole } from 'sections/Users/interfaces';
import { useState } from 'react';
import { API_ENDPOINTS } from 'data/paths.data';
import { APIRequest } from 'utils/api.utils';
import { IComplainReason } from 'sections/Users/interfaces';
import { useLocale } from 'hooks/locale.hook';
import { openNotification } from 'utils/common.utils';

const useHandlers = ({
  user,
  userRole,
  roleLabel,
}: {
  user: IUser;
  userRole: IUserRole;
  roleLabel: IUserRoleLabelsDefault;
}) => {
  const { locale } = useLocale();
  const router = useRouter();

  const initialBanState = userRole
    ? {
        minusRating: user?.minusRating || 0,
        requestsBanWeeks:
          userRole.requestsBannedUntil &&
          new Date(userRole.requestsBannedUntil)?.getTime() >
            new Date().getTime()
            ? Number(localStorage.getItem(`${userRole.id}-requestsBanWeeks`)) ||
              null
            : null,
        banWeeks:
          userRole.bannedUntil &&
          new Date(userRole.bannedUntil)?.getTime() > new Date().getTime()
            ? 4200
            : null,
        reasonList:
          (userRole.bannedUntil ||
            userRole.requestsBannedUntil ||
            !!user?.minusRating) &&
          (new Date(userRole.bannedUntil)?.getTime() > new Date().getTime() ||
            new Date(userRole.requestsBannedUntil)?.getTime() >
              new Date().getTime() ||
            !!user?.minusRating)
            ? userRole.bannedReason || []
            : [],
      }
    : {
        minusRating: 0,
        requestsBanWeeks: null,
        banWeeks: null,
        reasonList: [],
      };

  const [minusRating, setMinusRating] = useState<number>(
    initialBanState.minusRating,
  );
  const [requestsBanWeeks, setRequestBanWeeks] = useState<number | null>(
    initialBanState.requestsBanWeeks,
  );
  const [banWeeks, setBanWeeks] = useState<number | null>(
    initialBanState.banWeeks,
  );
  const [reasonList, setReasonList] = useState<IComplainReason[]>(
    initialBanState.reasonList,
  );

  // handlers
  const handleRatingDowngrade = (value: number) => {
    setMinusRating(value);
    if (!value && banWeeks === null && requestsBanWeeks === null)
      setReasonList([]);
  };

  const handleRequestsBanWeeksChange = value => {
    setRequestBanWeeks(value);
    if (value === null && banWeeks === null && !minusRating) setReasonList([]);
  };

  const handleBanWeeksChange = value => {
    setBanWeeks(value);
    if (value === null && requestsBanWeeks === null && !minusRating)
      setReasonList([]);
  };

  const handleReasonListChange = (reason: IComplainReason) =>
    setReasonList(reasonList =>
      reasonList.includes(reason)
        ? reasonList.filter(deleteReason => deleteReason !== reason)
        : [...reasonList, reason],
    );

  const punishUser = async () => {
    if (
      (requestsBanWeeks !== null || banWeeks !== null || !!minusRating) &&
      reasonList.length < 1
    ) {
      openNotification('Необходимо указать причину наказания');
      return;
    }

    const res = await APIRequest<any>({
      method: 'post',
      url: API_ENDPOINTS.PUNISH_USER,
      params: {
        userId: userRole.userId,
        roleLabel,
      },
      data: {
        minusRating,
        requestsBanWeeks,
        banWeeks,
        reasons: reasonList.length > 0 ? reasonList : null,
      },
      requireAuth: true,
    });

    if (!res.isSucceed) return;

    localStorage.setItem(
      `${userRole.id}-requestsBanWeeks`,
      String(requestsBanWeeks),
    );

    openNotification(`Меры наказания пользователя были успешно обновлены`);

    setTimeout(() => router.reload(), 2000);
  };

  return {
    locale,
    minusRating,
    requestsBanWeeks,
    banWeeks,
    reasonList,
    handlers: {
      handleRatingDowngrade,
      handleRequestsBanWeeksChange,
      handleBanWeeksChange,
      handleReasonListChange,
    },
    punishUser,
  };
};

export default useHandlers;
