import { INotification } from 'hooks/notifications.hooks/interfaces';
import { IAddress, IDBEntity } from 'interfaces/common.interfaces';
import { IServerFile } from 'interfaces/files.interfaces';
import {
  IAttachment,
  IDescribedProduct,
  IProduct,
  IProductCategory,
} from 'sections/Catalog/interfaces/products.interfaces';
import { IJuristicSubject } from 'sections/JuristicSubject/interfaces';
import { IOrganization } from 'sections/Organizations/interfaces';
import { IUser } from 'sections/Users/interfaces';
import { ITransportCompany } from '../Shipping/interfaces';
import { ICartOffer } from 'sections/Cart/interfaces/cart.interfaces';

export type IExtendedStatuses =
  // customer: order request
  | 'REQUESTED'
  | 'OFFER_RECEIVED' // worker: order request
  | `OFFER_UPDATED_${number}`
  // seller: order request
  | 'ORDER_REQUEST' // + worker: order request
  | 'ORDER_REQUEST_BY_PHOTO_OR_DESCRIPTION' // + worker: order request
  | 'OFFER_SENT'
  | 'OFFER_EXPIRED'
  | 'OFFER_UPDATE_REQUESTED'
  // customer | seller | worker: order
  | 'APPROVED'
  | 'PAYMENT_POSTPONED'
  | 'PAID'
  | 'COMPLETED'
  // seller | worker: order
  | 'REWARD_PAID'
  | 'DECLINED';

export interface IOrderRequest extends IDBEntity {
  idOrder: string;
  totalPrice: number;
  status: IExtendedStatuses;
  customerId: IUser['id'];
  customer?: IUser;
  commissionType?: 'acquiring' | 'invoice';
  paymentPostponedAt?: string;
  paymentType?: 'card' | 'invoice';
  payerId?: IJuristicSubject['id'];
  payer?: IJuristicSubject;
  paymentId: string;
  paymentLink?: string;
  paidSum?: number;
  paymentDate?: string;
  completionDate?: Date;
  comment?: string;
  orders?: IOrder[];
  products?: IRequestProduct[];
  deliveryAddressId: IAddress['id'];
  address?: IAddress;
  attachments: IAttachment[];
  isCollapsed?: boolean;
  selectedSellerIds?: string;
  notifications?: INotification[];
  unreadNotifications?: INotification[];
  lastNotificationCreatedAt?: Date;
  paymentRefundRequest?: IPaymentRefundRequest;
  inHistory?: boolean;
  hasActiveRefundExchangeRequest?: boolean;
  cancelPaymentMessage?: string;
  categories?: string[];
  deletedManagerId?: IUser['id'];
  managerDeletedAt?: string;
}

export interface IRequestProduct extends IDBEntity {
  isSelected?: boolean;
  count?: number;
  quantity: number;
  maxQuantity?: number;
  unitPrice: number;
  deliveryQuantity: number;
  deliveryTerm: number;
  productId?: IProduct['id'];
  product?: IProduct;
  describedProduct?: IDescribedProduct;
  requestedProductId?: string;
  orderId: IOrder['id'];
  order?: IOrder;
  orderRequestId: IOrderRequest['id'];
  orderRequest?: IOrderRequest;
  productCategoryId?: string;
  productCategory?: IProductCategory;
  refundExchangeRequest?: IRefundExchangeRequest;
  refundExchangeRequests?: IRefundExchangeRequest[];
  totalPrice?: number;
  altName?: string;
  altManufacturer?: string;
  altArticle?: string;
  reserveName?: string;
  reserveManufacturer?: string;
  reserveArticle?: string;
  transferedQuantity?: number;
}

export interface IOrder extends IDBEntity {
  idOrder: string;
  organization: IOrganization;
  totalPrice: number;
  sellerId: IUser['id'];
  seller?: IUser;
  orderRequestId: IOrderRequest['id'];
  orderRequest?: IOrderRequest;
  products?: IRequestProduct[];
  isPickup?: boolean;
  transportCompanyId: ITransportCompany['id'] | null;
  transportCompany?: ITransportCompany | null;
  notConfirmedTransportCompanyId?: ITransportCompany['id'] | null;
  notConfirmedPickup?: boolean;
  changedTransportCompany?: boolean | null;
  commissionType: 'acquiring' | 'invoice';
  notConfirmedTransportCompany?: ITransportCompany | null;
  customerOrderCount?: number;
  trackNumber?: string;
  departureDate?: Date;
  receivingDate?: Date | string;
  completionDate?: Date;
  sellerUpdatedAt?: Date;
  offerExpiresAt?: Date;
  isExpiredOffer: boolean;
  paidSum: number;
  paidAt: Date;
  status: 'OFFER' | 'PAID' | 'PAYMENT_POSTPONED';
  isRequestedToUpdateOffer: boolean;
  notifications?: INotification[];
  unreadNotifications?: INotification[];
  reward?: IReward;
  hasActiveRefundExchangeRequest?: boolean;
  supplierAddress: IAddress;
  paymentPostponedAt?: string;
  paymentPostponeAccepted?: boolean;
  paymentPostponeMaxSum?: number;
  paymentPostponeOverMaxSumApproved?: boolean;
  paymentPostponeCustomerOrganization?: IJuristicSubject;
  hideSupplierPayments?: boolean;
  cancelPaymentMessage?: string;
}

export interface IReward extends IDBEntity {
  amount: number;
  sellerId: IUser['id'];
  seller?: IUser;
  orderId: IOrder['id'];
  order?: IOrder;
  supplierPaid: boolean;
  givenAtMonth: string | null;
  givenAt: Date | null;
  sellerFeePaidAt?: Date | null;
}

export interface IRewardGroup {
  month: string;
  rewards: IReward[];
  ordersSum: number;
  rewardSum: number;
  seller?: IUser;
}

export type IRefundExchangeReason =
  | 'poorQuality'
  | 'deliveryTimesViolated'
  | 'inadequateSet'
  | 'notCorrespond'
  | 'notFit'
  | 'orderingMistake'
  | 'other';

export interface IRefundExchangeRequest extends IDBEntity {
  orderedQuantity: number;
  quantity: number;
  reason: IRefundExchangeReason[];
  disputeResolution: 'REFUND' | 'EXCHANGE';
  status: 'PENDING' | 'AGREED' | 'REJECTED' | 'RESOLVED' | 'CLOSED';
  isRejected: boolean;
  comment?: string;
  reply?: string;
  requestProductId: IRequestProduct['id'];
  requestProduct?: IRequestProduct;
  refundExchangeRequestFiles?: IRefundExchangeRequestFile[];
  attachments?: IAttachment[];
}

export interface IRefundExchangeRequestFile extends IDBEntity {
  refundExchangeRequestId: IRefundExchangeRequest['id'];
  refundExchangeRequest?: IRefundExchangeRequest;
  fileId: string;
  file?: IServerFile;
}

export interface IPaymentRefundRequest extends IDBEntity {
  orderRequestId: IOrderRequest['id'];
  orderRequest?: IOrderRequest;
  refundSum?: number;
}

export interface IReasonToRejectShippingCondition extends IDBEntity {
  orderId: IOrder['id'];
  userId: IUser['id'];
  reason: string;
}

export interface IOrderRequestTable {
  title: string;
  totalPaidSum: string | number;
  quantityProducts?: string | number;
  quantityAvailable?: string | number;
  cash?: string | number;
  changeAllowed?: boolean;
  addOfferProduct?: () => void;
}

export interface IOrderAttachment {
  id?: IDBEntity['id'];
  userId?: IUser['id'];
  orderId?: IOrder['id'];
  group?:
    | 'attachment'
    | 'invoice'
    | 'accountingDocument'
    | 'acceptanceCertificate'
    | 'waybill'
    | 'check'
    | 'specification';
  name: string;
  ext: string;
  url?: string;
  localUrl?: string;
}

export interface IPostponedPayment {
  id: number;
  customerId: IUser['id'];
  customer?: IUser;
  customerOrganizationId: IJuristicSubject['id'];
  customerOrganization?: IJuristicSubject;
  organizationId: IOrganization['id'];
  organization?: IOrganization | ICartOffer['organization'];
  warehouseId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  daysRequested: number;
  daysApproved: number;
  maxSum: number;
  isClosed: boolean;
  createdAt: string;
  updatedAt: string;
}
