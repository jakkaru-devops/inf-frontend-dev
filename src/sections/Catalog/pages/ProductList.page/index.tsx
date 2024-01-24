import PageContainer from 'components/containers/PageContainer';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import {
  IAutoBrand,
  IAutoModel,
  IAutoType,
  IProductGroup,
} from 'sections/Catalog/interfaces/categories.interfaces';
import { APIRequest } from 'utils/api.utils';
import { generateUrl } from 'utils/common.utils';
import ProductListPageContent from './Content';
import ProductListContextProvider from './context';
import { IProduct } from 'sections/Catalog/interfaces/products.interfaces';
import { useAuth } from 'hooks/auth.hook';
import { IAPIResponse } from 'interfaces/api.types';

const ProductListPage = () => {
  const router = useRouter();
  const auth = useAuth();
  const [showPriceOrderOption, setShowPriceOrderOption] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<{
    autoType: IRowsWithCount<IAutoType[]>;
    autoBrand: IRowsWithCount<IAutoBrand[]>;
    autoModel: IRowsWithCount<IAutoModel[]>;
    group: IRowsWithCount<IProductGroup[]>;
    subgroup: IRowsWithCount<IProductGroup[]>;
  }>(null);
  const [products, setProducts] = useState<IRowsWithCount<IProduct[]>>(null);

  useEffect(() => {
    const fetchData = async () => {
      const autoTypesRes = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.AUTO_TYPE_LIST,
      });
      const autoType = autoTypesRes.isSucceed ? autoTypesRes.data : null;

      const autoBrandsRes = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.AUTO_BRAND_LIST,
        params: {
          autoType: router.query.autoType,
        },
      });
      const autoBrand = autoBrandsRes.isSucceed ? autoBrandsRes.data : null;

      let autoModel: IRowsWithCount<IAutoModel[]> = { count: 0, rows: [] };
      if (router.query.autoBrand) {
        const autoModelsRes = await APIRequest({
          method: 'get',
          url: API_ENDPOINTS.AUTO_MODEL_LIST,
          params: {
            autoType: router.query.autoType,
            autoBrand: router.query.autoBrand,
          },
        });
        if (autoModelsRes.isSucceed) autoModel = autoModelsRes.data;
      }

      const groupsRes = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.PRODUCT_GROUP_LIST,
        params: {
          parent: 'none',
          autoType: router?.query?.autoType,
          autoBrand: router?.query?.autoBrand,
          catalog:
            !router?.query?.autoType && !router?.query?.autoBrand
              ? ['AUTO_PRODUCTS', 'AUTO_TOOLS']
              : undefined,
        },
      });
      const group = groupsRes.isSucceed ? groupsRes.data : null;

      let subgroup: IRowsWithCount<IProductGroup[]> = { count: 0, rows: [] };
      if (router?.query?.group) {
        const subgroupsRes = await APIRequest({
          method: 'get',
          url: API_ENDPOINTS.PRODUCT_GROUP_LIST,
          params: {
            parent: router.query.group,
            autoType: router?.query?.autoType,
            autoBrand: router?.query?.autoBrand,
            catalog:
              !router?.query?.autoType && !router?.query?.autoBrand
                ? ['AUTO_PRODUCTS', 'AUTO_TOOLS']
                : undefined,
          },
        });
        if (subgroupsRes.isSucceed) subgroup = subgroupsRes.data;
      }

      setCategories({
        autoType,
        autoBrand,
        autoModel,
        group,
        subgroup,
      });
    };
    fetchData();
  }, [router.query]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const params = {
        orderBy: router.query.orderBy,
        orderDirection: router.query.orderDirection || 'desc',
        search: router.query.search,
        page: router.query.page,
        pageSize: router.query.pageSize,
        autoType: router.query.autoType,
        autoBrand: router.query.autoBrand,
        autoModel: router.query.autoModel,
        group: router.query.group,
        subgroup: router.query.subgroup,
        productIds: router.query?.productIds,
      };

      const productsRes = (await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.PRODUCT_LIST,
        params,
      })) as IAPIResponse<IRowsWithCount<IProduct[]>>;

      const productList = productsRes.isSucceed
        ? productsRes.data
        : { rows: [], count: 0 };
      if (
        !productList?.count &&
        !!router.query?.search &&
        auth.currentRole.label === 'customer'
      ) {
        router.push(
          generateUrl(
            {
              history: DEFAULT_NAV_PATHS.CUSTOM_ORDER,
            },
            {
              pathname: APP_PATHS.CUSTOM_ORDER,
            },
          ),
        );
        return;
      }

      const isFirstPageByPrice =
        (!params?.orderBy || params?.orderBy === 'price') &&
        (!params?.page || params?.page === '1');

      if (isFirstPageByPrice) {
        setShowPriceOrderOption(!!productList?.rows?.[0]?.minPrice);
      } else {
        const pricedProductsRes = (await APIRequest({
          method: 'get',
          url: API_ENDPOINTS.PRODUCT_LIST,
          params: {
            ...params,
            page: 1,
            pageSize: 1,
            orderBy: 'price',
          },
        })) as IAPIResponse<IRowsWithCount<IProduct[]>>;
        setShowPriceOrderOption(!!pricedProductsRes?.data?.rows?.[0]?.minPrice);
      }

      setProducts(productList);
      if (productsRes.isSucceed) {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [
    router.query?.orderBy,
    router.query?.orderDirection,
    router.query?.search,
    router.query?.page,
    router.query?.pageSize,
    router.query?.autoType,
    router.query?.autoBrand,
    router.query?.autoModel,
    router.query?.group,
    router.query?.subgroup,
    router.query?.productIds,
  ]);

  return (
    <PageContainer contentLoaded={!!categories && !!products}>
      <ProductListContextProvider
        {...categories}
        products={products}
        showPriceOrderOption={showPriceOrderOption}
        isLoading={isLoading}
      >
        <ProductListPageContent />
      </ProductListContextProvider>
    </PageContainer>
  );
};

export default ProductListPage;
