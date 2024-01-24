import { API_ENDPOINTS } from 'data/paths.data';
import { IUser } from 'sections/Users/interfaces';
import { generateUrl } from 'utils/common.utils';
import PageContainer from 'components/containers/PageContainer';
import { useNotifications } from 'hooks/notifications.hooks';
import { useEffect, useState } from 'react';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { APIRequest } from 'utils/api.utils';
import { useRouter } from 'next/router';
import socketService from 'services/socket';
import { STRINGS } from 'data/strings.data';
import { INotification } from 'hooks/notifications.hooks/interfaces';
import SellerListPageContent from './Content';
import {
  IAutoBrand,
  IAutoType,
} from 'sections/Catalog/interfaces/categories.interfaces';

const SellerListPage = () => {
  const router = useRouter();
  const { handleNewNotification } = useNotifications();

  const [users, setUsers] = useState<IRowsWithCount<IUser[]>>(null);
  const [newItemsCount, setNewItemsCount] = useState(0);
  const [autoTypes, setAutoTypes] = useState<IRowsWithCount<IAutoType[]>>({
    rows: [],
    count: 0,
  });
  const [productGroups, setProductGroups] = useState<
    IRowsWithCount<IAutoType[]>
  >({
    rows: [],
    count: 0,
  });
  const [autoBrands, setAutoBrands] = useState<IRowsWithCount<IAutoBrand[]>>({
    rows: [],
    count: 0,
  });
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data, isSucceed } = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.USER_LIST,
        params: {
          page: router.query.page,
          pageSize: router.query.pageSize || 10,
          role: 'seller',
          search: router.query?.search,
          autoType: router.query?.autoType,
          autoBrand: router.query?.autoBrand,
          group: router.query?.group,
          include: ['organizations', 'productCategories'],
        },
        requireAuth: true,
      });

      console.log(data);
      if (isSucceed) {
        setUsers(data);
      }
    };
    fetchData();
  }, [router.query]);

  useEffect(() => {
    const fetchData = async () => {
      const autoTypesRes = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.AUTO_TYPE_LIST,
      });
      if (autoTypesRes.isSucceed) setAutoTypes(autoTypesRes.data);

      const productGroupsRes = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.PRODUCT_GROUP_LIST,
        params: {
          nestingLevel: 0,
          catalog: ['AUTO_PRODUCTS', 'AUTO_TOOLS'],
        },
      });
      if (productGroupsRes.isSucceed) setProductGroups(productGroupsRes.data);

      if (!!router.query?.autoType) {
        const autoBrandsRes = await APIRequest({
          method: 'get',
          url: API_ENDPOINTS.AUTO_BRAND_LIST,
          params: {
            autoType: router.query?.autoType,
          },
        });
        if (autoBrandsRes.isSucceed) setAutoBrands(autoBrandsRes.data);
      }

      setDataLoaded(true);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!users?.rows?.length) return;

    // Notification listener
    socketService.socket
      .off(STRINGS.SERVER_NEW_NOTIFICATION)
      .on(
        STRINGS.SERVER_NEW_NOTIFICATION,
        async (notification: INotification) => {
          handleNewNotification(notification);
          if (
            (
              ['sellerUpdateApplicationCreated'] as INotification['type'][]
            ).includes(notification?.type)
          ) {
            if (!router?.query?.page || router?.query?.page === '1') {
              router.push(generateUrl({ page: 1 }));
            } else {
              setNewItemsCount(prev => prev + 1);
            }
          }
        },
      );
  }, [users]);

  return (
    <PageContainer contentLoaded={!!users}>
      <SellerListPageContent
        users={users}
        newItemsCount={newItemsCount}
        setNewItemsCount={setNewItemsCount}
        autoTypes={autoTypes}
        productGroups={productGroups}
        autoBrands={autoBrands}
      />
    </PageContainer>
  );
};

export default SellerListPage;
