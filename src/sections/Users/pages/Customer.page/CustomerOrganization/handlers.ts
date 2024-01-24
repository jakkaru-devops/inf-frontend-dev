import { deepenObject } from 'utils/object.utils';
import { IJuristicSubject } from 'sections/JuristicSubject/interfaces';
import { Form } from 'antd';
import { useState } from 'react';
import { flattenObject } from 'utils/object.utils';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import { useLocale } from 'hooks/locale.hook';
import { openNotification } from 'utils/common.utils';
import { useAuth } from 'hooks/auth.hook';
import { ORGANIZATION_TYPES } from 'sections/Organizations/data';

interface IProps {
  jurSubject: IJuristicSubject;
}

export const useHandlers = ({ jurSubject }: IProps) => {
  const auth = useAuth();
  const { locale } = useLocale();
  const [form] = Form.useForm();

  const [state, setState] = useState({
    ...flattenObject({ jurSubject }),
    'jurSubject.formEnabled': true,
    'jurSubject.registered': true,
    personalDataProcessingPolicy: true,
    rulesForConcludingSupplyContract: true,
    userAgreementCustomer: true,
    deliveryOffer: true,
  });

  const [editable, setEditable] = useState(false);

  const handleEditToggle = () => setEditable(editable => !editable);

  const handleSaveChanges = async values => {
    const data = {
      juristicSubject: deepenObject(values).jurSubject,
    };
    data.juristicSubject.entityCode =
      ORGANIZATION_TYPES?.[data.juristicSubject.entityType];

    const res = await APIRequest({
      method: 'put',
      url: API_ENDPOINTS.USER_JURISTIC_SUBJECT,
      params: {
        id: jurSubject.id,
      },
      data,
      requireAuth: true,
    });

    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }

    openNotification('Организация успешно обновлена');
    setEditable(false);
  };

  return {
    locale,
    auth,
    form,
    state,
    setState,
    editable,
    handleEditToggle,
    handleSaveChanges,
  };
};
