import { API_ENDPOINTS } from 'data/paths.data';
import { FC, useEffect, useState } from 'react';
import { IJuristicSubject } from 'sections/JuristicSubject/interfaces';
import { IUser } from 'sections/Users/interfaces';
import { APIRequest } from 'utils/api.utils';
import CustomerContractsTabContent from './Content';
import PageContainer from 'components/containers/PageContainer';

interface IProps {
  user: IUser;
}

const CustomerContractsTab: FC<IProps> = ({ user }) => {
  const [juristicSubjects, setJuristicSubjects] =
    useState<IJuristicSubject[]>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.PROFILE_CUSTOMER_CONTRACTS,
        requireAuth: true,
      });
      if (!res.isSucceed) return;
      const resData: IJuristicSubject[] = res.data;

      for (const juristicSubject of resData) {
        if (!juristicSubject?.customerContracts?.length) {
          juristicSubject.customerContracts = [
            {
              juristicSubjectId: juristicSubject.id,
              creatorUserId: user.id,
              customerId: user.id,
              fileId: null,
              file: null,
              name: null,
              number: null,
              date: null,
              directorFirstName: null,
              directorLastName: null,
              directorMiddleName: null,
              directorPost: null,
              basisName: null,
              signerIsDirector: false,
              signerFirstName: null,
              signerLastName: null,
              signerMiddleName: null,
              signerPost: null,
            },
          ];
        }
      }
      setJuristicSubjects(resData);
    };
    fetchData();
  }, []);

  return (
    <PageContainer contentLoaded={!!juristicSubjects}>
      <CustomerContractsTabContent
        juristicSubjects={juristicSubjects}
        setJuristicSubjects={setJuristicSubjects}
      />
    </PageContainer>
  );
};

export default CustomerContractsTab;
