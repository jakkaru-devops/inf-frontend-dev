import {
  IOrderRequest,
  IRefundExchangeRequest,
  IRequestProduct,
} from 'sections/Orders/interfaces';
import { useState, useEffect } from 'react';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { APIRequest } from 'utils/api.utils';
import { useRouter } from 'next/router';
import moment from 'moment';
import { useLocale } from 'hooks/locale.hook';
import { useModalsState } from 'hooks/modal.hook';
import { generateUrl, openNotification } from 'utils/common.utils';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';
import { setAuthSavedRegions } from 'store/reducers/auth.reducer';

interface IProps {
  orderRequest: IOrderRequest;
  setOrderRequest: (value: IOrderRequest) => void;
}

const getInitialState = (orderRequest: IOrderRequest) => {
  const initialReceivingDateState = {};
  orderRequest.orders.forEach(
    offer =>
      (initialReceivingDateState[offer.id] = offer?.receivingDate
        ? moment(offer.receivingDate)
        : null),
  );
  return initialReceivingDateState;
};

export const useHandlers = ({ orderRequest, setOrderRequest }: IProps) => {
  const { locale } = useLocale();
  const router = useRouter();

  const [receivingDateState, setReceivingDateState] = useState(
    getInitialState(orderRequest),
  );
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [selectedRefundExchangeData, setSelectedRefundExchangeData] = useState<{
    requestProduct?: IRequestProduct;
    refundExchangeRequest?: IRefundExchangeRequest;
  }>(null);

  const currentOffer = orderRequest.orders.find(
    ({ id }) => id == router.query?.tab,
  );

  const productDeletionAllowed =
    currentOffer?.products?.length > 1 || orderRequest?.orders?.length > 1;
  const describedProducts = orderRequest.products.filter(
    ({ describedProduct }) => describedProduct,
  );
  const [attachments, setAttachments] = useState([]);
  const [attachmentsModalOpen, setAttachmentsModalOpen] = useState(false);
  const [submitAwaiting, setSubmitAwaiting] = useState(false);

  const tabList = [
    {
      label: 'full',
      title: 'Весь заказ',
      href: generateUrl({ tab: null }),
      isActive: !currentOffer,
    },
    ...orderRequest.orders
      .filter(offer => offer.products.some(el => el.isSelected))
      .map((offer, i) => ({
        label: offer.id,
        title: `Продавец ${i + 1}`,
        href: generateUrl({ tab: offer.id }),
        isActive: currentOffer?.id == offer.id,
        rollback: false,
      })),
  ];

  useEffect(() => {
    APIRequest({
      method: 'get',
      url: API_ENDPOINTS.SELECTED_REGIONS,
      requireAuth: true,
      params: { orderRequestId: orderRequest.id },
    }).then(res => {
      if (!res.isSucceed) return;
      setAuthSavedRegions(res.data);
    });
  }, []);

  const changeProductCount = async (
    orderedProductId: string,
    value: number,
  ) => {
    const product = currentOffer.products.find(
      ({ id }) => id === orderedProductId,
    );
    if (value > product.quantity + (product.deliveryQuantity || 0)) return;
    product.count = value;
    setOrderRequest({
      ...orderRequest,
    });
  };

  const deleteProduct = async (orderedProductId: string) => {
    if (!currentOffer) return;
    currentOffer.products = currentOffer.products.filter(
      ({ id }) => id !== orderedProductId,
    );
    if (currentOffer.products.length === 0) {
      orderRequest.orders = orderRequest.orders.filter(
        order => order.id !== currentOffer.id,
      );
    }
    setOrderRequest({
      ...orderRequest,
    });
    setDeleteProductId(null);
    if (currentOffer.products.length === 0) {
      router.push(generateUrl({ tab: null }));
    }
  };

  const requestPaymentRefund = async () => {
    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.REQUEST_PAYMENT_REFUND,
      params: {
        id: orderRequest.id,
      },
      requireAuth: true,
    });
    if (!res.isSucceed) {
      openNotification(res.message);
      return;
    }
    setOrderRequest({
      ...orderRequest,
      paymentRefundRequest: res.data,
    });
    openNotification('Запрос на возврат денеждных средств отправлен');
  };

  const saveChanges = async () => {
    if (submitAwaiting) return;
    setSubmitAwaiting(true);

    const orders = orderRequest.orders.map(order => ({
      id: order.id,
      products: order.products.map(product => ({
        id: product.id,
        count: product?.count,
      })),
    }));
    const res = await APIRequest({
      method: 'put',
      url: API_ENDPOINTS.PARTLY_PAID_ORDER,
      params: {
        id: orderRequest.id,
      },
      data: {
        orders,
      },
      requireAuth: true,
    });
    setSubmitAwaiting(false);
    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }

    const newOrderRequest: IOrderRequest = res.data.orderRequest;

    if (newOrderRequest.status === 'PAID') {
      openNotification('Заказ оплачен');
      const timeout = setTimeout(() => {
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
      }, 500);
      return () => clearTimeout(timeout);
    } else {
      orderRequest.orders = orderRequest.orders.map(order => ({
        ...order,
        totalPrice: newOrderRequest.orders.find(({ id }) => id === order.id)
          .totalPrice,
      }));
      orderRequest.totalPrice = orderRequest.totalPrice;
      setOrderRequest({
        ...orderRequest,
      });
      openNotification('Изменения сохранены');
      setIsEditingMode(false);
      const timer = setTimeout(() => router.reload(), 500);
      return () => clearTimeout(timer);
    }
  };

  const deleteOrderRequest = async () => {
    const res = await APIRequest({
      method: 'delete',
      url: API_ENDPOINTS.ORDER_REQUEST,
      params: {
        id: orderRequest.id,
      },
      requireAuth: true,
    });
    if (!res.isSucceed) {
      openNotification(res.message);
      return;
    }
    openNotification(res.data.message);
    router.push(
      generateUrl(
        {
          history: DEFAULT_NAV_PATHS.ORDER_REQUEST_LIST,
        },
        { pathname: APP_PATHS.ORDER_REQUEST_LIST },
      ),
    );
  };

  useEffect(() => {
    setAttachments([
      ...orderRequest.attachments.filter(
        ({ orderId }) =>
          !currentOffer || !orderId || orderId === currentOffer?.id,
      ),
      ...describedProducts.flatMap(
        ({ describedProduct: { attachments } }) => attachments,
      ),
    ]);
  }, [currentOffer]);

  const totalProductList: IRequestProduct[] = [];
  if (!currentOffer) {
    for (const offer of orderRequest.orders) {
      for (const offeredProduct of offer.products) {
        if (!offeredProduct?.isSelected) continue;

        let index = totalProductList.findIndex(
          ({ productId }) => productId === offeredProduct.productId,
        );
        if (index === -1) {
          index = totalProductList.length;
          totalProductList[index] = {
            ...offeredProduct,
            product: offeredProduct.product,
            count: 0,
            totalPrice: 0,
          };
        }

        totalProductList[index].count += offeredProduct.count;
        totalProductList[index].totalPrice +=
          offeredProduct.count * offeredProduct.unitPrice;
      }
    }
  }

  const allowUpdate = !!currentOffer && !receivingDateState[currentOffer.id];

  return {
    locale,
    router,
    submitAwaiting,
    tabList,
    currentOffer,
    totalProductList,
    receivingDateState,
    selectedRefundExchangeData,
    allowUpdate,
    productDeletionAllowed,
    attachments,
    setAttachments,
    attachmentsModalOpen,
    setAttachmentsModalOpen,
    describedProducts,
    isEditingMode,
    setIsEditingMode,
    deleteProductId,
    setDeleteProductId,
    handlers: {
      changeProductCount,
      deleteProduct,
      requestPaymentRefund,
      deleteOrderRequest,
      saveChanges,
    },
  };
};
