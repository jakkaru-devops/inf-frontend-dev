import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { useDispatch } from 'react-redux';
import { APIRequest } from 'utils/api.utils';
import { IOrderProductSelectingRouter } from './interfaces';
import OrderProductSelectingContent from './Content';
import { STRINGS } from 'data/strings.data';
import { IProduct } from 'sections/Catalog/interfaces/products.interfaces';
import { IOrderRequest } from 'sections/Orders/interfaces';
import { useAuth } from 'hooks/auth.hook';
import {
  IOfferProductSelectionState,
  setOfferProductSelection,
} from 'store/reducers/offerProductSelection.reducer';
import { useOfferProductSelection } from 'hooks/offerProductSelection.hook';

const OrderProductSelecting = () => {
  const offerProductSelection = useOfferProductSelection();
  const auth = useAuth();
  const dispatch = useDispatch();
  const router = useRouter() as IOrderProductSelectingRouter;
  const isAvailable =
    !!router?.pathname &&
    ((auth?.currentRole?.label == 'seller' &&
      [
        APP_PATHS.CATALOG,
        APP_PATHS.PRODUCT_LIST,
        APP_PATHS.PRODUCT('[productId]'),
        APP_PATHS.ADD_PRODUCT_OFFER,
        APP_PATHS.CATALOG_EXTERNAL,
        `${APP_PATHS.CATALOG_EXTERNAL}/[...params]`,
        `${APP_PATHS.CATALOG_EXTERNAL}/acat/[...params]`,
        `${APP_PATHS.CATALOG_EXTERNAL}/laximo/[...params]`,
        `${APP_PATHS.CATALOG_EXTERNAL}/laximo/[catalogCode]`,
      ].includes(router.pathname)) ||
      router.pathname.includes(APP_PATHS.CATALOG_EXTERNAL)) &&
    router.pathname !== APP_PATHS.ORDER_REQUEST('[orderRequestId]') &&
    !!router.query.orderRequestId;

  // Set state value from localStorage
  useEffect(() => {
    const fetchData = async () => {
      const valueFromLS = JSON.parse(
        localStorage.getItem(STRINGS.OFFER_PRODUCT_SELECTION),
      );
      const data: IOfferProductSelectionState = {
        ...offerProductSelection,
        orderRequestId: valueFromLS?.orderRequestId,
        activeProductIndex: valueFromLS?.activeProductIndex,
        products: valueFromLS?.products,
      };

      if (isAvailable) {
        if (!offerProductSelection.orderRequest) {
          const orderRequestRes = await APIRequest<IOrderRequest>({
            method: 'get',
            url: API_ENDPOINTS.ORDER_REQUEST_AS_SELLER,
            params: {
              id: router.query.orderRequestId,
            },
            requireAuth: true,
          });
          if (orderRequestRes.isSucceed) {
            data.orderRequest = orderRequestRes.data;
          }
        }

        const productId = data.products?.[data.activeProductIndex]?.productId;
        if (productId) {
          const productRes = await APIRequest<{ product: IProduct }>({
            method: 'get',
            url: API_ENDPOINTS.PRODUCT(productId),
          });
          const productData: IProduct = productRes.data.product;
          if (productRes.isSucceed) {
            data.products[data.activeProductIndex] = {
              ...data.products[data.activeProductIndex],
              productId: productData.id,
              product: productData,
            };
          }
        }
      }

      dispatch(setOfferProductSelection(data));
    };
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STRINGS.OFFER_PRODUCT_SELECTION,
      JSON.stringify({
        orderRequestId: offerProductSelection?.orderRequestId,
        activeProductIndex: offerProductSelection?.activeProductIndex,
        products: offerProductSelection?.products || [],
      }),
    );
  }, [offerProductSelection]);

  if (!isAvailable || !offerProductSelection.orderRequest) {
    return <></>;
  }

  return <OrderProductSelectingContent />;
};

export default OrderProductSelecting;
