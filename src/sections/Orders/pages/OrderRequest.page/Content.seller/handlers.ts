import { InputRef } from 'antd';
import { IOrderProductSelectingRouter } from 'components/complex/OrderProductSelecting/interfaces';
import { API_ENDPOINTS } from 'data/paths.data';
import { useAuth } from 'hooks/auth.hook';
import { useOfferProductSelection } from 'hooks/offerProductSelection.hook';
import moment from 'moment';
import { useRouter } from 'next/router';
import { RefObject, createRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { IOrderRequest } from 'sections/Orders/interfaces';
import { downloadOrderDocService } from 'sections/Orders/services/downloadOrderDoc.service';
import { IOrganization } from 'sections/Organizations/interfaces';
import {
  IOfferSelectedProduct,
  setOfferProductSelection,
} from 'store/reducers/offerProductSelection.reducer';
import { APIRequest } from 'utils/api.utils';
import { openNotification } from 'utils/common.utils';

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

  const [stateCounter, setStateCounter] = useState(0);
  const productsWithIds = orderRequest.products.filter(
    ({ productId }) => productId,
  );
  const describedProducts = orderRequest.products.filter(
    ({ describedProduct }) => describedProduct,
  );
  const offer = orderRequest.orders.find(el => el.sellerId === auth.user.id);
  const offeredProducts = (offer?.products || []).map(product => ({
    ...product,
    count: product.quantity,
    quantity: product.count,
  }));

  const getRequestProducts = (): IOfferSelectedProduct[] => {
    if (!describedProducts?.length) {
      return !!offeredProducts?.length
        ? offeredProducts.map(offeredProduct => ({
            orderRequestId: orderRequest.id,
            requestProductId: offeredProduct?.requestedProductId || null,
            offerProductId: offeredProduct.id,
            productId: offeredProduct?.productId || null,
            product: offeredProduct?.product || null,
            quantity: offeredProduct?.count || 0,
            count: offeredProduct?.quantity || 0,
            unitPrice: offeredProduct?.unitPrice || 0,
            deliveryQuantity: offeredProduct?.deliveryQuantity || 0,
            deliveryTerm: offeredProduct?.deliveryTerm || 0,
            altName: offeredProduct?.altName,
            altManufacturer: offeredProduct?.altManufacturer,
            altArticle: offeredProduct?.altArticle,
          }))
        : [
            ...productsWithIds.map(product => {
              const savedProduct = (offerProductSelection?.products || []).find(
                el => el.requestProductId === product.id,
              );

              return {
                orderRequestId: orderRequest.id,
                requestProductId: product.id,
                productId: product.productId,
                product: product?.product,
                quantity: product.quantity,
                unitPrice: savedProduct?.unitPrice || product.unitPrice,
                count: savedProduct?.count || product.count || 0,
                deliveryQuantity:
                  savedProduct?.deliveryQuantity || product.deliveryQuantity,
                deliveryTerm:
                  savedProduct?.deliveryTerm || product.deliveryTerm,
              };
            }),
            ...(offerProductSelection?.products || []).filter(
              product =>
                product.orderRequestId === orderRequest.id &&
                !product?.requestProductId,
            ),
          ];
    }

    const products = (offerProductSelection?.products || []).filter(
      product =>
        product.orderRequestId === orderRequest.id &&
        !product?.requestProductId,
    );
    if (!products?.length) {
      products.push({
        orderRequestId: orderRequest.id,
        requestProductId: null,
        productId: null,
        product: null,
        quantity: describedProducts?.[0]?.quantity,
        unitPrice: null,
        count: null,
        deliveryQuantity: null,
        deliveryTerm: null,
      });
    }

    return products;
  };

  const [postponedPaymentEnabled, setPostponedPaymentEnabled] =
    useState<boolean>(!!offer ? !!offer?.paymentPostponedAt : null);
  const [paymentDate, setPaymentDate] = useState<moment.Moment>(
    moment(offer?.paymentPostponedAt || orderRequest?.paymentPostponedAt),
  );
  const [attachments, setAttachments] = useState([
    ...orderRequest.attachments.filter(
      ({ orderId }) => !orderId || orderId === offer?.id,
    ),
    ...describedProducts.flatMap(
      ({ describedProduct: { attachments } }) => attachments,
    ),
  ]);
  const [attachmentsModalOpen, setAttachmentsModalOpen] = useState(false);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(
    organizations?.[0]?.id || null,
  );
  const [downloadDocModalVisible, setDownloadDocModalVisible] = useState(false);
  const [downloadDocAwaiting, setDownloadDocAwaiting] = useState(false);
  const [products, setProducts] = useState(getRequestProducts());
  const [activeProductIndex, setActiveProductIndex] = useState<number>(null);
  const [submitAwaiting, setSubmitAwaiting] = useState(false);
  const [isEditingMode, setIsEditingMode] = useState(false);

  const productsRefs = products.map(() => ({
    name: createRef() as RefObject<InputRef>,
    manufacturer: createRef() as RefObject<InputRef>,
    article: createRef() as RefObject<InputRef>,
    unitPrice: createRef() as RefObject<HTMLInputElement>,
    count: createRef() as RefObject<HTMLInputElement>,
    deliveryQuantity: createRef() as RefObject<HTMLInputElement>,
    deliveryTerm: createRef() as RefObject<HTMLInputElement>,
  }));

  const selectedOrganization = !!selectedOrganizationId
    ? organizations.find(org => org.id === selectedOrganizationId)
    : null;
  const considerableProducts = products.filter(
    ({
      orderRequestId,
      requestProductId,
      count,
      deliveryQuantity,
      deliveryTerm,
      unitPrice,
    }) =>
      orderRequestId === orderRequest.id &&
      (!requestProductId ||
        count ||
        deliveryQuantity ||
        deliveryTerm ||
        unitPrice),
  );
  const validProducts = products.filter(
    ({
      orderRequestId,
      product,
      newProduct,
      count,
      deliveryQuantity,
      deliveryTerm,
      unitPrice,
    }) =>
      orderRequestId === orderRequest.id &&
      (!!product ||
        (!product && !!newProduct?.name && !!newProduct?.article)) &&
      !!unitPrice &&
      ((!!count && !deliveryQuantity && !deliveryTerm) ||
        (!!deliveryQuantity && !!deliveryTerm)),
  );

  const allowCreateOffer =
    validProducts.length === considerableProducts.length &&
    validProducts.length > 0 &&
    !!selectedOrganization;
  const updateAllowed =
    !offer ||
    offer?.isRequestedToUpdateOffer ||
    (orderRequest.paidSum && orderRequest.paidSum < orderRequest.totalPrice);

  const disabledPaymentDate = (current: moment.Moment) =>
    !!current &&
    (current < moment(orderRequest.createdAt).endOf('day') ||
      current > moment(orderRequest.createdAt).add({ days: 30 }));

  const handlePaymentDateChange = (date: moment.Moment) => {
    if (typeof postponedPaymentEnabled !== 'boolean' || !!offer) return;
    setPaymentDate(date);
  };

  const handlePostponedPaymentEnabledChange = (value: boolean) => {
    if (!!offer) return;
    setPostponedPaymentEnabled(value);
  };

  const selectOrganization = (orgId: IOrganization['id']) =>
    setSelectedOrganizationId(orgId);

  const enableEditingMode = () => {
    setIsEditingMode(true);
  };

  const disableEditingMode = () => {
    setIsEditingMode(false);
  };

  const completeEditing = () => {
    setIsEditingMode(false);
    /* setRequestProductList(prev =>
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
    setIsEditingMode(false); */
  };

  const startManualProductEditing = () => {
    products[activeProductIndex].newProduct = {
      article: '',
      name: '',
      manufacturer: '',
    };
    products[activeProductIndex].productId = null;
    products[activeProductIndex].acatProductId = null;

    setProducts([...products]);
    memorizeProducts([...products]);
    setActiveProductIndex(null);
  };

  const memorizeProducts = (productsData: IOfferSelectedProduct[]) => {
    dispatch(
      setOfferProductSelection({
        ...offerProductSelection,
        products: productsData.map(product => ({
          orderRequestId: orderRequest.id,
          requestProductId: product.requestProductId,
          offerProductId: product.offerProductId,
          productId: product.productId,
          quantity: product.quantity,
          count: product.count,
          unitPrice: product.unitPrice,
          deliveryQuantity: product.deliveryQuantity,
          deliveryTerm: product.deliveryTerm,
          altName: product.altName,
          altManufacturer: product.altManufacturer,
          altArticle: product.altArticle,
          productCategoryId: product.productCategoryId,
          newProduct: product.newProduct,
        })),
      }),
    );
    setStateCounter(prev => prev + 1);
  };

  const handleProductUpdate = (product: IOfferSelectedProduct, i: number) => {
    products[i] = product;
    setProducts([...products]);
    memorizeProducts([...products]);
  };

  const handleNewProductValueChange = (
    value: IOfferSelectedProduct['newProduct'],
    i: number,
  ) => {
    products[i].newProduct = value;
    setProducts([...products]);
    memorizeProducts([...products]);
  };

  const addOfferProduct = () => {
    setProducts(prev => [
      ...prev,
      {
        orderRequestId: orderRequest.id,
        requestProductId: null,
        productId: null,
        product: null,
        quantity: describedProducts?.[0]?.quantity || null,
        unitPrice: null,
        count: null,
        deliveryQuantity: null,
        deliveryTerm: null,
        newProduct: null,
      },
    ]);
    dispatch(
      setOfferProductSelection({
        ...offerProductSelection,
        products: offerProductSelection.products.concat({
          orderRequestId: orderRequest.id,
          quantity: describedProducts?.[0]?.quantity || null,
        }),
      }),
    );
  };

  const deleteOfferProduct = (index: number) => {
    if (offerProductSelection.products.length < 2) return;

    const newProducts = products.filter((__, i) => i !== index);
    setProducts(newProducts);
    memorizeProducts(newProducts);
  };

  const submitCreateOffer = async () => {
    if (!allowCreateOffer) return;

    if (
      !!orderRequest?.paymentPostponedAt &&
      typeof postponedPaymentEnabled !== 'boolean'
    ) {
      openNotification('Необходимо согласовать отсрочку оплаты');
      return;
    }

    setSubmitAwaiting(true);

    const productsData = validProducts.map(product => {
      /* const altProduct = altProducts?.find(
        el => el?.productId === product?.productId,
      );
      product.altName = altProduct?.altName;
      product.altManufacturer = altProduct?.altManufacturer;
      product.altArticle = altProduct?.altArticle; */

      return {
        productId: product?.productId || product?.product?.id,
        requestedProductId: product?.requestProductId,
        quantity: product.quantity,
        count: product.count,
        requestedQuantity: product.quantity,
        unitPrice: product.unitPrice,
        deliveryQuantity: product.deliveryQuantity,
        deliveryTerm: product.deliveryTerm,
        productCategoryId: product.productCategoryId,
        name: product?.newProduct?.name,
        manufacturer: product?.newProduct?.manufacturer,
        article: product?.newProduct?.article,
        altName:
          product?.altName !== product?.product?.name ? product?.altName : null,
        altManufacturer:
          !!product?.altManufacturer &&
          product?.altManufacturer !== product?.product?.manufacturer
            ? product?.altManufacturer
            : null,
        altArticle:
          product?.altArticle !== product?.product?.article
            ? product?.altArticle
            : null,
        newProduct: product?.newProduct,
      };
    });

    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.ORDER,
      data: {
        organizationId: selectedOrganization.id,
        products: productsData,
        paymentPostponedAt: postponedPaymentEnabled
          ? paymentDate.format('yyyy.MM.DD')
          : null,
      },
      params: {
        orderRequestId: orderRequest.id,
      },
      requireAuth: true,
    });

    setSubmitAwaiting(false);

    if (!res.isSucceed) {
      openNotification(res.message);
      return;
    }

    openNotification('Предложение отправлено');
    router.reload();
  };

  const updateOffer = async () => {
    if (considerableProducts?.length !== validProducts?.length) {
      openNotification('Не все товары заполнены корректно');
      return;
    }
    if (!validProducts?.length) {
      openNotification('В предложении должен быть минимум 1 товар');
      return;
    }

    setSubmitAwaiting(true);

    const res = await APIRequest({
      method: 'put',
      url: API_ENDPOINTS.ORDER,
      data: {
        organizationId: selectedOrganization.id,
        products: validProducts.map(product => ({
          productId: product.productId,
          requestedProductId: product.requestProductId,
          quantity: product.count,
          count: product.quantity,
          requestedQuantity: product.quantity,
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

  const deleteOffer = async () => {
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

  const downloadDoc = async (docType: 'pdf' | 'xlsx') =>
    await downloadOrderDocService({
      url: API_ENDPOINTS.ORDER_REQUEST_DOC(orderRequest.id),
      docType,
      awaiting: downloadDocAwaiting,
      setAwaiting: setDownloadDocAwaiting,
    });

  return {
    router,
    dispatch,
    offerProductSelection,
    setOfferProductSelection,
    offer,
    productsWithIds,
    describedProducts,
    products,
    productsRefs,
    paymentDate,
    setPaymentDate,
    postponedPaymentEnabled,
    setPostponedPaymentEnabled,
    attachments,
    setAttachments,
    attachmentsModalOpen,
    setAttachmentsModalOpen,
    selectedOrganization,
    disabledPaymentDate,
    downloadDocModalVisible,
    setDownloadDocModalVisible,
    downloadDocAwaiting,
    setDownloadDocAwaiting,
    allowCreateOffer,
    updateAllowed,
    activeProductIndex,
    setActiveProductIndex,
    submitAwaiting,
    setSubmitAwaiting,
    isEditingMode,
    setIsEditingMode,

    handlePaymentDateChange,
    handlePostponedPaymentEnabledChange,
    selectOrganization,
    enableEditingMode,
    disableEditingMode,
    completeEditing,
    handleProductUpdate,
    handleNewProductValueChange,
    deleteOfferProduct,
    startManualProductEditing,
    submitCreateOffer,
    updateOffer,
    deleteOffer,
    downloadDoc,
    addOfferProduct,
  };
};
