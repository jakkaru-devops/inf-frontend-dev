import { Form } from 'antd';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { IOrganization } from 'sections/Organizations/interfaces';
import { ChangeEvent, useState } from 'react';
import { APIRequest } from 'utils/api.utils';
import { useRouter } from 'next/router';
import { REGISTER_ORG_FILE_LIST } from 'sections/Organizations/data';
import { IRegisterFileExtended } from 'sections/Auth/interfaces';
import { getOrgFormData } from 'sections/Organizations/utils';
import { generateInnerUrl, openNotification } from 'utils/common.utils';

interface IProps {
  organization: IOrganization;
}

export const useHandlers = ({ organization }: IProps) => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [state, setState] = useState({
    ...getOrgFormData(organization),
    'org.formEnabled': true,
    'org.offerForSuppliers': true,
    'org.supplyAgreementRules': true,
  });
  const [branchOffices, setBranchOffices] = useState({
    list: organization.branches.map(el => ({
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
    personal: [],
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
      } as IRegisterFileExtended;
    }),
  });

  const uploadFile = async (
    e: ChangeEvent<HTMLInputElement>,
    type: 'user' | 'org',
    label: string,
  ) => {};

  const removeFile = async (type: 'user' | 'org', label: string) => {};

  const banOrg = async () => {
    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.BAN_ORGANIZATION,
      data: {
        orgId: organization.id,
        isBanned: !organization.bannedUntil,
      },
      requireAuth: true,
    });
    if (!res.isSucceed) {
      return openNotification(res.message);
    }
    router.reload();
  };

  const deleteOrg = async () => {
    const res = await APIRequest({
      method: 'delete',
      url: API_ENDPOINTS.ORGANIZATION,
      data: {
        id: organization.id,
      },
      requireAuth: true,
    });
    if (!res.isSucceed) {
      return openNotification(res.message);
    }
    router.push(generateInnerUrl(APP_PATHS.ORGANIZATION_LIST));
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
    removeFile,
    banOrg,
    deleteOrg,
  };
};
