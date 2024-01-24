import { FormInstance } from 'antd/lib/form';
import { IOrganizationBranch } from 'sections/Organizations/interfaces';
import { IRegisterFileExtended } from 'sections/Auth/interfaces';
import { IAddress, ISetState } from 'interfaces/common.interfaces';
import { ChangeEvent, ReactNode } from 'react';

export interface IOrgFormGragmentProps {
  branches: {
    list: IOrganizationBranch[];
    index: number;
  };
  setBranches: ISetState<IOrgFormGragmentProps['branches']>;
  fileList: IRegisterFileExtended[];
  form: FormInstance<any>;
  state: any;
  setState: ISetState<any>;
  comparedData?: any;
  comparedJuristicAddress?: IAddress;
  comparedMailingAddress?: IAddress;
  comparedActualAddress?: IAddress;
  comparedFileList?: IRegisterFileExtended[];
  uploadFile: (
    e: ChangeEvent<HTMLInputElement>,
    type: 'user' | 'org',
    label: string,
  ) => void;
  deleteFile: (type: 'user' | 'org', label: string) => void;
  searchByInnEnabled: boolean;
  uploadAllFiles?: boolean;
  children?: ReactNode;
}
