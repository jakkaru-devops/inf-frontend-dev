import { IJuristicSubject } from 'sections/JuristicSubject/interfaces';
import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import PageContainer from 'components/containers/PageContainer';
import CustomerOrganizationContent from './Content';
import { Context } from '../context';
import { fetchJuristicSubjectService } from 'sections/Users/services/fetchJuristicSubject.service';

const CustomerOrganization = () => {
  const [jurSubject, setJurSubject] = useState<IJuristicSubject>(null);
  const { setSummaryContentLeft } = useContext(Context);

  const router = useRouter();

  useEffect(() => {
    setSummaryContentLeft(null);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchJuristicSubjectService(
        router.query.organizationId as string,
      );
      setJurSubject(data);
    };
    fetchData();
  }, [router.query?.organizationId]);

  return (
    <PageContainer contentLoaded={!!jurSubject}>
      <CustomerOrganizationContent jurSubject={jurSubject} />
    </PageContainer>
  );
};

export default CustomerOrganization;
