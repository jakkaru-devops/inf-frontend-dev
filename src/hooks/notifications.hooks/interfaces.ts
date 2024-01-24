import { IDBEntity } from 'interfaces/common.interfaces';
import { ReactNode } from 'react';
import { IProductOffer } from 'sections/Catalog/interfaces/products.interfaces';
import {
  IOrder,
  IOrderRequest,
  IPaymentRefundRequest,
} from 'sections/Orders/interfaces';
import { IOrganization } from 'sections/Organizations/interfaces';
import {
  IComplainReason,
  IUser,
  IUserRole,
  IUserRoleLabelsDefault,
  IUserRoleOption,
} from 'sections/Users/interfaces';

export interface INotification extends IDBEntity {
  userId: IUser['id'];
  user?: IUser;
  roleId: IUserRole['id'];
  role?: IUserRole;
  type: keyof INotificationDataType;
  autoread: boolean;
  data: any;
  orderRequestId?: IOrderRequest['id'];
  orderRequest?: IOrderRequest;
  orderId?: IOrder['id'];
  order?: IOrder;
  viewedAt: Date | null;
  module?:
    | 'orderRequests'
    | 'orders'
    | 'orderHistory'
    | 'refunds'
    | 'organizations'
    | 'userComplaints'
    | 'customers'
    | 'sellers'
    | 'productOffers';
  text?: ReactNode | string;
  textFull?: ReactNode | string;
  onClick?: () => void;
  action?: () => void;
}

export interface INotificationDataType {
  dummy: {};
  offerToOrderRequest: {
    orderRequestId: IOrderRequest['id'];
    idOrder: IOrderRequest['idOrder'];
    seller: IUser;
  };
  createOrderRequest: {
    customerId: IUser['id'];
    customer?: IUser;
    orderRequestId: IOrderRequest['id'];
    idOrder: IOrderRequest['idOrder'];
  };
  offerExpired: {
    idOrder: IOrderRequest['idOrder'];
    orderRequestId: IOrderRequest['id'];
  };
  requestToUpdateOffer: {
    idOrder: IOrderRequest['idOrder'];
    orderRequestId: IOrderRequest['id'];
  };
  offerUpdated: {
    idOrder: IOrderRequest['idOrder'];
    orderRequestId: IOrderRequest['id'];
  };
  orderShipped: {
    idOrder: IOrderRequest['idOrder'];
    orderRequestId: IOrderRequest['id'];
  };
  orderPartialPayment: {
    idOrder: IOrderRequest['idOrder'];
    orderRequestId: IOrderRequest['id'];
    totalPrice: IOrderRequest['totalPrice'];
    paidSum: IOrderRequest['paidSum'];
  };
  requestPaymentRefund: {
    idOrder: IOrderRequest['idOrder'];
    orderRequestId: IOrderRequest['id'];
    paidSum: IOrderRequest['paidSum'];
  };
  paymentRefundRequestPaid: {
    idOrder: IOrderRequest['idOrder'];
    orderRequestId: IOrderRequest['id'];
    refundSum: IPaymentRefundRequest['refundSum'];
  };
  orderPaid: {
    idOrder: IOrderRequest['idOrder'];
    orderRequestId: IOrderRequest['id'];
  };
  orderPaymentPostponed: {
    idOrder: IOrderRequest['idOrder'];
    orderRequestId: IOrderRequest['id'];
  };
  receiptCreated: {
    idOrder: IOrderRequest['idOrder'];
    orderRequestId: IOrderRequest['id'];
  };
  orderCompleted: {
    idOrder: IOrderRequest['idOrder'];
    orderRequestId: IOrderRequest['id'];
  };
  orderBack: {
    idOrder: IOrderRequest['idOrder'];
    orderRequestId: IOrderRequest['id'];
  };
  rewardPaid: {
    idOrder: IOrderRequest['idOrder'];
    orderRequestId: IOrderRequest['id'];
  };
  refundProductRequest: {
    idOrder: IOrderRequest['idOrder'];
    orderRequestId: IOrderRequest['id'];
    orderId: IOrder['id'];
  };
  refundProductAccept: {
    idOrder: IOrderRequest['idOrder'];
    orderRequestId: IOrderRequest['id'];
    orderId: IOrder['id'];
  };
  refundProductDecline: {
    idOrder: IOrderRequest['idOrder'];
    orderRequestId: IOrderRequest['id'];
    orderId: IOrder['id'];
  };
  refundProductComplete: {
    idOrder: IOrderRequest['idOrder'];
    orderRequestId: IOrderRequest['id'];
    orderId: IOrder['id'];
  };
  exchangeProductRequest: {
    idOrder: IOrderRequest['idOrder'];
    orderRequestId: IOrderRequest['id'];
    orderId: IOrder['id'];
  };
  exchangeProductAccept: {
    idOrder: IOrderRequest['idOrder'];
    orderRequestId: IOrderRequest['id'];
    orderId: IOrder['id'];
  };
  exchangeProductDecline: {
    idOrder: IOrderRequest['idOrder'];
    orderRequestId: IOrderRequest['id'];
    orderId: IOrder['id'];
  };
  exchangeProductComplete: {
    idOrder: IOrderRequest['idOrder'];
    orderRequestId: IOrderRequest['id'];
    orderId: IOrder['id'];
  };
  userRoleBanned: {
    roles: IUserRoleOption[];
    allRoles: boolean;
    reasons: IComplainReason[];
  };
  userRoleUnbanned: {
    roles: IUserRoleOption[];
    allRoles: boolean;
  };
  userOrderRequestsBanned: {
    roles: IUserRoleOption[];
    reasons: IComplainReason[];
  };
  userOrderRequestsUnbanned: {
    roles: IUserRoleOption[];
  };
  sellerDowngraded: {
    reasons: IComplainReason[];
  };
  newSellerReview: {
    review: {
      receiverId: IUser['id'];
      ratingValue: number;
    };
  };
  newUserComplaint: {
    complaint: {
      defendantId: IUser['id'];
      defendantRoleId: IUserRole['id'];
      defendantRoleLabel: IUserRoleLabelsDefault;
      defendantName: string;
    };
  };
  sellerUpdateApplicationCreated: {
    seller: {
      id: string;
      name: string;
    };
    applicationId: string;
  };
  sellerUpdateApplicationConfirmed: {
    seller: {
      id: string;
      name: string;
    };
    applicationId: string;
  };
  sellerUpdateApplicationRejected: {
    seller: {
      id: string;
      name: string;
    };
    applicationId: string;
  };
  registerOrganizationApplication: {
    organization: {
      id: IOrganization['id'];
      name: string;
    };
  };
  registerOrganizationApplicationUpdated: {
    organization: {
      id: IOrganization['id'];
      name: string;
    };
  };
  registerSellerApplication: {
    seller: {
      userId: IUser['id'];
      name: string;
    };
    organization: {
      id: IOrganization['id'];
      name: string;
    };
  };
  registerSellerApplicationUpdated: {
    seller: {
      userId: IUser['id'];
      name: string;
    };
    organization: {
      id: IOrganization['id'];
      name: string;
    };
  };
  organizationRegisterConfirmed: {
    organization: {
      id: IOrganization['id'];
      name: string;
    };
  };
  organizationRegisterRejected: {
    organization: {
      id: IOrganization['id'];
      name: string;
    };
  };
  organizationSellerRegisterConfirmed: {
    organization: {
      id: IOrganization['id'];
      name: string;
    };
  };
  organizationSellerRegisterRejected: {
    organization: {
      id: IOrganization['id'];
      name: string;
    };
  };
  organizationUpdateApplicationCreated: {
    organization: {
      id: IOrganization['id'];
      name: string;
    };
    applicationId: string;
    user: {
      id: string;
      name: string;
    };
  };
  organizationUpdateApplicationConfirmed: {
    organization: {
      id: IOrganization['id'];
      name: string;
    };
    applicationId: string;
  };
  organizationUpdateApplicationRejected: {
    organization: {
      id: IOrganization['id'];
      name: string;
    };
    applicationId: string;
  };
  productOfferCreated: {
    productOffer: {
      id: IProductOffer['id'];
      productName: string;
    };
  };
  productOfferUpdated: {
    productOffer: {
      id: IProductOffer['id'];
      productName: string;
    };
  };
  productOfferAccepted: {
    productOffer: {
      id: IProductOffer['id'];
      productName: string;
    };
  };
  productOfferRejected: {
    productOffer: {
      id: IProductOffer['id'];
      productName: string;
    };
  };
  orderInvoicePaymentApproved: {
    idOrder: IOrderRequest['idOrder'];
    orderRequestId: IOrderRequest['id'];
  };
  orderInvoicePaymentConfirmed: {
    idOrder: IOrderRequest['idOrder'];
    orderRequestId: IOrderRequest['id'];
  };
  offerInvoicePaymentConfirmed: {
    idOrder: IOrderRequest['idOrder'];
    orderRequestId: IOrderRequest['id'];
    offerId: IOrder['id'];
    supplierName: string;
  };
  offerInvoicePaymentCanceled: {
    idOrder: IOrderRequest['idOrder'];
    orderRequestId: IOrderRequest['id'];
    offerId: IOrder['id'];
    supplierName: string;
  };
  orderInvoicePaymentCanceled: {
    idOrder: IOrderRequest['idOrder'];
    orderRequestId: IOrderRequest['id'];
  };
  orderAttachmentUploaded: {
    orderRequestId: IOrderRequest['id'];
    idOrder: IOrderRequest['idOrder'];
    attachmentGroup:
      | 'attachment'
      | 'invoice'
      | 'accountingDocument'
      | 'acceptanceCertificate'
      | 'waybill'
      | 'check';
  };
  applicationChangeTransportCompany: {
    idOrder: IOrderRequest['idOrder'];
    orderRequestId: IOrderRequest['id'];
    seller?: IUser;
  };
  approvedChangeTransportCompany: {
    idOrder: IOrderRequest['idOrder'];
    orderRequestId: IOrderRequest['id'];
    customerId: IUser['id'];
    customer?: IUser;
  };
  declinedChangeTransportCompany: {
    idOrder: IOrderRequest['idOrder'];
    orderRequestId: IOrderRequest['id'];
    customerId: IUser['id'];
    customer?: IUser;
  };
  customerRegistered: {
    user: {
      id: string;
      phone: string;
    };
  };
}
