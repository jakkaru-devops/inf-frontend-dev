import {
  IProduct,
  IProductBranch,
  ISupplier,
} from 'sections/Catalog/interfaces/products.interfaces';
import { API_ENDPOINTS } from 'data/paths.data';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { APIRequest } from 'utils/api.utils';
import PageContainer from 'components/containers/PageContainer';
import ProductPageContent from './Content';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { IAutoType } from 'sections/Catalog/interfaces/categories.interfaces';
import { API_ENDPOINTS_V2 } from 'data/api.data';

const ProductPage = () => {
  const [data, setData] = useState<{
    product: IProduct;
    branches: IProductBranch[];
    autoTypes: IRowsWithCount<IAutoType[]>;
    suppliersList: ISupplier[];
  }>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const res = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.PRODUCT(router.query.productId as string),
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
        url: API_ENDPOINTS.PRODUCT_BRANCHES(router.query.productId as string),
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
        url: API_ENDPOINTS_V2.products.suppliersByProduct(
          router.query.productId as string,
        ),
      });
      const suppliersList = suppliersListRes.isSucceed
        ? suppliersListRes.data
        : [];

      setData({
        product: res.data?.product,
        branches: branchesRes?.data?.branches,
        autoTypes,
        suppliersList,
      });
    };
    fetchData();
  }, [router?.query?.productId]);

  return (
    <PageContainer contentLoaded={!!data}>
      <ProductPageContent {...data} />
    </PageContainer>
  );
};

export default ProductPage;
