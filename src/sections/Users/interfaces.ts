import { IOrderRequest } from './../Orders/interfaces';
import { IAddress, IDBEntity } from 'interfaces/common.interfaces';
import { IServerFile } from 'interfaces/files.interfaces';
import {
  IAttachment,
  IFavoriteProduct,
  IProductCategory,
} from 'sections/Catalog/interfaces/products.interfaces';
import {
  IOrganization,
  IOrganizationSeller,
} from 'sections/Organizations/interfaces';
import { ITransportCompany } from 'sections/Shipping/interfaces';
import { INotification } from 'hooks/notifications.hooks/interfaces';
import { ICustomerContract } from 'sections/JuristicSubject/interfaces';
import {
  IAutoBrand,
  IAutoType,
  IProductGroup,
} from 'sections/Catalog/interfaces/categories.interfaces';
import { ICartProduct } from 'sections/Cart/interfaces/interfaces';

export interface IUser extends IDBEntity {
  phone: string;
  phoneIsHidden?: boolean;
  email?: string;
  firstname?: string;
  lastname?: string;
  middlename?: string;
  bannedUntil?: string;
  avatar?: string;
  phoneVerificationDate?: string;
  emailVerificationDate?: string;
  ratingValue?: number;
  minusRating?: number;
  addressId?: IAddress['id'];
  address?: IAddress;
  sellerConfirmationDate?: string;
  salesNumber?: number;
  savedSellerIds?: string[];
  reviews?: IUserReview[];
  requisites?: IUserRequisites;
  deliveryAddresses?: IUserDeliveryAddress[];
  favoriteProducts?: IFavoriteProduct[];
  cartProducts?: ICartProduct[];
  sellers?: IOrganizationSeller[];
  customerRegisterFiles?: ICustomerRegisterFile[];
  sellerRegisterFiles?: ISellerRegisterFile[];
  sellerAutoBrands?: ISellerAutoBrand[];
  sellerProductGroups?: IProductGroup[];
  sellerAutoBrandsJson?: string;
  sellerProductGroupsJson?: string;
  transportCompanies?: ITransportCompany[];
  sellerRefundsNumber?: number;
  roles?: IUserRole[];
  createdOrganizations?: IOrganization[];
  organizations?: IOrganization[];
  isOnline?: boolean;
  sellerUpdateApplication?: ISellerUpdateApplication;
  notifications?: INotification[];
  unreadNotifications?: INotification[];
  sellerOfferDocName?: string;
  sellerOfferDocDate?: string;
  deletionAt?: string;
  sellerRegisterOrganizationId?: IOrganization['id'];
  isSpecialClient?: boolean;
  isServiceSeller?: boolean;
  postponedPaymentAllowed?: boolean;
  customerContracts?: ICustomerContract[];
  isExpanded?: boolean;
  reviewsNumber?: number;
  isAgreeEmailNotification?: boolean;
  emailNotification?: string;
}

export interface ISellerAutoBrand {
  autoTypeId: IAutoType['id'];
  autoBrandId: IAutoBrand['id'];
}

export interface IUsername {
  lastname: string;
  firstname: string;
  middlename?: string;
}

export interface IUserRequisites extends IDBEntity {
  userId: IUser['id'];
  user?: IUser;
  passportSeries?: string;
  passportNumber?: string;
  passportGiver?: string;
  passportGettingDate?: string;
  passportLocationUnitCode?: string;
  passportRegistrationAddress?: string;
  addressId?: IAddress['id'];
  address?: IAddress;
  inn?: string;
  snils?: string;
  bankName?: string;
  bankInn?: string;
  bankBik?: string;
  bankKs?: string;
  bankRs?: string;
}

export interface IUserDeliveryAddress extends IDBEntity {
  userId: IUser['id'];
  user?: IUser;
  addressId?: IAddress['id'];
  address?: IAddress;
}

export interface ICustomerRegisterFile extends IDBEntity {
  userId: IUser['id'];
  user?: IUser;
  fileId: IServerFile['id'];
  file: IServerFile;
  label: string;
}

export interface ISellerRegisterFile extends IDBEntity {
  userId: IUser['id'];
  user?: IUser;
  fileId: IServerFile['id'];
  file: IServerFile;
  label: string;
}

export interface IPhysicalSubject extends IDBEntity {
  userId: IUser['id'];
  user?: IUser;
  email: string;
  firstname: string;
  lastname: string;
  middlename: string;
}

export interface ISellerProductCategory extends IDBEntity {
  productCategoryId: string;
  productCategory?: IProductCategory;
  sellerId: string;
  seller?: IUser;
  categoryType: number;
}

export interface ISellerProductCategoryRelation extends IDBEntity {
  userId: IUser['id'];
  user?: IUser;
  categoryId: IProductCategory['id'];
  category?: IProductCategory;
}

export interface IUserRole {
  id: string;
  label: IUserRoleLabelsDefault;
  userId: IUser['id'];
  bannedUntil: Date | null;
  requestsBannedUntil: Date | null;
  bannedReason: ('spam' | 'behaviour' | 'fraud' | 'nonobservance')[];
  role?: { label: IUserRoleLabelsDefault };
  createdAt?: string;
}

export type IUserRoleLabelsDefault =
  | 'customer'
  | 'seller'
  | 'operator'
  | 'manager'
  | 'moderator'
  | 'superadmin';

export type IUserRoleOption = {
  id: string;
  label: IUserRoleLabelsDefault;
  bannedUntil?: string;
  requestsBannedUntil?: string;
};

export interface IUserRolesAccessItem {
  roles: IUserRoleOption[];
}

export interface ICustomerCounters {
  orderRequestsCount: number;
  ordersCount: number;
  refundsCount: number;
  receivedComplaintsCount: number;
  sentComplaintsCount: number;
}

export type IComplainReason = 'spam' | 'behaviour' | 'fraud' | 'nonobservance';

export interface IComplaintFile extends IDBEntity {
  complaintId: IComplaint['id'];
  complaint?: IComplaint;
  fileId: IServerFile['id'];
  file: IServerFile;
}
export interface IComplaint extends IDBEntity {
  reason: IComplainReason[];
  comment: string;
  defendantId: IUser['id'];
  defendant: IUser;
  defendantRoleLabel: IUserRoleLabelsDefault;
  appellantId: IUser['id'];
  appellant: IUser;
  complaintFiles: IComplaintFile[];
  attachments: IAttachment[];
  notifications?: INotification[];
  unreadNotifications?: INotification[];
}

export interface IUserReview extends IDBEntity {
  receiverId: IUser['id'];
  receiver: IUser;
  authorId: IUser['id'];
  author: IUser;
  orderId: IOrderRequest['id'];
  rating: number;
  text?: string;
}

export type ISellerUpdateApplication = IDBEntity &
  IUser &
  IUserRequisites & {
    files: ISellerRegisterFile[];
    rejectionMessage: string;
    rejectedAt: string;
  };
