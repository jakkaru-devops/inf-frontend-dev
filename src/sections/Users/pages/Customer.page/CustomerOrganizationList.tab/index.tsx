import PageContainer from 'components/containers/PageContainer';
import { API_ENDPOINTS } from 'data/paths.data';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { useRouter } from 'next/router';
import { FC, useEffect, useState } from 'react';
import { IJuristicSubject } from 'sections/JuristicSubject/interfaces';
import { IUser } from 'sections/Users/interfaces';
import { APIRequest } from 'utils/api.utils';
import CustomerOrganizationListTabContent from './Content';
import { useAuth } from 'hooks/auth.hook';

interface IProps {
  user: IUser;
}

const CustomerOrganizationListTab: FC<IProps> = ({ user }) => {
  const [jurSubjects, setJurSubjects] =
    useState<IRowsWithCount<IJuristicSubject[]>>(null);
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { isSucceed, data } = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.USER_JURISTIC_SUBJECT_LIST,
        params: {
          userId:
            auth?.currentRole?.label === 'customer'
              ? auth.user.id
              : router.query.userId,
          page: router?.query.page || 1,
        },
        requireAuth: true,
      });
      if (isSucceed) {
        setJurSubjects(data);
      }
    };
    fetchData();
  }, [router?.query]);

  return (
    <PageContainer contentLoaded={!!jurSubjects}>
      <CustomerOrganizationListTabContent
        user={user}
        jurSubjects={jurSubjects}
        setJurSubjects={setJurSubjects}
      />
    </PageContainer>
  );
};

export default CustomerOrganizationListTab;
