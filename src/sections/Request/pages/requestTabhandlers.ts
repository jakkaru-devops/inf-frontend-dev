import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { APIRequest } from 'utils/api.utils';
import { convertAddressToString } from 'components/common/YandexMap/utils';
import {
  generateInnerUrl,
  generateUrl,
  getInitialAddress,
  isClientSide,
  openNotification,
  stripString,
} from 'utils/common.utils';
import {
  IAddress,
  IRowsWithCount,
  ISetState,
} from 'interfaces/common.interfaces';
import { STRINGS } from 'data/strings.data';
import { useLocale } from 'hooks/locale.hook';
import { IOrderRequest } from 'sections/Orders/interfaces';
import { validateCart } from 'sections/Cart/utils';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';
import { MAX_ORDER_REQUEST_COMMENT_LENGTH } from 'data/common.data';
import { updateUserCartProduct } from 'services/updateUserCartProduct.service';
import moment from 'moment';
import { useAuth } from 'hooks/auth.hook';
import { setCartProducts } from 'store/reducers/cart.reducer';
import { ICartProduct } from 'sections/Cart/interfaces/interfaces';
import { useCart } from 'hooks/cart.hook';
import { API_ENDPOINTS_V2 } from 'data/api.data';

interface IProps {
  products: IRowsWithCount<ICartProduct[]>;
  setProducts: ISetState<IRowsWithCount<ICartProduct[]>>;
}

const PAGE_SIZE = 10;

export const useRequestTabHandlers = ({ products, setProducts }: IProps) => {
  const { locale } = useLocale();
  const auth = useAuth();
  const cart = useCart();
  const dispatch = useDispatch();
  const router = useRouter();
  const cartProductsForRequest = cart.products.filter(
    product => !product.priceOfferId,
  );
  const [savedRegions, setSavedRegions] = useState(
    JSON.parse(localStorage.getItem(STRINGS.CART.SETTLEMENTS) || '[]'),
  );
  const [deliveryAddress, setDeliveryAddress] = useState<IAddress>(
    localStorage.getItem(STRINGS.CART.DELIVERY_ADDRESS)
      ? JSON.parse(localStorage.getItem(STRINGS.CART.DELIVERY_ADDRESS))
      : getInitialAddress(),
  );
  const [settlementsModalVisible, setSettlementsModalVisible] = useState(false);
  const [comment, setComment] = useState(
    localStorage.getItem(STRINGS.CART.COMMENT) || null,
  );
  const [uploadedFileIds, setUploadedFileIds] = useState<string[] | []>(
    localStorage.getItem(STRINGS.CART.FILES)
      ? JSON.parse(localStorage.getItem(STRINGS.CART.FILES))
      : [],
  );
  const [selectedSellerIds, setSelectedSellerIds] = useState<string[]>(
    !!localStorage.getItem(STRINGS.CART.SELLERS)
      ? JSON.parse(localStorage.getItem(STRINGS.CART.SELLERS))
      : auth.user?.savedSellerIds || [],
  );
  const [saveSelectedSellers, setSaveSelectedSellers] = useState(
    !!localStorage.getItem(STRINGS.CART.SAVE_SELLERS)
      ? localStorage.getItem(STRINGS.CART.SAVE_SELLERS) === '1'
      : !!auth.user?.savedSellerIds,
  );
  const [filesUploading, setFilesUploading] = useState(false);
  const [submitAwaiting, setSubmitAwaiting] = useState(false);
  const [orderRequestCreated, setOrderRequestCreated] = useState(false);
  const [stateCounter, setStateCounter] = useState(0);
  const [paymentDate, setPaymentDate] = useState<moment.Moment>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [postponedPaymentEnabled, setPostponedPaymentEnabled] = useState(false);
  const [deliveryAddressModalOpen, setDeliveryAddressModalOpen] =
    useState(false);

  const disabledPaymentDate = (current: moment.Moment) =>
    !!current &&
    (current < moment().endOf('day') || current > moment().add({ days: 30 }));

  const addressStr = convertAddressToString(deliveryAddress);
  const allowCreateOrder = validateCart({
    deliveryAddress,
    products: cartProductsForRequest,
    comment,
  }).result;

  useEffect(() => {
    localStorage.setItem(
      STRINGS.CART.DELIVERY_ADDRESS,
      JSON.stringify(deliveryAddress),
    );
  }, [deliveryAddress]);

  useEffect(() => {
    localStorage.setItem(STRINGS.CART.FILES, JSON.stringify(uploadedFileIds));
  }, [uploadedFileIds]);

  useEffect(() => {
    localStorage.setItem(
      STRINGS.CART.SELLERS,
      JSON.stringify(selectedSellerIds),
    );
  }, [selectedSellerIds]);

  useEffect(() => {
    localStorage.setItem(
      STRINGS.CART.SAVE_SELLERS,
      saveSelectedSellers ? '1' : '0',
    );
  }, [saveSelectedSellers]);

  useEffect(() => {
    localStorage.setItem(
      STRINGS.CART.SETTLEMENTS,
      JSON.stringify(savedRegions),
    );
  }, [savedRegions]);

  const changeCartProductQuantity = async (
    cartProduct: ICartProduct,
    i: number,
    value: number,
  ) => {
    if (value <= 0 || !Number(value)) return;

    const indexInCart = cart.products.findIndex(
      el => el.productId === cartProduct.productId && !el.priceOfferId,
    );

    await updateUserCartProduct({
      cartProduct: {
        ...cartProduct,
        quantity: value,
      },
      cartProducts: cart.products,
      index: indexInCart,
      auth,
      dispatch,
    });
    products.rows[i].quantity = value;
    setStateCounter(prev => prev + 1);
  };

  const deleteCartProduct = async (cartProduct: ICartProduct) => {
    if (auth.isAuthenticated) {
      const res = await APIRequest({
        method: 'delete',
        url: API_ENDPOINTS_V2.cart.deleteCartProduct(cartProduct.productId),
        requireAuth: true,
      });
      if (!res.isSucceed) return;
    }

    const indexInCart = cart.products.findIndex(
      el => el.productId === cartProduct.productId && !el.priceOfferId,
    );

    dispatch(
      setCartProducts(cart.products.filter((el, i) => i !== indexInCart)),
    );
    setProducts(prev => ({
      count: prev.count - 1,
      rows: prev.rows.filter(
        el =>
          (el.productId !== cartProduct.productId && !el.priceOfferId) ||
          !!el.priceOfferId,
      ),
    }));
  };

  const handleCommentChange = (comment: string) => {
    setComment(comment);
    localStorage.setItem(STRINGS.CART.COMMENT, comment);
  };

  const handleFilesUpload = (fileIds: string[]) =>
    setUploadedFileIds(uploadedFileIds => [
      ...uploadedFileIds.filter(id => !fileIds.includes(id)),
      ...fileIds,
    ]);

  const handleFileDelete = (fileId: string) =>
    setUploadedFileIds(uploadedFileIds =>
      uploadedFileIds.filter(id => fileId !== id),
    );

  const handleSelectedSellersChange = (sellerIds: string[]) => {
    setSelectedSellerIds(sellerIds);
    localStorage.setItem(STRINGS.CART.SELLERS, JSON.stringify(sellerIds));
  };

  const handlePaymentDateChange = (date: moment.Moment) => {
    setPaymentDate(date);
    setPostponedPaymentEnabled(!!date);
  };

  const handlePostponedPaymentEnabledChange = (value: boolean) => {
    if (!paymentDate) {
      setDatePickerOpen(true);
      return;
    }
    setPostponedPaymentEnabled(value);
  };

  const createRequest = async (address: IAddress) => {
    if (products?.rows?.length <= 0) return;

    if (!addressStr) {
      openNotification('Укажите адрес доставки для отправки запроса');
      return;
    }
    if (filesUploading) {
      openNotification('Не все файлы загружены полностью');
      return;
    }
    if (stripString(comment)?.length > MAX_ORDER_REQUEST_COMMENT_LENGTH) {
      openNotification(
        `Максимальная длина комментария - ${MAX_ORDER_REQUEST_COMMENT_LENGTH} символов`,
      );
      return;
    }

    if (!auth.isAuthenticated) {
      openNotification(
        'Для отправки запроса необходимо зарегистрироваться или войти в аккаунт',
      );
      router.push(
        generateUrl(
          { [STRINGS.QUERY.SEND_ORDER_REQUEST]: 1, history: null },
          { pathname: APP_PATHS.LOGIN_CUSTOMER },
        ),
      );
      return;
    }
    const settlements = savedRegions.filter(settlement => settlement.isSelect);

    setSubmitAwaiting(true);

    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.ORDER_REQUEST,
      data: {
        products: products.rows
          .filter(el =>
            cartProductsForRequest.some(
              item => item.productId === el.productId,
            ),
          )
          .map(el => ({
            productId: el.productId,
            quantity: el.quantity,
          })),
        deliveryAddress: address,
        comment,
        fileIds: uploadedFileIds,
        selectedSellerIds,
        saveSelectedSellers,
        settlements,
        paymentPostponedAt: postponedPaymentEnabled
          ? paymentDate.format('yyyy.MM.DD')
          : null,
      },
      requireAuth: true,
    });

    if (!res.isSucceed) {
      openNotification(res?.message);
      setSubmitAwaiting(false);
      return;
    }

    setSubmitAwaiting(false);

    const orderRequest: IOrderRequest = res.data;

    isClientSide() && window.localStorage.removeItem(STRINGS.SELECTED_REGIONS);
    setSavedRegions([]);
    // Remove products from redux cart
    dispatch(setCartProducts(cart.products.filter(el => !!el.priceOfferId)));
    // Remove products from local cart state
    setProducts({
      count: 0,
      rows: [],
    });
    // Remove cart data from localStorage
    Object.keys(STRINGS.CART).forEach(key => {
      if (STRINGS.CART[key] !== 'cartDeliveryAddress') {
        localStorage.removeItem(STRINGS.CART[key]);
      }
    });
    openNotification(
      `${locale.orders.requestSent}. ${locale.other.cartCleared}`,
      {
        onClick: () =>
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
          ),
      },
    );
    setOrderRequestCreated(true);
  };

  const goToCatalog = () => {
    router.push(generateInnerUrl(APP_PATHS.CATALOG));
  };

  const fetchMore = async (page: number) => {
    const cartProductsBasic = JSON.stringify(cartProductsForRequest);
    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.CART_PRODUCT_LIST,
      params: {
        pageSize: PAGE_SIZE,
        page: page + 1,
      },
      data: {
        cartProducts: cartProductsBasic,
      },
    });
    if (!res.isSucceed) return;
    const resData: IRowsWithCount<ICartProduct[]> = res.data;
    setProducts(prev => ({
      ...prev,
      rows: [...prev.rows, ...resData.rows],
    }));
  };

  return {
    auth,
    locale,
    cart,
    dispatch,
    cartProductsForRequest,
    deliveryAddress,
    setDeliveryAddress,
    addressStr,
    allowCreateOrder,
    comment,
    uploadedFileIds,
    submitAwaiting,
    orderRequestCreated,
    setOrderRequestCreated,
    changeCartProductQuantity,
    deleteCartProduct,
    handleFilesUpload,
    handleFileDelete,
    handleCommentChange,
    handleSelectedSellersChange,
    createRequest,
    goToCatalog,
    savedRegions,
    setSavedRegions,
    settlementsModalVisible,
    setSettlementsModalVisible,
    selectedSellerIds,
    setSelectedSellerIds,
    saveSelectedSellers,
    setSaveSelectedSellers,
    deliveryAddressModalOpen,
    setDeliveryAddressModalOpen,
    filesUploading,
    setFilesUploading,
    fetchMore,
    paymentDate,
    disabledPaymentDate,
    postponedPaymentEnabled,
    datePickerOpen,
    setDatePickerOpen,
    handlePaymentDateChange,
    handlePostponedPaymentEnabledChange,
  };
};
