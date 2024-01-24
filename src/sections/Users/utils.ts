import { formatPhoneNumber } from 'utils/common.utils';
import { EMPLOYEE_ROLES } from './data';
import {
  ISellerUpdateApplication,
  IUser,
  IUserRoleLabelsDefault,
  IUserRoleOption,
} from './interfaces';
import parseDate from 'date-fns/parse';
import { ru as dateLocaleRu } from 'date-fns/locale';
import formatDate from 'date-fns/format';
import { flattenObject } from 'utils/object.utils';

export function getUserName(
  user: IUser,
  format?: 'full' | 'fl' | 'lf' | 'firstname' | 'lastname',
  strict?: boolean,
) {
  format = format || 'full';

  if (!!user?.firstname && !!user?.lastname) {
    switch (format) {
      case 'full':
        return `${user.lastname} ${user.firstname}${
          !!user.middlename ? ` ${user.middlename}` : ''
        }`;
      case 'fl':
        return `${user.firstname} ${user.lastname}`;
      case 'lf':
        return `${user.lastname} ${user.firstname}`;
      case 'firstname':
        return `${user.firstname}`;
      case 'lastname':
        return `${user.lastname}`;
      default:
        return 'Имя не определено';
    }
  } else {
    if (!strict && user?.phone) {
      return user?.phone !== 'hidden'
        ? formatPhoneNumber(user.phone)
        : `Покупатель №${user.idInt}`;
    } else return null;
  }
}

export const isUserBanned = (user: IUser, roleId: string) => {
  const userRole = user.roles.find(el => el.id === roleId);

  if (
    userRole?.bannedUntil !== null &&
    new Date(userRole.bannedUntil).getTime() > new Date().getTime()
  )
    return true;

  return false;
};

export const isUserRequestsBanned = (user: IUser, roleId: string) => {
  const userRole = user.roles.find(el => el.id === roleId);

  if (
    userRole?.requestsBannedUntil !== null &&
    new Date(userRole.requestsBannedUntil).getTime() > new Date().getTime()
  )
    return true;

  return false;
};

/**
 * @desc Get list of non banned role labels of a worker.
 * Return full list of worker role labels if a user himself is banned
 */
export const getWorkerAvailableRoles = (user: IUser) => {
  const workerRoles = user.roles.filter(
    role => !!EMPLOYEE_ROLES.find(roleLabel => roleLabel === role.label),
  );
  if (!!user.bannedUntil) {
    return workerRoles.map(role => role.label);
  }
  const nonBannedRoles = workerRoles.filter(role => !role.bannedUntil);
  if (nonBannedRoles.length === 0) {
    return workerRoles.map(role => role.label);
  }
  return nonBannedRoles.map(role => role.label);
};

export const getSellerUpdateApplicationFormData = (
  application: ISellerUpdateApplication,
) => {
  if (!application) return null;

  const parsedDate = !!application.passportGettingDate
    ? parseDate(application.passportGettingDate, 'yyyy-MM-dd', new Date(), {
        locale: dateLocaleRu,
      })
    : null;

  const data: IUser = {
    phone: application.phone,
    email: application.email,
    firstname: application.firstname,
    lastname: application.lastname,
    middlename: application.middlename,
    addressId: application.addressId,
    address: application.address,
    isAgreeEmailNotification: application.isAgreeEmailNotification,
    emailNotification: application.emailNotification,
    sellerRegisterFiles: (application.files || []).map(regFile => ({
      id: regFile.id,
      idInt: regFile.idInt,
      userId: application.userId,
      fileId: regFile.fileId,
      file: regFile.file,
      label: regFile.label,
      createdAt: regFile.createdAt,
      updatedAt: regFile.updatedAt,
    })),
    requisites: {
      userId: application.userId,
      passportSeries: application.passportSeries,
      passportNumber: application.passportNumber,
      passportGiver: application.passportGiver,
      passportGettingDate: !!parsedDate
        ? formatDate(parsedDate, 'dd.MM.yyyy')
        : null,
      passportLocationUnitCode: application.passportLocationUnitCode,
      passportRegistrationAddress: application.passportRegistrationAddress,
      inn: application.inn,
      snils: application.snils,
      bankName: application.bankName,
      bankInn: application.bankInn,
      bankBik: application.bankBik,
      bankKs: application.bankKs,
      bankRs: application.bankRs,
    },
  };

  return flattenObject({
    user: data,
    'user.personalDataProcessing': false,
    'user.agencyContract': false,
  });
};

export const isManager = (userRole: IUserRoleOption) =>
  (['manager', 'operator'] as IUserRoleLabelsDefault[]).includes(
    userRole?.label,
  );
