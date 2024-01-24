import { IAddress, IDBEntity } from 'interfaces/common.interfaces';
import { IServerFile } from 'interfaces/files.interfaces';
import { IUser } from 'sections/Users/interfaces';

export interface IJuristicSubject extends IDBEntity {
  userId: IUser['id'];
  user?: IUser;
  phone: string;
  email: string;
  directorFirstname: string;
  directorLastname: string;
  directorMiddlename: string;
  juristicAddressId: IAddress['id'];
  juristicAddress?: IAddress;
  mailingAddressId: IAddress['id'];
  mailingAddress?: IAddress;
  entityCode: string;
  entityType: string;
  name: string;
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
  hasNds: boolean;
  bankName: string;
  bankInn: string;
  bankBik: string;
  bankKs: string;
  bankRs: string;
  path?: string;
  isSpecialClient?: boolean;
  postponedPaymentAllowed?: boolean;
  customers: IUser[];
  customerContracts?: ICustomerContract[];
  isExpanded?: boolean;
}

export interface IJuristicSubjectByInn {
  id?: string;
  isRegistered?: boolean;
  entityType?: number;
  inn: string;
  kpp: string;
  ogrn?: string;
  name?: string;
  shopName?: string;
  directorFirstname?: string;
  directorLastname?: string;
  directorMiddlename?: string;
  juristicAddress?: IAddress;
  mailingAddress?: IAddress;
  bankName?: string;
  bankBik?: string;
  bankKs?: string;
  bankRs?: string;
}

export interface ICustomerContract extends IDBEntity {
  customerId?: IUser['id'];
  customer?: IUser;
  creatorUserId?: IUser['id'];
  juristicSubjectId: IJuristicSubject['id'];
  juristicSubject?: IJuristicSubject;
  fileId: IServerFile['id'];
  file?: IServerFile;
  name: string;
  number: string;
  date: string;
  directorFirstName: string;
  directorLastName: string;
  directorMiddleName: string;
  directorPost: string;
  basisName: string;
  signerIsDirector: boolean;
  signerFirstName: string;
  signerLastName: string;
  signerMiddleName: string;
  signerPost: string;
  valueChanged?: boolean;
  specifications?: ICustomerContractSpecification[];
}

export interface ICustomerContractSpecification extends IDBEntity {
  contractId: ICustomerContract['id'];
  contract?: ICustomerContract;
  fileId: IServerFile['id'];
  file: IServerFile;
  name: string;
}
