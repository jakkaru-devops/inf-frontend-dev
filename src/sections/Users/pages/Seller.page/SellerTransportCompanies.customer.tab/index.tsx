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

const SellerTransportCompaniesCustomerTab: FC<IProps> = ({ user }) => {
  const [data, setData] = useState<{
    transportCompanies: ITransportCompany[];
  }>(null);

  useEffect(() => {
    const fetchData = async () => {
      const sellerRes = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.USER_INFO,
        params: {
          id: user.id,
          include: ['transportCompanies'],
        },
        requireAuth: true,
      });
      console.log(sellerRes);

      const transportCompanies = sellerRes.isSucceed
        ? sellerRes.data?.transportCompanies
        : null;

      setData({
        transportCompanies,
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

export default SellerTransportCompaniesCustomerTab;
