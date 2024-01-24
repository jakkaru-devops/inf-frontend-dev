import { Form } from 'antd';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { useLocale } from 'hooks/locale.hook';
import { useRouter } from 'next/router';
import { IProductBranch } from 'sections/Catalog/interfaces/products.interfaces';
import { ISaleProduct } from 'sections/Sale/interfaces/sale.interfaces';
import { APIRequest } from 'utils/api.utils';
import { generateUrl, openNotification } from 'utils/common.utils';
import { useProductSaleEdit } from './useProductSaleEdit';
import { API_ENDPOINTS_V2 } from 'data/api.data';

interface IProps {
  product: ISaleProduct;
}

export const useHandlers = ({ product }: IProps) => {
  const { locale } = useLocale();
  const router = useRouter();
  const [form] = Form.useForm();
  const {
    deletionModalVisible,
    setDeletionModalVisible,
    deletionSubmitting,
    setDeletionSubmitting,
    deletedAnalogIds,
    setDeletedAnalogIds,
    addedAnalogIds,
    setAddedAnalogIds,
    submitAwaiting,
    setSubmitAwaiting,
    changeAllowed,
    setChangeAllowed,
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
    isDisabled,
    setIsDisabled,
  } = useProductSaleEdit({ product });

  const handleDelete = async () => {
    setDeletionSubmitting(true);
    try {
      const res = await APIRequest({
        method: 'delete',
        url: API_ENDPOINTS_V2.sale.deleteProduct(product.sale.id),
        requireAuth: true,
      });
      setDeletionSubmitting(false);
      if (!res.isSucceed) {
        openNotification(res?.message);
        return;
      }
      openNotification(res?.message || 'Товар удален');
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.SALE_PRODUCT_LIST,
          },
          {
            pathname: APP_PATHS.SALE_PRODUCT_LIST,
          },
        ),
      );
    } catch (e) {
      console.log('failed to uninstall saleProduct');
      setDeletionSubmitting(false);
    }
  };

  const formFailed = () => {
    openNotification('Необходимо заполнить все обязательные поля');
  };

  const handleSubmit = async (values: any) => {
    if (submitAwaiting) return;
    setSubmitAwaiting(true);

    const data = {
      product: {
        article: values.article,
        name: values.name,
        description: values.description,
        manufacturer: values.manufacturer,
        files,
        branches: [],
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
        id: branch.id,
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

    try {
      const res = await APIRequest({
        method: 'put',
        url: API_ENDPOINTS_V2.sale.updateProduct(product.sale.id),
        data,
        requireAuth: true,
      });

      setSubmitAwaiting(false);

      if (!res.isSucceed) {
        openNotification(res?.message);
        return;
      }

      console.log('saleProduct edit successfully', data);
      router.push(APP_PATHS.SALE_PRODUCT_LIST);
    } catch (e) {
      console.log('saleProduct edit error');
      setSubmitAwaiting(false);
    }
  };

  return {
    locale,
    router,
    form,
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
    deletionModalVisible,
    setDeletionModalVisible,
    deletionSubmitting,
    setDeletionSubmitting,
    submitAwaiting,
    setSubmitAwaiting,
    handleDelete,
    handleSubmit,
    formFailed,
    isDisabled,
    setIsDisabled,
  };
};
