import {
  IOrder,
  IOrderRequest,
  IRefundExchangeRequest,
  IRequestProduct,
} from 'sections/Orders/interfaces';
import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from 'data/paths.data';
import { APIRequest } from 'utils/api.utils';
import { useRouter } from 'next/router';
import moment from 'moment';
import { ModalType } from 'components/complex/ModalWrapper/interfaces';
import { useLocale } from 'hooks/locale.hook';
import { openNotification } from 'utils/common.utils';
import { ISetState } from 'interfaces/common.interfaces';
import ordersService from 'sections/Orders/orders.service';

export const getInitialRewardState = (order: IOrderRequest) => {
  const initialRewardState = {};
  order.orders.forEach(
    offer =>
      (initialRewardState[offer.id] = {
        supplierPaid: offer?.reward?.supplierPaid || false,
        sellerPaid: offer?.reward?.sellerFeePaidAt || false,
      }),
  );
  return initialRewardState;
};

const useHandlers = (
  order: IOrderRequest,
  setOrder: ISetState<IOrderRequest>,
  openModal: (type: ModalType) => void,
) => {
  const router = useRouter();
  const { locale } = useLocale();

  const [rewardState, setRewardState] = useState(
    ['PAID', 'COMPLETED', 'REWARD_PAID'].includes(order.status) &&
      getInitialRewardState(order),
  );

  const [selectedRefundExchangeData, setSelectedRefundExchangeData] = useState<{
    refundExchangeRequest?: IRefundExchangeRequest;
    refundExchangeHistory?: IRefundExchangeRequest[];
  }>(null);
  const [loaderVisible, setLoaderVisible] = useState(false);
  const [stateCounter, setStateCounter] = useState(0);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [cancelPaymentModalOpen, setCancelPaymentModalOpen] = useState(false);
  const [attachmentsModalOpen, setAttachmentsModalOpen] = useState(false);

  const currentOffer = order.orders.find(({ id }) => id == router.query?.tab);

  const describedProducts = order.products.filter(
    ({ describedProduct }) => describedProduct,
  );
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    const offerAttachments = !!currentOffer
      ? order.attachments.filter(
          el => el?.orderId === currentOffer?.id || el?.group === 'attachment',
        )
      : order.attachments;
    setAttachments([
      ...offerAttachments,
      ...describedProducts.flatMap(
        ({ describedProduct: { attachments } }) => attachments,
      ),
    ]);
  }, [currentOffer]);

  const totalProductList: IRequestProduct[] = [];
  if (!currentOffer) {
    for (const offer of order.orders) {
      if (!['PAID', 'PAYMENT_POSTPONED'].includes(offer.status)) continue;
      for (const offeredProduct of offer.products) {
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

  const allowReceivingDateUpdate =
    currentOffer &&
    !!currentOffer?.receivingDate &&
    moment(currentOffer.receivingDate)?.format('DD.MM.YYYY') !=
      moment(
        order.orders.find(({ id }) => id == currentOffer.id)?.receivingDate,
      )?.format('DD.MM.YYYY');

  const updateState = () => {
    setOrder({ ...order });
    setStateCounter(prev => prev + 1);
  };

  const updateReceivingDate = (value: moment.Moment | boolean) => {
    const receivingDate =
      typeof value === 'boolean' ? (value ? moment() : null) : value;
    submitOfferReceivingDate(receivingDate);
  };

  const submitOfferReceivingDate = async (receivingDate: moment.Moment) => {
    if (loaderVisible) return;

    setLoaderVisible(true);
    const res = await ordersService.updateOfferReceivingDate({
      orderId: order.id,
      offerId: currentOffer.id,
      receivingDate: receivingDate?.toString() || null,
    });
    setLoaderVisible(false);

    if (!res.isSucceed) {
      currentOffer.receivingDate = null;
      updateState();
      openNotification(res?.message);
      return;
    }

    currentOffer.receivingDate = receivingDate?.toDate();
    updateState();
    openNotification('Данные обновлены');
    router.reload();
  };

  const handleSupplierPaidCheckbox = async (supplierPaid: boolean) => {
    setRewardState(rewardState => ({
      ...rewardState,
      [currentOffer.id]: {
        supplierPaid,
        sellerPaid: rewardState[currentOffer.id].sellerPaid,
      },
    }));
    handleRewardUpdate({ supplierPaid });
  };

  const handleSellerPaidCheckbox = async (sellerPaid: boolean) => {
    setRewardState(rewardState => ({
      ...rewardState,
      [currentOffer.id]: {
        sellerPaid,
        supplierPaid: rewardState[currentOffer.id].supplierPaid,
      },
    }));
    handleRewardUpdate({ sellerPaid });
  };

  const handleRewardUpdate = async ({
    supplierPaid,
    sellerPaid,
  }: {
    supplierPaid?: boolean;
    sellerPaid?: boolean;
  }) => {
    const res = await APIRequest({
      method: 'put',
      url: API_ENDPOINTS.ORDER_REWARD,
      params: { orderId: currentOffer.id },
      data:
        (typeof supplierPaid === 'boolean' && { supplierPaid }) ||
        (typeof sellerPaid === 'boolean' && { sellerPaid }),
      requireAuth: true,
    });

    if (!res.isSucceed) return;

    openNotification('Данные обновлены');
  };

  const handleOpenRefundExchangeModal = (
    requestProductId: IRequestProduct['id'],
  ) => {
    const requestProduct = order.orders
      .find(({ id }) => id === currentOffer.id)
      .products.find(({ id }) => id === requestProductId);

    if (!!requestProduct.refundExchangeRequest) {
      setSelectedRefundExchangeData({
        refundExchangeRequest: requestProduct.refundExchangeRequest,
        refundExchangeHistory: requestProduct.refundExchangeRequests || [],
      });
      openModal('refundExchangeRequest');
    }
  };

  const handlePaidSumChange = async (value: number) => {
    currentOffer.paidSum = value;
    setOrder({
      ...order,
    });
    setStateCounter(prev => prev + 1);
  };

  const confirmFullOrderPayment = async () => {
    if (paymentSubmitting) return;

    setPaymentSubmitting(true);
    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.PAY_ORDER_REQUEST,
      params: { id: order.id },
      requireAuth: true,
    });
    setPaymentSubmitting(false);

    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }

    router.reload();
  };

  const confirmOfferPayment = async () => {
    if (paymentSubmitting) return;

    setPaymentSubmitting(true);
    const res = await ordersService.confirmOfferPayment({
      orderId: order.id,
      offerId: currentOffer.id,
    });
    setPaymentSubmitting(false);

    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }

    router.reload();
  };

  const cancelOfferPayment = async ({ message }: { message: string }) => {
    const res = await ordersService.cancelOfferPayment({
      orderId: order.id,
      offerId: currentOffer.id,
      message,
    });

    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }

    setCancelPaymentModalOpen(false);
    router.reload();
  };

  const cancelFullOrderPayment = async ({ message }: { message: string }) => {
    const res = await ordersService.cancelOrderPayment({
      orderId: order.id,
      message,
    });

    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }

    setCancelPaymentModalOpen(false);
    router.reload();
  };

  return {
    locale,
    router,
    currentOffer,
    totalProductList,
    rewardState,
    selectedRefundExchangeData,
    allowReceivingDateUpdate,
    attachments,
    setAttachments,
    describedProducts,
    loaderVisible,
    setLoaderVisible,
    attachmentsModalOpen,
    setAttachmentsModalOpen,
    cancelPaymentModalOpen,
    setCancelPaymentModalOpen,
    paymentSubmitting,
    handlers: {
      updateReceivingDate,
      handleSupplierPaidCheckbox,
      handleSellerPaidCheckbox,
      handleOpenRefundExchangeModal,
      handlePaidSumChange,
      confirmFullOrderPayment,
      confirmOfferPayment,
      cancelOfferPayment,
      cancelFullOrderPayment,
    },
  };
};

export default useHandlers;
