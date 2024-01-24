import { Button, Form } from 'antd';
import { BreadCrumbs, Page, PageContent, Summary } from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import { IOrganization } from 'sections/Organizations/interfaces';
import Link from 'next/link';
import { FC } from 'react';
import { IRowsWithCount, ISetState } from 'interfaces/common.interfaces';
import {
  IAutoBrand,
  IAutoType,
  IProductGroup,
} from 'sections/Catalog/interfaces/categories.interfaces';
import SaleProductForm from 'sections/Sale/components/SaleProductForm';
import { useHandlers } from './handlers';
import {
  getInitialSaleProductFormValues,
  onSaleFormFieldsChange,
} from 'sections/Sale/utils/sale.utils';
import { generateInnerUrl } from 'utils/common.utils';
import { IProduct } from 'sections/Catalog/interfaces/products.interfaces';

interface IProps {
  sourceProduct?: IProduct;
  autoTypes: IRowsWithCount<IAutoType[]>;
  setAutoTypes: ISetState<IProps['autoTypes']>;
  autoBrands: IRowsWithCount<IAutoBrand[]>;
  setAutoBrands: ISetState<IProps['autoBrands']>;
  groups: IRowsWithCount<IProductGroup[]>;
  setGroups: ISetState<IProps['groups']>;
  organizations: IOrganization[];
}

const AddSaleProductPageContent: FC<IProps> = ({
  sourceProduct,
  autoTypes,
  setAutoTypes,
  autoBrands,
  setAutoBrands,
  groups,
  setGroups,
  organizations,
}) => {
  const {
    router,
    locale,
    formFailed,
    submitAwaiting,
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
    setAddedApplicabilities,
    setChangeAllowed,
    form,
    setIsDisabled,
  } = useHandlers({ sourceProduct });

  return (
    <Page className="personal-area-page">
      <BreadCrumbs
        list={[
          {
            link: APP_PATHS.SALE_PRODUCT_LIST,
            text: locale.common.productSale,
          },
          {
            link: APP_PATHS.ADD_PRODUCT_OFFER,
            text: locale.catalog.newProduct,
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
          initialValues={
            !!sourceProduct
              ? getInitialSaleProductFormValues(sourceProduct)
              : null
          }
          onFinishFailed={formFailed}
          onFieldsChange={() => onSaleFormFieldsChange(form, setIsDisabled)}
          requiredMark={false}
        >
          <Link
            href={generateInnerUrl(APP_PATHS.CATALOG, {
              searchParams: {
                isSale: 1,
              },
            })}
            className="d-table"
          >
            <Button
              type="primary"
              className="addSaleProduct-form__searchCatalog button-white mb-20 ml-10"
            >
              Найти деталь в каталоге
            </Button>
          </Link>
          <SaleProductForm
            disableProductFields={!!sourceProduct}
            product={sourceProduct}
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
            files={files}
            setFiles={setFiles}
            form={form}
            changeAllowed={false}
            onChangeAllowedUpdate={value => setChangeAllowed(value)}
            action="create"
            organizations={organizations}
          />
        </Form>
      </PageContent>
      <Summary containerClassName="d-flex justify-content-end">
        <Button
          onClick={e => {
            e.preventDefault();
            router.back();
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
          loading={submitAwaiting}
        >
          Добавить
        </Button>
      </Summary>
    </Page>
  );
};

export default AddSaleProductPageContent;
