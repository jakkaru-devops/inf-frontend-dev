import { Fragment, KeyboardEvent, useEffect, useState } from 'react';
import { AutoComplete, Input, Spin, Button } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { useRouter } from 'next/router';
import { APIRequest } from 'utils/api.utils';
import { Key } from 'readline';
import { IProduct } from 'sections/Catalog/interfaces/products.interfaces';
import { ICatalogRouter } from 'sections/Catalog/interfaces/catalog.interfaces';
import { useLocale } from 'hooks/locale.hook';
import { generateUrl } from 'utils/common.utils';
import { SearchCatalogIcon } from 'components/icons';

interface IDropdownOption {
  key: Key;
}

//interface INextRouterExtended extends NextRouter {
//	query: {
//		search?: string
//		orderId?: string
//	}
//}

const SearchCatalogInput = () => {
  const { locale } = useLocale();
  const router = useRouter() as ICatalogRouter;

  const [search, setSearch] = useState({
    value:
      [APP_PATHS.CATALOG, APP_PATHS.PRODUCT_LIST].includes(router.pathname) &&
      router.query.search
        ? router.query.search
        : '',
  });
  const [options, setOptions] = useState([] as IProduct[]);
  const [searchTimeout, setSearchTimeout] = useState(null as NodeJS.Timeout);
  const [preloaderVisible, setPreloaderVisible] = useState(false);

  useEffect(() => {
    setPreloaderVisible(false);
  }, [router, router.pathname]);

  const handleValueChange = (value: string) => {
    setSearch({
      ...search,
      value,
    });
  };

  const handleSearch = (value: string) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    // exit if search value is empty
    if (value.trim().length <= 0) return;
    // request
    setSearchTimeout(
      setTimeout(() => {
        APIRequest({
          method: 'get',
          url: API_ENDPOINTS.PRODUCT_LIST,
          params: {
            search: value,
            noFiles: true,
          },
        }).then(res => {
          console.log(res);
          setOptions(res.data.rows);
        });
      }, 700),
    );
  };

  const handleSelect = (value: string, optionProp: any) => {
    const option: IDropdownOption = optionProp;
    setPreloaderVisible(true);
    router.push(APP_PATHS.PRODUCT(option.key as string));
  };

  const handleSearchSubmit = () => {
    setPreloaderVisible(true);

    const params =
      router.pathname === APP_PATHS.CATALOG
        ? {
            ...router.query,
            search: search.value,
            layout: router.query.layout,
            orderBy: router.query.orderBy,
            pageSize: router.query.pageSize,
            history: APP_PATHS.CATALOG,
          }
        : {
            search: search.value,
            layout: router.query.layout,
            orderBy: router.query.orderBy,
            pageSize: router.query.pageSize,
            history: APP_PATHS.CATALOG,
          };

    router.push(
      generateUrl(params, {
        pathname: APP_PATHS.PRODUCT_LIST,
        removeCurrentParams: router.pathname !== APP_PATHS.PRODUCT_LIST,
      }),
    );
  };

  const handleEnterPressed = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key.toLowerCase() === 'enter') {
      e.preventDefault();
      handleSearchSubmit();
    }
  };

  return (
    <Fragment>
      <AutoComplete
        onSearch={handleSearch}
        style={{ width: `100%` }}
        value={search.value}
        onChange={handleValueChange}
        onSelect={handleSelect}
        className="search-catalog-input"
        onKeyDown={handleEnterPressed}
      >
        <Input
          placeholder={locale.catalog.typeProductName}
          prefix={
            <Button
              size="small"
              shape="circle"
              className="no-border"
              style={{ marginRight: -3 }}
              onClick={handleSearchSubmit}
            >
              <SearchCatalogIcon />
            </Button>
          }
        />
      </AutoComplete>

      {preloaderVisible && (
        <div className="search-catalog-input__preloader">
          <Spin indicator={<LoadingOutlined spin />} />
        </div>
      )}
    </Fragment>
  );
};

export default SearchCatalogInput;
