import { Form } from 'antd';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { deepenObject } from 'utils/object.utils';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { useLocale } from 'hooks/locale.hook';
import { generateUrl, openNotification } from 'utils/common.utils';
import { ORGANIZATION_TYPES } from 'sections/Organizations/data';

export const useHandlers = () => {
  const { locale } = useLocale();
  const router = useRouter();
  const [form] = Form.useForm();

  const [state, setState] = useState({
    'jurSubject.formEnabled': false,
    'jurSubject.notFound': false,
  });

  const handleFormSubmit = async (values: any) => {
    const data = {
      juristicSubject: deepenObject(values).jurSubject,
    };
    data.juristicSubject.entityType = state['jurSubject.entityType'];
    data.juristicSubject.entityCode =
      ORGANIZATION_TYPES?.[data.juristicSubject.entityType] ||
      state['jurSubject.entityCode'];

    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.USER_JURISTIC_SUBJECT,
      data,
      requireAuth: true,
    });

    if (!res.isSucceed) {
      openNotification(res.message);
      return;
    }

    openNotification('Организация зарегистрирована');

    router.push(generateUrl({ organizationId: res.data.id }));
  };

  return {
    locale,
    form,
    state,
    setState,
    handleFormSubmit,
  };
};
