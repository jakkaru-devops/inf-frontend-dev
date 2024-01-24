import PageContainer from 'components/containers/PageContainer';
import { API_ENDPOINTS } from 'data/paths.data';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { APIRequest } from 'utils/api.utils';
import CatalogExternalPageContent from '../CatalogExternal.page/Content';
import { IAPIRequest } from 'interfaces/api.types';

const definePageFromData = (
  data: any,
): 'root' | 'brand' | 'model' | 'modelModifications' | 'group' => {
  if (Array.isArray(data) && data.filter(item => !!item.marks).length > 0) {
    return 'root';
  }

  if (data?.mark && data?.models) {
    return 'brand';
  }
  if (
    data?.model &&
    data?.groups &&
    (data?.model?.modification ||
      data?.modification ||
      data?.breadcrumbs?.length === 4)
  ) {
    return 'model';
  }
  if (data?.model && data?.modifications) {
    return 'modelModifications';
  }
  if (data?.numbers) {
    return 'group';
  }
};

const CatalogExternalPage = () => {
  const [data, setData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = () => {
      const request: IAPIRequest = {
        method: 'get',
        url: API_ENDPOINTS.ACAT_ROOT,
        params: {
          path: ((router?.query?.params as string[]) || []).join('/'),
        },
      };
      APIRequest(request).then(res => {
        if (!res.isSucceed) return;
        setData(res.data);
      });
    };
    fetchData();
  }, [router.asPath]);

  const definePage = () => {
    switch (definePageFromData(data)) {
      case 'root':
        return <CatalogExternalPageContent autoTypes={data} />;
    }
  };

  return <PageContainer contentLoaded={!!data}>{definePage()}</PageContainer>;
};

export default CatalogExternalPage;
