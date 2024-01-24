import { BreadCrumbs, Page, PageContent } from 'components/common';
import PageContainer from 'components/containers/PageContainer';
import { API_ENDPOINTS } from 'data/paths.data';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
  IAutoBrand,
  IAutoType,
  IProductGroup,
} from 'sections/Catalog/interfaces/categories.interfaces';
import { APIRequest } from 'utils/api.utils';
import EditProductPageContent from './content';
import { IProduct } from 'sections/Catalog/interfaces/products.interfaces';

const EditProductPage = () => {
  const router = useRouter();
  const [product, setProduct] = useState<IProduct>(null);
  const [autoTypes, setAutoTypes] = useState<IRowsWithCount<IAutoType[]>>(null);
  const [autoBrands, setAutoBrands] =
    useState<IRowsWithCount<IAutoBrand[]>>(null);
  const [groups, setGroups] = useState<IRowsWithCount<IProductGroup[]>>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const productRes = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.PRODUCT(router.query.productId as string),
        params: {
          include: [
            'files',
            'branches',
            // 'analogs', 'applicabilities'
          ],
        },
        requireAuth: true,
      });
      setProduct(productRes?.data?.product);

      const autoTypesRes = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.AUTO_TYPE_LIST,
      });
      setAutoTypes(autoTypesRes.data);

      const autoBrandsRes = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.AUTO_BRAND_LIST,
        params: {
          // include: ['autoTypes'],
          showHidden: true,
        },
      });
      setAutoBrands(autoBrandsRes?.data);

      const groupsRes = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.PRODUCT_GROUP_LIST,
        params: {
          parent: 'none',
          showHidden: true,
          // include: ['autoTypes', 'autoBrands'],
        },
      });
      setGroups(groupsRes?.data);

      setDataLoaded(true);
    };
    fetchData();
  }, []);

  return (
    <PageContainer contentLoaded={dataLoaded}>
      <EditProductPageContent
        product={product}
        autoTypes={autoTypes}
        setAutoTypes={setAutoTypes}
        autoBrands={autoBrands}
        setAutoBrands={setAutoBrands}
        groups={groups}
        setGroups={setGroups}
      />
    </PageContainer>
  );
};

export default EditProductPage;
