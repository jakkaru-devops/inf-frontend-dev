import {
  IOrganization,
  IOrganizationByInn,
  IOrganizationUpdateApplication,
} from 'sections/Organizations/interfaces';
import { IUser } from 'sections/Users/interfaces';
import { getInitialAddress } from 'utils/common.utils';
import { flattenObject } from 'utils/object.utils';
import parseDate from 'date-fns/parse';
import { ru as dateLocaleRu } from 'date-fns/locale';
import formatDate from 'date-fns/format';

/**
 * @desc Returns organization data as flatten object to paste it to form
 */
export const getOrgFormData = (org: IOrganization, main = false) => {
  let orgData: any = {
    isRegistered: !!org,
    formEnabled: !!org,
    offerForSuppliers: !!org,
    supplyAgreementRules: !!org,
  };
  if (!!org) {
    const filteredBranches = main
      ? org.branches
      : org.branches.filter(el => !el.isMain);

    orgData = {
      ...orgData,
      ...org,
      name: org?.pureName || org?.name,
      entityType: org.entityType,
      juristicAddress: org.juristicAddress || getInitialAddress(),
      actualAddress: org.actualAddress || getInitialAddress(),
      mailingAddress: org.mailingAddress || getInitialAddress(),
      branchAddress:
        filteredBranches.length > 0
          ? filteredBranches[0].actualAddress || getInitialAddress()
          : getInitialAddress(),
      branchKpp: filteredBranches.length > 0 ? filteredBranches[0].kpp : null,
      branchBankName:
        filteredBranches.length > 0 ? filteredBranches[0].bankName : null,
      branchBankInn:
        filteredBranches.length > 0 ? filteredBranches[0].bankInn : null,
      branchBankBik:
        filteredBranches.length > 0 ? filteredBranches[0].bankBik : null,
      branchBankKs:
        filteredBranches.length > 0 ? filteredBranches[0].bankKs : null,
      branchBankRs:
        filteredBranches.length > 0 ? filteredBranches[0].bankRs : null,
    };
  }

  return flattenObject({
    org: orgData,
  });
};

/**
 * @desc Returns organization data as flatten object to paste it to form
 */
export const getOrgFormDataByInn = (org: IOrganizationByInn) => {
  const data = {
    ...org,
    name: org?.pureName || org?.name,
    formEnabled: true,
    juristicAddress: org.juristicAddress || getInitialAddress(),
    actualAddress: org.actualAddress || getInitialAddress(),
    mailingAddress: org.actualAddress || getInitialAddress(),
  };

  return data;
};

/**
 * @desc Returns seller data as flatten object to paste it to form
 */
export const getOrgSellerFormData = (user: IUser) => {
  const isApplicationSent = !!user?.sellers?.length;
  const parsedPassportGettingDate = !!user?.requisites?.passportGettingDate
    ? parseDate(user.requisites.passportGettingDate, 'yyyy-MM-dd', new Date(), {
        locale: dateLocaleRu,
      })
    : null;
  const data: IUser = {
    ...user,
    requisites: !!user?.requisites
      ? {
          ...user.requisites,
          passportGettingDate: !!parsedPassportGettingDate
            ? formatDate(parsedPassportGettingDate, 'dd.MM.yyyy')
            : null,
        }
      : undefined,
    address: !!user.address
      ? {
          country: user.address.country,
          region: user.address.region,
          regionFiasId: user.address.regionFiasId,
          area: user.address.area || undefined,
          areaFiasId: user.address.areaFiasId || undefined,
          city: user.address.city || undefined,
          cityFiasId: user.address.cityFiasId || undefined,
          settlement: user.address.settlement || undefined,
          settlementFiasId: user.address.settlementFiasId || undefined,
          street: user.address.street || undefined,
          building: user.address.building || undefined,
          apartment: user.address.apartment || undefined,
          postcode: user.address.postcode || undefined,
        }
      : getInitialAddress(),
  };
  return flattenObject({
    user: data,
    'personal.personalDataProcessing': isApplicationSent,
    'personal.agencyContract': isApplicationSent,
    'user.personalDataProcessing': isApplicationSent,
    'user.agencyContract': isApplicationSent,
  });
};

/**
 * @desc Returns organization data as flatten object to paste it to form
 */
export const getOrgUpdateApplicationFormData = (
  application: IOrganizationUpdateApplication,
) => {
  if (!application) return null;

  let data: any = {
    isRegistered: true,
    formEnabled: true,
    offerForSuppliers: true,
    supplyAgreementRules: true,
  };
  const filteredBranches = application.branches.filter(el => !el.isMain);
  data = {
    ...data,
    ...application,
    entityType: application.entityType,
    juristicAddress: application.juristicAddress || getInitialAddress(),
    actualAddress: application.actualAddress || getInitialAddress(),
    mailingAddress: application.mailingAddress || getInitialAddress(),
    branchAddress:
      filteredBranches.length > 0
        ? filteredBranches[0].actualAddress || getInitialAddress()
        : getInitialAddress(),
    branchKpp: filteredBranches.length > 0 ? filteredBranches[0].kpp : null,
    branchBankName:
      filteredBranches.length > 0 ? filteredBranches[0].bankName : null,
    branchBankInn:
      filteredBranches.length > 0 ? filteredBranches[0].bankInn : null,
    branchBankBik:
      filteredBranches.length > 0 ? filteredBranches[0].bankBik : null,
    branchBankKs:
      filteredBranches.length > 0 ? filteredBranches[0].bankKs : null,
    branchBankRs:
      filteredBranches.length > 0 ? filteredBranches[0].bankRs : null,
  };

  return flattenObject({
    org: data,
  });
};
