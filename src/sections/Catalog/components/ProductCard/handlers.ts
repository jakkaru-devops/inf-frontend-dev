import { API_SERVER_URL } from 'config/env';
import { useDispatch } from 'react-redux';
import {
  IProduct,
  IProductApplicability,
  IProductPriceOfferGroup,
  ISupplier,
} from 'sections/Catalog/interfaces/products.interfaces';
import { useRouter } from 'next/router';
import { MouseEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { IOrderProductSelectingRouter } from 'components/complex/OrderProductSelecting/interfaces';
import { useProductHandlers } from 'hooks/productHandlers.hook';
import { useLocale } from 'hooks/locale.hook';
import { ITabGroupItem } from 'components/common/TabGroup/interfaces';
import { generateUrl } from 'utils/common.utils';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { updateUserCartProduct } from 'services/updateUserCartProduct.service';
import { useAuth } from 'hooks/auth.hook';
import { setOfferProductSelectionProduct } from 'store/reducers/offerProductSelection.reducer';
import { useOfferProductSelection } from 'hooks/offerProductSelection.hook';
import { useCart } from 'hooks/cart.hook';

type ITablLabel =
  | 'prices'
  | 'recommendedProducts'
  | 'analogs'
  | 'applicabilities';

type ITabGroupItemExtended = ITabGroupItem & {
  label: ITablLabel;
};

interface INextRouterExtended extends IOrderProductSelectingRouter {
  query: {
    productId: string;
    orderId?: string;
    orderRequestId?: string;
    tab?: ITablLabel;
    isSale?: string;
    history?: string[];
  };
}

interface IProps {
  product: IProduct;
  suppliersList: ISupplier[];
}

const useHandlers = ({ product, suppliersList }: IProps) => {
  const auth = useAuth();
  const cart = useCart();
  const offerProductSelection = useOfferProductSelection();
  const dispatch = useDispatch();
  const { locale } = useLocale();
  const router = useRouter() as INextRouterExtended;
  const {
    indexInCartProducts,
    isInCart,
    toggleProductIsInCart,
    isInFavorites,
    toggleProductIsInFavorites,
  } = useProductHandlers();

  const [quantity, setQuantity] = useState(
    cart?.products?.find(
      el => el?.productId === product.id && !el?.priceOfferId,
    )?.quantity || 1,
  );
  const [preview, setPreview] = useState({
    previewVisible: false,
    previewImage: '',
    activePhotoIndex: 0,
    currentPhotoIndex: 0,
  });
  const [analogProducts, setAnalogProducts] = useState<
    IRowsWithCount<IProduct[]>
  >({
    count: 0,
    rows: [],
  });
  const [applicabilities, setApplicabilities] = useState<
    IRowsWithCount<IProductApplicability[]>
  >({
    count: 0,
    rows: [],
  });
  const [recommendedProducts, setRecommendedProducts] =
    useState<IProduct[]>(null);
  const [priceOfferGroups, setPriceOfferGroups] = useState<
    IProductPriceOfferGroup[]
  >([]);

  const tabPriceList = useMemo(() => {
    const priceList = [
      {
        href: generateUrl({ tab: 'prices' }),
        label: 'prices',
        title: 'Цены',
        isActive: router?.query?.tab === 'prices' || !router?.query?.tab,
      },
    ];

    return priceList;
  }, [product, router?.query]);

  const tabSuppliersList = useMemo(
    () => [
      {
        href: generateUrl({ tab: 'suppliersList' }),
        label: 'suppliers',
        title: !!suppliersList.length
          ? 'Предложения от поставщиков'
          : 'Предложения от других поставщиков',
      },
    ],
    [product, router?.query],
  );

  const tabList = useMemo(() => {
    const result: ITabGroupItemExtended[] = [];

    result.push({
      href: generateUrl({ tab: 'recommendedProducts' }),
      label: 'recommendedProducts',
      title: 'С этим товаром покупают',
      isActive:
        router?.query?.tab === 'recommendedProducts' ||
        (!router?.query?.tab && !result?.length),
    });

    if (product?.hasAnalogs) {
      result.push({
        href: generateUrl({ tab: 'analogs' }),
        label: 'analogs',
        title: 'Аналоги',
        isActive:
          router?.query?.tab === 'analogs' ||
          (!router?.query?.tab && !result?.length),
      });
    }
    if (product?.hasApplicabilities) {
      result.push({
        href: generateUrl({ tab: 'applicabilities' }),
        label: 'applicabilities',
        title: 'Применяемость',
        isActive:
          router?.query?.tab === 'applicabilities' ||
          (!router?.query?.tab && !result?.length),
      });
    }
    return result;
  }, [product, router?.query?.tab]);

  const imageUrl = !!product.productFiles[0]?.file.path
    ? `${API_SERVER_URL}/files/${
        product.productFiles[preview.activePhotoIndex]?.file.path
      }`
    : null;

  const currentImageUrl = `${API_SERVER_URL}/files/${
    product?.productFiles[preview.currentPhotoIndex]?.file?.path
  }`;

  const categoryFilter = router?.query?.orderRequestId;
  const urlOrderSuffix = router.query.orderRequestId
    ? `?orderRequestId=${router.query.orderRequestId}`
    : '';

  const permissions = {
    // addToCart:
    //   (!auth.isAuthenticated || auth?.currentRole?.label === 'customer') &&
    //   !![
    //     PRODUCT_STATUSES.DEFAULT,
    //     PRODUCT_STATUSES.ACCEPTED,
    //     PRODUCT_STATUSES.COPIED,
    //   ].find(status => status === product.status),
    // addToFavorites:
    //   auth.isAuthenticated && auth?.currentRole?.label === 'customer',
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

  const isInOrderRequest = !!offerProductSelection?.products?.find(
    el => (el?.productId || el?.product?.id) === product.id,
  );

  const handlePreviewCancel = () => {
    setPreview({
      ...preview,
      previewVisible: false,
    });
  };

  const changeActivePhotoByIndex = (i: number) => {
    setPreview({
      ...preview,
      activePhotoIndex: i,
      currentPhotoIndex: i,
    });
  };

  const changeSlide = (direction: 'prev' | 'next') => {
    let newPhotoIndex =
      preview.currentPhotoIndex + (direction === 'prev' ? -1 : 1);
    if (newPhotoIndex < 0) {
      newPhotoIndex = product.productFiles.length - 1;
    }
    if (newPhotoIndex >= product.productFiles.length) {
      newPhotoIndex = 0;
    }
    setPreview({
      ...preview,
      currentPhotoIndex: newPhotoIndex,
    });
  };

  useEffect(() => {
    document.addEventListener('keydown', changeSlideByKeyboard, false);
    return () => {
      document.removeEventListener('keydown', changeSlideByKeyboard, false);
    };
  }, [preview]);

  const changeSlideByKeyboard = useCallback(
    (e: KeyboardEvent) => {
      if (!preview.previewVisible) return;
      if (e.keyCode === 37) {
        changeSlide('prev');
      } else if (e.keyCode === 39) {
        changeSlide('next');
      }
    },
    [preview],
  );

  const changeCartProductQuantity = async (value: number) => {
    if (value <= 0) return;
    if (!value.isInteger()) return;
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

  const handleAddToOrderRequestButtonClick = (
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
  ) => {
    e.preventDefault();
    const productData =
      offerProductSelection.products[offerProductSelection.activeProductIndex];
    dispatch(
      setOfferProductSelectionProduct(
        {
          orderRequestId: offerProductSelection.orderRequestId,
          productId: product?.id,
          product: !isInOrderRequest ? product : null,
          unitPrice: productData?.unitPrice,
          count: productData?.count,
          deliveryQuantity: productData?.deliveryQuantity,
          deliveryTerm: productData?.deliveryTerm,
        },
        offerProductSelection.activeProductIndex,
        offerProductSelection,
      ),
    );
  };

  const maxPrice = Math.max(
    ...priceOfferGroups.flatMap(group =>
      group.children.map(item => item.price),
    ),
  );
  const schemaOrgContentProduct = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    brand: product.manufacturer,
    name: product.name,
    description: product.description,
    image: `${API_SERVER_URL}/files${
      product.productFiles[0]?.file.path || `/${null}`
    }`,

    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'RUB',
      highPrice: maxPrice,
      lowPrice: product.minPrice,

      location: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality:
            priceOfferGroups[0]?.children[0].address || 'г. Иркутск',
        },
      },
    },
  };

  return {
    locale,
    auth,
    cart,
    router,
    categoryFilter,
    urlOrderSuffix,
    quantity,
    preview,
    setPreview,
    tabPriceList,
    tabSuppliersList,
    tabList,
    analogProducts,
    setAnalogProducts,
    applicabilities,
    setApplicabilities,
    recommendedProducts,
    setRecommendedProducts,
    priceOfferGroups,
    setPriceOfferGroups,
    permissions,
    changeSlide,
    changeActivePhotoByIndex,
    handlePreviewCancel,
    changeCartProductQuantity,
    indexInCartProducts,
    isInCart,
    toggleProductIsInCart,
    isInFavorites,
    toggleProductIsInFavorites,
    currentImageUrl,
    imageUrl,
    isInOrderRequest,
    handleAddToOrderRequestButtonClick,
    schemaOrgContentProduct,
  };
};

export default useHandlers;
