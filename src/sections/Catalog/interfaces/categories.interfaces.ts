import { IDBEntity, IRowsWithCount } from 'interfaces/common.interfaces';

export interface IProductCategoryCommon extends IDBEntity {
  label: string;
  name: string;
  catalogSectionId?: string;
}

export interface IAutoType extends IProductCategoryCommon {
  order: number;
  autoBrands?: IAutoBrand[];
  subname?: string;
  iconUrl?: string;
}

export interface IAutoBrand extends IProductCategoryCommon {
  autoTypeIds?: IAutoType['id'][];
  autoTypes?: IAutoType[];
}

export interface IAutoModel extends IProductCategoryCommon {
  autoTypeId: string;
  autoType?: IAutoType;
  autoBrandId: string;
  autoBrand?: IAutoBrand;
}

export interface IProductGroup extends IProductCategoryCommon {
  parentId?: string;
  nestingLevel?: number;
  catalog?: 'AUTO_PARTS' | 'AUTO_PRODUCTS' | 'AUTO_TOOLS';
  children?: IProductGroup[];
  autoTypes?: IAutoType[];
  autoBrands?: IAutoBrand[];
  parent?: IProductGroup;
}

export interface IProductCategoriesBasic {
  autoTypes: IAutoType[];
  autoBrands: IAutoBrand[];
  autoModels?: IAutoModel[];
  groups: IProductGroup[];
  subgroups?: IProductGroup[];
}

export interface IProductCategoryAll {
  autoType: IRowsWithCount<IAutoType[]>;
  autoBrand: IRowsWithCount<IAutoBrand[]>;
  autoModel: IRowsWithCount<IAutoModel[]>;
  group: IRowsWithCount<IProductGroup[]>;
  subgroup: IRowsWithCount<IProductGroup[]>;
}

export interface IAutoTypeExternal {
  name: string;
  value: string;
  index: number;
  image: string;
  marks: IAutoBrandExternal[];
}

export interface IAutoBrandExternal {
  name: string;
  value: string;
  index: number;
  archival: boolean;
  engine: boolean;
  SKD: boolean;
  vin: boolean;
  urlType?: string;
  code?: string;
  catalog?: string;
}
