import { IAddress, IDBEntity } from 'interfaces/common.interfaces';
import { IServerFile } from 'interfaces/files.interfaces';
import { IUser } from '../Users/interfaces';
import { ITransportCompany } from 'sections/Shipping/interfaces';
import { INotification } from 'hooks/notifications.hooks/interfaces';

export interface IOrganization extends IDBEntity {
  confirmationDate?: string;
  bannedUntil?: string;
  priceBenefitPercent?: number;
  priceBenefitPercentAcquiring?: number;
  priceBenefitPercentInvoice?: number;
  hasNds: boolean;
  shopName: string;
  creatorUserId?: IUser['id'];
  creatorUser?: IUser;
  email: string;
  phone: string;
  directorFirstname: string;
  directorLastname: string;
  directorMiddlename: string;
  juristicAddressId: IAddress['id'];
  juristicAddress?: IAddress;
  actualAddressId: IAddress['id'];
  actualAddress?: IAddress;
  mailingAddressId: IAddress['id'];
  mailingAddress?: IAddress;
  entityCode: string;
  entityType: string;
  name?: string;
  fullName?: string;
  pureName?: string;
  inn: string;
  kpp: string;
  bik: string;
  ks: string;
  rs: string;
  ogrn: string;
  passportSeries?: string;
  passportNumber?: string;
  passportGiver?: string;
  passportGettingDate?: string;
  passportLocationUnitCode?: string;
  passportRegistrationAddress?: string;
  bankName: string;
  bankInn: string;
  bankBik: string;
  bankKs: string;
  bankRs: string;
  sellers?: IOrganizationSeller[];
  unconfirmedSellers?: IOrganizationSeller[];
  branches?: IOrganizationBranch[];
  mainBranch?: IOrganizationBranch;
  rejections?: IOrganizationRejection[];
  files?: IOrganizationFile[];
  status?: {
    label: string;
    name: string;
  };
  transportCompanies: { transportCompany: ITransportCompany }[];
  notifications?: INotification[];
  unreadNotifications?: INotification[];
  path?: string;
  updateApplications?: IOrganizationUpdateApplication[];
  isServiceOrganization?: boolean;
}

export interface IOrganizationBranch extends IDBEntity {
  organizationId: IOrganization['id'];
  organization?: IOrganization;
  actualAddressId: IAddress['id'];
  actualAddress: IAddress;
  confirmationDate?: string;
  creatorUserId?: IUser['id'];
  creatorUser?: IUser;
  isMain: boolean;
  kpp: string;
  bankName: string;
  bankInn: string;
  bankBik: string;
  bankKs: string;
  bankRs: string;
  sellers?: IOrganizationSeller[];
  current?: boolean;
}

export interface IOrganizationSeller extends IDBEntity {
  organizationId: IOrganization['id'];
  organization?: IOrganization;
  userId: IUser['id'];
  user?: IUser;
  branchId: IOrganizationBranch['id'];
  branch?: IOrganizationBranch;
  confirmationDate?: string;
  detachedAt?: string;
  rejections?: IOrganizationSellerRejection[];
}

export interface IOrganizationSellerRejection extends IDBEntity {
  organizationId: IOrganization['id'];
  organization?: IOrganization;
  organizationSellerId: IOrganizationSeller['id'];
  organizationSeller?: IOrganizationSeller;
  message: string;
  isResponded?: boolean;
}

export interface IOrganizationFile extends IDBEntity {
  organizationId: IOrganization['id'];
  organization?: IOrganization;
  fileId: IServerFile['id'];
  file?: IServerFile;
  label: string;
  name?: string;
}

export interface IOrganizationRejection extends IDBEntity {
  organizationId: IOrganization['id'];
  organization?: IOrganization;
  message: string;
  isResponded?: boolean;
}

export interface IOrganizationByInn {
  id?: string;
  isRegistered?: boolean;
  entityType?: number;
  inn: string;
  kpp: string;
  ogrn?: string;
  name?: string;
  pureName?: string;
  shopName?: string;
  priceBenefitPercent?: number;
  branches?: IOrganizationBranch[];
  directorFirstname?: string;
  directorLastname?: string;
  directorMiddlename?: string;
  juristicAddress?: IAddress;
  actualAddress?: IAddress;
  authUserIsBeingSeller?: boolean;
  isServiceOrganization?: boolean;
}

export type IOrganizationUpdateApplication = IDBEntity &
  IOrganization & {
    files: IOrganizationFile[];
    rejectionMessage: string;
    rejectedAt: string;
    user?: IUser;
    organizationId?: string;
  };
