import PageContainer from 'components/containers/PageContainer';
import { API_ENDPOINTS } from 'data/paths.data';
import { STRINGS } from 'data/strings.data';
import { useNotifications } from 'hooks/notifications.hooks';
import { INotification } from 'hooks/notifications.hooks/interfaces';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
  IAutoBrand,
  IAutoType,
  IProductGroup,
} from 'sections/Catalog/interfaces/categories.interfaces';
import { fetchProductOfferService } from 'sections/Catalog/services/fetchProductOffer.service';
import socketService from 'services/socket';
import { APIRequest } from 'utils/api.utils';
import ProductOfferPageContentModerator from './Content.moderator';
import ProductOfferPageContentSeller from './Content.seller';
import { IProductOffer } from 'sections/Catalog/interfaces/products.interfaces';
import { useAuth } from 'hooks/auth.hook';

const ProductOfferPage = () => {
  const auth = useAuth();
  const router = useRouter();
  const { handleNewNotification, fetchUnreadNotificationsCount } =
    useNotifications();

  const [autoTypes, setAutoTypes] = useState<IRowsWithCount<IAutoType[]>>(null);
  const [autoBrands, setAutoBrands] =
    useState<IRowsWithCount<IAutoBrand[]>>(null);
  const [groups, setGroups] = useState<IRowsWithCount<IProductGroup[]>>(null);
  const [productOffer, setProductOffer] = useState<IProductOffer>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setDataLoaded(false);

      const productOfferData = await fetchProductOfferService(
        router.query.productOfferId as string,
      );
      setProductOffer(productOfferData);

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
  }, [router?.query?.productOfferId]);

  useEffect(() => {
    if (!productOffer) return;

    // Notification listener
    socketService.socket
      .off(STRINGS.SERVER_NEW_NOTIFICATION)
      .on(
        STRINGS.SERVER_NEW_NOTIFICATION,
        async (notification: INotification) => {
          handleNewNotification(notification);

          if (productOffer.id === notification?.data?.productOffer?.id) {
            const productOfferData = await fetchProductOfferService(
              productOffer.id,
            );
            setProductOffer(prev => ({
              ...prev,
              productOfferData,
            }));
          }
        },
      );

    const notifications = productOffer?.unreadNotifications;
    if (!notifications.length) return;

    const notificationIds = notifications.map(({ id }) => id);
    APIRequest({
      method: 'post',
      url: API_ENDPOINTS.NOTIFICATION_UNREAD,
      data: {
        notificationIds,
      },
      requireAuth: true,
    }).then(res => {
      if (!res.isSucceed) return;
      fetchUnreadNotificationsCount(notificationIds);
    });
  }, [productOffer]);

  return (
    <PageContainer contentLoaded={dataLoaded}>
      {auth?.currentRole?.label === 'moderator' && (
        <ProductOfferPageContentModerator
          productOffer={productOffer}
          autoTypes={autoTypes}
          setAutoTypes={setAutoTypes}
          autoBrands={autoBrands}
          setAutoBrands={setAutoBrands}
          groups={groups}
          setGroups={setGroups}
        />
      )}
      {auth?.currentRole?.label === 'seller' && (
        <ProductOfferPageContentSeller
          productOffer={productOffer}
          autoTypes={autoTypes}
          setAutoTypes={setAutoTypes}
          autoBrands={autoBrands}
          setAutoBrands={setAutoBrands}
          groups={groups}
          setGroups={setGroups}
        />
      )}
    </PageContainer>
  );
};

export default ProductOfferPage;
