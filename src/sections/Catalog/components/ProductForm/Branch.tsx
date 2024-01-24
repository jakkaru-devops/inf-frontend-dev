import { Form, FormInstance, Input, Select } from 'antd';
import classNames from 'classnames';
import { FormGroup, TextEditor } from 'components/common';
import { API_ENDPOINTS } from 'data/paths.data';
import { useLocale } from 'hooks/locale.hook';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { FC, useEffect, useState } from 'react';
import {
  IProduct,
  IProductBranch,
} from 'sections/Catalog/interfaces/products.interfaces';
import { APIRequest } from 'utils/api.utils';
import { SEARCH_TIMEOUT_MS } from './data';
import {
  IAutoBrand,
  IAutoModel,
  IAutoType,
  IProductCategoryCommon,
  IProductGroup,
} from 'sections/Catalog/interfaces/categories.interfaces';

interface IProps {
  branch: IProductBranch;
  setBranch: (data: IProductBranch) => void;
  product: IProduct;
  form: FormInstance<any>;
  disabled: boolean;
  autoTypes: IRowsWithCount<IAutoType[]>;
  autoBrands: IRowsWithCount<IAutoBrand[]>;
  groups: IRowsWithCount<IProductGroup[]>;
  index: number;
  deleteBranch: (i: number) => void;
}

type ICategoryLabel = 'autoBrands' | 'autoModels' | 'groups' | 'subgroups';

const ProductFormBranch: FC<IProps> = ({
  branch,
  setBranch,
  product,
  form,
  disabled,
  autoTypes,
  autoBrands,
  groups,
  index,
  deleteBranch,
}) => {
  const { locale } = useLocale();
  const [autoModels, setAutoModels] = useState<IRowsWithCount<IAutoModel[]>>(
    !!branch?.autoModels
      ? { count: branch?.autoModels?.length, rows: branch?.autoModels }
      : {
          count: 0,
          rows: [],
        },
  );
  const [subgroups, setSubgroups] = useState<IRowsWithCount<IProductGroup[]>>(
    !!branch?.subgroups
      ? { count: branch?.subgroups?.length, rows: branch?.subgroups }
      : {
          count: 0,
          rows: [],
        },
  );
  const [searchTimeout, setSearchTimeout] = useState(null as NodeJS.Timeout);
  const [search, setSearch] = useState({
    autoBrands: '',
    autoModels: '',
    groups: '',
    subgroups: '',
  });
  const [filteredCategories, setFilteredCategories] = useState<{
    [key in ICategoryLabel]: IProductCategoryCommon[];
  }>({
    autoBrands: autoBrands.rows,
    autoModels: autoModels.rows,
    groups: groups.rows,
    subgroups: subgroups.rows,
  });
  const suffix = index === null ? '' : `-${index}`;
  const permissions = {
    changeAutoType: !disabled,
    changeAutoBrand: !disabled,
    changeAutoModel:
      !disabled &&
      !!branch?.autoTypeId &&
      branch?.autoTypeId !== 'none' &&
      !!branch?.autoBrandId &&
      branch?.autoBrandId !== 'none',
    changeGroup: !disabled,
    changeSubgroup:
      !disabled && !!branch?.groupId && branch?.groupId !== 'none',
  };

  useEffect(() => {
    setFilteredCategories(prev => ({
      ...prev,
      autoModels: autoModels.rows,
    }));
  }, [JSON.stringify(autoModels)]);

  useEffect(() => {
    setFilteredCategories(prev => ({
      ...prev,
      subgroups: subgroups.rows,
    }));
  }, [JSON.stringify(subgroups)]);

  const handleTagChange = (value: string) => {
    setBranch({
      ...branch,
      tag: value,
    });
  };

  const handleDescriptionChange = (value: string) => {
    setBranch({
      ...branch,
      description: value,
    });
  };

  const handleAutoTypeChange = async (id: string) => {
    const idIsNull = !id || id === 'none';
    const newBranch = {
      ...branch,
      autoTypeId: id,
    };
    if (idIsNull) {
      newBranch.autoModelIds = [];
      form.setFieldsValue({
        ['autoModelIds' + suffix]: [],
      });
    }
    setBranch({
      ...newBranch,
    });
    if (!branch.autoBrandId || idIsNull) return;
    const res = await APIRequest({
      method: 'get',
      url: API_ENDPOINTS.AUTO_MODEL_LIST,
      params: {
        autoType: id,
        autoBrand: branch.autoBrandId,
        showHidden: true,
      },
      requireAuth: true,
    });
    if (!res.isSucceed) return;
    const resData: IRowsWithCount<IAutoModel[]> = res.data;
    setAutoModels(resData);
  };

  const handleAutoBrandChange = async (id: string) => {
    const idIsNull = !id || id === 'none';
    const newBranch = {
      ...branch,
      autoBrandId: id,
    };
    if (idIsNull || id !== branch?.autoBrandId) {
      newBranch.autoModelIds = [];
      form.setFieldsValue({
        ['autoModelIds' + suffix]: [],
      });
    }
    setBranch({
      ...newBranch,
    });
    if (!branch.autoTypeId || idIsNull) return;
    const res = await APIRequest({
      method: 'get',
      url: API_ENDPOINTS.AUTO_MODEL_LIST,
      params: {
        autoType: branch.autoTypeId,
        autoBrand: id,
        showHidden: true,
      },
      requireAuth: true,
    });
    if (!res.isSucceed) return;
    const resData: IRowsWithCount<IAutoModel[]> = res.data;
    setAutoModels(resData);
  };

  const handleAutoModelChange = async (ids: string[]) => {
    setBranch({
      ...branch,
      autoModelIds: ids,
    });
  };

  const handleGroupChange = async (id: string) => {
    const idIsNull = !id || id === 'none';
    const newBranch = {
      ...branch,
      groupId: id,
    };
    if (idIsNull && newBranch?.subgroupId !== 'none') {
      newBranch.subgroupId = null;
      form.resetFields(['subgroup' + suffix]);
    }
    setBranch({
      ...newBranch,
    });
    if (idIsNull) return;
    const res = await APIRequest({
      method: 'get',
      url: API_ENDPOINTS.PRODUCT_GROUP_LIST,
      params: {
        parent: id,
        nestingLevel: 1,
        showHidden: true,
      },
      requireAuth: true,
    });
    if (!res.isSucceed) return;
    const resData: IRowsWithCount<IProductGroup[]> = res.data;
    setSubgroups(resData);
  };

  const handleSubgroupChange = async (id: string) => {
    setBranch({
      ...branch,
      subgroupId: id,
    });
  };

  const handleCategoriesSearch = (value: string, category: ICategoryLabel) => {
    setSearch(prev => ({
      ...prev,
      [category]: value,
    }));

    let url = '';
    let params: any = {
      search: value,
      showHidden: true,
    };
    switch (category) {
      case 'autoBrands':
        url = API_ENDPOINTS.AUTO_BRAND_LIST;
        break;
      case 'autoModels':
        url = API_ENDPOINTS.AUTO_MODEL_LIST;
        params.autoType = branch?.autoTypeId;
        params.autoBrand = branch?.autoBrandId;
        break;
      case 'groups':
        url = API_ENDPOINTS.PRODUCT_GROUP_LIST;
        params.parent = 'none';
        break;
      case 'subgroups':
        url = API_ENDPOINTS.PRODUCT_GROUP_LIST;
        params.parent = branch?.groupId;
        break;
    }
    setSearchTimeout(
      setTimeout(async () => {
        const res = await APIRequest({
          method: 'get',
          url,
          params,
          requireAuth: true,
        });
        if (!res.isSucceed) return;
        const resData: IRowsWithCount<IProductCategoryCommon[]> = res.data;
        setFilteredCategories(prev => ({
          ...prev,
          [category]: resData.rows,
        }));
      }, SEARCH_TIMEOUT_MS),
    );
  };

  return (
    <div
      className={classNames('product-form-branch', {
        'product-form-branch--main': branch.isMain,
      })}
    >
      {branch.isMain ? (
        <div className="product-form-branch-controls">
          <span className="color-gray">
            Все поля обязательны для заполнения!
          </span>
        </div>
      ) : (
        <div className="product-form-branch-controls d-flex justify-content-end">
          <span
            className="color-primary text-underline cursor-pointer user-select-none"
            onClick={() => deleteBranch(index)}
          >
            Удалить
          </span>
        </div>
      )}
      <FormGroup>
        {branch.isMain ? (
          <Form.Item
            label="Наименование"
            name={'name' + suffix}
            colon={false}
            rules={[
              {
                required: true,
                message: locale.validations.required,
              },
            ]}
            className="mb-10"
          >
            <Input disabled={disabled} size="small" />
          </Form.Item>
        ) : (
          <Form.Item
            label="Тег"
            name={'tag' + suffix}
            colon={false}
            // rules={[
            //   {
            //     required: true,
            //     message: locale.validations.required,
            //   },
            // ]}
            className="mb-10"
          >
            <Input
              onChange={e => handleTagChange(e.target.value)}
              disabled={disabled}
              size="small"
            />
          </Form.Item>
        )}

        <Form.Item
          name={'autoTypeId' + suffix}
          label="Вид"
          colon={false}
          rules={[
            {
              required: true,
              message: locale.validations.required,
            },
          ]}
          className="mb-10"
        >
          <Select
            size="small"
            disabled={!permissions.changeAutoType}
            onChange={(value: string) => handleAutoTypeChange(value)}
            showSearch={false}
            showArrow={true}
            options={[
              {
                key: 'none',
                value: 'none',
                label: 'Не указано',
              },
              ...autoTypes.rows.map(item => ({
                key: item.id,
                value: item.id,
                label: item.name,
              })),
            ]}
          />
        </Form.Item>

        <Form.Item
          name={'autoBrandId' + suffix}
          label="Марка"
          colon={false}
          rules={[
            {
              required: true,
              message: locale.validations.required,
            },
          ]}
        >
          <Select
            size="small"
            disabled={!permissions.changeAutoBrand}
            showSearch={true}
            searchValue={search.autoBrands}
            onSearch={value => handleCategoriesSearch(value, 'autoBrands')}
            filterOption={false}
            onChange={(value: string) => handleAutoBrandChange(value)}
            showArrow={true}
            notFoundContent={
              <span className="color-gray">Марки не найдены</span>
            }
            menuItemSelectedIcon={null}
            dropdownMatchSelectWidth={false}
            options={[
              {
                key: 'none',
                value: 'none',
                label: 'Не указано',
              },
              ...filteredCategories.autoBrands.map(item => ({
                key: item.id,
                value: item.id,
                label: item.name,
              })),
            ]}
          />
        </Form.Item>

        <Form.Item name={'autoModelIds' + suffix} label="Модель" colon={false}>
          <Select
            size="small"
            mode="multiple"
            disabled={!permissions.changeAutoModel}
            showSearch={true}
            searchValue={search.autoModels}
            onSearch={value => handleCategoriesSearch(value, 'autoModels')}
            filterOption={false}
            onChange={(value: string[]) => handleAutoModelChange(value)}
            showArrow={true}
            notFoundContent={
              <span className="color-gray">Модели не найдены</span>
            }
            menuItemSelectedIcon={null}
            dropdownMatchSelectWidth={false}
            options={filteredCategories.autoModels.map(item => ({
              key: item.id,
              value: item.id,
              label: item.name,
            }))}
          />
        </Form.Item>

        <Form.Item
          name={'groupId' + suffix}
          label="Категория"
          colon={false}
          rules={[
            {
              required: true,
              message: locale.validations.required,
            },
          ]}
        >
          <Select
            size="small"
            disabled={!permissions.changeGroup}
            showSearch={true}
            searchValue={search.groups}
            onSearch={value => handleCategoriesSearch(value, 'groups')}
            filterOption={false}
            onChange={(value: string) => handleGroupChange(value)}
            showArrow={true}
            notFoundContent={
              <span className="color-gray">Категории не найдены</span>
            }
            menuItemSelectedIcon={null}
            dropdownMatchSelectWidth={false}
            options={[
              {
                key: 'none',
                value: 'none',
                label: 'Не указано',
              },
              ...filteredCategories.groups.map(item => ({
                key: item.id,
                value: item.id,
                label: item.name,
              })),
            ]}
          />
        </Form.Item>

        <Form.Item
          name={'subgroupId' + suffix}
          label="Подкатегория"
          colon={false}
          rules={[
            {
              required: true,
              message: locale.validations.required,
            },
          ]}
        >
          <Select
            size="small"
            disabled={!permissions.changeSubgroup}
            showSearch={true}
            searchValue={search.subgroups}
            onSearch={value => handleCategoriesSearch(value, 'subgroups')}
            filterOption={false}
            onChange={(value: string) => handleSubgroupChange(value)}
            showArrow={true}
            notFoundContent={
              <span className="color-gray">Подкатегории не найдены</span>
            }
            menuItemSelectedIcon={null}
            dropdownMatchSelectWidth={false}
            options={[
              {
                key: 'none',
                value: 'none',
                label: 'Не указано',
              },
              ...filteredCategories.subgroups.map(item => ({
                key: item.id,
                value: item.id,
                label: item.name,
              })),
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Описание"
          name={'description' + suffix}
          colon={false}
          className="mb-10"
        >
          <TextEditor
            onChange={value => handleDescriptionChange(value)}
            disabled={disabled}
            height="100px"
            width="100%"
          />
        </Form.Item>
      </FormGroup>
    </div>
  );
};

export default ProductFormBranch;
