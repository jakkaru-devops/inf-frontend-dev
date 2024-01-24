import PageContainer from 'components/containers/PageContainer';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
  IProduct,
  IProductBranch,
  ISupplier,
} from 'sections/Catalog/interfaces/products.interfaces';
import CatalogExternalProductPageContent from './Content';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import { API_ENDPOINTS_V2 } from 'data/api.data';
import { IAutoType } from 'sections/Catalog/interfaces/categories.interfaces';
import { IRowsWithCount } from 'interfaces/common.interfaces';

const CatalogExternalProductPage = () => {
  const [data, setData] = useState<any>(null);
  const [productData, setProductData] = useState<{
    product: IProduct;
    branches: IProductBranch[];
    autoTypes: IRowsWithCount<IAutoType[]>;
    suppliersList: ISupplier[];
  }>(null);
  const router = useRouter();

  const params = router.query?.restParams as string[];
  const productId = params[params.length - 1];

  useEffect(() => {
    const fetchData = async () => {
      const res = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.PRODUCT(productId),
        params: {
          include: ['files', 'analogs'],
        },
      });
      if (!res.isSucceed) {
        setData({
          product: null,
          branches: [],
          autoTypes: { count: 0, rows: [] },
          suppliersList: [],
        });
        return;
      }

      const branchesRes = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.PRODUCT_BRANCHES(productId),
        params: {
          autoType: router?.query?.autoType,
          autoBrand: router?.query?.autoBrand,
          requireDescription: true,
        },
      });
      if (!branchesRes.isSucceed) return;

      const autoTypesRes = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.AUTO_TYPE_LIST,
      });
      const autoTypes = autoTypesRes.isSucceed ? autoTypesRes.data : null;

      const suppliersListRes = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS_V2.products.suppliersByProduct(productId),
      });
      const suppliersList = suppliersListRes.isSucceed
        ? suppliersListRes.data
        : [];

      setProductData({
        product: res.data?.product,
        branches: branchesRes?.data?.branches,
        autoTypes,
        suppliersList,
      });
    };
    fetchData();
  }, [productId]);

  useEffect(() => {
    const fetchData = async () => {
      const restParams = params.filter((__, i) => i < params.length - 1);
      const modification = restParams?.length > 1 && restParams[0];
      const [parentGroup, group] = restParams?.pop()?.split('--');

      const res = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.ACAT_PARTS_LIST,
        params: {
          autoType: router.query.autoType,
          autoBrand: router.query.autoBrand,
          autoModel: router.query.autoModel,
          modification,
          parentGroup,
          group,
        },
      });
      if (!res.isSucceed) return;

      setData(res.data);
    };
    fetchData();
  }, [router.query]);

  return (
    <PageContainer contentLoaded={!!data && !!productData}>
      <CatalogExternalProductPageContent
        data={data}
        productData={productData}
      />
    </PageContainer>
  );
};

export default CatalogExternalProductPage;
