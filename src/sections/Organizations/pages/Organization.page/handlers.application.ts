import { Form } from 'antd';
import _ from 'lodash';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { IOrganization } from 'sections/Organizations/interfaces';
import { ChangeEvent, useEffect, useState } from 'react';
import { openNotification, validateAddress } from 'utils/common.utils';
import { getOrgFormData } from 'sections/Organizations/utils';
import { APIRequest } from 'utils/api.utils';
import { useRouter } from 'next/router';
import { deepenObject } from 'utils/object.utils';
import socketService from 'services/socket';
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
    ...getOrgFormData(organization),
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
  const [rejectionData, setRejectionData] = useState({
    message: '',
    modalVisible: false,
  });
  const orgRejectionAvailable =
    organization.rejections.filter(el => !el.isResponded).length <= 0;

  useEffect(() => {
    setTimeout(() => {
      socketService.socket
        .off('SERVER:SELLER_REGISTER_APPLICATION_REPEAT')
        .on('SERVER:SELLER_REGISTER_APPLICATION_REPEAT', data => {
          let message = `Повторная заявка на регистрацию продавца`;
          openNotification(message, {
            onClick: () => {
              router.push(
                APP_PATHS.ORGANIZATION_SELLER_APPLICATION(
                  data.organizationId,
                  data.orgSellerId,
                ),
              );
            },
          });
          setTimeout(() => {
            router.reload();
          }, 2000);
        });
    }, 10);
  }, []);

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
    data.org.entityCode = data.org.entityCode;
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
      url: API_ENDPOINTS.CONFIRM_ORGANIZATION,
      data,
      requireAuth: true,
    });
    if (!res.isSucceed) {
      openNotification(res.message);
      return;
    }

    if (
      !organization?.creatorUser?.sellerConfirmationDate &&
      !!organization?.creatorUser?.requisites
    ) {
      router.push(
        APP_PATHS.ORGANIZATION_SELLER_APPLICATION(
          organization.id,
          organization.creatorUser.id,
        ),
      );
    } else {
      router.reload();
    }
  };

  const handleReject = async () => {
    let data = {
      id: organization.id,
      message: rejectionData.message,
    };

    if (!data.message) {
      openNotification('Требуется указать причину отказа');
      return;
    }

    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.REJECT_ORGANIZATION,
      data,
      requireAuth: true,
    });
    if (!res.isSucceed) return;
    openNotification('Заявка на регистрацию отклонена');
    setRejectionData({
      message: '',
      modalVisible: false,
    });

    router.reload();
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
    handleFormSubmit,
    handleReject,
    rejectionData,
    setRejectionData,
    orgRejectionAvailable,
  };
};
