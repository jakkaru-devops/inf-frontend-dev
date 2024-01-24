import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { useLocale } from 'hooks/locale.hook';
import { useRouter } from 'next/router';
import {
  ILaximoCartProductDTO,
  ILaximoQuickListDetail,
} from 'sections/CatalogExternal/interfaces';
import { APIRequest } from 'utils/api.utils';
import { useDispatch } from 'react-redux';
import { createRef, RefObject, useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import { generateUrl } from 'utils/common.utils';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';
import { updateUserCartProduct } from 'services/updateUserCartProduct.service';
import { useAuth } from 'hooks/auth.hook';
import { setCartProducts } from 'store/reducers/cart.reducer';
import { setOfferProductSelectionProduct } from 'store/reducers/offerProductSelection.reducer';
import { ICartProduct } from 'sections/Cart/interfaces/interfaces';
import { IProduct } from 'sections/Catalog/interfaces/products.interfaces';
import { setAuthUser } from 'store/reducers/auth.reducer';
import { useOfferProductSelection } from 'hooks/offerProductSelection.hook';
import { useCart } from 'hooks/cart.hook';
import { API_ENDPOINTS_V2 } from 'data/api.data';

interface IActiveLabelState {
  code: string;
  event: 'hover' | 'onClick';
}

export const useHandlers = (
  getCatalogDto: (oem: string, name: string) => ILaximoCartProductDTO,
  details?: ILaximoQuickListDetail[],
) => {
  const { locale } = useLocale();
  const router = useRouter();
  const auth = useAuth();
  const cart = useCart();
  const offerProductSelection = useOfferProductSelection();
  const dispatch = useDispatch();
  const imageWapperRef: RefObject<HTMLDivElement> = useRef();
  const catalogUrl =
    router.query.laximoType == 'cars' ? 'CARS_FOREIGN' : 'TRUCKS_FOREIGN';

  const getProductIndexInCart = (product: ILaximoCartProductDTO) => {
    return cart.products.findIndex(el => el.acatProductId === product.article);
  };

  const [products, setProducts] = useState(
    details?.map(item => {
      const index = getProductIndexInCart(getCatalogDto(item.oem, item.name));
      let quantity = 1;
      if (index !== -1) quantity = cart?.products?.[index]?.quantity || 1;
      return {
        ...item,
        quantity,
      };
    }),
  );
  const [stateCounter, setStateCounter] = useState(0);
  const imageRef: RefObject<HTMLImageElement> = createRef();
  const pageContentRef: RefObject<HTMLDivElement> = useRef();

  const [rowsRef, setRowsRef] =
    useState<Array<{ id: string; ref: RefObject<any>; index: number }>>();

  const [activeLabel, setActiveLabel] = useState<Array<IActiveLabelState>>([
    {
      code: null,
      event: 'onClick',
    },
  ]);
  const [imageRatio, setImageRatio] = useState({
    ratio: 1,
    scale: 1,
    width: 0,
    height: 0,
  });

  const mouseEvents = {
    onClick: (currentLabel: IActiveLabelState) => {
      setActiveLabel(prevState =>
        !prevState.find(
          choseLabel =>
            choseLabel.code === currentLabel.code &&
            choseLabel.event === 'onClick',
        )
          ? [
              ...prevState,
              {
                code: currentLabel.code,
                event: 'onClick',
              },
            ]
          : activeLabel.filter(
              choseLabel =>
                !_.isEqual(choseLabel, {
                  code: currentLabel,
                  event: 'onClick',
                }),
            ),
      );
    },

    onMouseLeave: (currentLabel: IActiveLabelState) => {
      setActiveLabel(
        activeLabel?.filter(
          choseLabel =>
            !_.isEqual(choseLabel, {
              code: currentLabel.code,
              event: 'hover',
            }),
        ),
      );
    },

    onMouseEnter: (currentLabel: IActiveLabelState) => {
      setActiveLabel(prevState => [
        ...prevState,
        { code: currentLabel.code, event: 'hover' },
      ]);
    },
  };

  useEffect(() => {
    if (
      !imageRef?.current ||
      !imageWapperRef?.current ||
      imageRatio?.ratio !== 1
    )
      return;
    imageRef.current.onload = () => {
      if (!imageRef?.current) return;
      const canvasWidth = imageWapperRef.current.clientWidth;
      const width = imageRef.current.width;
      const height = imageRef.current.height;
      let ratio = height / 500;
      if (width / ratio > canvasWidth) ratio = width / canvasWidth;
      setImageRatio(prev => ({
        ...prev,
        ratio,
        width,
        height,
      }));
      // console.log(height, height / 500);
      setRowsRef(
        details?.map((detail, index) => ({
          ref: createRef(),
          id: detail.codeonimage,
          index,
        })),
      );
    };
  }, [imageRef?.current]);

  const permissions = {
    addToCart: !auth.isAuthenticated || auth?.currentRole?.label === 'customer',
    addToFavorites:
      auth.isAuthenticated && auth?.currentRole?.label === 'customer',
    addToOrderRequest:
      auth.isAuthenticated &&
      auth?.currentRole?.label === 'seller' &&
      router.query.orderRequestId,
  };

  const getProductIsInCart = (product: ILaximoCartProductDTO) =>
    getProductIndexInCart(product) !== -1;

  const handleProductQuantityChange = async (
    value: number,
    productId: string | number,
  ) => {
    const newProducts = products;
    const product = newProducts.find(el => el.oem === productId);
    if (!product) return;
    product.quantity = value;
    setProducts(newProducts);

    const indexInCart = getProductIndexInCart(
      getCatalogDto(product.oem, product.name),
    );
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

    setStateCounter(prev => prev + 1);
  };

  const handleCartButtonClick = async (
    product: ILaximoCartProductDTO,
    quantity: number,
  ) => {
    if (!getProductIsInCart(product)) {
      if (auth?.currentRole?.label === 'customer') {
        const res = await APIRequest({
          method: 'post',
          url: API_ENDPOINTS.ADD_ACAT_PRODUCT_TO_CART,
          data: {
            product: product,
            quantity,
          },
          requireAuth: true,
        });
        if (!res.isSucceed) return;
        const cartProduct: ICartProduct = res.data;

        dispatch(
          setCartProducts(
            cart.products.concat({
              productId: cartProduct.productId,
              acatProductId: product.article,
              quantity: quantity || cartProduct?.quantity || 1,
              createdAt: new Date().getTime().toString(),
            }),
          ),
        );
      } else {
        const res = await APIRequest({
          method: 'post',
          url: API_ENDPOINTS.COPY_EXTERNAL_PRODUCT,
          data: {
            product: product,
            quantity,
          },
          requireAuth: true,
        });
        if (!res.isSucceed) return;
        const resultProduct: IProduct = res.data;

        dispatch(
          setCartProducts(
            cart.products.concat({
              productId: resultProduct.id,
              acatProductId: product.article,
              quantity: quantity || 1,
              createdAt: new Date().getTime().toString(),
            }),
          ),
        );
      }
    } else {
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.CART,
          },
          {
            pathname: APP_PATHS.CART,
          },
        ),
      );
      // if (auth?.currentRole?.label === 'customer') {
      //   const res = await APIRequest({
      //     method: 'delete',
      //     url: API_ENDPOINTS_V2.cart.deleteCartProduct(cart.products[getProductIndexInCart(product)].productId),
      //     requireAuth: true,
      //   });
      //   if (!res.isSucceed) return;
      // }
      // cart.products.splice(getProductIndexInCart(product), 1);
      // dispatch(setCartProducts(cart.products));
    }
  };

  const getProductIndexInFavorites = (product: ILaximoCartProductDTO) =>
    auth.user.favoriteProducts.findIndex(
      el => el.acatProductId === product.article,
    );
  const getProductIsInFavorites = (product: ILaximoCartProductDTO) =>
    getProductIndexInFavorites(product) !== -1;

  const handleFavoriteButtonClick = async (product: ILaximoCartProductDTO) => {
    if (!getProductIsInFavorites(product)) {
      const res = await APIRequest({
        method: 'post',
        url: API_ENDPOINTS.ADD_ACAT_PRODUCT_TO_FAVORITES,
        data: { product: product },
        requireAuth: true,
      });
      if (res.isSucceed) {
        auth.user.favoriteProducts.push({
          ...res.data,
          acatProductId: product.article,
        });
        dispatch(setAuthUser({ ...auth.user }));
      }
    } else {
      const res = await APIRequest({
        method: 'delete',
        url: API_ENDPOINTS_V2.favoriteProducts.delete(
          auth.user.favoriteProducts[getProductIndexInFavorites(product)]
            .productId,
        ),
        requireAuth: true,
      });
      if (res.isSucceed) {
        auth.user.favoriteProducts.splice(
          getProductIndexInFavorites(product),
          1,
        );
        dispatch(setAuthUser({ ...auth.user }));
      }
    }
  };
  const getProductIsInOrderRequest = (product: ILaximoCartProductDTO) =>
    !!offerProductSelection.products.find(
      el => el?.acatProductId === product?.article,
    );

  const handleOrderRequestButton = async (product: ILaximoCartProductDTO) => {
    if (!getProductIsInOrderRequest(product)) {
      const res = await APIRequest({
        method: 'post',
        url: API_ENDPOINTS.COPY_EXTERNAL_PRODUCT,
        data: { product: product },
        requireAuth: true,
      });
      if (!res.isSucceed) return;

      const productData: IProduct = res.data;
      const selectedProductData =
        offerProductSelection?.products?.[
          offerProductSelection.activeProductIndex
        ];
      dispatch(
        setOfferProductSelectionProduct(
          {
            orderRequestId: offerProductSelection.orderRequestId,
            productId: productData?.id,
            product: productData,
            acatProductId: product.article,
            unitPrice: selectedProductData?.unitPrice,
            count: selectedProductData?.count,
            deliveryQuantity: selectedProductData?.deliveryQuantity,
            deliveryTerm: selectedProductData?.deliveryTerm,
          },
          offerProductSelection.activeProductIndex,
          offerProductSelection,
        ),
      );
    } else {
      dispatch(
        dispatch(
          setOfferProductSelectionProduct(
            {
              orderRequestId: null,
              product: null,
              acatProductId: null,
            },
            offerProductSelection.activeProductIndex,
            offerProductSelection,
          ),
        ),
      );
    }
  };

  return {
    locale,
    router,
    auth,
    cart,
    dispatch,
    permissions,
    products,
    handleProductQuantityChange,
    activeLabel,
    setActiveLabel,
    imageRef,
    imageWapperRef,
    imageRatio,
    getProductIsInCart,
    handleCartButtonClick,
    getProductIsInFavorites,
    handleFavoriteButtonClick,
    handleOrderRequestButton,
    getProductIsInOrderRequest,
    pageContentRef,
    mouseEvents,
    rowsRef,
  };
};
