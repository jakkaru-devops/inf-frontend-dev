import PageContainer from 'components/containers/PageContainer';
import { API_ENDPOINTS } from 'data/paths.data';
import { useEffect, useState } from 'react';
import { APIRequest } from 'utils/api.utils';
import CartPageContent from './Content';
import { IJuristicSubject } from 'sections/JuristicSubject/interfaces';
import { useAuth } from 'hooks/auth.hook';

const CartPage = () => {
  const [customerOrganizations, setCustomerOrganizations] =
    useState<IJuristicSubject[]>(null);
  const auth = useAuth();

  const fetchData = async () => {
    const res = await APIRequest({
      method: 'get',
      url: API_ENDPOINTS.USER_JURISTIC_SUBJECT_LIST,
      params: {
        userId: auth.user.id,
      },
    });
    setCustomerOrganizations(res.data.rows);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <PageContainer contentLoaded={!!customerOrganizations}>
      <CartPageContent customerOrganizations={customerOrganizations} />
    </PageContainer>
  );
};

export default CartPage;
