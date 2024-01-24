import { Form } from 'antd';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { useRouter } from 'next/router';
import { ChangeEvent, useState } from 'react';
import { IRegisterFileExtended } from 'sections/Auth/interfaces';
import { uploadRegisterFile } from 'sections/Auth/utils';
import {
  ORGANIZATION_TYPES,
  REGISTER_ORG_FILE_LIST,
} from 'sections/Organizations/data';
import {
  IOrganization,
  IOrganizationUpdateApplication,
} from 'sections/Organizations/interfaces';
import { getOrgUpdateApplicationFormData } from 'sections/Organizations/utils';
import { APIRequest } from 'utils/api.utils';
import {
  generateInnerUrl,
  openNotification,
  validateAddress,
} from 'utils/common.utils';
import { deepenObject } from 'utils/object.utils';

interface IProps {
  organization: IOrganization;
  updateApplication: IOrganizationUpdateApplication;
}

export const useHandlers = ({ organization, updateApplication }: IProps) => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [state, setState] = useState({
    ...getOrgUpdateApplicationFormData(updateApplication),
    'org.formEnabled': true,
    'org.offerForSuppliers': true,
    'org.supplyAgreementRules': true,
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
  const [fileList, setFileList] = useState({
    org: REGISTER_ORG_FILE_LIST.map(localFile => {
      const file = updateApplication.files.find(
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
      } as IRegisterFileExtended;
    }),
  });
  const [rejection, setRejection] = useState({
    modalVisible: false,
    text: '',
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
    setFileList(prev => ({
      org: prev.org.map(orgFile => ({
        ...orgFile,
        localFile: orgFile.label === label ? null : orgFile.localFile,
        file: orgFile.label === label ? null : orgFile.file,
      })),
    }));
  };

  const handleFormSubmit = async (values: any) => {
    const data = deepenObject(values);

    // Validate if organizaiton branch offices are filled correctly
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

    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.CONFIRM_ORGANIZATION_UPDATE_APPLICATION(
        updateApplication.id,
      ),
      data: {
        organization: data.org,
      },
      requireAuth: true,
    });
    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }

    openNotification('Данные обновлены');
    router.push(
      generateInnerUrl(APP_PATHS.ORGANIZATION(organization.id), {
        text: organization.name,
      }),
    );
  };

  const handleReject = async () => {
    if (!rejection?.text?.trim()?.length) {
      openNotification('Необходимо указать причину отказа');
      return;
    }

    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.REJECT_ORGANIZATION_UPDATE_APPLICATION(
        updateApplication.id,
      ),
      data: {
        rejectionMessage: rejection.text,
      },
      requireAuth: true,
    });
    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }

    openNotification('Заявка на обновление данных продавца отклонена');
    setRejection({
      modalVisible: false,
      text: '',
    });
    router.push(
      generateInnerUrl(APP_PATHS.ORGANIZATION(organization.id), {
        text: organization.name,
      }),
    );
  };

  return {
    router,
    form,
    state,
    setState,
    branches,
    setBranches,
    fileList,
    setFileList,
    uploadFile,
    deleteFile,
    rejection,
    setRejection,
    handleFormSubmit,
    handleReject,
  };
};
