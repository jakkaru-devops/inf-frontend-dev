import PageContainer from 'components/containers/PageContainer';
import { API_ENDPOINTS } from 'data/paths.data';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { APIRequest } from 'utils/api.utils';
import CatalogExternalAutoModelListPageContent from './Content';

const CatalogExternalAutoModelListPage = () => {
  const [data, setData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const res = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.ACAT_MODEL_LIST,
        params: {
          autoType: router.query.autoType,
          autoBrand: router.query.autoBrand,
        },
      });
      if (!res.isSucceed) return;
      setData(res.data);
    };
    fetchData();
  }, []);

  return (
    <PageContainer contentLoaded={!!data}>
      <CatalogExternalAutoModelListPageContent data={data} />
    </PageContainer>
  );
};

export default CatalogExternalAutoModelListPage;
