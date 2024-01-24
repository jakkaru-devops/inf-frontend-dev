import { ChangeEvent, useEffect, useState } from 'react';
import { Form } from 'antd';
import { useRouter } from 'next/router';
import _ from 'lodash';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { REGISTER_SELLER_FILE_LIST } from './../../data';
import { deepenObject } from 'utils/object.utils';
import {
  deleteRegisterFile,
  fetchAuthUser,
  getExtendedFile,
  uploadRegisterFile,
} from 'sections/Auth/utils';
import parseDate from 'date-fns/parse';
import { ru as dateLocaleRu } from 'date-fns/locale';
import { useDispatch } from 'react-redux';
import { getOrgSellerFormData } from 'sections/Organizations/utils';
import { ISellerAutoBrand, IUser } from 'sections/Users/interfaces';
import { IRegisterFileExtended } from 'sections/Auth/interfaces';
import { useLocale } from 'hooks/locale.hook';
import { generateUrl, openNotification } from 'utils/common.utils';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';
import { useAuth } from 'hooks/auth.hook';
import { setAuth } from 'store/reducers/auth.reducer';

interface IProps {
  user?: IUser;
}

const useHandlers = ({ user }: IProps) => {
  const auth = useAuth();
  const dispatch = useDispatch();
  const { locale } = useLocale();
  const router = useRouter();
  const [form] = Form.useForm();

  const [fileList, setFileList] = useState({
    user: !!user.requisites
      ? REGISTER_SELLER_FILE_LIST.map(localFile => {
          const file = user.sellerRegisterFiles.find(
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
        })
      : REGISTER_SELLER_FILE_LIST.map(file => getExtendedFile(file)),
  });
  const [categorySelectionVisible, setCategorySelectionVisible] =
    useState(false);

  const [selectedAutoBrands, setSelectedAutoBrands] = useState<
    ISellerAutoBrand[]
  >(user?.sellerAutoBrands || []);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

  const [state, setState] = useState({
    ...getOrgSellerFormData(user),
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

  const resetCategories = () => {
    setSelectedAutoBrands([]);
    setSelectedGroupIds([]);
  };

  /**
   * Send register request to API
   */
  const handleFormSubmit = async (values: any) => {
    let data = null;
    data = deepenObject(values);

    if (!selectedAutoBrands.length && !selectedGroupIds.length) {
      openNotification('Необходимо выбрать категории товаров');
      setCategorySelectionVisible(true);
      return;
    }

    // Seller user id
    data.user.id = auth.user.id;

    // Add product categories to request body
    data.user.sellerAutoBrands = selectedAutoBrands;
    data.user.sellerProductGroups = selectedGroupIds.map(id => ({ id }));

    // Add seller's files to request body
    data.user.sellerRegisterFiles = fileList?.user?.filter(
      regFile => !!regFile.file,
    );

    // Passport getting date
    if (!!data?.user?.requisites?.passportGettingDate) {
      data.user.requisites.passportGettingDate = parseDate(
        data?.user?.requisites?.passportGettingDate,
        'P',
        new Date(),
        { locale: dateLocaleRu },
      );
    }

    // Request
    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.HANDLE_SELLER_REGISTER,
      data,
      requireAuth: true,
    });
    if (!res.isSucceed) {
      openNotification(res.message);
      return;
    }

    // Auth
    const authData = await fetchAuthUser(auth);
    dispatch(setAuth(authData));

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
  };

  return {
    locale,
    auth,
    router,
    form,
    fileList,
    setFileList,
    categorySelectionVisible,
    setCategorySelectionVisible,
    selectedAutoBrands,
    setSelectedAutoBrands,
    selectedGroupIds,
    setSelectedGroupIds,
    resetCategories,
    uploadFile,
    deleteFile,
    handleFormSubmit,
    state,
    setState,
  };
};

export default useHandlers;
