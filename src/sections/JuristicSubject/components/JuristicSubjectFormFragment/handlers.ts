import { IJuristicSubjectByInn } from '../../interfaces';
import { FormInstance } from 'antd/lib/form';
import { API_ENDPOINTS } from 'data/paths.data';
import { getInitialAddress } from 'utils/common.utils';
import { flattenObject } from 'utils/object.utils';
import { getInitialUserName } from 'sections/Users/data';
import { APIRequest } from 'utils/api.utils';
import { useLocale } from 'hooks/locale.hook';
import { RULES_AND_AGREEMENTS } from 'components/complex/ModalWrapper/data';
import { ISetState } from 'interfaces/common.interfaces';
import { useState } from 'react';

interface IProps {
  form: FormInstance<any>;
  state: any;
  setState: ISetState<any>;
  searchByInnAvailable: boolean;
}

export const useHandlers = ({
  form,
  state,
  setState,
  searchByInnAvailable = true,
}: IProps) => {
  const { locale } = useLocale();
  const [loading, setLoading] = useState(false);

  const handleJurSubjectInnChange = (value: string) => {
    const newState = state;
    newState['jurSubject.inn'] = value;

    if (!value || value.length < 10) {
      newState['jurSubject.formEnabled'] = false;
    }
    if (value.length > 12) {
      form.setFields([{ name: 'jurSubject.inn', value }]);
      return;
    }
    if ([10, 12].findIndex(el => el === value.length) !== -1) {
      searchByInnAvailable && searchByInn(value);
      newState['jurSubject.formEnabled'] = true;
    }

    setState({ ...newState });
  };

  const handleJurSubjectAddressFiasId = (target: string, fiasId: string) => {
    const newState = state;
    newState[`${target}FiasId`] = fiasId;
    setState({ ...newState });
    return;
  };

  const searchByInn = async (value: string) => {
    setLoading(true);

    const res = await APIRequest({
      method: 'get',
      url: API_ENDPOINTS.ORGANIZATION_BY_INN,
      params: {
        search: value,
        type: 'jurSubject',
      },
      requireAuth: true,
    });

    setLoading(false);

    const jurSubject: IJuristicSubjectByInn = res.isSucceed
      ? {
          ...res.data,
          name: res.data?.pureName || res.data?.name,
          isRegistered: res?.data?.isRegistered,
          formEnabled: true,
          juristicAddress: res.data.juristicAddress || getInitialAddress(),
          mailingAddress: res.data.juristicAddress || getInitialAddress(),
          email: res.data?.email,
          bankName: res.data?.bankName,
          bankBik: res.data?.bankBik,
          bankKs: res.data?.bankKs,
          bankRs: res.data?.bankRs,
          hasNds: res?.data?.hasNds,
          notFound: false,
        }
      : {
          notFound: true,
          id: undefined,
          isRegistered: false,
          entityType: value.length === 12 ? 'ИП' : 'ООО',
          kpp: null,
          ogrn: null,
          shopName: null,
          organizationName: null,
          director: getInitialUserName(),
          juristicAddress: getInitialAddress(),
          mailingAddress: getInitialAddress(),
          bankName: null,
          bankBik: null,
          bankKs: null,
          bankRs: null,
          hasNds: null,
        };

    if (jurSubject?.isRegistered) {
      for (const item of RULES_AND_AGREEMENTS) {
        jurSubject[item.label] = true;
      }
    }

    form.setFieldsValue(
      flattenObject({
        jurSubject,
      }),
    );

    setState({
      ...state,
      ...flattenObject({
        jurSubject,
      }),
    });
  };

  return {
    locale,
    loading,
    handleJurSubjectInnChange,
    handleJurSubjectAddressFiasId,
  };
};
