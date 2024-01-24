import {
  IAutoBrand,
  IAutoModel,
  IAutoType,
  IProductCategoriesBasic,
  IProductGroup,
} from '../interfaces/categories.interfaces';
import catalogService from '../catalog.service';
import { IGetProductGroupListProps } from './getGroupList.service';
import { IRowsWithCount } from 'interfaces/common.interfaces';

interface IProps {
  includeHidden?: boolean;
  groupsCatalog?: IGetProductGroupListProps['catalog'];
  autoType?: IAutoType['id'];
  autoBrand?: IAutoBrand['id'];
  group?: IProductGroup['id'];
}

export const getMainCategoriesService = async (
  params?: IProps,
): Promise<IProductCategoriesBasic> => {
  const promises: [
    Promise<IRowsWithCount<IAutoType[]>>,
    Promise<IRowsWithCount<IAutoBrand[]>>,
    Promise<IRowsWithCount<IAutoModel[]>>,
    Promise<IRowsWithCount<IProductGroup[]>>,
    Promise<IRowsWithCount<IProductGroup[]>>,
  ] = [
    catalogService.getAutoTypeList(),

    catalogService.getAutoBrandList({ includeHidden: params?.includeHidden }),

    !!params?.autoType && !!params?.autoBrand
      ? catalogService.getAutoModelList({
          includeHidden: params?.includeHidden,
          autoType: params?.autoType,
          autoBrand: params?.autoBrand,
        })
      : null,

    catalogService.getGroupList({
      includeHidden: params?.includeHidden,
      parent: null,
      catalog: params?.groupsCatalog,
      autoType: params?.autoType,
      autoBrand: params?.autoBrand,
    }),

    !!params?.group
      ? catalogService.getGroupList({
          includeHidden: params?.includeHidden,
          parent: params?.group,
          catalog: params?.groupsCatalog,
          autoType: params?.autoType,
          autoBrand: params?.autoBrand,
        })
      : null,
  ];
  const [
    { rows: autoTypes },
    { rows: autoBrands },
    { rows: autoModels },
    { rows: groups },
    { rows: subgroups },
  ] = await Promise.all(
    promises.map(el => (el || { count: 0, rows: [] }) as any),
  );

  return {
    autoTypes,
    autoBrands,
    autoModels,
    groups,
    subgroups,
  };
};
