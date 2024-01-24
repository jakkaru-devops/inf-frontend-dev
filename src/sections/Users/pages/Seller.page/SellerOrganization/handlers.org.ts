import { Form } from 'antd';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { IOrganization } from 'sections/Organizations/interfaces';
import { ChangeEvent, useState } from 'react';
import {
  generateInnerUrl,
  openNotification,
  validateAddress,
} from 'utils/common.utils';
import { getOrgFormData } from 'sections/Organizations/utils';
import { APIRequest } from 'utils/api.utils';
import { useRouter } from 'next/router';
import { deepenObject } from 'utils/object.utils';
import { REGISTER_ORG_FILE_LIST } from 'sections/Organizations/data';
import { IRegisterFileExtended } from 'sections/Auth/interfaces';
import { deleteRegisterFile, uploadRegisterFile } from 'sections/Auth/utils';

interface IProps {
  organization: IOrganization;
}

export const useHandlers = ({ organization }: IProps) => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [state, setState] = useState({
    // ...getOrgSellerFormData(organization.sellers.find(el => el.userId === organization.creatorUser.id)),
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
        checked: localFile.type === 'check',
        disabled: localFile.type === 'check',
      } as IRegisterFileExtended;
    }),
  });
  const [rejectionData, setRejectionData] = useState({
    seller: false,
    sellerMessage: '',
    org: false,
    orgMessage: '',
    modalVisible: false,
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

    if (!state['org.formEnabled']) {
      openNotification('Необходимо заполнить данные компании');
      return;
    }

    for (const branchOffice of branchOffices.list) {
      if (!validateAddress(branchOffice.actualAddress)) {
        openNotification('Не все адреса филлиалов корректно заполнены');
        return;
      }
    }

    data.org.branches = branchOffices.list;
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

    console.log(data);

    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.CONFIRM_ORGANIZATION,
      params: {
        id: organization.id,
      },
      data,
      requireAuth: true,
    });
    console.log(res);
    if (!res.isSucceed) {
      openNotification(res.message);
      return;
    }

    if (organization.sellers.length > 0 && !organization.confirmationDate) {
      router.push(
        generateInnerUrl(APP_PATHS.USER_SETTINGS, {
          searchParams: {
            history: ['personal-area', 'settings'],
            tab: 'organizations',
          },
        }),
      );
    }
  };

  const handleReject = async () => {
    let data = {
      rejection: {} as any,
    };

    if (rejectionData.seller) {
      data.rejection.organizationSellerId =
        organization.creatorUser.sellers[0].id;
      data.rejection.sellerMessage = rejectionData.sellerMessage;
      if (
        !rejectionData.sellerMessage ||
        rejectionData.sellerMessage.trim().length <= 0
      ) {
        openNotification('Требуется указать причину отказа для продавца');
        return;
      }
    }
    if (rejectionData.org) {
      data.rejection.organizationId = organization.id;
      data.rejection.orgMessage = rejectionData.orgMessage;
      if (
        !rejectionData.orgMessage ||
        rejectionData.orgMessage.trim().length <= 0
      ) {
        openNotification('Требуется указать причину отказа для организации');
        return;
      }
    }

    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.REJECT_ORGANIZATION,
      params: {
        id: organization.id,
      },
      data,
      requireAuth: true,
    });
    console.log(res);
    if (!res.isSucceed) return;
    openNotification('Заявка на регистрацию отклонена');
    setRejectionData({
      ...rejectionData,
      org: false,
      orgMessage: '',
      seller: false,
      sellerMessage: '',
      modalVisible: false,
    });
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
    handleReject,
    rejectionData,
    setRejectionData,
  };
};
