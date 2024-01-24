import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { useDispatch } from 'react-redux';
import {
  IFavoriteProduct,
  IProduct,
  IProductPriceOffer,
} from 'sections/Catalog/interfaces/products.interfaces';
import { APIRequest } from 'utils/api.utils';
import { useAuth } from './auth.hook';
import { setCartProducts } from 'store/reducers/cart.reducer';
import { setAuthUser } from 'store/reducers/auth.reducer';
import { useCart } from './cart.hook';
import { API_ENDPOINTS_V2 } from 'data/api.data';
import { generateUrl, openNotification } from 'utils/common.utils';
import { useRouter } from 'next/router';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';

export const useProductHandlers = () => {
  const router = useRouter();
  const auth = useAuth();
  const cart = useCart();
  const dispatch = useDispatch();

  const indexInCartProducts = (
    product: IProduct,
    params: { priceOfferId: number },
  ): number => {
    if (!params)
      return cart.products.findIndex(
        el => el.productId === product.id && !el.priceOfferId,
      );
    else
      return cart.products.findIndex(
        el =>
          el.productId === product.id &&
          el.priceOfferId === params.priceOfferId,
      );
  };
  const isInCart = (
    product: IProduct,
    params: { priceOfferId: number },
  ): boolean => indexInCartProducts(product, params) !== -1;

  const toggleProductIsInCart = async (
    {
      product,
      quantity,
      acatProductId,
    }: {
      product: IProduct;
      quantity?: number;
      acatProductId?: string;
    },
    params: { priceOfferId: number },
  ) => {
    if (!isInCart(product, params)) {
      if (auth?.currentRole?.label === 'customer') {
        const res = await APIRequest<any>({
          method: 'post',
          url: API_ENDPOINTS_V2.cart.createCartProduct,
          data: {
            productId: product.id,
            quantity: quantity,
            acatProductId,
            priceOfferId: params?.priceOfferId,
          },
          requireAuth: true,
        });
        console.log(res);
        if (!res.isSucceed) return;
      }
      dispatch(
        setCartProducts(
          cart.products.concat({
            productId: product.id,
            priceOfferId: params?.priceOfferId,
            isSelected: false,
            quantity: quantity || 1,
            acatProductId,
            createdAt: new Date().getTime().toString(),
          }),
        ),
      );
    } else {
      if (auth?.currentRole?.label === 'customer') {
        const res = await APIRequest<any>({
          method: 'delete',
          url: API_ENDPOINTS_V2.cart.deleteCartProduct(
            cart.products[indexInCartProducts(product, params)].productId,
          ),
          data: {
            priceOfferId: params?.priceOfferId,
          },
          requireAuth: true,
        });
        if (!res.isSucceed) return;
      }
      cart.products.splice(indexInCartProducts(product, params), 1);
      dispatch(setCartProducts(cart.products));
    }
  };

  const indexInFavorites = (
    product: IProduct,
    params: { priceOfferId: number },
  ) => {
    if (!params)
      return auth.user.favoriteProducts.findIndex(
        el => el.productId === product.id && !el.priceOfferId,
      );
    else
      return auth.user.favoriteProducts.findIndex(
        el =>
          el.productId === product.id &&
          el.priceOfferId === params.priceOfferId,
      );
  };
  const isInFavorites = (product: IProduct, params: { priceOfferId: number }) =>
    indexInFavorites(product, params) !== -1;

  const toggleProductIsInFavorites = async (
    product: IProduct,
    params: { priceOfferId: number },
  ) => {
    if (!isInFavorites(product, params)) {
      const res = await APIRequest<IFavoriteProduct>({
        method: 'post',
        url: API_ENDPOINTS_V2.favoriteProducts.create,
        data: {
          productId: product.id,
          priceOfferId: params?.priceOfferId,
        },
        requireAuth: true,
      });
      if (res.isSucceed) {
        auth.user.favoriteProducts.push(res.data);
        dispatch(setAuthUser({ ...auth.user }));
      }
    } else {
      const res = await APIRequest<any>({
        method: 'delete',
        url: API_ENDPOINTS_V2.favoriteProducts.delete(
          auth.user.favoriteProducts[indexInFavorites(product, params)]
            .productId,
        ),
        data: {
          priceOfferId: params?.priceOfferId,
        },
        requireAuth: true,
      });
      if (res.isSucceed) {
        auth.user.favoriteProducts.splice(indexInFavorites(product, params), 1);
        dispatch(setAuthUser({ ...auth.user }));
      }
    }
  };

  const addToRequest = (product: IProduct, quantity: number) => {
    toggleProductIsInCart({ product, quantity }, null);
  };

  const goToRequest = () => {
    router.push(
      generateUrl(
        {
          history: DEFAULT_NAV_PATHS.REQUEST,
        },
        {
          pathname: APP_PATHS.REQUEST,
          removeCurrentParams: true,
        },
      ),
    );
  };

  const addProductToCart = ({
    product,
    quantity,
    priceOffer,
  }: {
    product: IProduct;
    quantity: number;
    priceOffer: IProductPriceOffer;
  }) => {
    if (!priceOffer.productAmount) {
      openNotification('Товара нет в наличии');
      return;
    }
    toggleProductIsInCart(
      { product, quantity },
      { priceOfferId: priceOffer.id },
    );
  };

  const goToCart = () => {
    router.push(
      generateUrl(
        { history: DEFAULT_NAV_PATHS.CART },
        {
          pathname: APP_PATHS.CART,
          removeCurrentParams: true,
        },
      ),
    );
  };

  return {
    indexInCartProducts,
    isInCart,
    toggleProductIsInCart,
    indexInFavorites,
    isInFavorites,
    toggleProductIsInFavorites,
    addToRequest,
    goToRequest,
    addProductToCart,
    goToCart,
  };
};
