import PageContainer from 'components/containers/PageContainer';
import { IUser } from 'sections/Users/interfaces';
import SpecialClientsTabContent from './Content';
import { FC, useEffect, useState } from 'react';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import { IJuristicSubject } from 'sections/JuristicSubject/interfaces';

interface IProps {
  user: IUser;
}

const SpecialClientsTab: FC<IProps> = () => {
  const [juristicSubjects, setJuristicSubjects] =
    useState<IJuristicSubject[]>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.SPECIAL_CLIENT_LIST,
        requireAuth: true,
      });
      if (!res.isSucceed) return;
      setJuristicSubjects(res.data);
    };
    fetchData();
  }, []);

  return (
    <PageContainer contentLoaded={!!juristicSubjects}>
      <SpecialClientsTabContent
        juristicSubjects={juristicSubjects}
        setJuristicSubjects={setJuristicSubjects}
      />
    </PageContainer>
  );
};

export default SpecialClientsTab;
