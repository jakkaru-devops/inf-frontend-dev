import { useDispatch } from 'react-redux';
import { IUser } from '../../interfaces';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import { openNotification } from 'utils/common.utils';
import { useState } from 'react';
import { useAuth } from 'hooks/auth.hook';
import { setAuthUser } from 'store/reducers/auth.reducer';

interface IProps {
  user: IUser;
  setUser: (user: IUser) => void;
}

export const useHandlers = ({ user, setUser }: IProps) => {
  const auth = useAuth();
  const dispatch = useDispatch();
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);

  const handleAvatarUpdate = async (avatarPath: string) => {
    setUser({
      ...user,
      avatar: avatarPath,
    });
    await APIRequest({
      method: 'put',
      url: API_ENDPOINTS.USER,
      data: { user: { id: auth.user.id, avatar: avatarPath } },
      requireAuth: true,
    });
    dispatch(setAuthUser({ ...auth.user, avatar: avatarPath }));
    openNotification(!!avatarPath ? 'Аватар обновлен' : 'Аватар удален');
    setAvatarModalVisible(false);
  };

  return {
    avatarModalVisible,
    setAvatarModalVisible,
    handleAvatarUpdate,
  };
};
