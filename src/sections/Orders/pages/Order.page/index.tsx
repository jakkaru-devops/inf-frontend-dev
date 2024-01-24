import { IOrderRequest } from 'sections/Orders/interfaces';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { IUserReview } from 'sections/Users/interfaces';
import { APIRequest } from 'utils/api.utils';
import OrderPageContent from './Content';
import PageContainer from 'components/containers/PageContainer';
import { useNotifications } from 'hooks/notifications.hooks';
import socketService from 'services/socket';
import { STRINGS } from 'data/strings.data';
import {
  INotification,
  INotificationDataType,
} from 'hooks/notifications.hooks/interfaces';
import { fetchOrderRequestService } from 'sections/Orders/services/fetchOrderRequest.service';
import { generateUrl } from 'utils/common.utils';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { useAuth } from 'hooks/auth.hook';

const OrderPage = () => {
  const auth = useAuth();
  const router = useRouter();
  const { handleNewNotification, fetchUnreadNotificationsCount } =
    useNotifications();

  const [order, setOrder] = useState<IOrderRequest>(null);
  const [reviews, setReviews] = useState<IUserReview[]>(null);

  const fetchOrder = async () => {
    const orderData = await fetchOrderRequestService(
      router.query.orderId as string,
      auth,
    );

    const reviewsRes = await APIRequest<IRowsWithCount<IUserReview[]>>({
      method: 'get',
      url: API_ENDPOINTS.USER_REVIEW,
      params: {
        orderId: router.query.orderId,
      },
      requireAuth: true,
    });

    setOrder(orderData);
    if (reviewsRes.isSucceed) {
      setReviews(reviewsRes.data.rows);
    }
  };

  useEffect(() => {
    setOrder(null);
    fetchOrder();
  }, [router.query?.orderId]);

  useEffect(() => {
    if (!order) return;

    // Notification listener
    socketService.socket
      .off(STRINGS.SERVER_NEW_NOTIFICATION)
      .on(
        STRINGS.SERVER_NEW_NOTIFICATION,
        async (notification: INotification) => {
          handleNewNotification(notification);

          if (
            [
              notification?.orderRequestId,
              notification?.data?.orderRequestId,
              notification?.data?.orderRequest?.id,
            ].includes(order.id)
          ) {
            if (notification?.type === 'orderCompleted') {
              router.push(
                generateUrl(
                  {
                    history: DEFAULT_NAV_PATHS.ORDER_IN_HISTORY(
                      order.id,
                      order.idOrder,
                    ),
                  },
                  { pathname: APP_PATHS.ORDER(order.id) },
                ),
              );
            } else if (notification?.type === 'orderBack') {
              router.push(
                generateUrl(
                  {
                    history: DEFAULT_NAV_PATHS.ORDER(order.id, order.idOrder),
                  },
                  { pathname: APP_PATHS.ORDER(order.id) },
                ),
              );
            } else if (
              (
                [
                  'exchangeProductRequest',
                  'refundProductRequest',
                ] as (keyof INotificationDataType)[]
              ).includes(notification?.type)
            ) {
              router.push(
                generateUrl({
                  fromRefunds: 1,
                  history: DEFAULT_NAV_PATHS.ORDER_IN_REFUNDS(
                    order.id,
                    order.idOrder,
                  ),
                }),
              );
            } else if (
              (
                [
                  'exchangeProductComplete',
                  'refundProductComplete',
                ] as (keyof INotificationDataType)[]
              ).includes(notification?.type)
            ) {
              router.push(
                generateUrl({
                  fromRefunds: null,
                  history: order.inHistory
                    ? DEFAULT_NAV_PATHS.ORDER_IN_HISTORY(
                        order.id,
                        order.idOrder,
                      )
                    : DEFAULT_NAV_PATHS.ORDER(order.id, order.idOrder),
                }),
              );
            }

            const orderRequest = await fetchOrderRequestService(order.id, auth);
            setOrder(prev => ({
              ...prev,
              ...orderRequest,
            }));
          }
        },
      );

    const unreadNotifications = async () => {
      if (!!order?.unreadNotifications?.length) {
        const notificationIds = order.unreadNotifications
          .concat(order?.orders?.flatMap(el => el.unreadNotifications))
          .filter(Boolean)
          .map(({ id }) => id);
        await APIRequest({
          method: 'post',
          url: API_ENDPOINTS.NOTIFICATION_UNREAD,
          data: {
            notificationIds,
          },
          requireAuth: true,
        }).then(async res => {
          if (!res.isSucceed) return;
          await fetchUnreadNotificationsCount(notificationIds);
        });
      }
    };
    unreadNotifications();
  }, [order]);

  return (
    <PageContainer contentLoaded={!!order && !!reviews}>
      <OrderPageContent
        order={order}
        setOrder={setOrder}
        reviews={reviews}
        setReviews={setReviews}
        fetchOrder={fetchOrder}
      />
    </PageContainer>
  );
};

export default OrderPage;
