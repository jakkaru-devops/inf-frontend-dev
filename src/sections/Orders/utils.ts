import { InputRef } from 'antd';
import { IInputLabel, INPUTS_ORDER } from './data';
import { IRequestProduct } from './interfaces';
import { IOrganization } from 'sections/Organizations/interfaces';
import { IOfferSelectedProduct } from 'store/reducers/offerProductSelection.reducer';
import { KeyboardEvent, RefObject } from 'react';

/**
 * @description   Function to calculate seller's CASH from Order
 */
export const calculateOrderCash = (
  orderCost: number,
  comissionPercent: number,
  sellerIndividual: boolean,
) => {
  if (sellerIndividual) {
    const comission = comissionPercent / 100;
    const individualPercent = 20 / 100;
    const cash = (orderCost * comission * individualPercent).gaussRound(2);
    return cash;
  }

  const acquiring = 0.014; // Эквайринг = 1.4%
  const comission = comissionPercent / 100; // Комиссия организации агента (продавца)
  const startSum = (orderCost * comission - orderCost * acquiring) * 0.5; // Сумма вознаграждения с затратами на ФОТ

  const bankIndividualComission = 0.1; // комиссия банка за перевод физ лицу = 10%
  const ndfl = 0.13; // НДФЛ = 13%
  const ndflOnHand = 0.1494; // НДФЛ % накрутки на сумму на руки = 14,94252873563%
  const pfr = 0.22; // ПФР = 22%
  const foms = 0.051; // ФОМС = 5.10%
  const coef =
    1 +
    bankIndividualComission +
    ndflOnHand +
    pfr +
    foms +
    ndflOnHand * pfr +
    ndflOnHand * foms; // Расчетный коэффициент для суммы на  руки

  const cashWithNdfl = startSum / coef + (startSum / coef) * ndflOnHand; // Доход Агента с НДФЛ
  const ndflWithKopek = cashWithNdfl * ndfl; // НДФЛ с копейками
  const ndflFloor = Math.floor(ndflWithKopek); // НДФЛ округление вниз
  const ndflBudget =
    ndflWithKopek - ndflFloor < 0.5 ? ndflFloor : Math.ceil(ndflWithKopek); // НДФЛ в бюджет

  const resultCash = cashWithNdfl - ndflBudget; // СУММА вознаграждения Агенту на карту

  return resultCash;
};

export const ORDER_CALCULATIONS = {
  orderedProductsQuantity: (products: IRequestProduct[]) =>
    products
      .filter(({ isSelected }) => isSelected)
      .map(({ count }) => count)
      .reduce((a, b) => a + b, 0),
  offeredProductsQuantity: (products: IRequestProduct[]) =>
    products
      .filter(({ isSelected }) => isSelected)
      .map(({ quantity }) => quantity)
      .reduce((a, b) => a + b, 0),
  productTotalPrice: (product: IRequestProduct) =>
    product.count * product.unitPrice,
  offerTotalPrice: (products: IRequestProduct[]) =>
    products
      .map(product => ORDER_CALCULATIONS.productTotalPrice(product))
      .filter(Boolean)
      .reduce((a, b) => a + b, 0),
  offerTotalCash: (products: IRequestProduct[], org: IOrganization) => {
    if (org.priceBenefitPercentAcquiring && org.priceBenefitPercentInvoice)
      return 0;

    return products
      .map(
        product =>
          calculateOrderCash(
            ORDER_CALCULATIONS.productTotalPrice(product),
            org?.priceBenefitPercent,
            true,
          ) || 0,
      )
      .filter(Boolean)
      .reduce((a, b) => a + b, 0);
  },
  offerCommission: (commission: number, products: IRequestProduct[]) =>
    (ORDER_CALCULATIONS.offerTotalPrice(products) / 100) * commission || 0,
  offerTotalPriceMinusCommission: (
    commission: number,
    products: IRequestProduct[],
  ) =>
    ORDER_CALCULATIONS.offerTotalPrice(products) -
    ORDER_CALCULATIONS.offerCommission(commission, products),
};

export const calculateProductSum = (
  product: IRequestProduct | IOfferSelectedProduct,
) => {
  const minQuantity = (product?.count || 0) + (product?.deliveryQuantity || 0);
  return minQuantity && product?.unitPrice
    ? minQuantity * product.unitPrice
    : 0;
};

export const calculateTotal = (requestProductList: IOfferSelectedProduct[]) => {
  const result = requestProductList
    .map(product => calculateProductSum(product))
    .filter(Boolean)
    .reduce((a, b) => a + b, 0);
  return Number(result.toFixed(2));
};

export const calculateTotalCash = (
  requestProductList: IRequestProduct[],
  selectedOrganization: IOrganization,
) => {
  if (
    selectedOrganization.priceBenefitPercentAcquiring &&
    selectedOrganization.priceBenefitPercentInvoice
  )
    return;
  const result = requestProductList
    .map(
      product =>
        calculateOrderCash(
          calculateProductSum(product),
          selectedOrganization?.priceBenefitPercent,
          true,
        ) || 0,
    )
    .filter(Boolean)
    .reduce((a, b) => a + b, 0);
  return Number(result.toFixed(2));
};

export const calculateQuantityProducts = requestProductList => {
  const result = requestProductList
    .map(product => product['quantity'])
    .filter(Boolean)
    .reduce((a, b) => a + b, 0);
  return result;
};

export const calculateQuantityAvailable = requestProductList => {
  const result = requestProductList
    .map(product => product['count'])
    .filter(Boolean)
    .reduce((a, b) => a + b, 0);
  return result;
};

export const calculateCommission = (commission, requestProductList) => {
  const result =
    ((calculateTotal(requestProductList) / 100) * commission || 0)
      .roundFraction()
      .separateBy(' ') || 0;
  return result;
};

export const calculateLessCommission = (commission, requestProductList) => {
  const result =
    (
      calculateTotal(requestProductList) -
        (calculateTotal(requestProductList) / 100) * commission || 0
    )
      .roundFraction()
      .separateBy(' ') || 0;

  return result;
};

export const calculateTotalPaid = orderRequest => {
  const result =
    orderRequest?.orders?.[0]?.paidSum?.roundFraction()?.separateBy(' ') || '-';

  return result;
};

export const handleInputsFocusMove = ({
  e,
  yIndex,
  yLength,
  inputName,
  refs,
}: {
  e: KeyboardEvent<HTMLInputElement>;
  yIndex: number;
  yLength: number;
  inputName: IInputLabel;
  refs: Array<{
    [key: string]: RefObject<HTMLInputElement> | RefObject<InputRef>;
  }>;
}) => {
  if (
    !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) ||
    e.shiftKey
  )
    return;
  e.preventDefault();
  e.stopPropagation();
  let inputIndex = INPUTS_ORDER.findIndex(el => el === inputName);
  switch (e.key) {
    case 'ArrowLeft':
      if (inputIndex > 0) inputIndex--;
      break;
    case 'ArrowRight':
      if (inputIndex < INPUTS_ORDER.length - 1) inputIndex++;
      break;
    case 'ArrowUp':
      if (yIndex > 0) yIndex--;
      window.scrollTo({ top: window.scrollY - 50, behavior: 'smooth' });
      break;
    case 'ArrowDown':
      if (yIndex < yLength - 1) {
        yIndex++;
        window.scrollTo({ top: window.scrollY + 50, behavior: 'smooth' });
      }
      break;
  }
  inputName = INPUTS_ORDER[inputIndex];
  const inputRef = refs[yIndex][inputName];
  if (!!inputRef.current) {
    inputRef.current.focus();
  }
};
