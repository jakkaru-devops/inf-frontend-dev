import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { useState, useEffect, useRef, RefObject } from 'react';
import { API_ENDPOINTS } from 'data/paths.data';
import { APIRequest } from 'utils/api.utils';
import { IOrderRequest, IRequestProduct } from 'sections/Orders/interfaces';
import { IOrganization } from 'sections/Organizations/interfaces';
import { openNotification } from 'utils/common.utils';
import { useLocale } from 'hooks/locale.hook';
import { IOrderProductSelectingRouter } from 'components/complex/OrderProductSelecting/interfaces';
import { STRINGS } from 'data/strings.data';
import { IProduct } from 'sections/Catalog/interfaces/products.interfaces';
import { useNotifications } from 'hooks/notifications.hooks';
import { InputRef } from 'antd';
import { IInputLabel } from 'sections/Orders/data';
import { useAuth } from 'hooks/auth.hook';
import {
  IOfferProductSelectionState,
  IOfferSelectedProduct,
  setOfferProductSelection,
  setOfferProductSelectionProduct,
} from 'store/reducers/offerProductSelection.reducer';
import { useOfferProductSelection } from 'hooks/offerProductSelection.hook';

interface IProps {
  orderRequest: IOrderRequest;
  setOrderRequest: (value: IOrderRequest) => void;
  organizations: IOrganization[];
}

export const useHandlers = ({
  orderRequest,
  setOrderRequest,
  organizations,
}: IProps) => {
  const auth = useAuth();
  const offerProductSelection = useOfferProductSelection();
  const dispatch = useDispatch();
  const router = useRouter() as IOrderProductSelectingRouter;
  const { locale } = useLocale();
  const { fetchUnreadNotificationsCount } = useNotifications();
  const refs = orderRequest.products.map(product => ({
    altName: useRef() as RefObject<InputRef>,
    altManufacturer: useRef() as RefObject<InputRef>,
    altArticle: useRef() as RefObject<InputRef>,
    unitPrice: useRef() as RefObject<HTMLInputElement>,
    count: useRef() as RefObject<HTMLInputElement>,
    deliveryQuantity: useRef() as RefObject<HTMLInputElement>,
    deliveryTerm: useRef() as RefObject<HTMLInputElement>,
  }));

  const offer = orderRequest.orders[0];
  offer.products = offer.products.filter(product => product.isSelected);
  const isPartialPayment =
    orderRequest.paidSum &&
    (!orderRequest.paymentRefundRequest ||
      (orderRequest.paymentRefundRequest &&
        !orderRequest.paymentRefundRequest.refundSum));

  const getRequestProducts = () =>
    (!isPartialPayment ? orderRequest.products : offer.products).map(
      product => {
        const offeredProduct =
          !!offer &&
          offer.products.find(
            ({ productId }) => productId === product.productId,
          );

        if (!!offeredProduct) {
          return {
            ...product,
            count: offeredProduct?.quantity || 0,
            unitPrice: offeredProduct?.unitPrice || 0,
            deliveryQuantity: offeredProduct?.deliveryQuantity || 0,
            deliveryTerm: offeredProduct?.deliveryTerm || 0,
            altName: offeredProduct?.altName,
            altManufacturer: offeredProduct?.altManufacturer,
            altArticle: offeredProduct?.altArticle,
          };
        }
        const savedProduct =
          offerProductSelection?.orderRequestId === orderRequest?.id &&
          offerProductSelection?.products?.find(
            el => el.productId === product?.productId,
          );
        return {
          ...product,
          count: savedProduct?.count || 0,
          unitPrice: savedProduct?.unitPrice || 0,
          deliveryQuantity: savedProduct?.deliveryQuantity || 0,
          deliveryTerm: savedProduct?.deliveryTerm || 0,
        };
      },
    );

  const [requestProductList, setRequestProductList] = useState(
    getRequestProducts(),
  );
  const [altProducts, setAltProducts] = useState(
    (!offer ? orderRequest.products : offer.products).map(product => {
      const offeredProduct =
        !!offer &&
        offer.products.find(({ productId }) => productId === product.productId);
      return {
        productId: product?.productId,
        altName: offeredProduct?.altName || product?.product?.name,
        altManufacturer:
          offeredProduct?.altManufacturer || product?.product?.manufacturer,
        altArticle: offeredProduct?.altArticle || product?.product?.article,
      };
    }),
  );
  const [selectedOrganization, setSelectedOrganization] =
    useState<IOrganization | null>(organizations[0]);
  const [activeProductIndex, setActiveProductIndex] = useState<number>(null);
  const [submitAwaiting, setSubmitAwaiting] = useState(false);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [stateCounter, setStateCounter] = useState(0);

  const productDeletionAllowed = requestProductList.length > 1;
  const describedProducts = orderRequest.products.filter(
    ({ describedProduct }) => describedProduct,
  );
  const isPlainOrderRequest = !describedProducts.length;

  const [attachments, setAttachments] = useState([
    ...orderRequest.attachments.filter(
      ({ orderId }) => !orderId || orderId === offer?.id,
    ),
    ...describedProducts.flatMap(
      ({ describedProduct: { attachments } }) => attachments,
    ),
  ]);
  const [attachmentsModalOpen, setAttachmentsModalOpen] = useState(false);

  useEffect(() => {
    setRequestProductList(getRequestProducts());
    setSelectedOrganization(organizations[0]);
    setActiveProductIndex(null);
    setSubmitAwaiting(false);
    setIsEditingMode(false);
    setAltProducts(
      (!offer ? orderRequest.products : offer.products).map(product => {
        const offeredProduct =
          !!offer &&
          offer.products.find(
            ({ productId }) => productId === product.productId,
          );
        return {
          productId: product?.productId,
          altName: offeredProduct?.altName || product?.product?.name,
          altManufacturer:
            offeredProduct?.altManufacturer || product?.product?.manufacturer,
          altArticle: offeredProduct?.altArticle || product?.product?.article,
        };
      }),
    );

    const fetchData = async () => {
      const selectedProducts: IOfferProductSelectionState['products'] = !!offer
        ? offer.products.map(product => ({
            productId: product.productId,
            product: product.product,
            quantity: product.count,
            unitPrice: product.unitPrice,
            count: product.quantity,
            deliveryQuantity: product.deliveryQuantity,
            deliveryTerm: product.deliveryTerm,
            productCategoryId: product.productCategoryId,
          }))
        : JSON.parse(localStorage.getItem(STRINGS.OFFER_PRODUCT_SELECTION))
            ?.products || [];
      const productIds: string[] = selectedProducts
        .map(({ productId }) => productId)
        .filter(Boolean);

      // Data of products saved in localStorage but we need to fetch actual products data (name, article, ext.) from API server
      if (productIds.length > 0 && !offer) {
        const res = await APIRequest({
          method: 'get',
          url: API_ENDPOINTS.PRODUCT_LIST_BY_IDS,
          params: {
            ids: productIds,
          },
        });
        if (res.isSucceed) {
          const productsData: IProduct[] = res.data;
          dispatch(
            setOfferProductSelection({
              ...offerProductSelection,
              orderRequestId: orderRequest.id,
              activeProductIndex: 0,
              products: selectedProducts.map(selectedProduct => ({
                ...selectedProduct,
                product: productsData.find(
                  product => product.id === selectedProduct.productId,
                ),
              })),
            }),
          );
        }
      }

      if (orderRequest?.unreadNotifications?.length) {
        const notificationIds = orderRequest.unreadNotifications.map(
          ({ id }) => id,
        );
        await APIRequest({
          method: 'post',
          url: API_ENDPOINTS.NOTIFICATION_UNREAD,
          data: {
            notificationIds,
          },
          requireAuth: true,
        }).then(async res => {
          if (!res.isSucceed) return;
          await fetchUnreadNotificationsCount(notificationIds);
        });
      }
      if (offer?.unreadNotifications?.length) {
        const notificationIds = offer.unreadNotifications.map(({ id }) => id);
        await APIRequest({
          method: 'post',
          url: API_ENDPOINTS.NOTIFICATION_UNREAD,
          data: {
            notificationIds,
          },
          requireAuth: true,
        }).then(async res => {
          if (!res.isSucceed) return;
          await fetchUnreadNotificationsCount(notificationIds);
        });
      }
    };

    if (
      !!describedProducts?.length &&
      (!offerProductSelection?.products?.length ||
        offerProductSelection?.orderRequestId !== orderRequest.id)
    ) {
      dispatch(
        setOfferProductSelection({
          ...offerProductSelection,
          orderRequestId: orderRequest.id,
          activeProductIndex: 0,
          products: [
            {
              orderRequestId: orderRequest.id,
              quantity: describedProducts?.[0]?.quantity,
            },
          ],
        }),
      );
    }

    fetchData();
  }, [orderRequest.id]);

  const changeOrganization = (value: string) => {
    if (!String(value)) return;

    const org = organizations.find(({ id }) => id == value);

    if (!org) return;

    setSelectedOrganization(org);
  };

  const enableEditingMode = () => {
    // setRequestProductList(prev =>
    //   prev.map(product => ({
    //     ...product,
    //     altName: product?.product?.name || '',
    //     altManufacturer: product?.product?.manufacturer || '',
    //     altArticle: product?.product?.article || '',
    //   })),
    // );
    // setStateCounter(prev => prev + 1);
    setIsEditingMode(true);
  };

  const disableEditingMode = () => {
    // setRequestProductList(prev =>
    //   prev.map(product => ({
    //     ...product,
    //     altName: null,
    //     altManufacturer: null,
    //     altArticle: null,
    //   })),
    // );
    // setStateCounter(prev => prev + 1);
    setIsEditingMode(false);
  };

  const handleAltInputChange = (
    value: string,
    productIndex: number,
    inputName: string,
  ) => {
    altProducts[productIndex][inputName as any] = value;
    if (!!offer) {
      (offer.products[productIndex][inputName] as any) = value;
      setOrderRequest({ ...orderRequest });
    }
    setAltProducts([...altProducts]);
    setStateCounter(prev => prev + 1);
  };

  const completeEditing = () => {
    setRequestProductList(prev =>
      prev.map((product, i) => {
        const altProduct = altProducts[i];
        return {
          ...product,
          altName:
            altProduct?.altName !== product?.product?.name
              ? altProduct?.altName?.trim()
              : null,
          altManufacturer:
            altProduct?.altManufacturer !== product?.product?.manufacturer
              ? altProduct?.altManufacturer?.trim()
              : null,
          altArticle:
            altProduct?.altArticle !== product?.product?.article
              ? altProduct?.altArticle?.trim()
              : null,
        };
      }),
    );
    setStateCounter(prev => prev + 1);
    setIsEditingMode(false);
  };

  const considerableProducts = offer.products.filter(
    ({ quantity, deliveryQuantity, deliveryTerm, unitPrice }) =>
      quantity || deliveryQuantity || deliveryTerm || unitPrice,
  );
  const validProducts = offer.products.filter(
    ({ productId, quantity, deliveryQuantity, deliveryTerm, unitPrice }) =>
      productId &&
      (((quantity || !quantity) && deliveryQuantity && deliveryTerm) ||
        (!deliveryQuantity && !deliveryTerm && quantity)) &&
      unitPrice,
  );

  const isAlreadySuggested = orderRequest.orders.some(
    ({ sellerId }) => sellerId == auth.user.id,
  );

  const allowCreateOrder =
    validProducts.length === considerableProducts.length &&
    validProducts.length > 0 &&
    !!selectedOrganization;
  // (!orderRequest.products[0]?.describedProduct ||
  //   (!!orderRequest.products[0]?.describedProduct && !!selectedProduct))

  const addSelectedProduct = () => {
    dispatch(
      setOfferProductSelection({
        ...offerProductSelection,
        products: offerProductSelection.products.concat({
          orderRequestId: orderRequest.id,
          quantity: describedProducts?.[0]?.quantity,
        }),
      }),
    );
  };

  const deleteSelectedProduct = (index: number) => {
    if (offerProductSelection.products.length < 2) return;
    dispatch(
      setOfferProductSelection({
        ...offerProductSelection,
        products: offerProductSelection.products.filter((_, i) => i !== index),
      }),
    );
  };

  const changeProductUnitPrice = (
    requestProduct: IRequestProduct,
    i: number,
    value: number,
  ) => {
    updateProduct(
      {
        ...requestProduct,
        count: requestProduct.quantity,
        quantity: requestProduct.count,
        unitPrice: value === 0 ? null : value,
      },
      i,
    );
    if (!!offer) return;
    dispatch(
      setOfferProductSelectionProduct(
        {
          orderRequestId: orderRequest.id,
          product: null,
          newProduct: null,
          productId: requestProduct?.productId,
          unitPrice: value,
          count: requestProduct?.count,
          deliveryQuantity: requestProduct?.deliveryQuantity,
          deliveryTerm: requestProduct?.deliveryTerm,
        },
        i,
        offerProductSelection,
      ),
    );
  };

  const changeProductCount = (
    requestProduct: IRequestProduct | IOfferSelectedProduct,
    i: number,
    value: number,
  ) => {
    updateProduct(
      {
        ...requestProduct,
        [!isPartialPayment ? 'quantity' : 'count']: value === 0 ? null : value,
      },
      i,
    );
    if (!!offer) return;
    dispatch(
      setOfferProductSelectionProduct(
        {
          orderRequestId: orderRequest.id,
          product: null,
          newProduct: null,
          productId: requestProduct?.productId,
          unitPrice: requestProduct?.unitPrice,
          count: value,
          deliveryQuantity: requestProduct?.deliveryQuantity,
          deliveryTerm: requestProduct?.deliveryTerm,
        },
        i,
        offerProductSelection,
      ),
    );
  };

  const changeProductDeliveryQuantity = (
    requestProduct: IRequestProduct | IOfferSelectedProduct,
    i: number,
    value: number,
  ) => {
    updateProduct(
      {
        ...requestProduct,
        count: requestProduct.quantity,
        quantity: requestProduct.count,
        deliveryQuantity: value,
      },
      i,
    );
    if (!!offer) return;
    dispatch(
      setOfferProductSelectionProduct(
        {
          orderRequestId: orderRequest.id,
          product: null,
          newProduct: null,
          productId: requestProduct?.productId,
          unitPrice: requestProduct?.unitPrice,
          count: requestProduct?.count,
          deliveryQuantity: value,
          deliveryTerm: requestProduct?.deliveryTerm,
        },
        i,
        offerProductSelection,
      ),
    );
  };

  const changeProductDeliveryTerm = (
    requestProduct: IRequestProduct | IOfferSelectedProduct,
    i: number,
    value: number,
  ) => {
    updateProduct(
      {
        ...requestProduct,
        count: requestProduct.quantity,
        quantity: requestProduct.count,
        deliveryTerm: value,
      },
      i,
    );
    if (!!offer) return;
    dispatch(
      setOfferProductSelectionProduct(
        {
          orderRequestId: orderRequest.id,
          product: null,
          newProduct: null,
          productId: requestProduct?.productId,
          unitPrice: requestProduct?.unitPrice,
          count: requestProduct?.count,
          deliveryQuantity: requestProduct?.deliveryQuantity,
          deliveryTerm: value,
        },
        i,
        offerProductSelection,
      ),
    );
  };

  const updateProduct = (
    requestProduct: IRequestProduct | IOfferSelectedProduct,
    i: number,
  ) => {
    if (!isPartialPayment) {
      requestProductList[i].count = requestProduct.quantity;
      requestProductList[i].unitPrice = requestProduct.unitPrice;
      requestProductList[i].deliveryQuantity = requestProduct.deliveryQuantity;
      requestProductList[i].deliveryTerm = requestProduct.deliveryTerm;
      requestProductList[i].productCategoryId =
        requestProduct.productCategoryId;

      setRequestProductList(
        requestProductList.map(product => ({
          ...product,
        })),
      );
    } else {
      offer.products[i].quantity = requestProduct.count;
      offer.products[i].unitPrice = requestProduct.unitPrice;
      offer.products[i].deliveryQuantity = requestProduct.deliveryQuantity;
      offer.products[i].deliveryTerm = requestProduct.deliveryTerm;
      offer.products[i].productCategoryId = requestProduct.productCategoryId;

      setOrderRequest({ ...orderRequest });
      setStateCounter(prev => prev + 1);
    }
  };

  const updateOrder = async () => {
    setSubmitAwaiting(true);

    if (considerableProducts?.length !== validProducts?.length) {
      openNotification('Не все товары заполнены корректно');
      return;
    }

    if (!validProducts?.length) {
      openNotification('В предложении должен быть минимум 1 товар');
      return;
    }

    const res = await APIRequest({
      method: 'put',
      url: API_ENDPOINTS.ORDER,
      data: {
        organizationId: selectedOrganization.id,
        products: validProducts.map(product => ({
          productId: product.productId,
          requestedProductId: product.id,
          count: product.count,
          quantity: product.quantity,
          requestedQuantity: product.count,
          unitPrice: product.unitPrice,
          deliveryQuantity: product.deliveryQuantity,
          deliveryTerm: product.deliveryTerm,
          productCategoryId: product.productCategoryId,
          altName:
            product?.altName !== product?.product?.name
              ? product?.altName
              : null,
          altManufacturer:
            !!product?.product?.manufacturer &&
            product?.altManufacturer !== product?.product?.manufacturer
              ? product?.altManufacturer
              : null,
          altArticle:
            product?.altArticle !== product?.product?.article
              ? product?.altArticle
              : null,
        })),
      },
      params: {
        id: offer.id,
      },
      requireAuth: true,
    });

    setSubmitAwaiting(false);

    if (!res.isSucceed) {
      openNotification(res.message);
      return;
    }

    openNotification('Предложение обновленно');
    setIsEditingMode(false);
    router.reload();
  };

  const deleteProduct = async (requestProductId: string) => {
    let newProducts = requestProductList.filter(
      product => product.id !== requestProductId,
    );
    setRequestProductList([...newProducts]);
    setDeleteProductId(null);
  };

  const deleteOrder = async () => {
    const res = await APIRequest({
      method: 'delete',
      url: API_ENDPOINTS.ORDER,
      params: {
        id: offer.id,
      },
      requireAuth: true,
    });

    if (!res.isSucceed) {
      openNotification(res.message);
    }

    openNotification('Предложение удалено');
    router.reload();
  };

  return {
    refs,
    locale,
    auth,
    router,
    offer,
    isPlainOrderRequest,
    isAlreadySuggested,
    allowCreateOrder,
    offerProductSelection,
    submitAwaiting,
    setSubmitAwaiting,
    isEditingMode,
    setIsEditingMode,
    deleteProductId,
    setDeleteProductId,
    productDeletionAllowed,
    altProducts,
    enableEditingMode,
    disableEditingMode,
    handleAltInputChange,
    completeEditing,
    changeOrganization,
    changeProductCount,
    changeProductDeliveryQuantity,
    changeProductDeliveryTerm,
    changeProductUnitPrice,
    updateOrder,
    deleteProduct,
    deleteOrder,
    selectedOrganization,
    requestProductList,
    setRequestProductList,
    activeProductIndex,
    setActiveProductIndex,
    addSelectedProduct,
    deleteSelectedProduct,
    attachments,
    setAttachments,
    attachmentsModalOpen,
    setAttachmentsModalOpen,
    describedProducts,
  };
};
