import PageContainer from 'components/containers/PageContainer';
import { API_ENDPOINTS } from 'data/paths.data';
import { FC, useEffect, useState } from 'react';
import { ITransportCompany } from 'sections/Shipping/interfaces';
import { IUser } from 'sections/Users/interfaces';
import { APIRequest } from 'utils/api.utils';
import SellerTransportCompaniesTabContent from './Content';

interface IProps {
  user: IUser;
}

const SellerTransportCompaniesSellerTab: FC<IProps> = ({ user }) => {
  const [data, setData] = useState<{
    transportCompanies: ITransportCompany[];
    sellersTransportCompanies: ITransportCompany[];
  }>(null);

  useEffect(() => {
    const fetchData = async () => {
      const transportCompaniesRes = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.ALL_TRANSPORT_COMPANY_LIST,
      });
      const transportCompanies = transportCompaniesRes.isSucceed
        ? transportCompaniesRes.data
        : [];

      const sellersTransportCompaniesRes = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.SELLERS_TRANSPORT_COMPANY_LIST,
        requireAuth: true,
      });
      const sellersTransportCompanies = sellersTransportCompaniesRes.isSucceed
        ? sellersTransportCompaniesRes.data
        : [];

      setData({
        transportCompanies,
        sellersTransportCompanies,
      });
    };
    fetchData();
  }, []);

  return (
    <PageContainer contentLoaded={!!data}>
      <SellerTransportCompaniesTabContent {...data} user={user} />
    </PageContainer>
  );
};

export default SellerTransportCompaniesSellerTab;
