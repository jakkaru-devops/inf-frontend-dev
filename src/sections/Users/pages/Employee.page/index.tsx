import PageContainer from 'components/containers/PageContainer';
import { API_ENDPOINTS } from 'data/paths.data';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { IUser } from 'sections/Users/interfaces';
import { APIRequest } from 'utils/api.utils';
import EmployeePageContent from './content';

const EmployeePage = () => {
  const [user, setUser] = useState<IUser>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      if (Object.keys(router.query).length === 0) return;

      const { isSucceed, data } = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.USER,
        params: {
          id: router.query.userId,
          include: ['address', 'roles'],
        },
        requireAuth: true,
      });

      if (isSucceed) {
        setUser(data.user);
      }
    };
    fetchData();
  }, [router.query]);

  return (
    <PageContainer contentLoaded={!!user}>
      <EmployeePageContent user={user} />
    </PageContainer>
  );
};

export default EmployeePage;
