import { IEntityId, ISetState } from 'interfaces/common.interfaces';
import {
  IAutoBrand,
  IAutoType,
  IProductCategoriesBasic,
  IProductGroup,
} from 'sections/Catalog/interfaces/categories.interfaces';
import { ISellerAutoBrand } from 'sections/Users/interfaces';

export interface ICategoriesSelectionProps {
  initialData?: IProductCategoriesBasic;
  defaultValues?: {
    autoTypeId?: IAutoType['id'];
    autoBrands?: ISellerAutoBrand[];
    groupIds?: IProductGroup['id'][];
  };
  selectedAutoBrands?: ISellerAutoBrand[];
  setSelectedAutoBrands?: ISetState<ISellerAutoBrand[]>;
  selectedGroupIds?: IProductGroup['id'][];
  setSelectedGroupIds?: ISetState<IProductGroup['id'][]>;
  onAutoTypeClick?: (autoType: IAutoType) => void;
  onAutoBrandClick?: (autoBrand: IAutoBrand) => void;
  onGroupClick?: (group: IProductGroup) => void;
  onDataLoaded?: () => void;
  generateAutoTypeHref?: (autoTypeId: IEntityId) => string;
  generateAutoBrandHref?: (
    autoBrandId: IEntityId,
    selectedAutoTypeId?: IEntityId,
  ) => string;
  generateGroupHref?: (groupId: IEntityId) => string;
}
