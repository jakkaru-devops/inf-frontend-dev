import { IAddress } from 'interfaces/common.interfaces';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import cartService from 'sections/Cart/cart.service';
import { ICartOffer } from 'sections/Cart/interfaces/cart.interfaces';
import {
  generateUrl,
  getInitialAddress,
  openNotification,
} from 'utils/common.utils';
import { updateUserCartProduct } from 'services/updateUserCartProduct.service';
import { useRouter } from 'next/router';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { STRINGS } from 'data/strings.data';
import { ITransportCompany } from 'sections/Shipping/interfaces';
import { APIRequest } from 'utils/api.utils';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';
import { ICartProduct } from 'sections/Cart/interfaces/interfaces';
import { useAuth } from 'hooks/auth.hook';
import { useCart } from 'hooks/cart.hook';
import { convertAddressToString } from 'components/common/YandexMap/utils';
import ordersService from 'sections/Orders/orders.service';
import { setCartProducts } from 'store/reducers/cart.reducer';

export const useSellersTabHandlers = () => {
  const auth = useAuth();
  const cart = useCart();
  const dispatch = useDispatch();
  const router = useRouter();
  const [offers, setOffers] = useState<ICartOffer[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [updateAwaiting, setUpdateAwaiting] = useState(false);
  const [stateCounter, setStateCounter] = useState(0);
  const [deliveryAddress, setDeliveryAddress] = useState<IAddress>(
    localStorage.getItem(STRINGS.CART.DELIVERY_ADDRESS)
      ? JSON.parse(localStorage.getItem(STRINGS.CART.DELIVERY_ADDRESS))
      : getInitialAddress(),
  );
  const [deliveryAddressModalOpen, setDeliveryAddressModalOpen] =
    useState(false);
  const [transportCompanies, setTransportCompanies] = useState<
    ITransportCompany[]
  >([]);
  const cartProductsForCart = cart.products.filter(
    product => !!product.priceOfferId,
  );

  const validOffers = offers.filter(
    offer =>
      !!offer.products.filter(product => product.isSelected).length &&
      (transportCompanies.find(el => el.id === offer.deliveryMethod) ||
        offer.deliveryMethod === 'pickup'),
  );
  const considerableOffers = offers.filter(
    offer => !!offer.products.filter(product => product.isSelected).length,
  );

  const paymentAllowed =
    !!validOffers.length &&
    validOffers.length === considerableOffers.length &&
    !!convertAddressToString(deliveryAddress);

  useEffect(() => {
    localStorage.setItem(
      STRINGS.CART.DELIVERY_ADDRESS,
      JSON.stringify(deliveryAddress),
    );
  }, [deliveryAddress]);

  const fetchOffers = async () => {
    const res = await cartService.getCartProductBySellers({
      cartProducts: cart.products,
    });
    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }
    const resData: ICartOffer[] = res.data;

    for (const offer of resData) {
      if (!!offer?.postponedPayment) {
        offer.postponedPayment.organization = offer.organization;
      }
    }

    setOffers(resData);
    setDataLoaded(true);
    setDataLoaded(true);
  };

  const fetchTransportCompanies = async () => {
    const res = await APIRequest({
      method: 'get',
      url: API_ENDPOINTS.ALL_TRANSPORT_COMPANY_LIST,
    });
    if (!res.isSucceed) {
      openNotification('Список транспортных компаний не загружен');
      return;
    }
    setTransportCompanies(res.data);
  };

  useEffect(() => {
    fetchOffers();
    fetchTransportCompanies();
  }, []);

  const updateCartProduct = async (
    cartProduct: ICartProduct,
    params: {
      productIndexInCart: number;
      productIndexInOffer: number;
      offerIndex: number;
      preventServerUpdate?: boolean;
    },
  ) => {
    setUpdateAwaiting(true);
    await updateUserCartProduct({
      cartProduct,
      cartProducts: cart.products,
      index: params.productIndexInCart,
      auth,
      dispatch,
      preventServerUpdate: params.preventServerUpdate,
    });

    const offer = offers[params.offerIndex];
    offer.deliveryMethod = cartProduct.deliveryMethod;
    const offerProduct = offer.products[params.productIndexInOffer];
    offerProduct.quantity = cartProduct.quantity;
    offerProduct.isSelected = cartProduct.isSelected;

    setOffers([...offers]);

    setUpdateAwaiting(false);
    setStateCounter(prev => prev + 1);
  };

  const updateCartOffer = async (
    offer: ICartOffer,
    data: { deliveryMethod: string },
  ) =>
    new Promise<void>(async (resolve, reject) => {
      if (!auth.isAuthenticated) return resolve();

      setUpdateAwaiting(true);
      const res = await cartService.updateCartOffer({
        warehouseId: offer.warehouse.id,
        deliveryMethod: data.deliveryMethod,
      });
      setUpdateAwaiting(false);

      if (!res) {
        openNotification(res?.message);
        return reject();
      }

      return resolve();
    });

  const deleteCartProduct = async (
    cartProduct: ICartProduct,
    indexes: {
      productIndexInCart: number;
      productIndexInOffer: number;
      offerIndex: number;
    },
  ) => {
    setUpdateAwaiting(true);

    await cartService.deleteCartProduct({
      cartProduct,
      cartProducts: cart.products,
      index: indexes.productIndexInCart,
      auth,
      dispatch,
    });

    const offer = offers[indexes.offerIndex];
    offer.products.splice(indexes.productIndexInOffer, 1);
    if (!offer.products.length) offers.splice(indexes.offerIndex, 1);

    setOffers([...offers]);

    setUpdateAwaiting(false);
    setStateCounter(prev => prev + 1);
  };

  const resetCart = () => {
    dispatch(
      setCartProducts(
        cart.products.filter(
          cartProduct =>
            !cartProduct?.priceOfferId ||
            (!!cartProduct?.priceOfferId && !cartProduct?.isSelected),
        ),
      ),
    );
  };

  const createPricedOrder = async () => {
    if (!auth.isAuthenticated) {
      openNotification('Для оформления заказа необходимо авторизоваться');
      router.push(APP_PATHS.LOGIN_CUSTOMER);
      return;
    }

    if (!paymentAllowed) {
      openNotification('Оформление заказа недоступно');
      return;
    }

    const res = await ordersService.createPricedOrder({
      deliveryAddress,
    });

    if (!res?.isSucceed) {
      openNotification(res?.message);
      return;
    }

    resetCart();
    const order = res?.data?.order;
    if (!!order) {
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.ORDER_REQUEST_OFFER_LIST(
              order.id,
              order.idOrder,
            ),
            openPayment: 1,
          },
          {
            pathname: APP_PATHS.ORDER_REQUEST_OFFER_LIST(order.id),
            removeCurrentParams: true,
          },
        ),
      );
    } else {
      openNotification(`Запрос ${order.idOrder} сформирован и ждет оплаты`);
    }
  };

  const setOffer = (offerData: ICartOffer) => {
    offers[offers.findIndex(el => el.warehouse.id === offerData.warehouse.id)] =
      { ...offerData };
    setOffers([...offers]);
    setStateCounter(prev => prev + 1);
  };

  return {
    router,
    dataLoaded,
    cart,
    offers,
    setOffer,
    updateAwaiting,
    transportCompanies,
    deliveryAddress,
    cartProductsForCart,
    paymentAllowed,
    deliveryAddressModalOpen,
    setDeliveryAddressModalOpen,
    setDeliveryAddress,
    updateCartProduct,
    updateCartOffer,
    deleteCartProduct,
    createPricedOrder,
  };
};
