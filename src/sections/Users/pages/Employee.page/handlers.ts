import { Form } from 'antd';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { useLocale } from 'hooks/locale.hook';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { IUser } from 'sections/Users/interfaces';
import { APIRequest } from 'utils/api.utils';
import { openNotification } from 'utils/common.utils';
import { deepenObject } from 'utils/object.utils';

interface IProps {
  user: IUser;
}

export const useHandlers = ({ user }: IProps) => {
  const { locale } = useLocale();
  const [form] = Form.useForm();
  const router = useRouter();
  const [deletion, setDeletion] = useState(() => {
    const result = {
      modalVisible: false,
      roles: {
        all: false,
      } as any,
    };
    for (const userRole of user.roles) {
      result.roles[userRole.label] = false;
    }
    return result;
  });
  const [blocking, setBlocking] = useState(() => {
    let initialBlocking = {
      modalVisible: false,
      roles: {
        all: user.roles.every(({ bannedUntil }) => !!bannedUntil),
      },
    };

    user.roles.forEach(userRole => {
      initialBlocking.roles[userRole.label] = !!userRole.bannedUntil;
    });

    return initialBlocking;
  });

  const handleDeletionCheckboxChange = async (
    label: string,
    value: boolean,
  ) => {
    setDeletion({
      ...deletion,
      roles: {
        ...deletion.roles,
        [label]: value,
      },
    });
  };

  /**
   * @desc Delete user roles or user
   */
  const handleDeletionSubmit = async () => {
    /* const data: {
      roles: string[]
    } = {
      roles: [],
    }

    Object.keys(deletion.roles).forEach(roleLabel => {
      if (deletion.roles[roleLabel]) {
        data.roles.push(roleLabel)
      }
    })

    const res = await APIRequest({
      method: 'delete',
      url: API_ENDPOINTS.USER,
      data,
      requireAuth: true,
    })
    if (!res.isSucceed) {
      openNotification(res.message)
      return
    } */

    const res = await APIRequest({
      method: 'delete',
      url: API_ENDPOINTS.USER,
      data: {
        userId: user.id,
      },
      requireAuth: true,
    });
    if (!res.isSucceed) {
      openNotification(res.message);
      return;
    }

    router.push(APP_PATHS.EMPLOYEE_LIST);
  };

  const handleBlockingCheckboxChange = async (
    label: string,
    value: boolean,
  ) => {
    setBlocking({
      ...blocking,
      roles: {
        ...blocking.roles,
        [label]: value,
      },
    });

    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.PUNISH_USER,
      params: {
        userId: user.id,
        roleLabel: label,
      },
      data: {
        requestBanWeeks: null,
        banWeeks: value ? 4200 : null,
        reasons: null,
      },
      requireAuth: true,
    });

    if (!res.isSucceed) {
      openNotification(res.message);
      return;
    }
  };

  const handleUpdateSubmit = async (values: any) => {
    const userData = deepenObject(values);
    userData.roles = Object.keys(userData.roles)
      .filter(key => !!userData.roles[key])
      .map(roleLabel => ({
        label: roleLabel,
      }));

    const res = await APIRequest({
      method: 'put',
      url: API_ENDPOINTS.USER_WORKER,
      data: {
        user: {
          ...userData,
          id: user.id,
        },
      },
      requireAuth: true,
    });
    if (!res.isSucceed) {
      openNotification(res.message);
      return;
    }

    openNotification(res.data.message);
  };

  return {
    locale,
    form,
    deletion,
    setDeletion,
    blocking,
    setBlocking,
    handleDeletionCheckboxChange,
    handleDeletionSubmit,
    handleBlockingCheckboxChange,
    handleUpdateSubmit,
  };
};
