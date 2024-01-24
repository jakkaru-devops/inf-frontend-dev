import PageContainer from 'components/containers/PageContainer';
import { API_ENDPOINTS } from 'data/paths.data';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { IProductGroup } from 'sections/Catalog/interfaces/categories.interfaces';
import { APIRequest } from 'utils/api.utils';
import { openNotification } from 'utils/common.utils';
import ProductGroupPageContent from './Content';

const ProductGroupPage = () => {
  const router = useRouter();
  const [productGroup, setProductGroup] = useState<IProductGroup>(null);
  const [productSubgroups, setProductSubgroups] =
    useState<IRowsWithCount<IProductGroup[]>>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const productGroupRes = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.PRODUCT_GROUP(
          router?.query?.productGroupId as string,
        ),
      });
      if (!productGroupRes) {
        openNotification(productGroupRes?.message);
        return;
      }
      setProductGroup(productGroupRes.data?.productGroup);

      const res = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.PRODUCT_GROUP_LIST,
        params: {
          parent: router?.query?.productGroupId,
          nestingLevel: 1,
          pageSize: 'all',
          showHidden: true,
          search: router?.query?.search,
        },
      });
      if (!res.isSucceed) {
        openNotification(res?.message);
        return;
      }
      setProductSubgroups(res.data);

      setDataLoaded(true);
    };
    fetchData();
  }, [router?.query]);

  return (
    <PageContainer contentLoaded={dataLoaded}>
      <ProductGroupPageContent
        productGroup={productGroup}
        productSubgroups={productSubgroups}
        setProductSubgroups={setProductSubgroups}
      />
    </PageContainer>
  );
};

export default ProductGroupPage;
