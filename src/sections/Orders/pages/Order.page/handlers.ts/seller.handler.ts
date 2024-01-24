import {
  IOrder,
  IOrderAttachment,
  IOrderRequest,
  IRefundExchangeRequest,
  IRequestProduct,
} from './../../../interfaces';
import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from 'data/paths.data';
import { APIRequest } from 'utils/api.utils';
import { useRouter } from 'next/router';
import moment from 'moment';
import { ModalType } from 'components/complex/ModalWrapper/interfaces';
import { useLocale } from 'hooks/locale.hook';
import { openNotification } from 'utils/common.utils';
import { ISetState } from 'interfaces/common.interfaces';
import ordersService from 'sections/Orders/orders.service';

const useHandlers = ({
  order,
  setOrder,
  offer,
  openModal,
}: {
  order: IOrderRequest;
  setOrder: ISetState<IOrderRequest>;
  offer: IOrder;
  openModal: (type: ModalType) => void;
}) => {
  const { locale } = useLocale();

  const [departureDate, setDepartureDate] = useState(
    offer?.departureDate ? moment(offer.departureDate) : null,
  );
  const [trackNumber, setTrackNumber] = useState(offer?.trackNumber || null);
  const [loaderVisible, setLoaderVisible] = useState(false);
  const [stateCounter, setStateCounter] = useState(0);
  const [generateAcceptanceActOpen, setGenerateAcceptanceActOpen] =
    useState(false);
  const generateAcceptanceActAvailable = !!offer.products.filter(
    offerProduct => (offerProduct.transferedQuantity || 0) < offerProduct.count,
  ).length;
  const [attachmentsModalOpen, setAttachmentsModalOpen] = useState(false);
  const [openAttachment, setOpenAttachment] = useState<IOrderAttachment>(null);
  let commission = 0;

  if (!order.commissionType && !!offer?.organization?.priceBenefitPercent)
    commission = offer.organization.priceBenefitPercent;
  if (order.commissionType === 'acquiring')
    commission = offer.organization.priceBenefitPercentAcquiring;
  if (order.commissionType === 'invoice')
    commission = offer.organization.priceBenefitPercentInvoice;

  const [selectedRefundExchangeData, setSelectedRefundExchangeData] = useState<{
    refundExchangeRequest?: IRefundExchangeRequest;
    refundExchangeHistory?: IRefundExchangeRequest[];
  }>(null);

  const describedProducts = order.products.filter(
    ({ describedProduct }) => describedProduct,
  );
  const [attachments, setAttachments] = useState([]);

  const router = useRouter();

  const allowUpdate =
    (departureDate &&
      departureDate?.format('DD.MM.YYYY') !=
        moment(offer?.departureDate)?.format('DD.MM.YYYY')) ||
    (trackNumber && trackNumber !== offer?.trackNumber);

  const allowReceivingDateUpdate =
    !!offer?.receivingDate &&
    moment(offer?.receivingDate)?.format('DD.MM.YYYY') !=
      moment(offer?.receivingDate)?.format('DD.MM.YYYY');

  useEffect(() => {
    setAttachments([
      ...order.attachments.filter(
        ({ orderId }) => !orderId || orderId === offer?.id,
      ),
      ...describedProducts.flatMap(
        ({ describedProduct: { attachments } }) => attachments,
      ),
    ]);
  }, [order?.attachments?.length]);

  const updateState = () => {
    setOrder({ ...order });
    setStateCounter(prev => prev + 1);
  };

  const handleTrackNumberChange = trackNumber => setTrackNumber(trackNumber);

  const handleDepartureDateChange = departureDate =>
    setDepartureDate(departureDate);

  const updateReceivingDate = (value: moment.Moment | boolean) => {
    if (!!offer?.receivingDate) return;
    const receivingDate =
      typeof value === 'boolean' ? (value ? moment() : null) : value;
    offer.receivingDate = receivingDate?.toDate();
    updateState();
    submitOfferReceivingDate(receivingDate);
  };

  const submitOfferReceivingDate = async (date: moment.Moment) => {
    if (loaderVisible) return;

    setLoaderVisible(true);
    const res = await ordersService.updateOfferReceivingDate({
      orderId: order.id,
      offerId: offer.id,
      receivingDate: date?.toString() || null,
    });
    setLoaderVisible(false);

    if (!res.isSucceed) {
      offer.receivingDate = null;
      updateState();
      openNotification(res?.message);
      return;
    }

    openNotification('Данные обновлены');
    router.reload();
  };

  const handleOpenRefundExchangeModal = (
    requestProductId: IRequestProduct['id'],
  ) => {
    const requestProduct = offer.products.find(
      ({ id }) => id === requestProductId,
    );

    if (!!requestProduct.refundExchangeRequest) {
      setSelectedRefundExchangeData({
        refundExchangeRequest: requestProduct.refundExchangeRequest,
        refundExchangeHistory: requestProduct.refundExchangeRequests || [],
      });
      openModal('refundExchangeRequest');
    }
  };

  const handleSubmit = async () => {
    setLoaderVisible(true);
    const res = await APIRequest({
      method: 'put',
      url: API_ENDPOINTS.ORDER,
      params: { id: offer.id },
      data: {
        organizationId: offer?.organization?.id,
        products: offer?.products,
        departureDate: departureDate ? departureDate.toDate() : null,
        trackNumber,
        receivingDate: offer?.receivingDate || null,
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
    departureDate,
    trackNumber,
    selectedRefundExchangeData,
    allowUpdate,
    allowReceivingDateUpdate,
    attachments,
    setAttachments,
    describedProducts,
    loaderVisible,
    setLoaderVisible,
    commission,
    generateAcceptanceActOpen,
    setGenerateAcceptanceActOpen,
    generateAcceptanceActAvailable,
    attachmentsModalOpen,
    setAttachmentsModalOpen,
    openAttachment,
    setOpenAttachment,
    handlers: {
      updateReceivingDate,
      handleTrackNumberChange,
      handleDepartureDateChange,
      handleOpenRefundExchangeModal,
      handleSubmit,
    },
  };
};

export default useHandlers;
