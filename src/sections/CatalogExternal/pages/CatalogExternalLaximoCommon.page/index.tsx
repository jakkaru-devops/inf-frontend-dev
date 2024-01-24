import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import PageContainer from 'components/containers/PageContainer';
import CatalogExternalLaximoContentPage from './Content';
import { LaximoUrlType } from '../../interfaces';

const CatalogExternalLaximoCommonPage = () => {
  const [catalogInfo, setCatalogInfo] = useState<any>();

  const router = useRouter();

  useEffect(() => {
    APIRequest({
      url: API_ENDPOINTS.LAXIMO_CATALOG_INFO(
        router?.query?.laximoType.toString() as LaximoUrlType,
      ),
      params: {
        catalogCode: router?.query?.catalogCode,
      },
    }).then(res => {
      if (!res.isSucceed) return;
      setCatalogInfo(res.data);
    });
  }, []);

  return (
    <PageContainer contentLoaded={!!catalogInfo}>
      <CatalogExternalLaximoContentPage catalogInfo={catalogInfo} />
    </PageContainer>
  );
};

export default CatalogExternalLaximoCommonPage;
