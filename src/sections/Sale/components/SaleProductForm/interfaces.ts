import { FormInstance } from 'antd';
import { IUploadedFile } from 'components/common/FileInput/interfaces';
import { IRowsWithCount, ISetState } from 'interfaces/common.interfaces';
import { IProductFormProps } from 'sections/Catalog/components/ProductForm/interfaces';
import {
  IAutoBrand,
  IAutoType,
  IProductGroup,
} from 'sections/Catalog/interfaces/categories.interfaces';
import { IProductBranch } from 'sections/Catalog/interfaces/products.interfaces';
import { IOrganization } from 'sections/Organizations/interfaces';
import { ISaleProduct } from 'sections/Sale/interfaces/sale.interfaces';

export interface ISaleProductFormProps {
  organizations?: IOrganization[];
  branch?: any;
  index?: any;
  setBranch?: any;
  product?: ISaleProduct;
  files?: IUploadedFile[];
  setFiles?: ISetState<IProductFormProps['files']>;
  disabled?: boolean;
  autoTypes: IRowsWithCount<IAutoType[]>;
  setAutoTypes: ISetState<IProductFormProps['autoTypes']>;
  autoBrands: IRowsWithCount<IAutoBrand[]>;
  setAutoBrands: ISetState<IRowsWithCount<IAutoBrand[]>>;
  groups: IRowsWithCount<IProductGroup[]>;
  setGroups: ISetState<IRowsWithCount<IProductGroup[]>>;
  branches: IProductBranch[];
  setBranches: ISetState<IProductFormProps['branches']>;
  mainBranch: IProductBranch;
  setMainBranch: ISetState<IProductFormProps['mainBranch']>;
  form: FormInstance<any>;
  changeAllowed: boolean;
  onChangeAllowedUpdate: (value: boolean) => void;
  action: 'create' | 'update';
  disableProductFields?: boolean;
}
