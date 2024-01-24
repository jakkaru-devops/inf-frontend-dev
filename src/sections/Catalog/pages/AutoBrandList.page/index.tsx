import { BreadCrumbs, Page } from 'components/common';
import PageContainer from 'components/containers/PageContainer';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { IAutoBrand } from 'sections/Catalog/interfaces/categories.interfaces';
import { APIRequest } from 'utils/api.utils';
import { openNotification } from 'utils/common.utils';
import AutoBrandListPageContent from './Content';

const AutoBrandListPage = () => {
  const router = useRouter();
  const [autoBrands, setAutoBrands] =
    useState<IRowsWithCount<IAutoBrand[]>>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.AUTO_BRAND_LIST,
        params: {
          pageSize: 'all',
          showHidden: true,
          search: router?.query?.search,
        },
      });
      if (!res.isSucceed) {
        openNotification(res?.message);
        return;
      }
      setAutoBrands(res.data);
    };
    fetchData();
  }, [router?.query]);

  return (
    <PageContainer contentLoaded={!!autoBrands}>
      <AutoBrandListPageContent
        autoBrands={autoBrands}
        setAutoBrands={setAutoBrands}
      />
    </PageContainer>
  );
};

export default AutoBrandListPage;
