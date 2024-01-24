import { convertAddressToString } from 'components/common/YandexMap/utils';
import { MAX_ORDER_REQUEST_COMMENT_LENGTH } from 'data/common.data';
import { STRINGS } from 'data/strings.data';
import { IAddress } from 'interfaces/common.interfaces';
import {
  isClientSide,
  openNotification,
  stripString,
} from 'utils/common.utils';
import { ICartProduct } from './interfaces/interfaces';

interface IValidationProps {
  deliveryAddress: IAddress;
  products: ICartProduct[];
  comment: string;
}

interface IValidationResult {
  result: boolean;
  reasons?: ('address' | 'products' | 'comment')[];
  message?: string;
}

export const validateCart = ({
  deliveryAddress,
  products,
  comment,
}: IValidationProps): IValidationResult => {
  const addressStr = convertAddressToString(deliveryAddress);
  const reasons: IValidationResult['reasons'] = [];
  const messages: string[] = [];

  if (!addressStr) {
    reasons.push('address');
    messages.push(`указать в корзине адрес доставки`);
  }

  if (!products.length) {
    reasons.push('products');
    messages.push('добавить товары в корзину');
  }

  if (stripString(comment)?.length > MAX_ORDER_REQUEST_COMMENT_LENGTH) {
    reasons.push('comment');
    messages.push(
      `сократить длину комментария до ${MAX_ORDER_REQUEST_COMMENT_LENGTH}`,
    );
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

export const getCartDataFromLocalStorage = () => {
  const data = {
    deliveryAddress: localStorage.getItem(STRINGS.CART.DELIVERY_ADDRESS),
    products: localStorage.getItem(STRINGS.CART.PRODUCTS),
    comment: localStorage.getItem(STRINGS.CART.COMMENT),
    fileIds: localStorage.getItem(STRINGS.CART.FILES),
    selectedSellerIds: localStorage.getItem(STRINGS.CART.SELLERS),
    settlements: localStorage.getItem(STRINGS.CART.SETTLEMENTS),
  };

  return {
    deliveryAddress: data.deliveryAddress
      ? (JSON.parse(data.deliveryAddress) as IAddress)
      : null,
    products: data.products
      ? (JSON.parse(data.products) as ICartProduct[])
      : null,
    comment: data?.comment,
    fileIds: data.fileIds ? (JSON.parse(data.fileIds) as string[]) : [],
    selectedSellerIds: data.selectedSellerIds
      ? (JSON.parse(data.selectedSellerIds) as string[])
      : null,
    settlements: data.settlements
      ? (JSON.parse(data.settlements) as string[])
      : null,
  };
};

export const isCartOrderRequestCreatingAllowed = (
  onNotificationClick?: () => void,
): boolean => {
  if (!isClientSide()) return false;

  const currentUrl = new URL(location.href);
  if (!currentUrl.searchParams.get(STRINGS.QUERY.SEND_ORDER_REQUEST))
    return true;

  const data = getCartDataFromLocalStorage();
  const submitAllowed = validateCart({
    deliveryAddress: data.deliveryAddress,
    products: data.products,
    comment: data.comment,
  });

  if (!submitAllowed.result) {
    openNotification(submitAllowed.message, {
      onClick: onNotificationClick,
    });
    return false;
  }

  return true;
};
