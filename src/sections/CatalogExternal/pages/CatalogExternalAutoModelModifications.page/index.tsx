import PageContainer from 'components/containers/PageContainer';
import { API_ENDPOINTS } from 'data/paths.data';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { APIRequest } from 'utils/api.utils';
import CatalogExternalAutoModelModificationsPageContent from './Content';

const CatalogExternalAutoModelModificationsPage = () => {
  const [data, setData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const res = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.ACAT_MODIFICATION_LIST,
        params: {
          autoType: router.query.autoType,
          autoBrand: router.query.autoBrand,
          autoModel: router.query.autoModel,
          page: router.query?.page || 1,
        },
      });
      if (!res.isSucceed) return;
      setData(res.data);
      console.log(res.data);
    };
    fetchData();
  }, [router?.query]);

  if (!!data) console.log(data);

  return (
    <PageContainer contentLoaded={!!data}>
      <CatalogExternalAutoModelModificationsPageContent data={data} />
    </PageContainer>
  );
};

export default CatalogExternalAutoModelModificationsPage;
