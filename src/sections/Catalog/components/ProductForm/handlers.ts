import { IUploadedFile } from 'components/common/FileInput/interfaces';
import { API_ENDPOINTS } from 'data/paths.data';
import { useRouter } from 'next/router';
import { RefObject, useEffect, useRef, useState } from 'react';
import { getBranchFormValues, getInitialProduct } from 'sections/Catalog/data';
import {
  IProduct,
  IProductApplicability,
} from 'sections/Catalog/interfaces/products.interfaces';
import { APIRequest } from 'utils/api.utils';
import { openNotification } from 'utils/common.utils';
import { IProductFormProps } from './interfaces';
import { v4 as uuidv4 } from 'uuid';
import { useOfferProductSelection } from 'hooks/offerProductSelection.hook';

export const SEARCH_TIMEOUT_MS = 300;

const getInitialProductBranch = ({ isMain }: { isMain: boolean }) => ({
  name: null,
  tag: null,
  description: null,
  manufacturer: null,
  autoTypeId: null,
  autoBrandId: null,
  autoModelsIds: [],
  groupId: null,
  subgroupId: null,
  isMain,
});

export const useHandlers = (props: IProductFormProps) => {
  const {
    product: productInitial,
    files,
    setFiles,
    branches,
    setBranches,
    mainBranch,
    setMainBranch,
    form,
    applicabilities,
    setApplicabilities,
    addedApplicabilities,
    setAddedApplicabilities,
    updatedApplicabilities,
    setUpdatedApplicabilities,
    deletedApplicabilityIds,
    setDeletedApplicabilityIds,
    analogProducts,
    setAnalogProducts,
    addedAnalogIds,
    setAddedAnalogIds,
    deletedAnalogIds,
    setDeletedAnalogIds,
    onChangeAllowedUpdate,
  } = props;

  const router = useRouter();
  const branchListRef: RefObject<HTMLDivElement> = useRef();
  const branchListWrapperRef: RefObject<HTMLDivElement> = useRef();
  const [product, setProduct] = useState(productInitial || getInitialProduct());
  const [foundProducts, setFoundProducts] = useState<IProduct[]>([]);
  const [branchListWrapperWidth, setBranchListWrapperWidth] = useState(0);
  const [stateCounter, setStateCounter] = useState(0);
  const [changeAllowed, setChangeAllowed] = useState(props?.changeAllowed);
  const [searchTimeout, setSearchTimeout] = useState(null as NodeJS.Timeout);
  const [analogsSearch, setAnalogsSearch] = useState('');
  const [analogOptions, setAnalogOptions] = useState<IProduct[]>([]);
  const offerProductSelection = useOfferProductSelection();
  const applicabilitiesRef: RefObject<HTMLDivElement> = useRef();
  const analogsRef: RefObject<HTMLDivElement> = useRef();

  const productExist = !!product?.id;
  const isInOrderRequest = !!offerProductSelection?.products?.find(
    el => el?.productId === product?.id,
  );
  const branchListWidth = (branches.length + 1) * 290 + 10;
  const scrollMaxValue = branchListWidth - branchListWrapperWidth;

  useEffect(() => {
    const wrapperDiv = branchListWrapperRef?.current;
    if (!wrapperDiv) return;
    setBranchListWrapperWidth(wrapperDiv.clientWidth);
    // const div = branchListRef?.current;
    // if (!div) return;
    console.log('WRAPPER WIDTH', wrapperDiv.clientWidth);
    // setBranchListWidth(div.clientWidth);

    // wrapperDiv.addEventListener('scroll', e => {
    //   console.log(e.target);
    // });
  }, []);

  useEffect(() => {
    onChangeAllowedUpdate(changeAllowed);
  }, [changeAllowed]);

  useEffect(() => {
    form.setFields(
      applicabilities.rows.flatMap((row, i) => [
        {
          name: `applicability.autoBrandId-${i}`,
          value: row?.autoBrandId,
        },
        {
          name: `applicability.autoBrandName-${i}`,
          value: row?.autoBrandName,
        },
        {
          name: `applicability.autoModelId-${i}`,
          value: row?.autoModelId,
        },
        {
          name: `applicability.autoModelName-${i}`,
          value: row?.autoModelName,
        },
        {
          name: `applicability.article-${i}`,
          value: row?.article,
        },
      ]),
    );
  }, [applicabilities?.rows]);

  const handleArticleChange = (value: string) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    if (value.trim().length <= 0) {
      setChangeAllowed(false);
      return;
    }

    setSearchTimeout(
      setTimeout(async () => {
        const res = await APIRequest({
          method: 'get',
          url: API_ENDPOINTS.PRODUCT_LIST,
          params: {
            search: value,
            exactSearch: true,
            searchFields: ['article'],
          },
        });
        if (!res.isSucceed) return;

        // if (!productData) {
        setChangeAllowed(true);

        const newFormValue = {
          ...product,
          ...getInitialProduct(),
        };
        delete newFormValue.article;
        form.setFieldsValue(newFormValue);
        setProduct({
          ...product,
          article: value,
        });

        const products: IProduct[] = res?.data?.rows;
        setFoundProducts(products || []);

        // } else {
        //   setChangeAllowed(true);

        //   const newFormValue = {
        //     ...getInitialProduct(),
        //     // ...productData,
        //   };
        //   delete newFormValue.article;
        //   form.setFieldsValue(newFormValue);
        //   setProduct({
        //     ...productData,
        //   });
        //   setFiles(
        //     productData.productFiles.map(({ file }) => ({ id: file.id })),
        //   );
        //   openNotification('Такой товар уже существует');
        // }
      }, SEARCH_TIMEOUT_MS),
    );
  };

  const changeSliderValue = (value: number) => {
    const div = branchListRef?.current;
    if (!div) return;
    div.scrollTo({ left: value });
  };

  const addBranch = () => {
    setBranches(prev =>
      prev.concat(getInitialProductBranch({ isMain: false })),
    );
  };

  const deleteBranch = (index: number) => {
    const lastIndex = branches.length - 1;
    setBranches(prev => prev.filter((__, i) => i !== index));
    const newBranches = branches.filter((__, i) => i !== index);
    let values: any = {};
    for (let i = 0; i < newBranches.length; i++) {
      const branch = newBranches[i];
      const suffix = '-' + i;
      values = {
        ...values,
        ...getBranchFormValues(branch, suffix),
      };
    }
    form.setFieldsValue(values);

    const suffix = '-' + lastIndex;
    form.setFieldsValue({
      ['tag' + suffix]: null,
      ['description' + suffix]: null,
      ['autoTypeId' + suffix]: null,
      ['autoBrandId' + suffix]: null,
      ['autoModelIds' + suffix]: [],
      ['groupId' + suffix]: null,
      ['subgroupId' + suffix]: null,
    });
  };

  const onFileUpload = (uploadedFiles: IUploadedFile[]) => {
    setFiles(prev => [...prev, ...uploadedFiles]);
  };

  const onFileDelete = (fileId: string) => {
    setFiles(files.filter(({ id }) => id !== fileId));
  };

  const addApplicability = () => {
    const newItem: IProductApplicability = {
      id: uuidv4(),
      productId: null,
      autoTypeId: null,
      autoType: null,
      autoBrandId: null,
      autoBrand: null,
      autoBrandName: null,
      autoModelId: null,
      autoModel: null,
      autoModelName: null,
      article: null,
      autoBrandInputMode: 'id',
      autoModelInputMode: 'id',
    };
    setApplicabilities(prev => ({
      count: prev.count + 1,
      rows: prev.rows.concat(newItem),
    }));
    setAddedApplicabilities(prev => prev.concat(newItem));
    setStateCounter(prev => prev + 1);
    if (!applicabilitiesRef?.current) return;
    applicabilitiesRef.current.scrollTo({ top: 99999 });
  };

  const changeApplicability = (data: IProductApplicability, index: number) => {
    const item = applicabilities.rows[index];
    if (!!item?.productId) {
      let updatedItemIndex = updatedApplicabilities.findIndex(
        el => el.id === item.id,
      );
      if (updatedItemIndex === -1) {
        setUpdatedApplicabilities(prev => prev.concat({ ...data }));
      } else {
        updatedApplicabilities[updatedItemIndex] = { ...data };
        setUpdatedApplicabilities([...updatedApplicabilities]);
      }
    } else {
      let addedItemIndex = addedApplicabilities.findIndex(
        el => el.id === item.id,
      );
      if (addedItemIndex !== -1) {
        addedApplicabilities[addedItemIndex] = { ...data };
        setAddedApplicabilities([...addedApplicabilities]);
      }
    }
    applicabilities.rows[index] = { ...data };
    setApplicabilities({ ...applicabilities });
    setStateCounter(prev => prev + 1);
  };

  const deleteApplicability = (index: number) => {
    const item = applicabilities.rows[index];
    if (!!item?.productId)
      setDeletedApplicabilityIds(prev => prev.concat(item.id));
    const newRows = applicabilities.rows.filter((__, i) => i !== index);
    setApplicabilities(prev => ({
      count: prev.count - 1,
      rows: newRows,
    }));
    setAddedApplicabilities(prev => prev.filter(el => el.id !== item.id));
    setStateCounter(prev => prev + 1);
    form.setFields(
      newRows.flatMap((row, i) => [
        {
          name: `applicability.autoBrandId-${i}`,
          value: row?.autoBrandId,
        },
        {
          name: `applicability.autoBrandName-${i}`,
          value: row?.autoBrandName,
        },
        {
          name: `applicability.autoModelId-${i}`,
          value: row?.autoModelId,
        },
        {
          name: `applicability.autoModelName-${i}`,
          value: row?.autoModelName,
        },
        {
          name: `applicability.article-${i}`,
          value: row?.article,
        },
      ]),
    );
  };

  const changeApplicabilityAutoBrandInputMode = (
    value: boolean,
    index: number,
  ) => {
    applicabilities.rows[index].autoBrandInputMode = value ? 'id' : 'name';
    setApplicabilities({ ...applicabilities });
    setStateCounter(prev => prev + 1);
  };

  const changeApplicabilityAutoModelInputMode = (
    value: boolean,
    index: number,
  ) => {
    applicabilities.rows[index].autoModelInputMode = value ? 'id' : 'name';
    setApplicabilities({ ...applicabilities });
    setStateCounter(prev => prev + 1);
  };

  const handleAnalogsSearch = (value: string) => {
    setAnalogsSearch(value);
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (!value?.trim()?.length) {
      setAnalogOptions([]);
      return;
    }

    setSearchTimeout(
      setTimeout(async () => {
        const res = await APIRequest({
          method: 'get',
          url: API_ENDPOINTS.PRODUCT_LIST,
          params: {
            search: value,
            searchFields: ['article', 'name'],
            pageSize: 24,
            excludeIds: [product?.id].filter(Boolean),
          },
        });
        const products: IProduct[] = res?.data?.rows;
        if (!products) return;

        setAnalogOptions(products);
      }, SEARCH_TIMEOUT_MS),
    );
  };

  const handleAnalogSelect = (product: IProduct) => {
    if (!!analogProducts.rows.find(el => el.id === product.id)) {
      openNotification('Этот товар уже находится в аналогах');
      return;
    }
    setAnalogProducts(prev => ({
      count: prev.count + 1,
      rows: prev.rows.concat(product),
    }));
    setAnalogsSearch(analogsSearch);
    setAddedAnalogIds(prev => prev.concat(product.id));
    form.setFieldsValue({ analogsSearch: '' });
    if (!analogsRef?.current) return;
    analogsRef.current.scrollTo({ top: 99999 });
  };

  const deleteAnalog = (index: number) => {
    const item = analogProducts.rows[index];
    setAnalogProducts(prev => ({
      count: prev.count - 1,
      rows: prev.rows.filter((__, i) => i !== index),
    }));
    setAddedAnalogIds(prev => prev.filter(itemId => itemId !== item.id));
    setDeletedAnalogIds(prev => prev.concat(item.id));
    setStateCounter(prev => prev + 1);
  };

  return {
    router,
    branchListRef,
    branchListWrapperRef,
    branchListWrapperWidth,
    product,
    setProduct,
    foundProducts,
    setFoundProducts,
    branches,
    setBranches,
    setStateCounter,
    mainBranch,
    setMainBranch,
    changeAllowed,
    setChangeAllowed,
    searchTimeout,
    setSearchTimeout,
    productExist,
    isInOrderRequest,
    branchListWidth,
    scrollMaxValue,
    applicabilitiesRef,
    analogsSearch,
    setAnalogsSearch,
    analogOptions,
    analogProducts,
    analogsRef,
    handleArticleChange,
    changeSliderValue,
    addBranch,
    deleteBranch,
    onFileUpload,
    onFileDelete,
    addApplicability,
    changeApplicability,
    deleteApplicability,
    changeApplicabilityAutoBrandInputMode,
    changeApplicabilityAutoModelInputMode,
    handleAnalogsSearch,
    handleAnalogSelect,
    deleteAnalog,
  };
};
