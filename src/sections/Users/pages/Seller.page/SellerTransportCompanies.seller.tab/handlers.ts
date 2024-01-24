import { useState } from 'react';
import { API_ENDPOINTS } from 'data/paths.data';
import { APIRequest } from 'utils/api.utils';
import { ITransportCompany } from 'sections/Shipping/interfaces';
import { useLocale } from 'hooks/locale.hook';
import { openNotification } from 'utils/common.utils';
import { IAPIRequest } from 'interfaces/api.types';

interface IProps {
  sellersTransportCompanies: ITransportCompany[];
}

export const useHandlers = ({ sellersTransportCompanies }: IProps) => {
  const { locale } = useLocale();

  const [selectedTransportCompanyIds, setSelectedTransportCompanyIds] =
    useState(sellersTransportCompanies.map(({ id }) => id) || []);

  const selectTransportCompany = async (
    value: boolean,
    transportCompanyId: string,
  ) => {
    console.log(value);
    let requestConfig: IAPIRequest = {};
    const setRequestConfig = config => (requestConfig = config);

    const onDeleteCompany = () => {
      console.log(transportCompanyId);
      setRequestConfig({
        method: 'delete',
        url: API_ENDPOINTS.DELETE_PERSONAL_TRANSPORT_COMPANY,
        data: {
          transportCompanyId,
        },
        requireAuth: true,
      });
      return selectedTransportCompanyIds.filter(
        id => id !== transportCompanyId,
      );
    };

    const onSelectCompany = () => {
      console.log(newSelectedTransportCompanyIds);
      setRequestConfig({
        method: 'put',
        url: API_ENDPOINTS.SELLERS_TRANSPORT_COMPANIES,
        data: {
          transportCompanyIds:
            selectedTransportCompanyIds.concat(transportCompanyId),
        },
        requireAuth: true,
      });
      console.log(selectedTransportCompanyIds.concat(transportCompanyId));
      return selectedTransportCompanyIds.concat(transportCompanyId);
    };

    const newSelectedTransportCompanyIds = value
      ? onSelectCompany()
      : onDeleteCompany();

    if (!requestConfig) {
      setRequestConfig({
        method: 'put',
        url: API_ENDPOINTS.SELLERS_TRANSPORT_COMPANIES,
        data: {
          transportCompanyIds: newSelectedTransportCompanyIds,
        },
        requireAuth: true,
      });
    }

    const res = await APIRequest(requestConfig);
    if (!res.isSucceed) {
      openNotification('Изменения не сохранены');
      return;
    }

    setSelectedTransportCompanyIds(newSelectedTransportCompanyIds);
  };

  return {
    locale,
    selectedTransportCompanyIds,
    selectTransportCompany,
  };
};
