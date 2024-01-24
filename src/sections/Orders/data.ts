export const ORDER_REQUEST_STATUSES = {
  customer: [
    'REQUESTED',
    'OFFER_RECEIVED',
    'OFFER_EXPIRED',
    'OFFER_UPDATE_REQUESTED',
    'OFFER_UPDATED',
    'APPROVED',
  ],
  seller: [
    'ORDER_REQUEST',
    'ORDER_REQUEST_BY_PHOTO_OR_DESCRIPTION',
    'OFFER_SENT',
    'OFFER_EXPIRED',
    'OFFER_UPDATE_REQUESTED',
    'APPROVED',
  ],
  manager: [
    'ORDER_REQUEST',
    'ORDER_REQUEST_BY_PHOTO_OR_DESCRIPTION',
    'OFFER_RECEIVED',
    'OFFER_EXPIRED',
    'OFFER_UPDATE_REQUESTED',
    'OFFER_UPDATED',
    'APPROVED',
  ],
  operator: [
    'ORDER_REQUEST',
    'ORDER_REQUEST_BY_PHOTO_OR_DESCRIPTION',
    'OFFER_RECEIVED',
    'OFFER_EXPIRED',
    'OFFER_UPDATE_REQUESTED',
    'OFFER_UPDATED',
    'APPROVED',
  ],
};

export const ORDER_STATUSES = {
  customer: ['PAID', 'PAYMENT_POSTPONED', 'SHIPPED'],
  seller: ['PAID', 'PAYMENT_POSTPONED', 'SHIPPED', 'REWARD_PAID'],
  manager: ['PAID', 'PAYMENT_POSTPONED', 'SHIPPED', 'REWARD_PAID'],
  operator: ['PAID', 'PAYMENT_POSTPONED', 'SHIPPED', 'REWARD_PAID'],
};

export const ORDER_HISTORY_STATUSES = {
  customer: ['COMPLETED', 'DECLINED'],
  seller: ['SHIPPED', 'COMPLETED', 'REWARD_PAID', 'DECLINED'],
  manager: ['PAID', 'SHIPPED', 'REWARD_PAID', 'DECLINED'],
  operator: ['PAID', 'SHIPPED', 'REWARD_PAID', 'DECLINED'],
};

export const REFUND_STATUSES = {
  customer: ['PAID', 'SHIPPED', 'COMPLETED'],
  seller: ['PAID', 'SHIPPED', 'COMPLETED', 'REWARD_PAID'],
  manager: ['PAID', 'SHIPPED', 'COMPLETED', 'REWARD_PAID'],
  operator: ['PAID', 'SHIPPED', 'COMPLETED', 'REWARD_PAID'],
};

export type IInputLabel =
  | 'name'
  | 'manufacturer'
  | 'article'
  | 'unitPrice'
  | 'count'
  | 'deliveryQuantity'
  | 'deliveryTerm';
export const INPUTS_ORDER: IInputLabel[] = [
  'name',
  'manufacturer',
  'article',
  'unitPrice',
  'count',
  'deliveryQuantity',
  'deliveryTerm',
];
