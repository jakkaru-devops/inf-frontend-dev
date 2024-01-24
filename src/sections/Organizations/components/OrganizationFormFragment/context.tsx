import { FC, createContext, useState } from 'react';
import { API_ENDPOINTS } from 'data/paths.data';
import {
  IOrganizationBranch,
  IOrganizationByInn,
} from 'sections/Organizations/interfaces';
import { getInitialAddress } from 'utils/common.utils';
import { flattenObject } from 'utils/object.utils';
import { APIRequest } from 'utils/api.utils';
import { getOrgFormDataByInn } from 'sections/Organizations/utils';
import { IOrgFormGragmentProps } from './interfaces';
import { useLocale } from 'hooks/locale.hook';
import { IAddress } from 'interfaces/common.interfaces';
import { IRegisterFileExtended } from 'sections/Auth/interfaces';
import { useAuth } from 'hooks/auth.hook';
import { IAuthState } from 'store/reducers/auth.reducer';

export const OrgFormFragmentContext = createContext<{
  auth: IAuthState;
  locale: any;
  loading: boolean;
  form: IOrgFormGragmentProps['form'];
  state: IOrgFormGragmentProps['state'];
  setState: IOrgFormGragmentProps['setState'];
  comparedData: any;
  comparedJuristicAddress: IAddress;
  comparedMailingAddress: IAddress;
  comparedActualAddress: IAddress;
  comparedFileList: IRegisterFileExtended[];
  branches: IOrgFormGragmentProps['branches'];
  setBranches: IOrgFormGragmentProps['setBranches'];
  fileList: IOrgFormGragmentProps['fileList'];
  uploadFile: IOrgFormGragmentProps['uploadFile'];
  deleteFile: IOrgFormGragmentProps['deleteFile'];
  handleOrgInnChange: (value: string) => void;
  handleOrgAddressFiasId: (target: string, fiasId: string) => void;
  searchByInnEnabled: boolean;
  addBranchOffice: () => void;
  changeOrgBranch: (value: IOrganizationBranch) => void;
  setCurrentBranchOfficeIndex: (i: number) => void;
  deleteBranchOffice: (i: number) => void;
  uploadAllFiles: boolean;
  branchPermissions: {
    addItem: boolean;
    editValues: boolean;
    deleteItem: boolean;
    markAsMain: boolean;
    selectNoBranchOffice: boolean;
    switchActiveItem: boolean;
  };
}>(null);

const OrgFormFragmentContextProvider: FC<IOrgFormGragmentProps> = ({
  branches,
  setBranches,
  form,
  state,
  setState,
  comparedData,
  comparedJuristicAddress,
  comparedMailingAddress,
  comparedActualAddress,
  comparedFileList,
  fileList,
  uploadFile,
  deleteFile,
  searchByInnEnabled,
  uploadAllFiles,
  children,
}) => {
  const auth = useAuth();
  const { locale } = useLocale();
  const [loading, setLoading] = useState(false);

  const branchPermissions = {
    addItem:
      ['manager', 'operator'].includes(auth?.currentRole?.label) ||
      (auth?.currentRole?.label === 'seller' &&
        branches.list.filter(el => !el.id).length < 1),
    editValues:
      branches.list.length > 0 &&
      (['manager', 'operator'].includes(auth?.currentRole?.label) ||
        (auth?.currentRole?.label === 'seller' &&
          branches.list[branches.index] &&
          branches.list[branches.index].creatorUserId === auth.user.id &&
          !branches.list[branches.index].confirmationDate)),
    deleteItem:
      branches.index !== -1 &&
      branches.list.length > 0 &&
      (['manager', 'operator'].includes(auth?.currentRole?.label) ||
        (auth?.currentRole?.label === 'seller' &&
          branches.list[branches.index] &&
          branches.list[branches.index].creatorUserId === auth.user.id &&
          !branches.list[branches.index].confirmationDate)),
    markAsMain: ['manager', 'operator'].includes(auth?.currentRole?.label),
    selectNoBranchOffice:
      auth?.currentRole?.label === 'seller' &&
      branches.list.length > 0 &&
      branches.list.filter(el => !el.id).length === 0,
    switchActiveItem: true,
    // switchActiveItem: !(
    // 	auth.user.role === USER_ROLES.seller && branches.list.filter(el => !el.id).length > 0
    // )
  };

  /**
   * Handle organization inn input change
   */
  const handleOrgInnChange = (value: string) => {
    const newState = state;
    newState['org.inn'] = value;

    if (!searchByInnEnabled) {
      setState({ ...newState });
      return;
    }

    if (!value || value.length < 10) {
      newState['org.formEnabled'] = false;
      newState['org.isRegistered'] = false;
    }
    if (value.length > 12) {
      form.setFields([{ name: 'org.inn', value }]);
      newState['org.isRegistered'] = false;
    }
    if ([10, 12].includes(value.length)) {
      searchByInn(value);
      newState['org.formEnabled'] = true;
    } else {
      newState['org.isRegistered'] = false;
    }

    setState({ ...newState });
  };

  const handleOrgAddressFiasId = (target: string, fiasId: string) => {
    const newState = state;
    newState[`${target}FiasId`] = fiasId;
    setState({ ...newState });
    return;
  };

  /**
   * Fetch organization data by its INN and set it to form
   */
  const searchByInn = async (value: string) => {
    setLoading(true);

    const res = await APIRequest({
      method: 'get',
      url: API_ENDPOINTS.ORGANIZATION_BY_INN,
      params: {
        search: value,
        type: 'organization',
      },
      requireAuth: true,
    });

    setLoading(false);

    // Values to set to the organizaiton
    let values: any = {};

    // If organization is found whether it is registered or not
    if (res.isSucceed) {
      const org: IOrganizationByInn = res.data;

      values = {
        ...getOrgFormDataByInn(org),
        notFound: false,
        authUserIsBeingSeller: org.authUserIsBeingSeller,
      };

      // If organization is not registered
      if (!org.isRegistered) {
        setBranches({
          index: -1,
          list: [],
        });
      }
      // If organization is registered
      if (org.isRegistered && org.branches && org.branches.length > 0) {
        const filteredbranches = org.branches.filter(el => !el.isMain);
        values.branchAddress =
          filteredbranches.length > 0
            ? filteredbranches[0].actualAddress || getInitialAddress()
            : getInitialAddress();
        setBranches({
          index: -1,
          list: filteredbranches,
        });
      }
      // If organization is not found in any way
    } else {
      values = {
        notFound: true,
        id: null,
        isRegistered: false,
        entityType: value.length === 12 ? 'ИП' : 'ООО',
        kpp: '',
        ogrn: '',
        shopName: '',
        priceBenefitPercent: null,
        priceBenefitPercentAcquiring: null,
        priceBenefitPercentInvoice: null,
        name: '',
        directorFirstname: '',
        directorLastname: '',
        directorMiddlename: '',
        juristicAddress: getInitialAddress(),
        actualAddress: getInitialAddress(),
        mailingAddress: getInitialAddress(),
        authUserIsBeingSeller: false,
        formEnabled: true,
        isServiceOrganization: false,
      };

      setBranches({
        index: -1,
        list: [],
      });
    }

    console.log(values);
    form.setFieldsValue(
      flattenObject({
        org: values,
      }),
    );
    setState({
      ...state,
      ...flattenObject({
        org: values,
      }),
    });
  };

  const addBranchOffice = () => {
    const newBranchOffice: IOrganizationBranch = {
      organizationId: null,
      actualAddressId: null,
      actualAddress: getInitialAddress(),
      isMain: false,
      creatorUserId: auth.user.id,
      kpp: null,
      bankName: null,
      bankInn: null,
      bankBik: null,
      bankKs: null,
      bankRs: null,
    };
    setBranches({
      ...branches,
      list: branches.list.concat(newBranchOffice),
      index: branches.list.length,
    });

    form.setFieldsValue({
      'org.branchAddress.country': newBranchOffice.actualAddress.country,
      'org.branchAddress.settlement': newBranchOffice.actualAddress.settlement,
      'org.branchAddress.street': newBranchOffice.actualAddress.street,
      'org.branchAddress.building': newBranchOffice.actualAddress.building,
      'org.branchAddress.apartment': newBranchOffice.actualAddress.apartment,
      'org.branchAddress.postcode': newBranchOffice.actualAddress.postcode,
      'org.branchKpp': newBranchOffice.kpp,
      'org.branchBankName': newBranchOffice.bankName,
      'org.branchBankInn': newBranchOffice.bankInn,
      'org.branchBankBik': newBranchOffice.bankBik,
      'org.branchBankKs': newBranchOffice.bankKs,
      'org.branchBankRs': newBranchOffice.bankRs,
    });
  };

  const changeOrgBranch = (value: IOrganizationBranch) => {
    const newBranchList = branches.list;
    newBranchList[branches.index] = value;
    setBranches({
      ...branches,
      list: newBranchList,
    });
  };

  const setCurrentBranchOfficeIndex = (i: number) => {
    if (!branchPermissions.switchActiveItem) return;
    setBranches({
      ...branches,
      index: i,
    });
    if (i === -1) {
      form.setFieldsValue({
        'org.branchAddress.country': '',
        'org.branchAddress.settlement': '',
        'org.branchAddress.street': '',
        'org.branchAddress.building': '',
        'org.branchAddress.apartment': '',
        'org.branchAddress.postcode': '',
        'org.branchKpp': '',
        'org.branchBankName': '',
        'org.branchBankInn': '',
        'org.branchBankBik': '',
        'org.branchBankKs': '',
        'org.branchBankRs': '',
      });
      return;
    }
    const currentBranchOffice = branches.list[i];
    form.setFieldsValue({
      'org.branchAddress.country': currentBranchOffice.actualAddress.country,
      'org.branchAddress.settlement':
        currentBranchOffice.actualAddress.settlement,
      'org.branchAddress.street': currentBranchOffice.actualAddress.street,
      'org.branchAddress.building': currentBranchOffice.actualAddress.building,
      'org.branchAddress.apartment':
        currentBranchOffice.actualAddress.apartment,
      'org.branchAddress.postcode': currentBranchOffice.actualAddress.postcode,
      'org.branchKpp': currentBranchOffice.kpp,
      'org.branchBankName': currentBranchOffice.bankName,
      'org.branchBankInn': currentBranchOffice.bankInn,
      'org.branchBankBik': currentBranchOffice.bankBik,
      'org.branchBankKs': currentBranchOffice.bankKs,
      'org.branchBankRs': currentBranchOffice.bankRs,
    });
  };

  const deleteBranchOffice = (i: number) => {
    let newCurrentIndex = i + 1;

    if (newCurrentIndex >= branches.list.length - 1) {
      newCurrentIndex = i - 1;
    }
    if (branches.list.length === 1) {
      newCurrentIndex = -1;
    }
    setCurrentBranchOfficeIndex(newCurrentIndex);

    const newBranchList = branches.list;
    newBranchList.splice(i, 1);
    setBranches({
      ...branches,
      list: newBranchList,
      index: newCurrentIndex,
    });
  };

  return (
    <OrgFormFragmentContext.Provider
      value={{
        auth,
        locale,
        loading,
        form,
        state,
        setState,
        comparedData,
        comparedJuristicAddress,
        comparedMailingAddress,
        comparedActualAddress,
        comparedFileList,
        branches,
        setBranches,
        fileList,
        uploadFile,
        deleteFile,
        branchPermissions,
        searchByInnEnabled,
        uploadAllFiles,
        handleOrgInnChange,
        handleOrgAddressFiasId,
        addBranchOffice,
        changeOrgBranch,
        setCurrentBranchOfficeIndex,
        deleteBranchOffice,
      }}
    >
      {children}
    </OrgFormFragmentContext.Provider>
  );
};

export default OrgFormFragmentContextProvider;
