import { IOrganization } from 'sections/Organizations/interfaces';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import PageContainer from 'components/containers/PageContainer';
import EditOrganizationPageContent from './Content';
import organizationsService from 'sections/Organizations/organizations.service';

const OrganizationPage = () => {
  const router = useRouter();
  const [data, setData] = useState<{ organization: IOrganization }>(null);

  useEffect(() => {
    const fetchData = async () => {
      const organization = await organizationsService.fetchOrganization(
        router.query?.organizationId as string,
      );

      setData({
        organization,
      });
    };
    fetchData();
  }, [router.query?.organizationId]);

  return (
    <PageContainer contentLoaded={!!data}>
      <EditOrganizationPageContent {...data} />
    </PageContainer>
  );
};

export default OrganizationPage;
