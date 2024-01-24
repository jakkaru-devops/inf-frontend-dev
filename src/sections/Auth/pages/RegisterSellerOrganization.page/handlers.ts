import { ChangeEvent, useState } from 'react';
import { Form } from 'antd';
import { useRouter } from 'next/router';
import _ from 'lodash';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import {
  generateUrl,
  openNotification,
  validateAddress,
  validateAddressFiasId,
} from 'utils/common.utils';
import { deepenObject } from 'utils/object.utils';
import {
  deleteRegisterFile,
  fetchAuthUser,
  getExtendedFile,
  uploadRegisterFile,
} from 'sections/Auth/utils';
import { IOrganization } from 'sections/Organizations/interfaces';
import { useDispatch } from 'react-redux';
import { getOrgFormData } from 'sections/Organizations/utils';
import { IRegisterFileExtended } from 'sections/Auth/interfaces';
import { useLocale } from 'hooks/locale.hook';
import { REGISTER_ORG_FILE_LIST } from 'sections/Organizations/data';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';
import { useAuth } from 'hooks/auth.hook';
import { setAuth } from 'store/reducers/auth.reducer';

interface IProps {
  org: IOrganization;
}

const useHandlers = ({ org }: IProps) => {
  const { locale } = useLocale();
  const auth = useAuth();
  const dispatch = useDispatch();

  const router = useRouter();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState({
    org: !!org
      ? REGISTER_ORG_FILE_LIST.map(localFile => {
          const file = org.files.find(el => el.label === localFile.label);
          return {
            label: localFile.label,
            name: localFile.name,
            localFile: file ? (file.file as any) : null,
            file: file ? file.file : null,
            entityTypes: localFile.entityTypes,
            type: localFile.type,
            path: localFile.path,
          } as IRegisterFileExtended;
        })
      : REGISTER_ORG_FILE_LIST.map(file => getExtendedFile(file)),
  });
  const [branches, setBranches] = useState({
    list: !!org
      ? org.branches
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
          }))
      : [],
    index: 0,
  });
  const [state, setState] = useState({
    ...getOrgFormData(org),
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

    console.log(data.org.actualAddress);

    const isItemsSelected = state['org.isRegistered']
      ? !!validateAddressFiasId(data.org.actualAddress)
      : !!validateAddressFiasId(data.org.actualAddress) &&
        !!validateAddressFiasId(data.org.juristicAddress) &&
        !!validateAddressFiasId(data.org.mailingAddress);

    // Validate if org branches are filled correctly
    for (const branch of branches.list) {
      if (
        !validateAddress(branch.actualAddress) ||
        !validateAddressFiasId(branch.actualAddress)
      ) {
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
    data.org.entityType = stateData.org.entityType || data.org.entityType;
    data.org.selectedBranch = branches.list[branches.index];
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

    // If user hasn't sent application to register org yet
    if (!org) {
      // Create seller for current user if org is already registered
      if (data.org.isRegistered) {
        // Request to API
        const res = await APIRequest({
          method: 'post',
          url: API_ENDPOINTS.ORGANIZATION_SELLER,
          data,
          requireAuth: true,
        });
        if (!res.isSucceed) {
          openNotification(res.message);
          return;
        }
        // Create organization if it is not registered yet
      } else {
        // Request to API
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
      }

      // Auth
      const authData = await fetchAuthUser(auth);
      dispatch(setAuth(authData));

      router.push(APP_PATHS.REGISTER_SELLER_COMPLETE);
    } else {
      // Update organization application
      const res = await APIRequest({
        method: 'put',
        url: API_ENDPOINTS.ORGANIZATION_APPLICATION,
        data,
        requireAuth: true,
      });
      if (!res.isSucceed) {
        openNotification(res.message);
        return;
      }
      openNotification('Повторная заявка отправлена');
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.ACCOUNT_REVIEW,
          },
          {
            pathname: APP_PATHS.ACCOUNT_REVIEW,
          },
        ),
      );
    }
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
