import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { useRouter } from 'next/router';
import { useState, useEffect, MouseEvent as ReactMouseEvent } from 'react';
import { useDispatch } from 'react-redux';
import { IJuristicSubject } from 'sections/JuristicSubject/interfaces';
import {
  IOrder,
  IOrderRequest,
  IRequestProduct,
} from 'sections/Orders/interfaces';
import { APIRequest } from 'utils/api.utils';
import { generateUrl, openNotification } from 'utils/common.utils';
import { IAddress, IRowsWithCount } from 'interfaces/common.interfaces';
import { PAYMENTS_ENABLED } from 'config/env';
import { downloadBase64 } from 'utils/files.utils';
import { useLocale } from 'hooks/locale.hook';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';
import { useAuth } from 'hooks/auth.hook';
import { IOfferFilterBy } from 'sections/Offers/interfaces/offers.interfaces';
import { IRegion } from 'components/common/SelectSettlementsModal/interfaces';
import { API_ENDPOINTS_V2 } from 'data/api.data';
import ordersService from 'sections/Orders/orders.service';

interface IProps {
  orderRequest: IOrderRequest;
  offers: { rows: IOrder[]; count: number };
  selectedProducts: IRequestProduct[];
}

interface IOrderState {
  totalPrice: number;
  allowAccept: boolean;
  allowDownloadSelectedList: boolean;
}

const INITIAL_ORDER_STATE: IOrderState = {
  totalPrice: 0,
  allowAccept: false,
  allowDownloadSelectedList: false,
};

export const useHandlers = ({
  orderRequest,
  offers,
  selectedProducts,
}: IProps) => {
  const auth = useAuth();
  const { locale } = useLocale();
  const router = useRouter();
  const dispatch = useDispatch();

  // State
  const [offerList, setOfferList] = useState<IOrder[]>([]);
  const [selectedProductList, setSelectedProductList] =
    useState<IRequestProduct[]>(selectedProducts);
  const [orderState, setOrderState] =
    useState<IOrderState>(INITIAL_ORDER_STATE);
  const [selectedView, setSelectedView] = useState<'list' | 'extended'>(null);
  const [downloadPdfAwaiting, setDownloadPdfAwaiting] = useState(false);
  const [orgBranch, setOrgBranch] = useState<{
    address: IAddress;
    orgName: string;
  }>(null);
  const [selectRegionVisible, setSelectRegionVisible] = useState(false);
  const [selectedRegionIds, setSelectedRegionIds] = useState<string[]>([]);
  const [stateCounter, setStateCounter] = useState(0);
  const [savingOffersAwaiting, setSavingOffersAwaiting] = useState(false);
  const [updateAwaiting, setUpdateAwaiting] = useState(false);
  const [selectPayerModalOpen, setSelectPayerModalOpen] = useState(false);
  const [filtersModalOpen, setFiltersModalOpen] = useState(false);
  const filterBy = (router.query?.filterBy as IOfferFilterBy) || null;
  const filterProductId = (router.query?.filterProductId as string) || null;

  // Update offers on data fetch
  useEffect(() => {
    setOfferList(
      offers.rows.map(offer => ({
        ...offer,
        products: offer.products.map(product => ({
          ...product,
          count: product.count || 1,
        })),
      })),
    );
  }, [offers]);

  // Update order state on change
  useEffect(() => {
    getOrderState();
  }, [stateCounter]);

  // Set initial order state and view
  useEffect(() => {
    const urlParams: any = { view: null };

    if (!!router.query?.openPayment) {
      urlParams.openPayment = null;
      setSelectPayerModalOpen(true);
    }

    urlParams.regionFiasId = !!selectedRegionIds.length
      ? selectedRegionIds
      : null;
    urlParams.page = 1;

    router.push(generateUrl(urlParams), null, {
      scroll: false,
    });
  }, [selectedRegionIds]);

  const getOrderState = async () => {
    const orderStateRes = await APIRequest({
      method: 'get',
      url: API_ENDPOINTS.OFFERS_STATE,
      params: {
        id: orderRequest.id,
      },
      requireAuth: true,
    });

    const { totalPrice, allowAccept, allowDownloadSelectedList } =
      orderStateRes.isSucceed ? orderStateRes.data : INITIAL_ORDER_STATE;

    setOrderState({
      totalPrice,
      allowAccept,
      allowDownloadSelectedList,
    });
  };

  const fetchOffer = async (offerId: IOrder['id']) => {
    const res = await ordersService.fetchOffer({
      orderId: orderRequest.id,
      offerId,
    });
    if (!res?.isSucceed) {
      openNotification(res?.message);
      return;
    }
    const fetchedOffer = res.data;

    setOfferList(prev =>
      prev.map(offer => (offer.id === fetchedOffer.id ? fetchedOffer : offer)),
    );
  };

  // Handlers
  const handleSelectedViewToggle = (view?: 'list' | 'extended') => {
    const value = !view ? (selectedView ? null : 'extended') : view;
    router.push(generateUrl({ view: value }));
    setSelectedView(value);
  };

  const handleChangeProducts = async ({
    offerId,
    products,
    requestProduct,
  }: {
    offerId: IOrder['id'];
    products?: {
      id: string;
      count: number;
      isSelected: boolean;
    }[];
    requestProduct?: {
      id: string;
      count: number;
      isSelected: boolean;
    };
  }) => {
    if (updateAwaiting) return;
    setUpdateAwaiting(true);

    const offerIndex = offerList.findIndex(({ id }) => id === offerId);
    const offer = offerList[offerIndex];

    if (!!products) {
      products = products.map(({ id: productId, count, isSelected }) => {
        const product = offer.products.find(({ id }) => id === productId);

        return {
          id: productId,
          isSelected,
          count: Math.min(count, product.quantity + product.deliveryQuantity),
        };
      });
      offer.products = offer.products.map(product => {
        const newProduct = products.find(el => el.id === product.id);
        if (!newProduct) return product;
        return {
          ...product,
          isSelected: newProduct.isSelected,
          count: newProduct.count,
        };
      });
    }
    if (!!requestProduct) {
      products = [requestProduct];
      const offerProduct = offer.products.find(
        el => el.id === requestProduct.id,
      );
      offerProduct.isSelected = requestProduct.isSelected;
      offerProduct.count = requestProduct.count;
    }

    const res = await APIRequest({
      method: 'patch',
      url: API_ENDPOINTS.ORDER,
      params: { id: offerId },
      data: { products },
      requireAuth: true,
    });

    if (!res.isSucceed) return;

    setOfferList([...offerList]);
    setStateCounter(prev => prev + 1);
    setUpdateAwaiting(false);
  };

  const handleDeleteProducts = async (productId: IRequestProduct['id']) => {
    const newOffers = offerList;

    const res = await APIRequest({
      method: 'patch',
      url: API_ENDPOINTS.SELECTED_LIST,
      params: { productId },
      requireAuth: true,
    });

    if (!res.isSucceed) return;

    offerList.forEach(({ id: offerId, products }) =>
      products.forEach(({ id: requestProductId, product }) => {
        if (product.id === productId) {
          newOffers
            .find(({ id }) => id === offerId)
            .products.find(({ id }) => id === requestProductId).isSelected =
            false;
        }
      }),
    );

    setOfferList(newOffers);
    setSelectedProductList(selectedProductList =>
      selectedProductList.filter(
        ({ productId: selectedProductId }) => selectedProductId !== productId,
      ),
    );
    setStateCounter(prev => prev + 1);
  };

  const handleTransportCompanyChange = async (
    offerId: string,
    transportCompanyId: IOrder['transportCompanyId'] | 'pickup' | null,
  ) => {
    if (updateAwaiting) return;
    setUpdateAwaiting(true);

    const res = await APIRequest({
      method: 'patch',
      url: API_ENDPOINTS.ORDER,
      params: { id: offerId },
      data: { transportCompanyId },
      requireAuth: true,
    });

    if (!res.isSucceed) return;

    const offer = offerList.find(({ id }) => id === offerId);
    offer.transportCompanyId =
      transportCompanyId !== 'pickup' ? transportCompanyId : null;
    offer.isPickup = transportCompanyId === 'pickup';

    setOfferList([...offerList]);
    setStateCounter(prev => prev + 1);
    setUpdateAwaiting(false);
  };

  const manipulationAvailable = auth?.currentRole?.label === 'customer';

  const handleInvoicePayment = async (jurSubjectId: IJuristicSubject['id']) => {
    const relevanceRes = await APIRequest({
      method: 'get',
      url: API_ENDPOINTS.OFFERS_RELEVANCE,
      params: {
        id: orderRequest.id,
      },
      requireAuth: true,
    });
    if (!relevanceRes.isSucceed) return;
    if (!relevanceRes.data?.result) {
      openNotification(
        'Истек срок одного или нескольких выбранных предложений',
      );
      return;
    }

    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.APPROVE_ORDER_REQUEST,
      params: { id: orderRequest.id, paymentType: 'invoice' },
      data: { jurSubjectId },
      requireAuth: true,
    });

    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }

    window.location.href = generateUrl({ showAttachments: '1' });
  };

  const handleCardPayment = async (jurSubjectId?: IJuristicSubject['id']) => {
    const relevanceRes = await APIRequest({
      method: 'get',
      url: API_ENDPOINTS.OFFERS_RELEVANCE,
      params: {
        id: orderRequest.id,
      },
      requireAuth: true,
    });
    if (!relevanceRes.isSucceed) return;
    if (!relevanceRes.data?.result) {
      openNotification(
        'Истек срок одного или нескольких выбранных предложений',
      );
      return;
    }

    jurSubjectId = jurSubjectId !== '0' ? jurSubjectId : null;

    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.APPROVE_ORDER_REQUEST,
      params: { id: orderRequest.id, paymentType: 'card' },
      data: jurSubjectId ? { jurSubjectId } : {},
      requireAuth: true,
    });

    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }

    if (!PAYMENTS_ENABLED) {
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

    router.push(res.data?.paymentLink);
  };

  const downloadSelectedList = async (
    e: ReactMouseEvent<HTMLElement, MouseEvent>,
  ) => {
    setDownloadPdfAwaiting(true);

    const res = await APIRequest({
      method: 'get',
      url: API_ENDPOINTS.SELECTED_LIST,
      params: { id: orderRequest.id, mode: selectedView || null },
      requireAuth: true,
    });

    setDownloadPdfAwaiting(false);

    if (!res.isSucceed) {
      openNotification(res.message);
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    downloadBase64(
      res.data,
      `Inf.market - Запрос ${orderRequest.idOrder} ${
        (selectedView || 'extended') === 'extended'
          ? 'расширенный список'
          : 'товары'
      }.pdf`,
    );
  };

  const handleOffersPayment = async () => {
    setSavingOffersAwaiting(true);
    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.PAY_ORDER_REQUEST_OFFERS,
      params: {
        id: orderRequest.id,
      },
      data: {
        offers: offerList
          .filter(offer => !!offer?.idOrder)
          .map(el => ({
            id: el.id,
            paidSum: el.paidSum,
            paymentPostponeAccepted: el?.paymentPostponeAccepted,
          })),
      },
      requireAuth: true,
    });
    setSavingOffersAwaiting(false);
    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }

    const resData: IOrderRequest = res.data;
    if (['PAID', 'PAYMENT_POSTPONED'].includes(resData?.status)) {
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
    } else {
      openNotification('Изменения сохранены');
    }
  };

  return {
    auth,
    locale,
    router,
    dispatch,
    manipulationAvailable,
    selectedView,
    offerList,
    setOfferList,
    selectedProductList,
    allowAccept: orderState.allowAccept,
    allowDownloadSelectedList: orderState.allowDownloadSelectedList,
    totalPrice: orderState.totalPrice,
    downloadPdfAwaiting,
    orgBranch,
    selectRegionVisible,
    setSelectRegionVisible,
    selectedRegionIds,
    setSelectedRegionIds,
    setStateCounter,
    savingOffersAwaiting,
    updateAwaiting,
    selectPayerModalOpen,
    setSelectPayerModalOpen,
    filtersModalOpen,
    setFiltersModalOpen,
    filterBy,
    filterProductId,
    handlers: {
      handleSelectedViewToggle,
      handleChangeProducts,
      handleDeleteProducts,
      handleTransportCompanyChange,
      handleInvoicePayment,
      handleCardPayment,
      handleOffersPayment,
      downloadSelectedList,
      setOrgBranch,
      fetchOffer,
    },
  };
};
