import { IUploadedFile } from 'components/common/FileInput/interfaces';
import { API_ENDPOINTS } from 'data/paths.data';
import { useLocale } from 'hooks/locale.hook';
import { useState } from 'react';
import { IOrganization } from 'sections/Organizations/interfaces';
import { APIRequest } from 'utils/api.utils';
import { ISaleProductFormProps } from './interfaces';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import {
  IAutoBrand,
  IAutoModel,
  IProductCategoryCommon,
  IProductGroup,
} from 'sections/Catalog/interfaces/categories.interfaces';

export const SEARCH_TIMEOUT_MS = 300;
type ICategoryLabel = 'autoBrands' | 'autoModels' | 'groups' | 'subgroups';

export const useHandlers = (props: ISaleProductFormProps) => {
  const {
    files,
    setFiles,
    disabled,
    organizations,
    index,
    groups,
    setGroups,
    branch,
    autoBrands,
    setAutoBrands,
    setBranch,
    form,
    product,
  } = props;

  //  ProductSaleForm
  const onFileUpload = (uploadedFiles: IUploadedFile[]) => {
    console.log(uploadedFiles);
    setFiles(prev => [...prev, ...uploadedFiles]);
  };

  const onFileDelete = (fileId: string) => {
    setFiles(files.filter(({ id }) => id !== fileId));
  };

  // ProductSaleFormBranch
  const { locale } = useLocale();
  const [selectedOrganization, setSelectedOrganization] =
    useState<IOrganization | null>(product?.sale?.organization);

  const changeOrganization = (value: string) => {
    if (!String(value)) return;

    const org = organizations.find(({ id }) => id == value);

    if (!org) return;

    setSelectedOrganization(org);
  };

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
    changeAutoBrand:
      !disabled &&
      !!branch?.autoTypeId &&
      branch?.autoTypeId !== 'none' &&
      branch?.autoTypeId !== 'relatedProducts',
    changeAutoModel:
      !disabled &&
      !!branch?.autoTypeId &&
      branch?.autoTypeId !== 'none' &&
      branch?.autoTypeId !== 'relatedProducts' &&
      !!branch?.autoBrandId &&
      branch?.autoBrandId !== 'none',
    changeGroup:
      !disabled && !!branch?.autoTypeId && branch?.autoTypeId !== 'none',
    changeSubgroup:
      !disabled && !!branch?.groupId && branch?.groupId !== 'none',
  };
  const rules = {
    autoBrandRequired: permissions.changeAutoBrand,
    groupRequired: branch?.autoTypeId === 'relatedProducts',
  };

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

    newBranch.autoBrandId = null;
    newBranch.autoModelIds = [];
    newBranch.groupId = null;
    form.setFieldsValue({
      ['autoBrandId' + suffix]: null,
      ['autoModelIds' + suffix]: [],
      ['groupId' + suffix]: null,
    });

    setBranch({
      ...newBranch,
    });

    if (!idIsNull && id !== 'relatedProducts') {
      const res = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.AUTO_BRAND_LIST,
        params: {
          autoType: id,
          showHidden: true,
          mode: 'saleEdit',
        },
        requireAuth: true,
      });
      console.log('res.data', res.data);
      if (!res.isSucceed) return;
      const resData: IRowsWithCount<IAutoBrand[]> = res.data;
      setAutoBrands(resData);
    }

    if (!!branch.autoBrandId && !idIsNull && id !== 'relatedProducts') {
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
    }

    if (!idIsNull) {
      const params =
        id === 'relatedProducts'
          ? {
              parent: 'none',
              showHidden: true,
              mode: 'saleEdit',
            }
          : {
              parent: 'none',
              showHidden: true,
              autoType: id,
              autoBrand: branch.autoBrandId,
            };
      const res = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.PRODUCT_GROUP_LIST,
        params: params,
        requireAuth: true,
      });
      if (!res.isSucceed) return;
      const resData: IRowsWithCount<IProductGroup[]> = res.data;
      setGroups(resData);
    }
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
    if (!!branch.autoTypeId && !idIsNull) {
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
    }

    if (!idIsNull) {
      const params =
        branch?.autoTypeId === 'relatedProducts'
          ? {
              parent: 'none',
              showHidden: true,
              mode: 'saleEdit',
            }
          : {
              parent: 'none',
              showHidden: true,
              autoType: id,
              autoBrand: branch.autoBrandId,
            };
      const res = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.PRODUCT_GROUP_LIST,
        params: params,
        requireAuth: true,
      });
      if (!res.isSucceed) return;
      const resData: IRowsWithCount<IProductGroup[]> = res.data;
      setGroups(resData);
    }
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
      mode: 'saleEdit',
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

  return {
    onFileUpload,
    onFileDelete,
    locale,
    selectedOrganization,
    setSelectedOrganization,
    changeOrganization,
    searchTimeout,
    setSearchTimeout,
    search,
    setSearch,
    filteredCategories,
    setFilteredCategories,
    permissions,
    rules,
    handleTagChange,
    handleDescriptionChange,
    handleAutoTypeChange,
    handleAutoBrandChange,
    handleAutoModelChange,
    handleGroupChange,
    handleSubgroupChange,
    handleCategoriesSearch,
    autoBrands,
    autoModels,
    setAutoModels,
    groups,
    setGroups,
    subgroups,
    suffix,
  };
};
