import { Checkbox } from 'antd';
import { API_ENDPOINTS } from 'data/paths.data';
import { FC, Fragment, useEffect, useState } from 'react';
import { ITransportCompany } from 'sections/Shipping/interfaces';
import { APIRequest } from 'utils/api.utils';
import { openNotification } from 'utils/common.utils';
import Preloader from '../Preloader';

export interface ITransportCompaniesListProps {
  companies: ITransportCompany[];
  selectedCompanies: Array<ITransportCompany['id']>;
  disabled?: boolean;
  onChange: (companyId: ITransportCompany['id'], checked: boolean) => void;
}

const TransportCompaniesList: FC<ITransportCompaniesListProps> = ({
  companies: companiesInitial,
  selectedCompanies,
  disabled,
  onChange,
}) => {
  const [companies, setCompanies] = useState<ITransportCompany[]>(
    companiesInitial || [],
  );
  const [dataLoaded, setDataLoaded] = useState(!!companiesInitial?.length);

  const fetchCompanies = async () => {
    const res = await APIRequest({
      method: 'get',
      url: API_ENDPOINTS.ALL_TRANSPORT_COMPANY_LIST,
    });
    if (!res.isSucceed) {
      openNotification('Список транспортных компаний не загружен');
      return;
    }
    setCompanies(res.data);
    setDataLoaded(true);
  };

  useEffect(() => {
    if (!!companies.length) return;
    fetchCompanies();
  }, []);

  return (
    <Fragment>
      {companies.map((company, i) => (
        <div
          key={i}
          className="mb-15 d-flex align-items-center justify-content-between"
        >
          <Checkbox
            checked={selectedCompanies.includes(company.id)}
            onChange={e => onChange(company.id, e.target.checked)}
            style={{
              alignItems: 'center',
            }}
            disabled={disabled}
          >
            <h3 className="mb-0">{company.name}</h3>
          </Checkbox>
          <div style={{ position: 'absolute', right: '280px' }}>
            <span className={'text_14'}>
              <a href={company.calculateUrl} target="_blank">
                Расчитать стоимость
              </a>
            </span>
          </div>
        </div>
      ))}
      {!dataLoaded && <Preloader />}
    </Fragment>
  );
};

export default TransportCompaniesList;
