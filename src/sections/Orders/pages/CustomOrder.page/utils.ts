import { convertAddressToString } from 'components/common/YandexMap/utils';
import { MAX_ORDER_REQUEST_COMMENT_LENGTH } from 'data/common.data';
import { STRINGS } from 'data/strings.data';
import { IAddress } from 'interfaces/common.interfaces';
import { ISellerAutoBrand } from 'sections/Users/interfaces';
import {
  isClientSide,
  openNotification,
  stripString,
} from 'utils/common.utils';

interface IValidationProps {
  autoBrands: ISellerAutoBrand[];
  productGroupIds: string[];
  quantity: number;
  description: string;
  uploadedFileIds: string[];
  deliveryAddress: IAddress;
  paymentPostponedAt: Date | string;
}

interface IValidationResult {
  result: boolean;
  reasons?: (
    | 'productCategory'
    | 'quantity'
    | 'description'
    | 'descriptionLength'
    | 'deliveryAddress'
  )[];
  message?: string;
}

export const validateCustomOrder = ({
  autoBrands,
  productGroupIds,
  quantity,
  description,
  uploadedFileIds,
  deliveryAddress,
  paymentPostponedAt,
}: IValidationProps): IValidationResult => {
  const addressStr = convertAddressToString(deliveryAddress);
  const reasons: IValidationResult['reasons'] = [];
  const messages: string[] = [];

  if (!autoBrands?.length && !productGroupIds?.length) {
    reasons.push('productCategory');
    messages.push('указать категорию товара');
  }

  console.log('TEST', description, uploadedFileIds);

  if (
    (!description?.length || description === '<p><br></p>') &&
    !uploadedFileIds?.length
  ) {
    reasons.push('description');
    messages.push('добавить описание товара или прикрепить фото товара');
  }
  if (stripString(description)?.length > 250) {
    reasons.push('description');
    messages.push(
      `сократить длину описания товаро до ${MAX_ORDER_REQUEST_COMMENT_LENGTH}`,
    );
  }

  if (!addressStr) {
    reasons.push('deliveryAddress');
    messages.push(`указать адрес доставки`);
  }

  if (reasons.length > 0) {
    return {
      result: false,
      reasons,
      message: 'Для продолжения необходимо ' + messages.join(', '),
    };
  }

  return {
    result: true,
  };
};

export const getCustomOrderDataFromLocalStorage = () => {
  const data = {
    deliveryAddress: localStorage.getItem(
      STRINGS.CUSTOM_ORDER.DELIVERY_ADDRESS,
    ),
    autoBrands:
      (JSON.parse(
        localStorage.getItem(STRINGS.CUSTOM_ORDER.AUTO_BRANDS),
      ) as ISellerAutoBrand[]) || [],
    productGroups:
      (JSON.parse(
        localStorage.getItem(STRINGS.CUSTOM_ORDER.PRODUCT_GROUPS),
      ) as string[]) || [],
    quantity: localStorage.getItem(STRINGS.CUSTOM_ORDER.QUANTITY),
    description: localStorage.getItem(STRINGS.CUSTOM_ORDER.DESCRIPTION),
    fileIds: localStorage.getItem(STRINGS.CUSTOM_ORDER.FILES),
    selectedSellerIds: localStorage.getItem(STRINGS.CUSTOM_ORDER.SELLERS),
    settlements: localStorage.getItem(STRINGS.CUSTOM_ORDER.SETTLEMENTS),
    paymentPostponedAt: localStorage.getItem(
      STRINGS.CUSTOM_ORDER.PAYMENT_POSTPONED_AT,
    ),
  };

  return {
    products: [
      {
        describedProductData: {
          description: data?.description,
          fileIds: data.fileIds ? (JSON.parse(data.fileIds) as string[]) : [],
          autoBrands: data.autoBrands,
          productGroupIds: data.productGroups,
        },
        quantity: parseInt(data.quantity),
      },
    ],
    deliveryAddress: data.deliveryAddress
      ? (JSON.parse(data.deliveryAddress) as IAddress)
      : null,
    selectedSellerIds: data.selectedSellerIds
      ? (JSON.parse(data.selectedSellerIds) as string[])
      : null,
    settlements: data.settlements
      ? (JSON.parse(data.settlements) as string[])
      : null,
    paymentPostponedAt: !!data?.paymentPostponedAt
      ? new Date(data?.paymentPostponedAt)
      : null,
  };
};

export const isCustomOrderRequestCreatingAllowed = (
  onNotificationClick?: () => void,
): boolean => {
  if (!isClientSide()) return false;

  const currentUrl = new URL(location.href);
  if (!currentUrl.searchParams.get(STRINGS.QUERY.SEND_CUSTOM_ORDER_REQUEST))
    return true;

  const data = getCustomOrderDataFromLocalStorage();
  const submitAllowed = validateCustomOrder({
    autoBrands: data.products[0].describedProductData.autoBrands,
    productGroupIds: data.products[0].describedProductData.productGroupIds,
    quantity: data.products[0].quantity,
    description: data.products[0].describedProductData?.description,
    uploadedFileIds: data.products[0].describedProductData?.fileIds,
    deliveryAddress: data.deliveryAddress,
    paymentPostponedAt: data.paymentPostponedAt,
  });

  if (!submitAllowed.result) {
    openNotification(submitAllowed.message, {
      onClick: onNotificationClick,
    });
    return false;
  }

  return true;
};
