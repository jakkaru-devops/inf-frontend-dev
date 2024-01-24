import PageContainer from 'components/containers/PageContainer';
import { API_ENDPOINTS } from 'data/paths.data';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { APIRequest } from 'utils/api.utils';
import CatalogExternalGroupListPageContent from './Content';

const CatalogExternalGroupListPage = () => {
  const [data, setData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const res = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.ACAT_GROUP_LIST,
        params: {
          autoType: router.query.autoType,
          autoBrand: router.query.autoBrand,
          autoModel: router.query.autoModel,
          modification: router.query?.restParams?.[0],
        },
      });
      if (!res.isSucceed) return;
      setData(res.data);
    };
    fetchData();
  }, []);

  return (
    <PageContainer contentLoaded={!!data}>
      <CatalogExternalGroupListPageContent data={data} />
    </PageContainer>
  );
};

export default CatalogExternalGroupListPage;
