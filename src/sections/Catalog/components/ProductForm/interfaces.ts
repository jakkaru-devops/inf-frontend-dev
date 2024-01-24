import { FormInstance } from 'antd';
import { IUploadedFile } from 'components/common/FileInput/interfaces';
import { ISetState, IRowsWithCount } from 'interfaces/common.interfaces';
import {
  IAutoBrand,
  IAutoType,
  IProductGroup,
} from 'sections/Catalog/interfaces/categories.interfaces';
import {
  IProduct,
  IProductApplicability,
  IProductBranch,
} from 'sections/Catalog/interfaces/products.interfaces';
import { IOrganization } from 'sections/Organizations/interfaces';

export interface IProductFormProps {
  autoTypes: IRowsWithCount<IAutoType[]>;
  setAutoTypes: ISetState<IProductFormProps['autoTypes']>;
  autoBrands: IRowsWithCount<IAutoBrand[]>;
  setAutoBrands: ISetState<IProductFormProps['autoBrands']>;
  groups: IRowsWithCount<IProductGroup[]>;
  setGroups: ISetState<IProductFormProps['groups']>;
  files: IUploadedFile[];
  setFiles: ISetState<IProductFormProps['files']>;
  form: FormInstance<any>;
  product?: IProduct;
  branches: IProductBranch[];
  setBranches: ISetState<IProductFormProps['branches']>;
  mainBranch: IProductBranch;
  setMainBranch: ISetState<IProductFormProps['mainBranch']>;
  disabled?: boolean;
  changeAllowed: boolean;
  onChangeAllowedUpdate: (value: boolean) => void;
  action: 'create' | 'update' | 'view';
  applicabilities: IRowsWithCount<IProductApplicability[]>;
  setApplicabilities: ISetState<IProductFormProps['applicabilities']>;
  addedApplicabilities: IProductApplicability[];
  setAddedApplicabilities: ISetState<IProductFormProps['addedApplicabilities']>;
  updatedApplicabilities: IProductApplicability[];
  setUpdatedApplicabilities: ISetState<
    IProductFormProps['updatedApplicabilities']
  >;
  deletedApplicabilityIds: string[];
  setDeletedApplicabilityIds: ISetState<
    IProductFormProps['deletedApplicabilityIds']
  >;
  analogProducts: IRowsWithCount<IProduct[]>;
  setAnalogProducts: ISetState<IProductFormProps['analogProducts']>;
  addedAnalogIds: string[];
  setAddedAnalogIds: ISetState<string[]>;
  deletedAnalogIds: string[];
  setDeletedAnalogIds: ISetState<string[]>;
  organizations?: IOrganization[];
}
