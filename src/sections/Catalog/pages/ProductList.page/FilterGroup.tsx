import { FC, RefObject, useContext, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { Input, Radio } from 'antd';
import { Scrollbars } from 'react-custom-scrollbars';
import { useLocale } from 'hooks/locale.hook';
import {
  CATALOG_FILTERS,
  ICatalogFilterLabel,
  ProductListContext,
} from './context';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import {
  IAutoBrand,
  IAutoModel,
  IProductGroup,
} from 'sections/Catalog/interfaces/categories.interfaces';
import { IAPIResponse } from 'interfaces/api.types';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { SearchCatalogIcon } from 'components/icons';

interface IProps {
  label: ICatalogFilterLabel;
  mode?: 'sale';
}

const FilterGroup: FC<IProps> = ({ label, mode }) => {
  const { locale } = useLocale();
  const { filters, filterGroups, setFilterGroups, setFilters } =
    useContext(ProductListContext);
  const [searchTimeout, setSearchTimeout] = useState(null as NodeJS.Timeout);

  // Выводить только сопутствующие товары если не выбраны вид и марка
  if (!filters?.autoType?.length && !filters?.autoBrand?.length) {
    if (!!filterGroups?.group?.list)
      filterGroups.group.list = filterGroups.group.list.filter(
        (item: IProductGroup) => item.catalog !== 'AUTO_PARTS',
      );
    if (!!filterGroups?.subgroup?.list)
      filterGroups.subgroup.list = filterGroups.subgroup.list.filter(
        (item: IProductGroup) => item.catalog !== 'AUTO_PARTS',
      );
  }

  const { searchValue, isExpanded, list } = filterGroups[label];
  const { title, emptyListText, severalOptionsAvailable } =
    CATALOG_FILTERS[label];
  const listRef: RefObject<Scrollbars> = useRef();

  useEffect(() => {
    if (!filters?.[label]?.length || !listRef?.current) return;

    const itemId = filters[label][0];
    const el: HTMLDivElement = document.querySelector(
      `.catalog__checks .filter-group-option-${itemId}`,
    );

    if (!!el) listRef.current.scrollTop(el.offsetTop);
  }, []);

  const defineRequestParams = (
    value: string,
  ): {
    url: string;
    params: { [key: string]: string | string[] | number };
  } => {
    switch (label) {
      case 'autoType':
        return {
          url: API_ENDPOINTS.AUTO_TYPE_LIST,
          params: {
            search: value,
            mode,
          },
        };
      case 'autoBrand':
        return {
          url: API_ENDPOINTS.AUTO_BRAND_LIST,
          params: {
            search: value,
            autoType: filters.autoType,
            mode,
          },
        };
      case 'autoModel':
        return {
          url: API_ENDPOINTS.AUTO_MODEL_LIST,
          params: {
            search: value,
            autoType: filters.autoType,
            autoBrand: filters.autoBrand,
            mode,
          },
        };
      case 'group':
        return {
          url: API_ENDPOINTS.PRODUCT_GROUP_LIST,
          params: {
            search: value,
            parent: 'none',
            autoType: filters.autoType,
            autoBrand: filters.autoBrand,
            catalog:
              !filters.autoType?.length && !filters.autoBrand?.length
                ? ['AUTO_PRODUCTS', 'AUTO_TOOLS']
                : undefined,
            mode,
          },
        };
      case 'subgroup':
        return {
          url: API_ENDPOINTS.PRODUCT_GROUP_LIST,
          params: {
            search: value,
            parent: filters.group,
            autoType: filters.autoType,
            autoBrand: filters.autoBrand,
            catalog:
              !filters.autoType?.length && !filters.autoBrand?.length
                ? ['AUTO_PRODUCTS', 'AUTO_TOOLS']
                : undefined,
            mode,
          },
        };
    }
  };

  const toggleExpanded = () => {
    setFilterGroups(prev => ({
      ...prev,
      [label]: {
        ...prev[label],
        isExpanded: !prev[label].isExpanded,
      },
    }));
  };

  const handleInputChange = (value: string) => {
    setFilterGroups(prev => ({
      ...prev,
      [label]: {
        ...prev[label],
        searchValue: value,
      },
    }));

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    setSearchTimeout(
      setTimeout(async () => {
        const res = await APIRequest({
          ...defineRequestParams(value),
          method: 'get',
        });
        if (res.isSucceed)
          setFilterGroups(prev => ({
            ...prev,
            [label]: {
              ...prev[label],
              list: res.data.rows,
            },
          }));
      }, 300),
    );
  };

  const handleItemSelect = async (itemId: string, value: boolean) => {
    const newFilters = filters;
    const newFilterGroups = filterGroups;
    let options = newFilters[label];
    let productGroupsRes: IAPIResponse<IRowsWithCount<IProductGroup[]>> = null;

    // if (value) options = [itemId];
    // else options = options.filter(option => option !== itemId);
    options = value ? [itemId] : [];

    switch (label) {
      case 'autoType':
        newFilters.autoModel = [];

        const autoBrandsRes = await APIRequest({
          method: 'get',
          url: API_ENDPOINTS.AUTO_BRAND_LIST,
          params: {
            autoType: options,
            mode,
          },
        });
        if (autoBrandsRes.isSucceed) {
          const rows: IAutoBrand[] = autoBrandsRes.data.rows;
          newFilters.autoBrand = rows
            .filter(({ id }) => id && newFilters.autoBrand.includes(id))
            .map(({ id }) => id);
          newFilterGroups.autoBrand.list = rows;
        }

        productGroupsRes = await APIRequest({
          method: 'get',
          url: API_ENDPOINTS.PRODUCT_GROUP_LIST,
          params: {
            autoType: options,
            autoBrand: newFilters.autoBrand,
            mode,
          },
        });
        if (productGroupsRes.isSucceed) {
          const rows: IProductGroup[] = productGroupsRes.data.rows;
          const groupRows = rows.filter(
            ({ nestingLevel }) => nestingLevel === 0,
          );
          const subgroupRows = rows.filter(
            ({ nestingLevel }) => nestingLevel !== 0,
          );
          newFilters.group = groupRows
            .map(({ id }) => id)
            .filter(id => id && newFilters.group.includes(id));
          newFilters.subgroup = subgroupRows
            .map(({ id }) => id)
            .filter(id => id && newFilters.subgroup.includes(id));

          newFilterGroups.group.list = groupRows;
          newFilterGroups.subgroup.list = subgroupRows;
        }

        setFilterGroups({
          ...newFilterGroups,
        });

        newFilters[label] = options;

        setFilters({
          ...newFilters,
        });

        return;
      case 'autoBrand':
        newFilters.autoModel = [];

        const autoModelsRes = await APIRequest({
          method: 'get',
          url: API_ENDPOINTS.AUTO_MODEL_LIST,
          params: {
            autoType: newFilters.autoType,
            autoBrand: options,
            mode,
          },
        });
        if (autoModelsRes.isSucceed) {
          const rows: IAutoModel[] = autoModelsRes.data.rows;
          newFilters.autoModel = rows
            .map(({ id }) => id)
            .filter(id => id && newFilters.autoModel.includes(id));
          newFilterGroups.autoModel.list = rows;
        }

        productGroupsRes = await APIRequest({
          method: 'get',
          url: API_ENDPOINTS.PRODUCT_GROUP_LIST,
          params: {
            autoType: newFilters.autoType,
            autoBrand: options,
            mode,
          },
        });
        if (productGroupsRes.isSucceed) {
          const rows: IProductGroup[] = productGroupsRes.data.rows;
          const groupRows = rows.filter(
            ({ nestingLevel }) => nestingLevel === 0,
          );
          const subgroupRows = rows.filter(
            ({ nestingLevel }) => nestingLevel !== 0,
          );
          newFilters.group = groupRows
            .map(({ id }) => id)
            .filter(id => id && newFilters.group.includes(id));
          newFilters.subgroup = subgroupRows
            .map(({ id }) => id)
            .filter(id => id && newFilters.subgroup.includes(id));

          newFilterGroups.group.list = groupRows;
          newFilterGroups.subgroup.list = subgroupRows;
        }

        setFilterGroups({
          ...newFilterGroups,
        });

        newFilters[label] = options;

        setFilters({
          ...newFilters,
        });

        return;
      case 'group':
        if (options.length > 0) {
          APIRequest({
            method: 'get',
            url: API_ENDPOINTS.PRODUCT_GROUP_LIST,
            params: {
              parent: options,
              autoType: newFilters.autoType,
              autoBrand: newFilters.autoBrand,
              mode,
            },
          }).then(res => {
            if (!res.isSucceed) return;
            const rows: IProductGroup[] = res.data.rows;
            console.log(rows.filter(({ nestingLevel }) => nestingLevel === 1));
            newFilters.subgroup = rows
              .filter(({ nestingLevel }) => nestingLevel === 1)
              .map(item => item.id)
              .filter(id => id && newFilters.subgroup.includes(id));

            setFilterGroups(prev => ({
              ...prev,
              subgroup: {
                ...prev.subgroup,
                list: rows,
              },
            }));
          });
        } else {
          setFilterGroups(prev => ({
            ...prev,
            subgroup: {
              ...prev.subgroup,
              list: [],
            },
          }));
        }

        newFilters[label] = options;

        setFilters({
          ...newFilters,
        });

        return;
      default:
        newFilters[label] = options;

        setFilters({
          ...newFilters,
        });

        return;
    }
  };

  return (
    <div
      className={classNames('catalog__accP', {
        active: isExpanded,
      })}
    >
      <div className="catalog__accTitle" onClick={() => toggleExpanded()}>
        <img src="/img/downS.svg" alt="" className="catalog__down" />
        <span className="catalog__titles">{title}</span>
      </div>
      <div className="catalog__accContent">
        {label !== 'autoType' && (
          <div className="catalog__accSearch">
            <Input
              placeholder={locale.common.iAmLookingFor}
              value={searchValue}
              onChange={e => handleInputChange(e.target.value)}
              prefix={<SearchCatalogIcon />}
            />
          </div>
        )}

        <div className="catalog__checks">
          <Scrollbars
            autoHeightMin={0}
            autoHeightMax={173}
            autoHeight={true}
            universal={true}
            renderTrackHorizontal={props => (
              <div
                {...props}
                style={{ display: 'none' }}
                className="track-horizontal"
              />
            )}
            ref={listRef}
          >
            {list.length > 0 ? (
              list.map(item => (
                <div key={item.id} className="catalog__check">
                  <Radio
                    checked={filters[label].includes(item.id)}
                    onChange={e => handleItemSelect(item.id, e.target.checked)}
                    className={`filter-group-option-${item.id}`}
                  >
                    {item.name}
                  </Radio>
                </div>
              ))
            ) : (
              <span>{emptyListText}</span>
            )}
          </Scrollbars>
        </div>
      </div>
    </div>
  );
};

export default FilterGroup;
