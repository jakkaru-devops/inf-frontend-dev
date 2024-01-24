import { useEffect, useState } from 'react';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import OffersPageContent from './Content';
import { APIRequest } from 'utils/api.utils';
import { useRouter } from 'next/router';
import {
  IOrder,
  IOrderRequest,
  IRequestProduct,
} from 'sections/Orders/interfaces';
import { IJuristicSubject } from 'sections/JuristicSubject/interfaces';
import { ITransportCompany } from 'sections/Shipping/interfaces';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { generateUrl } from 'utils/common.utils';
import { useNotifications } from 'hooks/notifications.hooks';
import PageContainer from 'components/containers/PageContainer';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';
import socketService from 'services/socket';
import { STRINGS } from 'data/strings.data';
import { INotification } from 'hooks/notifications.hooks/interfaces';
import { fetchOrderService } from 'sections/Orders/services/fetchOrder.service';
import { IRegion } from 'components/common/SelectSettlementsModal/interfaces';
import { useAuth } from 'hooks/auth.hook';

const OffersPage = () => {
  const [data, setData] = useState<{
    orderRequest: IOrderRequest;
    offers: IRowsWithCount<IOrder[]>;
    selectedProducts: IRequestProduct[];
    jurSubjects?: IJuristicSubject[];
    transportCompanies: ITransportCompany[];
    regions: IRegion[];
  }>({
    orderRequest: null,
    offers: null,
    selectedProducts: null,
    jurSubjects: null,
    transportCompanies: null,
    regions: null,
  });
  const [dataLoaded, setDataLoaded] = useState(false);
  const [newItemsCount, setNewItemsCount] = useState(0);
  const [stateCounter, setStateCounter] = useState(0);

  const auth = useAuth();
  const router = useRouter();
  const { fetchUnreadNotificationsCount, handleNewNotification } =
    useNotifications();

  useEffect(() => {
    const fetchData = async () => {
      const orderRequestRes = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.OFFERS,
        params: {
          id: router.query?.orderRequestId,
          page: router.query?.page || 1,
          pageSize: router.query?.pageSize || 10,
          regionFiasId: router?.query?.regionFiasId,
          filterBy: router.query?.filterBy,
          filterProductId: router.query?.filterProductId,
        },
        requireAuth: true,
      });

      const {
        orderRequest,
        offers,
        selectedProducts,
        regions,
      }: {
        orderRequest?: IOrderRequest;
        offers?: IRowsWithCount<IOrder[]>;
        selectedProducts?: IRequestProduct[];
        regions?: IRegion[];
      } = orderRequestRes.isSucceed
        ? orderRequestRes.data
        : {
            orderRequest: null,
            offers: null,
            selectedProducts: null,
            regions: null,
          };

      if (
        offers.rows.some(
          ({ unreadNotifications }) => unreadNotifications?.length > 0,
        )
      ) {
        const notificationIds = offers.rows
          .flatMap(({ unreadNotifications }) =>
            unreadNotifications.map(({ id }) => id),
          )
          .filter(Boolean);
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

      const isPartialPayment =
        orderRequest.paidSum &&
        (!orderRequest.paymentRefundRequest ||
          (orderRequest.paymentRefundRequest &&
            !orderRequest.paymentRefundRequest.refundSum));

      if (isPartialPayment) {
        router.push(
          generateUrl(
            {
              history: DEFAULT_NAV_PATHS.ORDER_REQUEST(
                orderRequest.id,
                orderRequest.idOrder,
              ),
            },
            {
              pathname: APP_PATHS.ORDER_REQUEST(orderRequest.id),
            },
          ),
        );
        return;
      }

      if (
        orderRequest &&
        ['PAID', 'PAYMENT_POSTPONED', 'COMPLETED', 'REWARD_PAID'].includes(
          orderRequest.status,
        )
      ) {
        router.push(
          generateUrl(
            {
              history: DEFAULT_NAV_PATHS.ORDER(
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

      const transportCompaniesRes = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.ALL_TRANSPORT_COMPANY_LIST,
      });
      const transportCompanies = transportCompaniesRes.isSucceed
        ? transportCompaniesRes.data
        : [];

      if (auth?.currentRole?.label === 'customer') {
        const jurSubjectListRes = await APIRequest({
          method: 'get',
          url: API_ENDPOINTS.USER_JURISTIC_SUBJECT_LIST,
          params: { userId: auth.user.id },
          requireAuth: true,
        });

        const jurSubjects = jurSubjectListRes.isSucceed
          ? jurSubjectListRes.data.rows
          : null;

        setData({
          orderRequest,
          offers,
          selectedProducts,
          jurSubjects,
          transportCompanies,
          regions,
        });
        setDataLoaded(true);
        return;
      }

      setData({
        orderRequest,
        offers,
        selectedProducts,
        regions,
        transportCompanies,
      });
      setDataLoaded(true);
    };
    fetchData();
  }, [
    router.query?.orderRequestId,
    router.query?.page,
    router.query?.pageSize,
    router.query?.regionFiasId,
    router.query?.view,
    router.query?.filterBy,
    router.query?.filterProductId,
  ]);

  // Handle notifications
  useEffect(() => {
    if (!data?.offers?.rows?.length) return;

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

          if (notification?.type === 'orderInvoicePaymentConfirmed') {
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
          }

          if (
            notification?.type === 'orderPaid' &&
            notification?.orderRequestId === data?.orderRequest?.id
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
          }

          if (
            notification?.type === 'offerToOrderRequest' &&
            notification?.orderRequestId === data?.orderRequest?.id
          ) {
            if (!router?.query?.page || router?.query?.page === '1') {
              router.push(generateUrl({ page: 1 }));
            } else {
              setNewItemsCount(prev => prev + 1);
            }
          }

          if (
            notification?.type === 'orderPartialPayment' &&
            notification?.orderRequestId === data?.orderRequest?.id
          ) {
            router.push(
              generateUrl(
                {
                  history: DEFAULT_NAV_PATHS.ORDER_REQUEST(
                    data.orderRequest.id,
                    data.orderRequest.idOrder,
                  ),
                },
                { pathname: APP_PATHS.ORDER_REQUEST(data.orderRequest.id) },
              ),
            );
          }

          const index = data?.offers.rows.findIndex(
            offer => offer.id === notification?.orderId,
          );
          if (index !== -1) {
            const offer = await fetchOrderService(data?.offers?.rows[index].id);
            if (!offer) return;
            const rows = data?.offers?.rows;
            rows[index] = offer;
            setData({
              ...data,
              offers: {
                ...data.offers,
                rows,
              },
            });
            setStateCounter(prev => prev + 1);
          }
        },
      );
  }, [data?.offers]);

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
    <PageContainer contentLoaded={dataLoaded}>
      <OffersPageContent
        {...data}
        newItemsCount={newItemsCount}
        setNewItemsCount={setNewItemsCount}
      />
    </PageContainer>
  );
};

export default OffersPage;
