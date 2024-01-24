import { Form, FormInstance, Input, Select } from 'antd';
import {
  FileUpload,
  FormGroup,
  InputNumber,
  TextEditor,
} from 'components/common';
import { API_ENDPOINTS } from 'data/paths.data';
import { Dispatch, FC, SetStateAction } from 'react';
import { IMAGE_EXTENSIONS } from 'data/files.data';
import { getServerFileUrl } from 'utils/files.utils';
import { IUploadedFile } from 'components/common/FileInput/interfaces';
import { IOrganization } from 'sections/Organizations/interfaces';
import { IProductBranch } from 'sections/Catalog/interfaces/products.interfaces';
import { ISaleProduct } from 'sections/Sale/interfaces/sale.interfaces';
import { IRowsWithCount, ISetState } from 'interfaces/common.interfaces';
import {
  IAutoBrand,
  IAutoType,
  IProductGroup,
} from 'sections/Catalog/interfaces/categories.interfaces';
import { useHandlers } from './handlers';
import { useDeepCompareEffect } from 'react-use';
import { IProductFormProps } from 'sections/Catalog/components/ProductForm/interfaces';

interface IProps {
  branch: IProductBranch;
  setBranch: (data: IProductBranch) => void;
  product: ISaleProduct;
  form: FormInstance<any>;
  disabled: boolean;
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
  index: number;
  deleteBranch: (i: number) => void;
  onFileDelete?: (fileId: string) => void;
  onFileUpload?: (uploadedFiles: IUploadedFile[]) => void;
  organizations: IOrganization[];
  files?: IUploadedFile[];
  setFiles?: Dispatch<SetStateAction<IUploadedFile[]>>;
  changeAllowed: boolean;
  onChangeAllowedUpdate: (value: boolean) => void;
  action: 'create' | 'update';
  disableProductFields?: boolean;
}

const SaleProductFormBranch: FC<IProps> = props => {
  const { product, disabled, autoTypes, organizations, disableProductFields } =
    props;
  const {
    onFileUpload,
    onFileDelete,
    locale,
    changeOrganization,
    search,
    filteredCategories,
    setFilteredCategories,
    permissions,
    rules,
    handleDescriptionChange,
    handleAutoTypeChange,
    handleAutoBrandChange,
    handleAutoModelChange,
    handleGroupChange,
    handleSubgroupChange,
    handleCategoriesSearch,
    autoBrands,
    autoModels,
    groups,
    subgroups,
  } = useHandlers({ ...props });

  useDeepCompareEffect(() => {
    setFilteredCategories(prev => ({
      ...prev,
      autoBrands: autoBrands.rows,
    }));
  }, [autoBrands.rows]);

  useDeepCompareEffect(() => {
    setFilteredCategories(prev => ({
      ...prev,
      autoModels: autoModels.rows,
    }));
  }, [autoModels.rows]);

  useDeepCompareEffect(() => {
    setFilteredCategories(prev => ({
      ...prev,
      groups: groups.rows,
    }));
  }, [groups.rows]);

  useDeepCompareEffect(() => {
    setFilteredCategories(prev => ({
      ...prev,
      subgroups: subgroups.rows,
    }));
  }, [subgroups.rows]);

  // Star in form - position: left;
  const Label = ({ children, requiredMarkPosition }) => {
    return (
      <label>
        {requiredMarkPosition === 'start' && (
          <span className="star-form"> *</span>
        )}
        {children}
        {requiredMarkPosition === 'end' && (
          <span className="star-form"> *</span>
        )}
      </label>
    );
  };

  return (
    <div className="d-flex">
      <div className="mr-40">
        <FormGroup style={{ position: 'relative' }}>
          <Form.Item
            label={
              <Label requiredMarkPosition="end">Наименование товара</Label>
            }
            name={'name'}
            colon={false}
            rules={[
              {
                required: true,
                message: locale.validations.required,
              },
            ]}
            className="mb-10"
          >
            <Input disabled={disabled || disableProductFields} size="small" />
          </Form.Item>
          <Form.Item
            label={<Label requiredMarkPosition="end">Артикул</Label>}
            name={'article'}
            colon={false}
            rules={[
              {
                required: true,
                message: locale.validations.required,
              },
            ]}
            className="mb-10"
          >
            <Input disabled={disabled || disableProductFields} size="small" />
          </Form.Item>

          <Form.Item
            name={'autoTypeId'}
            label={<Label requiredMarkPosition="end">Вид</Label>}
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
              disabled={!permissions.changeAutoType || disableProductFields}
              onChange={(value: string) => handleAutoTypeChange(value)}
              showSearch={false}
              showArrow={true}
              options={[
                ...autoTypes.rows.map(item => ({
                  key: item.id,
                  value: item.id,
                  label: item.name,
                })),
              ]}
            />
          </Form.Item>
          <Form.Item
            name={'autoBrandId'}
            label={'Марка'}
            colon={false}
            rules={
              rules.autoBrandRequired && [
                {
                  required: true,
                  message: locale.validations.required,
                },
              ]
            }
          >
            <Select
              size="small"
              disabled={!permissions.changeAutoBrand || disableProductFields}
              showSearch={false}
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

          <Form.Item name={'autoModelIds'} label="Модель" colon={false}>
            <Select
              size="small"
              mode="multiple"
              disabled={!permissions.changeAutoModel || disableProductFields}
              showSearch={false}
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
            name={'groupId'}
            label="Категория"
            colon={false}
            rules={
              rules.groupRequired && [
                {
                  required: true,
                  message: locale.validations.required,
                },
              ]
            }
          >
            <Select
              size="small"
              disabled={!permissions.changeGroup || disableProductFields}
              showSearch={false}
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

          <Form.Item name={'subgroupId'} label="Подкатегория" colon={false}>
            <Select
              size="small"
              disabled={!permissions.changeSubgroup || disableProductFields}
              showSearch={false}
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
            label="Бренд"
            name={'manufacturer'}
            colon={false}
            className="mb-10"
          >
            <Input disabled={disabled || disableProductFields} size="small" />
          </Form.Item>

          <Form.Item
            name={'organizationId'}
            label={<Label requiredMarkPosition="end">Поставщик</Label>}
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
              className="w-100"
              defaultValue={product?.sale?.organizationId}
              // value={product?.organizationId}
              onChange={organizationId =>
                changeOrganization(organizationId as string)
              }
            >
              {organizations?.map(org => (
                <Select.Option key={org.id} value={org.id}>
                  {org.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </FormGroup>
      </div>
      <FormGroup>
        <Form.Item
          label="Цена старая"
          name={'previousPrice'}
          colon={false}
          className="mb-10"
        >
          <InputNumber
            min={0}
            precision={2}
            size="small"
            style={{ width: '100%', paddingLeft: '5px' }}
          />
        </Form.Item>
        <Form.Item
          label={<Label requiredMarkPosition="end">Цена новая</Label>}
          name={'price'}
          colon={false}
          rules={[
            {
              required: true,
              message: locale.validations.required,
            },
          ]}
          className="mb-10"
        >
          <InputNumber
            min={0}
            precision={2}
            size="small"
            style={{ width: '100%', paddingLeft: '5px' }}
          />
        </Form.Item>
        <Form.Item
          label={<Label requiredMarkPosition="end">В наличии шт.</Label>}
          name={'amount'}
          colon={false}
          rules={[
            {
              required: true,
              message: locale.validations.required,
            },
          ]}
          className="mb-10"
        >
          <InputNumber
            min={0}
            precision={0}
            disabled={disabled}
            size="small"
            style={{ width: '100%', paddingLeft: '5px' }}
          />
        </Form.Item>
        <Form.Item
          label="Описание"
          name={'description'}
          colon={false}
          className="mb-10"
        >
          <TextEditor
            autoFocus={false}
            onChange={value => handleDescriptionChange(value)}
            disabled={disabled || disableProductFields}
            height="100px"
            width="100%"
          />
        </Form.Item>
        <FileUpload
          textInputFile="Добавить фото"
          url={API_ENDPOINTS.FILE_UNKNOWN}
          onFileUploaded={({ id }) => onFileUpload([{ id }])}
          onDelete={file => onFileDelete(file.id)}
          accept={IMAGE_EXTENSIONS.map(ext => `.${ext}`).join(',')}
          disabled={disabled || disableProductFields}
          initFiles={product?.productFiles?.map(({ file }) => ({
            ...file,
            url: getServerFileUrl(file?.path),
          }))}
          className="mb-20"
        />
      </FormGroup>
    </div>
  );
};

export default SaleProductFormBranch;
