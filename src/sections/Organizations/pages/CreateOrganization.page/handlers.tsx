import { ChangeEvent, useState } from 'react';
import { Form } from 'antd';
import _ from 'lodash';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { IOrganizationBranch } from 'sections/Organizations/interfaces';
import {
  generateUrl,
  getInitialAddress,
  openNotification,
  validateAddress,
  validateAddressFiasId,
} from 'utils/common.utils';
import {
  deleteRegisterFile,
  getExtendedFile,
  uploadRegisterFile,
} from 'sections/Auth/utils';
import { REGISTER_ORG_FILE_LIST } from 'sections/Organizations/data';
import { deepenObject } from 'utils/object.utils';
import { useRouter } from 'next/router';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';

export const useHandlers = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [state, setState] = useState({
    'org.formEnabled': false,
    'org.notFound': false,
  });
  const [fileList, setFileList] = useState({
    org: REGISTER_ORG_FILE_LIST.map(file => getExtendedFile(file)),
  });
  const [branches, setBranches] = useState({
    list: [
      {
        organizationId: null,
        actualAddressId: null,
        actualAddress: getInitialAddress(),
        isMain: true,
      },
    ] as IOrganizationBranch[],
    index: 0,
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

  const handleFormSubmit = async (values: any) => {
    let data = deepenObject(values);
    const stateData = deepenObject(state);

    data.org.actualAddress = {
      ...stateData.org.actualAddress,
      ...data.org.actualAddress,
    };
    data.org.juristicAddress = {
      ...stateData.org.juristicAddress,
      ...data.org.juristicAddress,
    };
    data.org.mailingAddress = {
      ...stateData.org.mailingAddress,
      ...data.org.mailingAddress,
    };

    const isItemsSelected = state['org.isRegistered']
      ? !!validateAddressFiasId(data.org.actualAddress)
      : !!validateAddressFiasId(data.org.actualAddress) &&
        !!validateAddressFiasId(data.org.juristicAddress) &&
        !!validateAddressFiasId(data.org.mailingAddress);

    // Validate if org branches are filled correctly
    for (const branch of branches.list) {
      if (!validateAddress(branch.actualAddress)) {
        openNotification('Не все адреса филлиалов корректно заполнены');
        return;
      }
    }

    // Validate if user selected address from suggestions
    if (!isItemsSelected) {
      openNotification(
        'Пожалуйста, выберите подходящий адрес из всплывающих подсказок',
      );
      return;
    }

    // Add organization data to request body
    data.org.id = state['org.id'];
    data.org.isRegistered = state['org.isRegistered'];
    data.org.entityCode = stateData.org.entityCode || data.org.entityCode;
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

    // Create organization
    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.ORGANIZATION,
      data,
      requireAuth: true,
    });
    if (!res.isSucceed) {
      openNotification(res.message);
      return;
    }

    openNotification(res?.data?.message || 'Организация зарегистрирована');
    const org = res.data.org;
    router.push(
      generateUrl(
        { history: DEFAULT_NAV_PATHS.ORGANIZATION(org.id, org.name) },
        {
          pathname: APP_PATHS.ORGANIZATION(org.id),
        },
      ),
    );
  };

  return {
    form,
    state,
    setState,
    branches,
    setBranches,
    fileList,
    uploadFile,
    deleteFile,
    handleFormSubmit,
  };
};
