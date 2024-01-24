import { Form } from 'antd';
import _ from 'lodash';
import { API_ENDPOINTS } from 'data/paths.data';
import {
  IOrganization,
  IOrganizationSeller,
} from 'sections/Organizations/interfaces';
import { ChangeEvent, useState } from 'react';
import { openNotification, validateAddress } from 'utils/common.utils';
import {
  getOrgFormData,
  getOrgSellerFormData,
} from 'sections/Organizations/utils';
import { APIRequest } from 'utils/api.utils';
import { useRouter } from 'next/router';
import { deepenObject } from 'utils/object.utils';
import { REGISTER_SELLER_FILE_LIST } from 'sections/Auth/data';
import { IRegisterFileExtended } from 'sections/Auth/interfaces';
import { deleteRegisterFile, uploadRegisterFile } from 'sections/Auth/utils';
import { REGISTER_ORG_FILE_LIST } from 'sections/Organizations/data';
import { IAuthState } from 'store/reducers/auth.reducer';

interface IProps {
  orgSeller: IOrganizationSeller;
  organization: IOrganization;
  auth: IAuthState;
}

export const useHandlers = ({ orgSeller, organization, auth }: IProps) => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [state, setState] = useState({
    ...getOrgSellerFormData(orgSeller.user),
    ...getOrgFormData(organization),
    'org.formEnabled': true,
    'org.offerForSuppliers': true,
    'org.supplyAgreementRules': true,
  });
  const [branchOffices, setBranchOffices] = useState({
    list: organization.branches
      .filter(el => !el.isMain)
      .map(el => ({
        id: el.id,
        organizationId: el.organizationId,
        actualAddressId: el.actualAddressId,
        actualAddress: el.actualAddress,
        isMain: el.isMain,
        kpp: el.kpp,
        bankName: el.bankName,
        bankInn: el.bankInn,
        bankBik: el.bankBik,
        bankKs: el.bankKs,
        bankRs: el.bankRs,
      })),
    index: 0,
  });
  const [fileList, setFileList] = useState({
    personal: orgSeller.user
      ? REGISTER_SELLER_FILE_LIST.map(localFile => {
          const file = orgSeller.user.sellerRegisterFiles.find(
            el => el.label === localFile.label,
          );
          return {
            label: localFile.label,
            name: localFile.name,
            localFile: file ? (file.file as any) : null,
            file: file ? file.file : null,
            entityTypes: localFile.entityTypes,
            type: localFile.type,
            path: localFile.path,
            checked: localFile.type === 'check',
            disabled: localFile.type === 'check',
          } as IRegisterFileExtended;
        })
      : [],
    org: REGISTER_ORG_FILE_LIST.map(localFile => {
      const file = organization.files.find(el => el.label === localFile.label);
      return {
        label: localFile.label,
        name: localFile.name,
        localFile: file ? (file.file as any) : null,
        file: file ? file.file : null,
        entityTypes: localFile.entityTypes,
        type: localFile.type,
        path: localFile.path,
        checked: localFile.type === 'check',
        disabled: localFile.type === 'check',
      } as IRegisterFileExtended;
    }),
  });

  const uploadFile = async (
    e: ChangeEvent<HTMLInputElement>,
    type: 'user' | 'org',
    label: string,
  ) => {
    uploadRegisterFile({
      e,
      type,
      label,
      fileList,
      setFileList,
    });
  };

  const deleteFile = async (type: 'user' | 'org', label: string) => {
    deleteRegisterFile({
      type,
      label,
      fileList,
      setFileList,
    });
  };

  /**
   * Send register request to API
   */
  const handleFormSubmit = async (values: any) => {
    const data: any = deepenObject(values);

    if (data.org) {
      // Validate if organizaiton branch offices are filled correctly
      for (const branchOffice of branchOffices.list) {
        if (!validateAddress(branchOffice.actualAddress)) {
          openNotification('Не все адреса филлиалов корректно заполнены');
          return;
        }
      }

      // Add organization data to request body
      data.org.id = organization.id;
      data.org.isRegistered = state['org.isRegistered'];
      data.org.branches = branchOffices.list;
      data.org.selectedBranchOfficeIndex = branchOffices.index;
      data.org.files = fileList.org
        .filter(orgFile => !!orgFile && orgFile.file)
        .filter(
          orgFile =>
            !orgFile.entityTypes ||
            (orgFile.entityTypes.includes('REST') &&
              values['org.entityType'] !== 'ИП') ||
            (orgFile.entityTypes.includes('ИП') &&
              values['org.entityType'] === 'ИП'),
        );

      data.org.branches.push({
        ...organization.branches.find(el => el.isMain),
        actualAddress: data.org.actualAddress,
      });
    }

    data.organizationId = orgSeller.organizationId || organization.id;
    data.orgSellerId = orgSeller.id;

    // Specify request status
    data.status = 'correct';

    const res = await APIRequest({
      method: 'put',
      url: API_ENDPOINTS.ORGANIZATION,
      data,
      requireAuth: true,
    });
    if (!res.isSucceed) {
      openNotification(res.message);
      return;
    }

    router.reload();
  };

  return {
    router,
    form,
    state,
    setState,
    branchOffices,
    setBranchOffices,
    fileList,
    setFileList,
    uploadFile,
    deleteFile,
    handleFormSubmit,
  };
};
