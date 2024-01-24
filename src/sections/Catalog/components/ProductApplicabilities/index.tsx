import { Form, Input, Select, Switch } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { Pagination, Preloader, Table } from 'components/common';
import { ITableCol, ITableRow } from 'components/common/Table/interfaces';
import { API_ENDPOINTS } from 'data/paths.data';
import { useLocale } from 'hooks/locale.hook';
import { ISetState, IRowsWithCount } from 'interfaces/common.interfaces';
import { useRouter } from 'next/router';
import { FC, Fragment, useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import {
  IAutoBrand,
  IAutoModel,
} from 'sections/Catalog/interfaces/categories.interfaces';
import { APIRequest } from 'utils/api.utils';
import {
  IProduct,
  IProductApplicability,
} from 'sections/Catalog/interfaces/products.interfaces';
import { openNotification } from 'utils/common.utils';

interface IProps {
  productId: IProduct['id'];
  applicabilities: IRowsWithCount<IProductApplicability[]>;
  setApplicabilities: ISetState<IProps['applicabilities']>;
  useWindowScroll?: boolean;
  pagination: 'scroll' | 'pages';
  editProps?: {
    disabled: boolean;
    autoBrands: IRowsWithCount<IAutoBrand[]>;
    addedItems: string[];
    changeApplicability: (data: IProductApplicability, index: number) => void;
    changeApplicabilityAutoBrandInputMode: (
      value: boolean,
      index: number,
    ) => void;
    changeApplicabilityAutoModelInputMode: (
      value: boolean,
      index: number,
    ) => void;
    deleteApplicability: (index: number) => void;
  };
}

export const APPLICABILITIES_PAGE_SIZE = 10;

const ProductApplicabilities: FC<IProps> = ({
  productId,
  applicabilities,
  setApplicabilities,
  useWindowScroll = true,
  pagination,
  editProps,
}) => {
  const { locale } = useLocale();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const hasMore = applicabilities.count > applicabilities.rows.length;

  useEffect(() => {
    if (pagination !== 'scroll') return;
    if (!!applicabilities.count && !hasMore) return;
    fetchMore(0);
  }, []);

  useEffect(() => {
    if (pagination !== 'pages') return;
    const fetchData = async () => {
      setIsLoading(true);
      const res = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.PRODUCT_APPLICABILITIES(productId),
        params: {
          pageSize: APPLICABILITIES_PAGE_SIZE,
          page: router?.query?.applicabilitiesPage || 1,
        },
      });
      setIsLoading(false);
      if (!res.isSucceed) return;
      const resData: IRowsWithCount<IProductApplicability[]> = res.data;

      setApplicabilities({
        count: resData.count,
        rows: resData.rows.map(
          item =>
            ({
              ...item,
              autoBrandInputMode: !!item?.autoBrand ? 'id' : 'name',
              autoModelInputMode: !!item?.autoModel ? 'id' : 'name',
            } as IProductApplicability),
        ),
      });
    };
    fetchData();
  }, [router?.query?.applicabilitiesPage]);

  const fetchMore = async (page: number) => {
    const res = await APIRequest({
      method: 'get',
      url: API_ENDPOINTS.PRODUCT_APPLICABILITIES(productId),
      params: {
        pageSize: APPLICABILITIES_PAGE_SIZE,
        page: page + 1,
      },
    });
    if (!res.isSucceed) return;

    const resData: IRowsWithCount<IProductApplicability[]> = res.data;
    setApplicabilities(prev => ({
      count: !prev?.count
        ? resData.count + (editProps?.addedItems?.length || 0)
        : prev?.count,
      rows: [
        ...prev.rows,
        ...resData.rows.map(
          item =>
            ({
              ...item,
              autoBrandInputMode: !!item?.autoBrand ? 'id' : 'name',
              autoModelInputMode: !!item?.autoModel ? 'id' : 'name',
            } as IProductApplicability),
        ),
      ],
    }));
  };

  const cols: ITableCol[] = [
    {
      content: 'Марка',
      width: '33%',
    },
    {
      content: 'Модель',
      width: '33%',
    },
    {
      content: 'Артикул',
      width: '33%',
    },
  ];
  let rows: ITableRow[] = [];

  if (!editProps) {
    rows = applicabilities.rows.map(item => ({
      cols: [
        { content: item?.autoBrand?.name || item?.autoBrandName || '' },
        { content: item?.autoModel?.name || item?.autoModelName || '' },
        { content: item?.article },
      ],
    }));
  } else {
    const {
      disabled,
      autoBrands,
      changeApplicability,
      changeApplicabilityAutoBrandInputMode,
      changeApplicabilityAutoModelInputMode,
      deleteApplicability,
    } = editProps;
    const [autoModels, setAutoModels] = useState<IAutoModel[]>([]);
    const [brandsSearch, setBrandsSearch] = useState('');
    const [modelsSearch, setModelsSearch] = useState('');
    const autoBrandsFiltered = !!brandsSearch
      ? autoBrands.rows.filter(
          item =>
            item?.name?.toLowerCase()?.includes(brandsSearch) ||
            item?.label?.toLowerCase()?.includes(brandsSearch),
        )
      : autoBrands.rows;
    const autoModelsFiltered = !!modelsSearch
      ? autoModels.filter(
          item =>
            item?.name?.toLowerCase()?.includes(modelsSearch) ||
            item?.label?.toLowerCase()?.includes(modelsSearch),
        )
      : autoModels;

    useEffect(() => {
      const autoBrandIds = applicabilities?.rows
        ?.filter(item => !!item?.autoBrandId)
        .map(item => item.autoBrandId);

      if (!autoBrandIds?.length) return;

      fetchAutoModelsByAutoBrand(autoBrandIds);
    }, [applicabilities?.rows?.length]);

    const fetchAutoModelsByAutoBrand = async (
      autoBrandId: IAutoBrand['id'] | Array<IAutoBrand['id']>,
    ) => {
      const res = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.AUTO_MODEL_LIST,
        params: {
          autoBrand: autoBrandId,
          showHidden: true,
        },
      });
      if (!res?.isSucceed) {
        openNotification('Не удалось загрузить модели');
        return;
      }

      setAutoModels(res?.data.rows);
    };

    const handleAutoBrandsSearch = async (value: string) => {
      setBrandsSearch(value?.toLowerCase()?.trim() || '');
    };

    const handleAutoModelsSearch = async (value: string) => {
      setModelsSearch(value?.toLowerCase()?.trim() || '');
    };

    const handleAutoBrandSelect = async ({
      item,
      autoBrandId,
      i,
    }: {
      item: IProductApplicability;
      autoBrandId: IAutoBrand['id'];
      i: number;
    }) => {
      setBrandsSearch('');
      changeApplicability({ ...item, autoBrandId }, i);
      await fetchAutoModelsByAutoBrand(autoBrandId);
    };

    const handleAutoModelSelect = ({
      item,
      autoModelId,
      i,
    }: {
      item: IProductApplicability;
      autoModelId: IAutoModel['id'];
      i: number;
    }) => {
      setModelsSearch('');
      changeApplicability({ ...item, autoModelId }, i);
    };

    rows = applicabilities.rows.map((item, i) => ({
      cols: [
        {
          content: (
            <span
              className="d-flex align-items-center w-100"
              style={{ position: 'relative' }}
            >
              {item?.autoBrandInputMode === 'id' ? (
                <Form.Item
                  name={`applicability.autoBrandId-${i}`}
                  colon={false}
                  rules={[
                    {
                      required: true,
                      message: locale.validations.required,
                    },
                  ]}
                  style={{ flex: 1, margin: 0 }}
                >
                  <Select
                    options={autoBrandsFiltered.map(autoBrand => ({
                      key: autoBrand.id,
                      value: autoBrand.id,
                      label: autoBrand.name,
                    }))}
                    filterOption={false}
                    showSearch
                    onSearch={handleAutoBrandsSearch}
                    defaultValue={item.autoBrandId}
                    onChange={value =>
                      handleAutoBrandSelect({ item, autoBrandId: value, i })
                    }
                    size="small"
                    className="text-left"
                    placeholder="Марка"
                    disabled={disabled}
                  />
                </Form.Item>
              ) : (
                <Form.Item
                  name={`applicability.autoBrandName-${i}`}
                  colon={false}
                  rules={[
                    {
                      required: true,
                      message: locale.validations.required,
                    },
                  ]}
                  style={{ flex: 1, margin: 0 }}
                >
                  <Input
                    defaultValue={item.autoBrandName}
                    value={item?.autoBrandName}
                    onChange={e =>
                      changeApplicability(
                        { ...item, autoBrandName: e.target.value },
                        i,
                      )
                    }
                    size="small"
                    placeholder="Марка"
                    disabled={disabled}
                  />
                </Form.Item>
              )}
              <Switch
                checked={item?.autoBrandInputMode === 'id'}
                onChange={value =>
                  changeApplicabilityAutoBrandInputMode(value, i)
                }
                size="small"
                className="ml-10"
                disabled={disabled}
              />
              {!disabled && (
                <span
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '100%',
                    marginRight: 10,
                    transform: 'translateY(-50%)',
                    cursor: 'pointer',
                    color: '#aaa',
                  }}
                  onClick={() => deleteApplicability(i)}
                >
                  <CloseOutlined />
                </span>
              )}
            </span>
          ),
        },
        {
          content: (
            <span className="d-flex align-items-center w-100">
              {item?.autoModelInputMode === 'id' ? (
                <Form.Item
                  name={`applicability.autoModelId-${i}`}
                  colon={false}
                  rules={[
                    {
                      required: true,
                      message: locale.validations.required,
                    },
                  ]}
                  style={{ flex: 1, margin: 0 }}
                >
                  <Select
                    options={autoModelsFiltered
                      .filter(
                        autoModel =>
                          autoModel.autoBrandId === item?.autoBrandId,
                      )
                      .map(autoModel => ({
                        key: autoModel.id,
                        value: autoModel.id,
                        label: autoModel.name,
                      }))}
                    filterOption={false}
                    showSearch
                    defaultValue={item.autoModelId}
                    value={item.autoModelId}
                    onChange={value =>
                      handleAutoModelSelect({ item, autoModelId: value, i })
                    }
                    size="small"
                    className="text-left"
                    placeholder="Модель"
                    disabled={disabled}
                  />
                </Form.Item>
              ) : (
                <Form.Item
                  name={`applicability.autoModelName-${i}`}
                  colon={false}
                  rules={[
                    {
                      required: true,
                      message: locale.validations.required,
                    },
                  ]}
                  style={{ flex: 1, margin: 0 }}
                >
                  <Input
                    defaultValue={item.autoModelName}
                    value={item?.autoModelName}
                    onChange={e =>
                      changeApplicability(
                        { ...item, autoModelName: e.target.value },
                        i,
                      )
                    }
                    size="small"
                    placeholder="Модель"
                    disabled={disabled}
                  />
                </Form.Item>
              )}
              <Switch
                checked={item?.autoModelInputMode === 'id'}
                onChange={value =>
                  changeApplicabilityAutoModelInputMode(value, i)
                }
                size="small"
                className="ml-10"
                disabled={disabled}
              />
            </span>
          ),
        },
        {
          content: (
            <Form.Item
              name={`applicability.article-${i}`}
              colon={false}
              rules={[
                {
                  required: true,
                  message: locale.validations.required,
                },
              ]}
              style={{ flex: 1, margin: 0 }}
            >
              <Input
                defaultValue={item?.article}
                value={item?.article}
                onChange={e =>
                  changeApplicability({ ...item, article: e.target.value }, i)
                }
                size="small"
                placeholder="Артикул"
                disabled={disabled}
              />
            </Form.Item>
          ),
        },
      ],
    }));
  }

  return (
    <Fragment>
      {pagination === 'scroll' && (
        <InfiniteScroll
          pageStart={0}
          loadMore={fetchMore}
          hasMore={applicabilities.count > applicabilities.rows.length}
          loader={
            <div key={0} className="mt-10">
              <Preloader />
            </div>
          }
          threshold={400}
          useWindow={useWindowScroll}
        >
          <Table cols={cols} rows={rows} />
        </InfiniteScroll>
      )}
      {pagination === 'pages' && (
        <div>
          <Table
            cols={cols}
            rows={rows}
            className="mb-10"
            rowsLoading={isLoading}
          />
          <Pagination
            total={applicabilities.count}
            pageSize={APPLICABILITIES_PAGE_SIZE}
            pagePropName="applicabilitiesPage"
            wrapClassName="mt-10"
            wrapStyle={{ justifyContent: 'left' }}
            disableScroll
          />
        </div>
      )}
    </Fragment>
  );
};

export default ProductApplicabilities;
