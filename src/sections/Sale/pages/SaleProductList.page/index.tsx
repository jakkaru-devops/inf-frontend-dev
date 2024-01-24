import { useLocale } from 'hooks/locale.hook';
import { FC, useEffect, useState } from 'react';
import socketService from 'services/socket';
import { STRINGS } from 'data/strings.data';
import { INotification } from 'hooks/notifications.hooks/interfaces';
import { useNotifications } from 'hooks/notifications.hooks';
import { useRouter } from 'next/router';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import ProductListContextProvider from 'sections/Catalog/pages/ProductList.page/context';
import PageContainer from 'components/containers/PageContainer';
import { useAuth } from 'hooks/auth.hook';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import {
  IAutoBrand,
  IAutoModel,
  IAutoType,
  IProductGroup,
} from 'sections/Catalog/interfaces/categories.interfaces';
import { IProduct } from 'sections/Catalog/interfaces/products.interfaces';
import { API_ENDPOINTS_V2 } from 'data/api.data';
import SaleProductListPageContentCustomer from './Content.customer';
import SaleProductListPageContentSeller from './Content.seller';

const SaleProductListPage: FC = () => {
  const auth = useAuth();
  const router = useRouter();
  const { locale } = useLocale();
  const { handleNewNotification } = useNotifications();

  useEffect(() => {
    socketService.socket
      .off(STRINGS.SERVER_NEW_NOTIFICATION)
      .on(
        STRINGS.SERVER_NEW_NOTIFICATION,
        async (notification: INotification) => {
          handleNewNotification(notification);

          if (
            (notification?.type === 'userOrderRequestsBanned' ||
              notification?.type === 'userOrderRequestsUnbanned') &&
            notification?.roleId === auth.currentRole.id
          ) {
            router.reload();
          }
        },
      );
  }, []);

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
        params: {
          mode: 'sale',
        },
      });
      const autoType = autoTypesRes.isSucceed ? autoTypesRes.data : null;

      const autoBrandsRes = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.AUTO_BRAND_LIST,
        params: {
          autoType: router.query.autoType,
          mode: 'sale',
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
            mode: 'sale',
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
          mode: 'sale',
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
            mode: 'sale',
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
      try {
        const productsRes = await APIRequest({
          method: 'get',
          url: API_ENDPOINTS_V2.sale.productList,
          params: {
            search: router.query.search,
            page: router.query.page,
            pageSize:
              router.query.pageSize ||
              (auth.currentRole?.label === 'seller' ? 10 : 12),
            orderBy: router.query.orderBy,
            autoType: router.query.autoType,
            autoBrand: router.query.autoBrand,
            autoModel: router.query.autoModel,
            group: router.query.group,
            subgroup: router.query.subgroup,
            region: router.query.region,
          },
        });

        const productList: IRowsWithCount<IProduct[]> = productsRes.isSucceed
          ? productsRes.data
          : { rows: [], count: 0 };

        setProducts(productList);
      } catch (e) {
        console.log('saleProduct list request failed');
      }
    };
    fetchData();
  }, [router.query]);

  if (auth.currentRole?.label === 'customer') {
    return (
      <PageContainer contentLoaded={!!categories && !!products}>
        <ProductListContextProvider
          {...categories}
          products={products}
          showPriceOrderOption
        >
          <SaleProductListPageContentCustomer />;
        </ProductListContextProvider>
      </PageContainer>
    );
  }
  if (auth.currentRole?.label === 'seller') {
    return (
      <PageContainer contentLoaded={!!categories && !!products}>
        <SaleProductListPageContentSeller products={products} />
      </PageContainer>
    );
  }
  return <div>{locale.errors.userRoleNotDefined}</div>;
};

export default SaleProductListPage;
