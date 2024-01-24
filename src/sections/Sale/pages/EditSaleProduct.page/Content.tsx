import { Button, Form } from 'antd';
import {
  BreadCrumbs,
  ConfirmModal,
  Page,
  PageContent,
  Summary,
} from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import { IOrganization } from 'sections/Organizations/interfaces';
import { ISaleProduct } from 'sections/Sale/interfaces/sale.interfaces';
import { IRowsWithCount, ISetState } from 'interfaces/common.interfaces';
import {
  IAutoBrand,
  IAutoType,
  IProductGroup,
} from 'sections/Catalog/interfaces/categories.interfaces';
import { useHandlers } from './handlers';
import {
  getInitialSaleProductFormValues,
  onSaleFormFieldsChange,
} from 'sections/Sale/utils/sale.utils';
import SaleProductForm from 'sections/Sale/components/SaleProductForm';
import { FC } from 'react';
import { PRODUCT_STATUSES } from 'sections/Catalog/data';

interface IProps {
  product: ISaleProduct;
  autoTypes: IRowsWithCount<IAutoType[]>;
  setAutoTypes: ISetState<IProps['autoTypes']>;
  autoBrands: IRowsWithCount<IAutoBrand[]>;
  setAutoBrands: ISetState<IProps['autoBrands']>;
  groups: IRowsWithCount<IProductGroup[]>;
  setGroups: ISetState<IProps['groups']>;
  organizations: IOrganization[];
}

const EditSaleProductPageContent: FC<IProps> = ({
  product,
  autoTypes,
  setAutoTypes,
  autoBrands,
  setAutoBrands,
  groups,
  setGroups,
  organizations,
}) => {
  const {
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
    setChangeAllowed,
    deletionModalVisible,
    setDeletionModalVisible,
    deletionSubmitting,
    handleDelete,
    handleSubmit,
    formFailed,
    isDisabled,
    setIsDisabled,
  } = useHandlers({ product });

  return (
    <Page className="personal-area-page">
      <BreadCrumbs
        list={[
          {
            link: APP_PATHS.SALE_PRODUCT_LIST,
            text: locale.common.productSale,
          },
          {
            link: APP_PATHS.EDIT_SALE_PRODUCT(product.sale.id),
            text: locale.catalog.editProduct,
          },
        ]}
      />
      <PageContent className="addSaleProduct-form">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ height: '100%' }}
          className="product-form"
          initialValues={getInitialSaleProductFormValues(product)}
          onFieldsChange={() => onSaleFormFieldsChange(form, setIsDisabled)}
          onFinishFailed={formFailed}
          requiredMark={false}
        >
          <SaleProductForm
            disableProductFields={product.status !== PRODUCT_STATUSES.SALE}
            product={product}
            autoTypes={autoTypes}
            setAutoTypes={setAutoTypes}
            autoBrands={autoBrands}
            setAutoBrands={setAutoBrands}
            groups={groups}
            setGroups={setGroups}
            branches={branches}
            setBranches={setBranches}
            mainBranch={mainBranch}
            setMainBranch={setMainBranch}
            changeAllowed
            files={files}
            setFiles={setFiles}
            form={form}
            onChangeAllowedUpdate={value => setChangeAllowed(value)}
            action="update"
            organizations={organizations}
          />
        </Form>
      </PageContent>
      <Summary containerClassName="d-flex justify-content-end">
        <Button
          onClick={e => {
            e.preventDefault();
            setDeletionModalVisible(true);
          }}
          className="gray mr-10"
        >
          Удалить
        </Button>
        <Button
          onClick={() => {
            router.push(APP_PATHS.SALE_PRODUCT_LIST);
          }}
          className="gray mr-10"
        >
          Отмена
        </Button>
        <Button
          onClick={e => {
            e.preventDefault();
            form.submit();
          }}
          type="primary"
          disabled={isDisabled}
        >
          Сохранить
        </Button>
      </Summary>

      <ConfirmModal
        open={deletionModalVisible}
        onClose={() => setDeletionModalVisible(false)}
        title="Вы уверены что хотите удалить товар?"
        onConfirm={handleDelete}
        submitAwaiting={deletionSubmitting}
      />
    </Page>
  );
};

export default EditSaleProductPageContent;
