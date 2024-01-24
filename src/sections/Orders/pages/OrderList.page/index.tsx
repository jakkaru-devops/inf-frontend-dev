import { API_ENDPOINTS } from 'data/paths.data';
import { IOrderRequest } from 'sections/Orders/interfaces';
import { FC, useEffect, useState } from 'react';
import { APIRequest } from 'utils/api.utils';
import OrderListPageContent from './Content';
import { useRouter } from 'next/router';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { useNotifications } from 'hooks/notifications.hooks';
import PageContainer from 'components/containers/PageContainer';
import socketService from 'services/socket';
import { STRINGS } from 'data/strings.data';
import { INotification } from 'hooks/notifications.hooks/interfaces';
import { fetchOrderRequestService } from 'sections/Orders/services/fetchOrderRequest.service';
import { generateUrl } from 'utils/common.utils';
import { useAuth } from 'hooks/auth.hook';

interface IProps {
  isHistory: boolean;
}

const OrderListPage: FC<IProps> = ({ isHistory = false }) => {
  const auth = useAuth();
  const router = useRouter();
  const { handleNewNotification } = useNotifications();

  const [newItemsCount, setNewItemsCount] = useState(0);
  const [orders, setOrders] = useState<IRowsWithCount<IOrderRequest[]>>({
    count: 0,
    rows: [],
  });
  const [dataLoaded, setDataLoaded] = useState(false);
  const [stateCounter, setStateCounter] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const { data, isSucceed } = await APIRequest({
        method: 'get',
        url: !isHistory
          ? API_ENDPOINTS.ORDER_LIST
          : API_ENDPOINTS.ORDER_HISTORY_LIST,
        params: {
          page: router.query.page,
          pageSize: router.query.pageSize || 10,
          idOrder: router.query.idOrder,
          status: router.query?.status,
          customerStatus: router.query?.customerStatus,
          sellerStatus: router.query?.sellerStatus,
          month: router.query.month,
          year: router.query.year,
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

  useEffect(() => {
    if (!orders?.rows?.length) return;

    // Notification listener
    socketService.socket
      .off(STRINGS.SERVER_NEW_NOTIFICATION)
      .on(
        STRINGS.SERVER_NEW_NOTIFICATION,
        async (notification: INotification) => {
          handleNewNotification(notification);
          if (
            (
              [
                'orderPaid',
                'exchangeProductComplete',
                'refundProductComplete',
              ] as INotification['type'][]
            ).includes(notification?.type)
          ) {
            if (!router?.query?.page || router?.query?.page === '1') {
              router.push(generateUrl({ page: 1 }));
            } else {
              setNewItemsCount(prev => prev + 1);
            }
          }

          const index = orders.rows.findIndex(
            orderRequest => orderRequest.id === notification?.orderRequestId,
          );
          if (index !== -1) {
            if (
              (
                [
                  'orderCompleted',
                  'refundProductRequest',
                  'exchangeProductRequest',
                ] as INotification['type'][]
              ).includes(notification?.type)
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
      <OrderListPageContent
        orders={orders}
        setOrders={setOrders}
        isHistory={isHistory}
        newItemsCount={newItemsCount}
        setNewItemsCount={setNewItemsCount}
      />
    </PageContainer>
  );
};

export default OrderListPage;
