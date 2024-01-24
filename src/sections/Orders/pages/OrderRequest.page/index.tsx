import { IOrderRequest } from 'sections/Orders/interfaces';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { IOrganization } from 'sections/Organizations/interfaces';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { APIRequest } from 'utils/api.utils';
import OrderRequestPageContent from './Content';
import { PagePreloader } from 'components/common';
import { IUser } from 'sections/Users/interfaces';
import { fetchOrderRequestService } from 'sections/Orders/services/fetchOrderRequest.service';
import { useNotifications } from 'hooks/notifications.hooks';
import socketService from 'services/socket';
import { STRINGS } from 'data/strings.data';
import { INotification } from 'hooks/notifications.hooks/interfaces';
import { generateUrl } from 'utils/common.utils';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';
import { useAuth } from 'hooks/auth.hook';

const OrderRequestPage = () => {
  const auth = useAuth();
  const router = useRouter();
  const { handleNewNotification } = useNotifications();

  const [data, setData] = useState<{
    orderRequest: IOrderRequest;
    organizations: IOrganization[];
    sellers: IUser[];
  }>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const setOrderRequest = (value: IOrderRequest) => {
    setData({ ...data, orderRequest: value });
  };

  useEffect(() => {
    const fetchData = async () => {
      setData(null);

      const orderRequest = await fetchOrderRequestService(
        router.query.orderRequestId as string,
        auth,
      );

      let organizations: IOrganization[] = [];
      if (auth?.currentRole?.label === 'seller') {
        const organizationsRes = await APIRequest({
          method: 'get',
          url: API_ENDPOINTS.SELLERS_ORGANIZATIONS,
          requireAuth: true,
        });

        organizations = organizationsRes.isSucceed
          ? organizationsRes.data
          : null;
      }

      let sellers: IUser[] = [];
      if (
        ['customer', 'manager', 'operator'].includes(
          auth?.currentRole?.label,
        ) &&
        !!orderRequest &&
        orderRequest.selectedSellerIds
      ) {
        const sellersRes = await APIRequest({
          method: 'get',
          url: API_ENDPOINTS.USER_LIST,
          params: {
            role: 'seller',
            ids: orderRequest.selectedSellerIds.split(' '),
            pageSize: 999999,
          },
          requireAuth: true,
        });
        if (sellersRes.isSucceed) {
          sellers = sellersRes.data.rows;
        }
      }

      // Redirect to order page
      if (
        orderRequest &&
        [
          'PAID',
          'PAYMENT_POSTPONED',
          'COMPLETED',
          'DECLINED',
          'REWARD_PAID',
          'SHIPPED',
        ].includes(orderRequest.status)
      ) {
        router.push(
          generateUrl(
            {
              history: orderRequest.inHistory
                ? DEFAULT_NAV_PATHS.ORDER_IN_HISTORY(
                    orderRequest.id,
                    orderRequest.idOrder,
                  )
                : DEFAULT_NAV_PATHS.ORDER(
                    orderRequest.id,
                    orderRequest.idOrder,
                  ),
            },
            {
              pathname: APP_PATHS.ORDER(orderRequest.id),
            },
          ),
        );
        return;
      }

      setData({
        orderRequest,
        organizations,
        sellers,
      });
      setDataLoaded(true);
    };
    fetchData();
  }, [router.query?.orderRequestId]);

  // Handle notifications
  useEffect(() => {
    if (!data) return;

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

          if (
            [
              notification?.orderRequestId,
              notification?.data?.orderRequestId,
              notification?.data?.orderRequest?.id,
            ].includes(data.orderRequest.id)
          ) {
            if (
              notification?.type === 'orderPaid' ||
              notification?.type === 'orderInvoicePaymentConfirmed'
            ) {
              router.push(
                generateUrl(
                  {
                    history: DEFAULT_NAV_PATHS.ORDER(
                      data.orderRequest.id,
                      data.orderRequest.idOrder,
                    ),
                  },
                  { pathname: APP_PATHS.ORDER(data.orderRequest.id) },
                ),
              );
            } else {
              const orderRequest = await fetchOrderRequestService(
                data.orderRequest.id,
                auth,
              );
              setData(prev => ({
                ...prev,
                orderRequest,
              }));
            }
          }
        },
      );
  }, [data]);

  // Instantly redirect user to personal area when orderRequests are banned for auth user
  useEffect(() => {
    const role = auth?.user?.roles?.find(el => el.id === auth.currentRole.id);
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

  return dataLoaded ? (
    <OrderRequestPageContent {...data} setOrderRequest={setOrderRequest} />
  ) : (
    <PagePreloader />
  );
};

export default OrderRequestPage;
