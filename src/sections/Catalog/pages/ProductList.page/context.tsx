import { DefaultOptionType } from 'antd/lib/select';
import { useLocale } from 'hooks/locale.hook';
import { IRowsWithCount, ISetState } from 'interfaces/common.interfaces';
import { NextRouter, useRouter } from 'next/router';
import { useState, useEffect, createContext, FC, ReactNode } from 'react';
import { PRODUCT_LIST_ORDER_OPTIONS } from 'sections/Catalog/data';
import {
  IAutoBrand,
  IAutoModel,
  IAutoType,
  IProductCategoryCommon,
  IProductGroup,
} from 'sections/Catalog/interfaces/categories.interfaces';
import { IProduct } from 'sections/Catalog/interfaces/products.interfaces';

interface IProps {
  autoType: IRowsWithCount<IAutoType[]>;
  autoBrand: IRowsWithCount<IAutoBrand[]>;
  autoModel: IRowsWithCount<IAutoModel[]>;
  group: IRowsWithCount<IProductGroup[]>;
  subgroup: IRowsWithCount<IProductGroup[]>;
  products: IRowsWithCount<IProduct[]>;
  showPriceOrderOption: boolean;
  children: ReactNode;
  isLoading?: boolean;
}

export interface IFilterGroup {
  label: ICatalogFilterLabel;
  isExpanded: boolean;
  searchValue: string;
  list: IProductCategoryCommon[];
}

interface IContext {
  filters: { [key in ICatalogFilterLabel]: string[] };
  setFilters: ISetState<IContext['filters']>;
  filterGroups: { [key in ICatalogFilterLabel]: IFilterGroup };
  setFilterGroups: ISetState<IContext['filterGroups']>;
  products: IRowsWithCount<IProduct[]>;
  orderByOptions: DefaultOptionType[];
  isLoading?: boolean;
}

export type ICatalogFilterLabel =
  | 'autoType'
  | 'autoBrand'
  | 'autoModel'
  | 'group'
  | 'subgroup';

export const ProductListContext = createContext<IContext>(null);

export const CATALOG_FILTERS: {
  [key in ICatalogFilterLabel]: {
    title: string;
    label: string;
    emptyListText: string;
    severalOptionsAvailable: boolean;
  };
} = {
  autoType: {
    title: 'Вид',
    label: 'autoType',
    emptyListText: '',
    severalOptionsAvailable: true,
  },
  autoBrand: {
    title: 'Марка',
    label: 'autoBrand',
    emptyListText: '',
    severalOptionsAvailable: true,
  },
  autoModel: {
    title: 'Модель',
    label: 'autoModel',
    emptyListText: 'Необходимо выбрать Марку',
    severalOptionsAvailable: true,
  },
  group: {
    title: 'Категория',
    label: 'group',
    emptyListText: '',
    severalOptionsAvailable: true,
  },
  subgroup: {
    title: 'Подкатегория',
    label: 'subgroup',
    emptyListText: 'Необходимо выбрать Категорию',
    severalOptionsAvailable: true,
  },
};

export const getCatalogFilterLinkParams = (
  label: string,
  router: NextRouter,
) => {
  const result: {} = {
    search: null,
  };
  const index = Object.keys(CATALOG_FILTERS).findIndex(key => key === label);
  Object.keys(CATALOG_FILTERS).forEach((key, i) => {
    if (i <= index) {
      result[key] = router.query?.[key];
    } else {
      result[key] = null;
    }
  });
  return result;
};

const ProductListContextProvider: FC<IProps> = props => {
  const router = useRouter();
  const { locale } = useLocale();
  const [filters, setFilters] = useState(() => {
    const result: { [key in ICatalogFilterLabel]: string[] } = {} as any;
    Object.keys(CATALOG_FILTERS).forEach(key => {
      result[key] = []
        .concat(router.query[CATALOG_FILTERS[key].label])
        .filter(Boolean);
    });
    return result;
  });
  const [filterGroups, setFilterGroups] = useState<{
    [key in ICatalogFilterLabel]: IFilterGroup;
  }>({} as any);
  const orderByOptions: DefaultOptionType[] = PRODUCT_LIST_ORDER_OPTIONS.map(
    value => ({
      value,
      label: locale.catalog.productListOrderOptions[value],
    }),
  );
  const isLoading = props.isLoading;

  useEffect(() => {
    const result: { [key in ICatalogFilterLabel]: IFilterGroup } = {} as any;
    Object.keys(CATALOG_FILTERS).forEach((key: ICatalogFilterLabel) => {
      result[key] = {
        label: key,
        isExpanded:
          Object.keys(filterGroups).length > 0
            ? filterGroups?.[key]?.isExpanded
            : true,
        searchValue: filterGroups?.[key]?.searchValue || '',
        list: props[key].rows.map((item: IProductCategoryCommon) => ({
          id: item.id,
          label: item.label,
          name: item.name,
        })),
      };
    });
    setFilterGroups(result);
  }, [props]);

  useEffect(() => {
    if (!router?.query?.autoBrand) {
      setFilters(prev => ({
        ...prev,
        autoBrand: [],
      }));
    }
  }, [router?.query?.autoBrand]);

  return (
    <ProductListContext.Provider
      value={{
        filters,
        setFilters,
        filterGroups,
        setFilterGroups,
        products: props.products,
        orderByOptions,
        isLoading,
      }}
    >
      {props.children}
    </ProductListContext.Provider>
  );
};

export default ProductListContextProvider;
