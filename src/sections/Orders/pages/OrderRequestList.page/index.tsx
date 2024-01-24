import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { IOrderRequest } from 'sections/Orders/interfaces';
import { useEffect, useState } from 'react';
import { APIRequest } from 'utils/api.utils';
import OrderRequestListPageContent from './Content';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { useNotifications } from 'hooks/notifications.hooks';
import socketService from 'services/socket';
import { STRINGS } from 'data/strings.data';
import { INotification } from 'hooks/notifications.hooks/interfaces';
import { fetchOrderRequestService } from 'sections/Orders/services/fetchOrderRequest.service';
import { useRouter } from 'next/router';
import { generateUrl } from 'utils/common.utils';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';
import { useAuth } from 'hooks/auth.hook';

const OrderRequestListPage = () => {
  const auth = useAuth();
  const router = useRouter();
  const { handleNewNotification } = useNotifications();

  const [orderRequests, setOrderRequests] =
    useState<IRowsWithCount<IOrderRequest[]>>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [newItemsCount, setNewItemsCount] = useState(0);
  const [stateCounter, setStateCounter] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const res = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.ORDER_REQUEST_LIST,
        params: {
          page: router.query?.page,
          pageSize: router.query?.pageSize || 10,
          idOrder: router.query?.idOrder,
          status: router.query?.status,
        },
        requireAuth: true,
      });
      if (res.isSucceed) {
        setOrderRequests(res.data);
      }
      setDataLoaded(true);
    };
    fetchData();
  }, [router.query]);

  // Handle notifications
  useEffect(() => {
    if (!orderRequests) return;

    socketService.socket
      .off(STRINGS.SERVER_NEW_NOTIFICATION)
      .on(
        STRINGS.SERVER_NEW_NOTIFICATION,
        async (notification: INotification) => {
          handleNewNotification(notification);

          if (
            notification?.type === 'userOrderRequestsBanned' &&
            notification?.roleId === auth.currentRole.id
          ) {
            router.reload();
          }

          if (notification.type === 'createOrderRequest') {
            if (!router?.query?.page || router?.query?.page === '1') {
              router.push(generateUrl({ page: 1 }));
            } else {
              setNewItemsCount(prev => prev + 1);
            }
          }

          const index = orderRequests.rows.findIndex(
            orderRequest => orderRequest.id === notification?.orderRequestId,
          );
          if (index !== -1) {
            if (
              notification?.type === 'orderPaid' ||
              notification?.type === 'orderInvoicePaymentConfirmed'
            ) {
              setOrderRequests(prev => ({
                count: prev.count - 1,
                rows: prev.rows.filter((__, i) => i !== index),
              }));
            } else {
              const orderRequest = await fetchOrderRequestService(
                orderRequests.rows[index].id,
                auth,
              );
              const rows = orderRequests.rows;
              rows[index] = orderRequest;
              setOrderRequests({
                ...orderRequests,
                rows,
              });
            }
            setStateCounter(prev => prev + 1);
          }
        },
      );
  }, [orderRequests]);

  // Instantly redirect user to personal area when orderRequests are banned for auth user
  useEffect(() => {
    const role = auth.user.roles.find(el => el.id === auth.currentRole.id);
    if (
      role?.requestsBannedUntil &&
      new Date(role?.requestsBannedUntil).getTime() > new Date().getTime()
    ) {
      router.push(
        generateUrl(
          { history: DEFAULT_NAV_PATHS.PERSONAL_AREA },
          { pathname: APP_PATHS.PERSONAL_AREA },
        ),
      );
    }
  }, [auth.user.roles]);

  return (
    <OrderRequestListPageContent
      orderRequests={orderRequests}
      dataLoaded={dataLoaded}
      newItemsCount={newItemsCount}
      setNewItemsCount={setNewItemsCount}
    />
  );
};

export default OrderRequestListPage;
