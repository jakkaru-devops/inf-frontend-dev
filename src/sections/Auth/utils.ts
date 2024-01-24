import { API_ENDPOINTS } from 'data/paths.data';
import { IServerFile } from 'interfaces/files.interfaces';
import { ChangeEvent, Dispatch, SetStateAction } from 'react';
import { APIRequest } from 'utils/api.utils';
import { IRegisterFile, IRegisterFileExtended } from './interfaces';
import { IAuthState } from 'store/reducers/auth.reducer';

export const fetchAuthUser = async (
  authState: IAuthState,
  roleId?: string,
): Promise<IAuthState> => {
  const headers = !!roleId ? { 'user-role': roleId } : {};
  const res = await APIRequest({
    method: 'get',
    url: API_ENDPOINTS.AUTH_USER_PROFILE,
    headers,
    requireAuth: true,
  });
  const isAuthenticated = res.isSucceed;
  if (isAuthenticated) {
    const currentRole = res.data.currentRole;

    return {
      ...authState,
      user: res.data.user,
      currentRole,
      isAuthenticated,
      isLoaded: true,
      hideSellerRewards: !!res.data?.hideSellerRewards,
      sellerRegisterSimplified: !!res.data?.sellerRegisterSimplified,
    };
  } else {
    return {
      ...authState,
      isLoaded: true,
    };
  }
};

export const getExtendedFile = (file: IRegisterFile): IRegisterFileExtended => {
  return {
    name: file.name,
    label: file.label,
    entityTypes: file.entityTypes,
    localFile: null,
    file: null,
    type: file.type,
    path: file.path,
  };
};

export const uploadRegisterFile = async (params: {
  e: ChangeEvent<HTMLInputElement>;
  label: string;
  type: string;
  fileList: { [key: string]: IRegisterFileExtended[] };
  setFileList: Dispatch<
    SetStateAction<{ [key: string]: IRegisterFileExtended[] }>
  >;
}) => {
  const { e, label, type, fileList, setFileList } = params;
  const file = e.target.files[0];
  const formData = new FormData();
  formData.append('file', file);
  formData.append('filename', file.name);

  const res = await APIRequest({
    method: 'post',
    url: API_ENDPOINTS.FILE_UNKNOWN,
    data: formData,
  });
  if (!res.isSucceed) return;
  const uploadedFile: IServerFile = res.data.result;
  const newFileList: IRegisterFileExtended[] = fileList[type];
  const index = newFileList.findIndex(el => el.label === label);
  newFileList[index].file = uploadedFile;
  newFileList[index].localFile = file;
  setFileList({
    ...fileList,
    [type]: newFileList,
  });
};

export const deleteRegisterFile = async (params: {
  label: string;
  type: string;
  fileList: { [key: string]: IRegisterFileExtended[] };
  setFileList: Dispatch<
    SetStateAction<{ [key: string]: IRegisterFileExtended[] }>
  >;
}) => {
  const { label, type, fileList, setFileList } = params;
  const index = fileList[type].findIndex(el => el.label === label);
  const serverFile = fileList[type][index].file;

  const res = await APIRequest({
    method: 'delete',
    url: API_ENDPOINTS.FILE_UNKNOWN,
    params: {
      fileId: serverFile.id,
      filePath: serverFile.path,
    },
  });
  if (!res.isSucceed) return;
  const newFileList: IRegisterFileExtended[] = fileList[type];
  newFileList[index] = {
    ...newFileList[index],
    localFile: null,
    file: null,
  };
  setFileList({
    ...fileList,
    [type]: newFileList,
  });
};
