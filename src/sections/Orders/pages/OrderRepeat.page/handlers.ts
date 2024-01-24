import { convertAddressToString } from 'components/common/YandexMap/utils';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { useAuth } from 'hooks/auth.hook';
import { useLocale } from 'hooks/locale.hook';
import { IAddress } from 'interfaces/common.interfaces';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { IOrderRequest, IRequestProduct } from 'sections/Orders/interfaces';
import { APIRequest } from 'utils/api.utils';
import { generateInnerUrl, openNotification } from 'utils/common.utils';

export const useHandlers = ({ order }: { order: IOrderRequest }) => {
  const auth = useAuth();
  const { locale } = useLocale();
  const router = useRouter();

  const [products, setProducts] = useState(() => {
    const totalProductList: IRequestProduct[] = [];
    for (const offer of order.orders) {
      for (const offeredProduct of offer.products) {
        let index = totalProductList.findIndex(
          ({ productId }) => productId === offeredProduct.productId,
        );
        if (index === -1) {
          index = totalProductList.length;
          totalProductList[index] = {
            ...offeredProduct,
            product: {
              ...offeredProduct.product,
              preview: order.products.find(
                ({ productId }) => productId === offeredProduct.productId,
              )?.product?.preview,
            },
            count: 0,
            totalPrice: 0,
          };
        }

        totalProductList[index].count += offeredProduct.count;
      }
    }
    return totalProductList;
  });
  const [savedRegions, setSavedRegions] = useState([]);
  const [deliveryAddressVisible, setDeliveryAddressVisible] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState<IAddress>(
    order.address,
  );
  const [settlementsModalVisible, setSettlementsModalVisible] = useState(false);
  const [comment, setComment] = useState(order.comment);
  const [uploadedFileIds, setUploadedFileIds] = useState<string[] | []>([]);
  const [selectedSellerIds, setSelectedSellerIds] = useState<string[]>(
    order?.selectedSellerIds?.split(' ') || [],
  );
  const [saveSelectedSellers, setSaveSelectedSellers] = useState(
    !!auth.user?.savedSellerIds,
  );
  const [stateCounter, setStateCounter] = useState(0);

  const addressStr = convertAddressToString(deliveryAddress);
  const allowCreateOrder = !!addressStr;

  const updateProduct = (product: IRequestProduct, i: number) => {
    products[i].count = product.count;
    setProducts(
      products.map(product => ({
        ...product,
        count: product.count,
      })),
    );
    setStateCounter(stateCounter + 1);
  };

  const changeProductCount = (
    product: IRequestProduct,
    i: number,
    value: number,
  ) => {
    if (value <= 0 || !Number(value)) return;
    updateProduct(
      {
        ...product,
        count: value,
      },
      i,
    );
  };

  const deleteProduct = (i: number) => {
    products.splice(i, 1);
    setProducts(products);
    setStateCounter(stateCounter + 1);
  };

  const handleCommentChange = comment => setComment(comment);

  const handleFilesUpload = fileIds =>
    setUploadedFileIds(uploadedFileIds => [
      ...uploadedFileIds.filter(id => !fileIds.includes(id)),
      ...fileIds,
    ]);

  const handleFileDelete = fileId =>
    setUploadedFileIds(uploadedFileIds =>
      uploadedFileIds.filter(id => fileId !== id),
    );

  const createOrderRequest = async (address: IAddress) => {
    if (products.length <= 0) return;

    // Check if order creating is allowed
    if (!allowCreateOrder) {
      openNotification('Укажите адрес доставки для отправки запроса');
      return;
    }

    const settlements = savedRegions.filter(settlement => settlement.isSelect);

    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.ORDER_REQUEST,
      data: {
        repeatOrder: true,
        products: products.map(el => ({
          productId: el.productId,
          quantity: el.count,
        })),
        deliveryAddress: address,
        comment,
        fileIds: uploadedFileIds,
        selectedSellerIds,
        saveSelectedSellers,
        settlements,
      },
      requireAuth: true,
    });
    if (!res.isSucceed) return;
    // isClientSide() && window.localStorage.removeItem(selectedRegionsKey);
    openNotification(`Запрос отправлен`);

    const orderRequestData: IOrderRequest = res?.data;
    router.push(
      generateInnerUrl(APP_PATHS.ORDER_REQUEST(orderRequestData.id), {
        text: orderRequestData.idOrder,
      }),
    );
  };

  return {
    router,
    addressStr,
    products,
    allowCreateOrder,
    changeProductCount,
    comment,
    createOrderRequest,
    deleteProduct,
    deliveryAddress,
    handleCommentChange,
    handleFileDelete,
    handleFilesUpload,
    locale,
    savedRegions,
    deliveryAddressVisible,
    setDeliveryAddressVisible,
    setDeliveryAddress,
    setSavedRegions,
    settlementsModalVisible,
    setSettlementsModalVisible,
    selectedSellerIds,
    setSelectedSellerIds,
    saveSelectedSellers,
    setSaveSelectedSellers,
  };
};
