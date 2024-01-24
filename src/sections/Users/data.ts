import { IUser, IUserRolesAccessItem } from './interfaces';
import { IUserRoleLabelsDefault } from 'sections/Users/interfaces';

export const getInitialUser = (): IUser => ({
  id: null,
  phone: null,
  email: null,
  emailNotification: null,
  isAgreeEmailNotification: null,
  firstname: null,
  lastname: null,
  middlename: null,
  bannedUntil: null,
  avatar: null,
  phoneVerificationDate: null,
  emailVerificationDate: null,
  ratingValue: null,
  addressId: null,
  address: null,
  sellerConfirmationDate: null,
  requisites: null,
  deliveryAddresses: [],
  favoriteProducts: [],
  roles: [],
  createdAt: null,
  updatedAt: null,
  deletedAt: null,
});

export const getInitialUserName = () => ({
  lastname: null,
  firstname: null,
  middlename: null,
});

export const EMPLOYEE_ROLES: IUserRoleLabelsDefault[] = [
  'operator',
  'manager',
  'moderator',
];

export const CLIENT_ROLES: IUserRoleLabelsDefault[] = ['customer', 'seller'];
