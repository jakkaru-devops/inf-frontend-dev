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
  const [selectedRefundExchangeData, setSelectedRefundExchangeData] = useState<{
    requestProduct?: IRequestProduct;
    refundExchangeRequest?: IRefundExchangeRequest;
  }>(null);
  const [paymentRefundModalVisible, setPaymentRefundModalVisible] =
    useState(false);
  const [refundSum, setRefundSum] = useState(null);
  const [paidSum, setPaidSum] = useState(orderRequest?.paidSum);
  const [stateCounter, setStateCounter] = useState(0);

  const currentOffer = orderRequest.orders.find(
    ({ id }) => id == router.query?.tab,
  );

  const describedProducts = orderRequest.products.filter(
    ({ describedProduct }) => describedProduct,
  );
  const [attachments, setAttachments] = useState([]);
  const [attachmentsModalOpen, setAttachmentsModalOpen] = useState(false);

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

  const payPaymentRefundRequest = async () => {
    if (!refundSum) {
      openNotification('Необходимо указать сумму к возврату');
      return;
    }
    if (refundSum > orderRequest.paidSum) {
      openNotification('Сумма к возврату не должна превышать оплаченную сумму');
      return;
    }

    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.PAY_PAYMENT_REFUND_REQUEST,
      params: {
        id: orderRequest.id,
      },
      data: {
        refundSum,
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
    openNotification(
      `Возврат денежных средств по Запрос ${orderRequest.idOrder} произведен`,
    );
    setPaymentRefundModalVisible(false);
  };

  const handlePaidSumChange = async (value: number) => {
    currentOffer.paidSum = value;
    setOrderRequest({
      ...orderRequest,
    });
    setStateCounter(prev => prev + 1);
  };

  const handlePayment = async () => {
    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.PAY_ORDER_REQUEST,
      params: { id: orderRequest.id },
      requireAuth: true,
    });

    if (!res.isSucceed) return;

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
  };

  const handlePartialPayment = async () => {
    if (!currentOffer?.paidSum) {
      openNotification('Необходимо заполнить оплаченную сумму');
      return;
    }
    if (currentOffer?.paidSum >= currentOffer.totalPrice) {
      openNotification('Оплаченная сумма не должна превышать стоимость заказа');
      return;
    }

    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.MARK_ORDER_REQUEST_PARTIAL_PAYMENT,
      params: { id: orderRequest.id },
      data: {
        paidSum,
      },
      requireAuth: true,
    });

    if (!res.isSucceed) return;

    setOrderRequest({ ...orderRequest, paidSum: currentOffer.paidSum });
    openNotification('Оповещение отправлено покупателю');
  };

  return {
    locale,
    router,
    tabList,
    currentOffer,
    totalProductList,
    receivingDateState,
    selectedRefundExchangeData,
    allowUpdate,
    paymentRefundModalVisible,
    setPaymentRefundModalVisible,
    refundSum,
    setRefundSum,
    paidSum,
    setPaidSum,
    attachments,
    setAttachments,
    attachmentsModalOpen,
    setAttachmentsModalOpen,
    describedProducts,
    handlers: {
      payPaymentRefundRequest,
      handlePaidSumChange,
      handlePayment,
      handlePartialPayment,
    },
  };
};
