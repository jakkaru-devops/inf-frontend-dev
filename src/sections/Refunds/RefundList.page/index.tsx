import { API_ENDPOINTS } from 'data/paths.data';
import { IOrderRequest } from 'sections/Orders/interfaces';
import { useEffect, useState } from 'react';
import { APIRequest } from 'utils/api.utils';
import { useRouter } from 'next/router';
import RefundListPageContent from './content';
import PageContainer from 'components/containers/PageContainer';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { useNotifications } from 'hooks/notifications.hooks';
import socketService from 'services/socket';
import { STRINGS } from 'data/strings.data';
import { INotification } from 'hooks/notifications.hooks/interfaces';
import { fetchOrderRequestService } from 'sections/Orders/services/fetchOrderRequest.service';
import { generateUrl } from 'utils/common.utils';
import { useAuth } from 'hooks/auth.hook';

const RefundListPage = () => {
  const [orders, setOrders] = useState<IRowsWithCount<IOrderRequest[]>>({
    count: 0,
    rows: [],
  });
  const [dataLoaded, setDataLoaded] = useState(false);
  const [newItemsCount, setNewItemsCount] = useState(0);
  const [stateCounter, setStateCounter] = useState(0);

  const auth = useAuth();
  const router = useRouter();
  const { handleNewNotification } = useNotifications();

  useEffect(() => {
    const fetchData = async () => {
      const { data, isSucceed } = await APIRequest({
        method: 'get',
        url:
          (['manager', 'operator'].includes(auth?.currentRole?.label) &&
            API_ENDPOINTS.ORDER_WITH_REFUND_EXCHANGE_ALL) ||
          (auth?.currentRole?.label === 'customer' &&
            API_ENDPOINTS.ORDER_WITH_REFUND_EXCHANGE_LIST) ||
          (auth?.currentRole?.label === 'seller' &&
            API_ENDPOINTS.ORDER_WITH_REFUND_EXCHANGE_LIST),
        params: {
          page: router.query.page || 1,
          status: router.query?.status,
          idOrder: router.query.idOrder,
        },
        requireAuth: true,
      });
      if (isSucceed) {
        setOrders(data);
      }
      setDataLoaded(true);
    };
    fetchData();
  }, [router.query]);

  // Handle notifications
  useEffect(() => {
    if (!orders?.rows?.length) return;

    socketService.socket
      .off(STRINGS.SERVER_NEW_NOTIFICATION)
      .on(
        STRINGS.SERVER_NEW_NOTIFICATION,
        async (notification: INotification) => {
          handleNewNotification(notification);
          if (
            notification?.type === 'refundProductRequest' ||
            notification?.type === 'exchangeProductRequest'
          ) {
            if (!router?.query?.page || router?.query?.page === '1') {
              router.push(generateUrl({ page: 1 }));
            } else {
              setNewItemsCount(prev => prev + 1);
            }
          }
          const index = orders.rows.findIndex(
            order => order.id === notification?.orderRequestId,
          );
          if (index !== -1) {
            if (
              (
                [
                  'refundProductComplete',
                  'exchangeProductComplete',
                ] as INotification['type'][]
              ).includes(notification.type)
            ) {
              setOrders(prev => ({
                count: prev.count - 1,
                rows: prev.rows.filter((__, i) => i !== index),
              }));
            } else {
              const order = await fetchOrderRequestService(
                orders.rows[index].id,
                auth,
              );
              const rows = orders.rows;
              rows[index] = order;
              setOrders({
                ...orders,
                rows,
              });
            }
            setStateCounter(prev => prev + 1);
          }
        },
      );
  }, [orders]);

  return (
    <PageContainer contentLoaded={dataLoaded}>
      <RefundListPageContent
        orders={orders}
        newItemsCount={newItemsCount}
        setNewItemsCount={setNewItemsCount}
      />
    </PageContainer>
  );
};

export default RefundListPage;
