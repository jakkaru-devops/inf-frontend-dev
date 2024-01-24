import { BreadCrumbs, Page } from 'components/common';
import PageContainer from 'components/containers/PageContainer';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { IProductGroup } from 'sections/Catalog/interfaces/categories.interfaces';
import { APIRequest } from 'utils/api.utils';
import { openNotification } from 'utils/common.utils';
import ProductGroupListPageContent from './Content';

const ProductGroupListPage = () => {
  const router = useRouter();
  const [productGroups, setProductGroups] =
    useState<IRowsWithCount<IProductGroup[]>>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.PRODUCT_GROUP_LIST,
        params: {
          parent: 'none',
          pageSize: 'all',
          showHidden: true,
          search: router?.query?.search,
        },
      });
      console.log(res.data);
      if (!res.isSucceed) {
        openNotification(res?.message);
        return;
      }
      setProductGroups(res.data);
    };
    fetchData();
  }, [router?.query]);

  return (
    <PageContainer contentLoaded={!!productGroups}>
      <ProductGroupListPageContent
        productGroups={productGroups}
        setProductGroups={setProductGroups}
      />
    </PageContainer>
  );
};

export default ProductGroupListPage;
