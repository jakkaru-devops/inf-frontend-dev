import PageContainer from 'components/containers/PageContainer';
import { API_ENDPOINTS } from 'data/paths.data';
import { STRINGS } from 'data/strings.data';
import { useNotifications } from 'hooks/notifications.hooks';
import { INotification } from 'hooks/notifications.hooks/interfaces';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { IProductOffer } from 'sections/Catalog/interfaces/products.interfaces';
import { fetchProductOfferService } from 'sections/Catalog/services/fetchProductOffer.service';
import socketService from 'services/socket';
import { APIRequest } from 'utils/api.utils';
import { generateUrl } from 'utils/common.utils';
import ProductOfferListPageContent from './content';

const ProductOfferListPage = () => {
  const { handleNewNotification } = useNotifications();
  const router = useRouter();

  const [newItemsCount, setNewItemsCount] = useState(0);
  const [productOffers, setProductOffers] =
    useState<IRowsWithCount<IProductOffer[]>>(null);
  const [filterMonths, setFilterMonths] = useState<number[]>([]);
  const [stateCounter, setStateCounter] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const res = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.PRODUCT_OFFER_LIST,
        params: {
          page: router?.query?.page,
          month: router.query?.month,
        },
        requireAuth: true,
      });
      const resData: {
        count: number;
        rows: IProductOffer[];
        filterMonths: number[];
      } = res.data;
      console.log(resData);
      if (res.isSucceed) {
        setFilterMonths(resData.filterMonths);
        setProductOffers({
          count: resData.count,
          rows: resData.rows,
        });
      }
    };
    fetchData();
  }, [router?.query]);

  useEffect(() => {
    if (!productOffers) return;

    // Notification listener
    socketService.socket
      .off(STRINGS.SERVER_NEW_NOTIFICATION)
      .on(
        STRINGS.SERVER_NEW_NOTIFICATION,
        async (notification: INotification) => {
          handleNewNotification(notification);

          if (notification.type === 'productOfferCreated') {
            if (!router?.query?.page || router?.query?.page === '1') {
              router.push(generateUrl({ page: 1 }));
            } else {
              setNewItemsCount(prev => prev + 1);
            }
          }

          const index = productOffers.rows.findIndex(
            productOffer => productOffer.id === notification?.orderRequestId,
          );
          if (index !== -1) {
            const productOffer = await fetchProductOfferService(
              productOffers.rows[index].id,
            );
            const rows = productOffers.rows;
            rows[index] = productOffer;
            setProductOffers({
              ...productOffers,
              rows,
            });
            setStateCounter(prev => prev + 1);
          }
        },
      );
  }, [productOffers]);

  return (
    <PageContainer contentLoaded={!!productOffers}>
      <ProductOfferListPageContent
        productOffers={productOffers}
        filterMonths={filterMonths}
        newItemsCount={newItemsCount}
        setNewItemsCount={setNewItemsCount}
      />
    </PageContainer>
  );
};

export default ProductOfferListPage;
