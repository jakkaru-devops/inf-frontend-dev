import { API_ENDPOINTS } from 'data/paths.data';
import { STRINGS } from 'data/strings.data';
import { useAuth } from 'hooks/auth.hook';
import { IAddress } from 'interfaces/common.interfaces';
import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { IUser, IUsername } from 'sections/Users/interfaces';
import { setAuthUser } from 'store/reducers/auth.reducer';
import { APIRequest } from 'utils/api.utils';
import { getInitialAddress, openNotification } from 'utils/common.utils';

interface IProps {
  user: IUser;
  setUser: (user: IUser) => void;
}

export const useHandlers = ({ user, setUser }: IProps) => {
  const auth = useAuth();
  const dispatch = useDispatch();

  const [usernameUpdateModalVisible, setUsernameUpdateModalVisible] =
    useState(false);
  const [phoneUpdateModalVisible, setPhoneUpdateModalVisible] = useState(false);
  const [emailUpdateModalVisible, setEmailUpdateModalVisible] = useState(false);
  const [phoneVisibleSubmitting, setPhoneVisibleSubmitting] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [defaultAddressModal, setDefaultAddressModal] = useState(false);
  const [
    emailNotificationUpdateModalVisible,
    setEmailNotificationUpdateModalVisible,
  ] = useState(false);
  const [targetNotification, setTargetNotification] = useState(
    user.isAgreeEmailNotification,
  );
  const [deliveryAddresses, setDeliveryAddresses] = useState<IAddress>(
    localStorage.getItem(STRINGS.CUSTOM_ORDER.DELIVERY_ADDRESS)
      ? JSON.parse(localStorage.getItem(STRINGS.CUSTOM_ORDER.DELIVERY_ADDRESS))
      : getInitialAddress(),
  );

  const handleAvatarUpdate = useMemo(
    () => async (avatarPath: string) => {
      setUser({
        ...user,
        avatar: avatarPath,
      });
      console.log(avatarPath);
      await APIRequest({
        method: 'put',
        url: API_ENDPOINTS.USER,
        data: { user: { id: auth.user.id, avatar: avatarPath } },
        requireAuth: true,
      });
      dispatch(setAuthUser({ ...auth.user, avatar: avatarPath }));
      openNotification(!!avatarPath ? 'Аватар обновлен' : 'Аватар удален');
      setAvatarModalVisible(false);
    },
    [],
  );

  const handleUsernameUpdate = (usernameData: IUsername) => {
    setUser({
      ...user,
      ...usernameData,
    });
    dispatch(
      setAuthUser({
        ...auth.user,
        ...usernameData,
      }),
    );
    setUsernameUpdateModalVisible(false);
    openNotification('ФИО обновлено');
  };

  const handlePhoneUpdate = (phone: string) => {
    setUser({
      ...user,
      phone,
    });
    dispatch(setAuthUser({ ...auth.user, phone }));
    setPhoneUpdateModalVisible(false);
    openNotification('Номер телефона обновлен');
  };

  const handleEmailUpdate = (email: string) => {
    setUser({
      ...user,
      email,
    });
    dispatch(setAuthUser({ ...auth.user, email }));
    setEmailUpdateModalVisible(false);
    openNotification('E-mail адрес обновлен');
  };

  const handleEmailNotificationUpdate = async (emailNotification: string) => {
    setUser({
      ...user,
      emailNotification,
    });
    dispatch(setAuthUser({ ...auth.user, emailNotification }));
    setEmailNotificationUpdateModalVisible(false);
    openNotification(
      !!emailNotification
        ? 'Добавлена почта для уведомлений'
        : 'Удалена  почта для уведомлений',
    );
  };

  const toggleEmailNotification = async () => {
    setTargetNotification(!targetNotification);

    const res = await APIRequest({
      method: 'patch',
      url: API_ENDPOINTS.TOGGLE_EMAIL_NOTIFICATION,
      requireAuth: true,
    });

    setTargetNotification(!targetNotification);

    if (!res.isSucceed) {
      openNotification(res.message);
      return;
    }
    const userData: IUser = res.data.user;

    if (userData.isAgreeEmailNotification === true) {
      openNotification('Получения уведомлений на почту подключено');
    } else {
      openNotification('Получения уведомлений на почту отключено');
    }

    setUser({
      ...user,
      isAgreeEmailNotification: userData.isAgreeEmailNotification,
    });
    dispatch(
      setAuthUser({
        ...auth.user,
        phoneIsHidden: userData.phoneIsHidden,
      }),
    );
  };

  const toggleUserPhoneIsHidden = async () => {
    setPhoneVisibleSubmitting(true);

    const res = await APIRequest({
      method: 'patch',
      url: API_ENDPOINTS.TOGGLE_PHONE_VISIBLE,
      requireAuth: true,
    });

    setPhoneVisibleSubmitting(false);

    if (!res.isSucceed) {
      openNotification(res.message);
      return;
    }
    const userData: IUser = res.data.user;

    if (userData.phoneIsHidden) {
      openNotification('Ваш номер телефона скрыт от других пользователей');
    } else {
      openNotification('Ваш номер телефона открыт для других пользователей');
    }
    setUser({
      ...user,
      phoneIsHidden: userData.phoneIsHidden,
    });
    dispatch(
      setAuthUser({
        ...auth.user,
        phoneIsHidden: userData.phoneIsHidden,
      }),
    );
  };

  return {
    usernameUpdateModalVisible,
    setUsernameUpdateModalVisible,
    handleUsernameUpdate,
    phoneUpdateModalVisible,
    setPhoneUpdateModalVisible,
    handlePhoneUpdate,
    emailUpdateModalVisible,
    setEmailUpdateModalVisible,
    emailNotificationUpdateModalVisible,
    setEmailNotificationUpdateModalVisible,
    avatarModalVisible,
    setAvatarModalVisible,
    handleEmailUpdate,
    phoneVisibleSubmitting,
    toggleUserPhoneIsHidden,
    handleAvatarUpdate,
    toggleEmailNotification,
    handleEmailNotificationUpdate,
    defaultAddressModal,
    setDefaultAddressModal,
    deliveryAddresses,
    setDeliveryAddresses,
  };
};
