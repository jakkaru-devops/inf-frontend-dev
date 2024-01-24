import { Form } from 'antd';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';
import { APP_PATHS } from 'data/paths.data';
import { useRouter } from 'next/router';
import { APIRequest } from 'utils/api.utils';
import { generateUrl, openNotification } from 'utils/common.utils';
import { useLocale } from 'hooks/locale.hook';
import { useProductSaleAdd } from './useProductSaleAdd';
import { API_ENDPOINTS_V2 } from 'data/api.data';
import { IProduct } from 'sections/Catalog/interfaces/products.interfaces';

interface IProps {
  sourceProduct?: IProduct;
}

export const useHandlers = ({ sourceProduct }: IProps) => {
  const [form] = Form.useForm();
  const { locale } = useLocale();
  const router = useRouter();
  const {
    submitAwaiting,
    setSubmitAwaiting,
    branches,
    setBranches,
    mainBranch,
    setMainBranch,
    files,
    setFiles,
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
    changeAllowed,
    setChangeAllowed,
    isDisabled,
    setIsDisabled,
  } = useProductSaleAdd({ sourceProduct });

  const formFailed = () => {
    openNotification('Необходимо заполнить все обязательные поля');
  };

  const handleSubmit = async (values: any) => {
    if (submitAwaiting) return;
    setSubmitAwaiting(true);

    try {
      const data = {
        product: {
          article: values.article,
          name: values.name,
          description: values.description,
          manufacturer: values.manufacturer,
          files,
          branches: [],
          sourceProductId: sourceProduct?.id,
        },
        sale: {
          organizationId: values.organizationId,
          price: +values.price,
          previousPrice: +values.previousPrice,
          amount: values.amount,
        },
      };

      data.product.branches = [mainBranch].concat(branches).map((branch, i) => {
        const suffix = i === 0 ? '' : `-${i - 1}`;
        const branchData = {
          isMain: !!branch?.isMain,
          tag: values?.['tag' + suffix],
          description: values?.['description' + suffix],
          autoTypeId: values?.['autoTypeId' + suffix],
          autoBrandId: values?.['autoBrandId' + suffix],
          autoModelIds: (values?.['autoModelIds' + suffix] as string[]) || [],
          groupId: values?.['groupId' + suffix],
          subgroupId: values?.['subgroupId' + suffix],
        };
        if (
          branchData.autoTypeId === 'none' ||
          branchData.autoTypeId === 'relatedProducts'
        )
          branchData.autoTypeId = null;
        if (branchData.autoBrandId === 'none') branchData.autoBrandId = null;
        branchData.autoModelIds = branchData.autoModelIds.filter(
          el => el !== 'none',
        );
        if (branchData.groupId === 'none') branchData.groupId = null;
        if (branchData.subgroupId === 'none') branchData.subgroupId = null;
        return branchData;
      });

      const res = await APIRequest({
        method: 'post',
        url: API_ENDPOINTS_V2.sale.createProduct,
        data,
        requireAuth: true,
      });
      setSubmitAwaiting(false);

      if (!res.isSucceed) {
        openNotification(res?.message);
        return;
      }

      console.log('saleProduct created successfully', data);

      router.push(
        generateUrl(
          { history: DEFAULT_NAV_PATHS.SALE_PRODUCT_LIST },
          { pathname: APP_PATHS.SALE_PRODUCT_LIST },
        ),
      );
    } catch (e) {
      console.log('failed to create saleProduct');
      setSubmitAwaiting(false);
    }
  };

  return {
    router,
    locale,
    formFailed,
    submitAwaiting,
    setSubmitAwaiting,
    branches,
    setBranches,
    mainBranch,
    setMainBranch,
    handleSubmit,
    isDisabled,
    files,
    setFiles,
    applicabilities,
    setApplicabilities,
    setAddedApplicabilities,
    addedApplicabilities,
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
    changeAllowed,
    setChangeAllowed,
    form,
    setIsDisabled,
  };
};
