import { API_ENDPOINTS } from 'data/paths.data';
import { IUser } from 'sections/Users/interfaces';
import { EMPLOYEE_ROLES } from 'sections/Users/data';
import { useState, useEffect } from 'react';
import { APIRequest } from 'utils/api.utils';
import EmployeeListPageContent from './content';
import { useRouter } from 'next/router';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import PageContainer from 'components/containers/PageContainer';

const EmployeeListPage = () => {
  const router = useRouter();

  const [users, setUsers] = useState<IRowsWithCount<IUser[]>>({
    count: 0,
    rows: [],
  });
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data, isSucceed } = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.USER_LIST,
        params: {
          role: EMPLOYEE_ROLES,
          include: ['address'],
          page: router.query.page,
          pageSize: router.query.pageSize || 10,
        },
        requireAuth: true,
      });

      if (isSucceed) {
        setUsers(data);
      }
      setDataLoaded(true);
    };
    fetchData();
  }, [router.query]);

  return (
    <PageContainer contentLoaded={dataLoaded}>
      <EmployeeListPageContent users={users} setUsers={setUsers} />
    </PageContainer>
  );
};

export default EmployeeListPage;
