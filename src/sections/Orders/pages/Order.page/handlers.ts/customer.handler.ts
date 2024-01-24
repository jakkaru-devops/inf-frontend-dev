import { ModalType } from 'components/complex/ModalWrapper/interfaces';
import {
  IOrderRequest,
  IRefundExchangeRequest,
  IRequestProduct,
} from 'sections/Orders/interfaces';
import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from 'data/paths.data';
import { APIRequest } from 'utils/api.utils';
import { useRouter } from 'next/router';
import moment from 'moment';
import { useLocale } from 'hooks/locale.hook';
import { openNotification } from 'utils/common.utils';
import ordersService from 'sections/Orders/orders.service';
import { ISetState } from 'interfaces/common.interfaces';

interface IProps {
  order: IOrderRequest;
  setOrder: ISetState<IOrderRequest>;
  openModal: (type: ModalType) => void;
}

const useHandlers = ({ order, setOrder, openModal }: IProps) => {
  const { locale } = useLocale();
  const router = useRouter();

  const [selectedRefundExchangeData, setSelectedRefundExchangeData] = useState<{
    requestProduct?: IRequestProduct;
    refundExchangeRequest?: IRefundExchangeRequest;
    refundExchangeHistory?: IRefundExchangeRequest[];
  }>(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [loaderVisible, setLoaderVisible] = useState(false);
  const [stateCounter, setStateCounter] = useState(0);
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
  }, [currentOffer?.id, order?.attachments]);

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

  const allowUpdate = !!currentOffer && !order[currentOffer.id];

  const updateState = () => {
    setOrder({ ...order });
    setStateCounter(prev => prev + 1);
  };

  const handleOpenRefundExchangeModal = (
    requestProductId: IRequestProduct['id'],
  ) => {
    const requestProduct = order.orders
      .find(({ id }) => id === currentOffer.id)
      .products.find(({ id }) => id === requestProductId);

    if (!!requestProduct.refundExchangeRequest) {
      setSelectedRefundExchangeData({
        requestProduct,
        refundExchangeRequest: requestProduct.refundExchangeRequest,
        refundExchangeHistory: requestProduct.refundExchangeRequests || [],
      });
      openModal('refundExchangeRequest');
      return;
    }

    setSelectedRefundExchangeData({ requestProduct });
    openModal('requestRefundExchange');
  };

  const updateReceivingDate = (value: moment.Moment | boolean) => {
    if (!!currentOffer?.receivingDate) return;
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

  const handleSubmit = async () => {
    setLoaderVisible(true);
    const res = await APIRequest({
      method: 'put',
      url: API_ENDPOINTS.ORDER,
      params: { id: currentOffer.id },
      data: {
        receivingDate: currentOffer?.receivingDate || null,
        organizationId: currentOffer?.organization?.id,
        products: currentOffer?.products,
      },
      requireAuth: true,
    });
    setLoaderVisible(false);

    if (!res.isSucceed) return;

    openNotification('Данные обновлены');

    router.reload();
  };

  return {
    locale,
    router,
    currentOffer,
    totalProductList,
    selectedRefundExchangeData,
    allowUpdate,
    reviewModalVisible,
    setReviewModalVisible,
    attachments,
    setAttachments,
    describedProducts,
    loaderVisible,
    setLoaderVisible,
    attachmentsModalOpen,
    setAttachmentsModalOpen,
    handlers: {
      updateReceivingDate,
      handleOpenRefundExchangeModal,
      handleSubmit,
    },
  };
};

export default useHandlers;
