import { ChangeEvent, useState } from 'react';
import { Form } from 'antd';
import { useRouter } from 'next/router';
import _ from 'lodash';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import {
  generateInnerUrl,
  openNotification,
  validateAddress,
} from 'utils/common.utils';
import { deepenObject } from 'utils/object.utils';
import {
  ORGANIZATION_TYPES,
  REGISTER_ORG_FILE_LIST,
} from 'sections/Organizations/data';
import { deleteRegisterFile, uploadRegisterFile } from 'sections/Auth/utils';
import { IOrganization } from 'sections/Organizations/interfaces';
import { getOrgFormData } from 'sections/Organizations/utils';
import { IRegisterFileExtended } from 'sections/Auth/interfaces';
import { useLocale } from 'hooks/locale.hook';
import { useAuth } from 'hooks/auth.hook';

interface IProps {
  organization: IOrganization;
}

const useHandlers = ({ organization }: IProps) => {
  const auth = useAuth();
  const { locale } = useLocale();
  const router = useRouter();
  const [form] = Form.useForm();

  const [fileList, setFileList] = useState({
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
  const [branches, setBranches] = useState({
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
  const [state, setState] = useState({
    ...getOrgFormData(organization),
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
    let data = deepenObject(values);

    // Validate if org branches are filled correctly
    for (const branch of branches.list) {
      if (!validateAddress(branch.actualAddress)) {
        openNotification('Не все адреса филлиалов корректно заполнены');
        return;
      }
    }

    // Add organization data to request body
    data.org.id = state['org.id'];
    data.org.selectedBranch = branches.list[branches.index];
    data.org.entityCode =
      ORGANIZATION_TYPES?.[data?.org?.entityType] || data.org.entityCode;
    data.org.branches = branches.list;
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

    // Update organization application
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
    openNotification('Данные организации обновлены');
    router.push(
      generateInnerUrl(APP_PATHS.ORGANIZATION(organization.id), {
        text: organization.name,
      }),
    );
  };

  return {
    locale,
    auth,
    router,
    form,
    fileList,
    setFileList,
    branches,
    setBranches,
    state,
    setState,
    uploadFile,
    deleteFile,
    handleFormSubmit,
  };
};

export default useHandlers;
