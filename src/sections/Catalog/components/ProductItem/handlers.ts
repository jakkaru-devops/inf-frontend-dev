import { MouseEvent, useState } from 'react';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { IProduct } from 'sections/Catalog/interfaces/products.interfaces';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { IOrderProductSelectingRouter } from 'components/complex/OrderProductSelecting/interfaces';
import { PRODUCT_STATUSES } from 'sections/Catalog/data';
import { useLocale } from 'hooks/locale.hook';
import { useProductHandlers } from 'hooks/productHandlers.hook';
import { openNotification } from 'utils/common.utils';
import { updateUserCartProduct } from 'services/updateUserCartProduct.service';
import { useAuth } from 'hooks/auth.hook';
import { setOfferProductSelectionProduct } from 'store/reducers/offerProductSelection.reducer';
import { useOfferProductSelection } from 'hooks/offerProductSelection.hook';
import { useCart } from 'hooks/cart.hook';
import { APIRequest } from 'utils/api.utils';

interface IProps {
  product: IProduct;
  externalProductData: any;
}

const useHandlers = ({ product, externalProductData }: IProps) => {
  const auth = useAuth();
  const cart = useCart();
  const offerProductSelection = useOfferProductSelection();
  const dispatch = useDispatch();
  const router = useRouter() as IOrderProductSelectingRouter;
  const { locale } = useLocale();
  const {
    isInCart,
    indexInCartProducts,
    toggleProductIsInCart,
    isInFavorites,
    toggleProductIsInFavorites,
  } = useProductHandlers();
  const [quantity, setQuantity] = useState(
    cart?.products?.find(el => el?.productId === product.id)?.quantity || 1,
  );

  const permissions = {
    addToCart:
      (!auth.isAuthenticated || auth?.currentRole?.label === 'customer') &&
      !![
        PRODUCT_STATUSES.DEFAULT,
        PRODUCT_STATUSES.ACCEPTED,
        PRODUCT_STATUSES.COPIED,
      ].find(status => status === product.status),
    addToFavorites:
      auth.isAuthenticated && auth?.currentRole?.label === 'customer',
    addToOrderRequest:
      auth.isAuthenticated &&
      auth?.currentRole?.label === 'seller' &&
      router.query.orderRequestId,
    addToEditRequest:
      auth.isAuthenticated &&
      auth?.currentRole?.label === 'seller' &&
      !router.query.orderRequestId,
    edit: auth.isAuthenticated && auth.currentRole?.label === 'moderator',
  };
  const isInOrderRequest = !!externalProductData
    ? !!offerProductSelection.products
        .filter(el => !el?.requestProductId)
        .find(el => el?.acatProductId === product?.article)
    : !!offerProductSelection?.products
        .filter(el => !el?.requestProductId)
        ?.find(el => (el?.productId || el?.product?.id) === product.id);

  let productPageUrl = APP_PATHS.PRODUCT(product.id);

  const handleQuantityChange = async (value: number) => {
    const indexInCart = indexInCartProducts(product, null);
    if (indexInCart !== -1) {
      await updateUserCartProduct({
        cartProduct: {
          ...cart.products[indexInCart],
          quantity: value,
        },
        cartProducts: cart.products,
        index: indexInCart,
        auth,
        dispatch,
      });
    }
    setQuantity(value);
  };

  const handleCartButtonClick = (
    e: MouseEvent<HTMLElement, globalThis.MouseEvent>,
  ) => {
    e.preventDefault();
    if (!quantity) {
      openNotification('Минимальное кол-во товара - 1');
      return;
    }
    toggleProductIsInCart({ product, quantity }, null);
  };

  const handleFavoriteButtonClick = (
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
  ) => {
    e.preventDefault();
    toggleProductIsInFavorites(product, null);
  };

  const copyExternalProduct = async () => {
    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.COPY_EXTERNAL_PRODUCT,
      data: { product: externalProductData },
      requireAuth: true,
    });
    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }
    return res.data as IProduct;
  };

  const handleAddToOrderRequestButtonClick = async (
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
  ) => {
    e.preventDefault();
    // const productData =
    //   offerProductSelection.products[offerProductSelection.activeProductIndex];
    let offeredProduct =
      offerProductSelection.products[offerProductSelection.activeProductIndex];
    let productData = product;

    if (!!externalProductData && !isInOrderRequest) {
      productData = await copyExternalProduct();
    }

    dispatch(
      setOfferProductSelectionProduct(
        {
          orderRequestId: offerProductSelection.orderRequestId,
          productId: productData?.id,
          product: !isInOrderRequest ? productData : null,
          acatProductId: !!externalProductData ? product.article : null,
          unitPrice: offeredProduct?.unitPrice,
          count: offeredProduct?.count,
          deliveryQuantity: offeredProduct?.deliveryQuantity,
          deliveryTerm: offeredProduct?.deliveryTerm,
        },
        offerProductSelection.activeProductIndex,
        offerProductSelection,
      ),
    );
  };

  return {
    locale,
    auth,
    quantity,
    isInCart,
    isInFavorites,
    isInOrderRequest,
    permissions,
    handleQuantityChange,
    handleCartButtonClick,
    handleFavoriteButtonClick,
    handleAddToOrderRequestButtonClick,
    productPageUrl,
  };
};

export default useHandlers;
