import { Button, Form, Alert } from 'antd';
import {
  BreadCrumbs,
  Page,
  PageContent,
  PageTop,
  Summary,
} from 'components/common';
import { IUploadedFile } from 'components/common/FileInput/interfaces';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { useLocale } from 'hooks/locale.hook';
import { ISetState, IRowsWithCount } from 'interfaces/common.interfaces';
import { useRouter } from 'next/router';
import { FC, useState } from 'react';
import ProductForm from 'sections/Catalog/components/ProductForm';
import {
  defineProductOfferStatus,
  getInitialProductFormValue,
  PRODUCT_OFFER_STATUSES,
} from 'sections/Catalog/data';
import {
  IProduct,
  IProductApplicability,
  IProductBranch,
  IProductOffer,
} from 'sections/Catalog/interfaces/products.interfaces';
import {
  IAutoBrand,
  IAutoType,
  IProductGroup,
} from 'sections/Catalog/interfaces/categories.interfaces';
import { APIRequest } from 'utils/api.utils';
import { openNotification, stripString } from 'utils/common.utils';

interface IProps {
  productOffer: IProductOffer;
  autoTypes: IRowsWithCount<IAutoType[]>;
  setAutoTypes: ISetState<IProps['autoTypes']>;
  autoBrands: IRowsWithCount<IAutoBrand[]>;
  setAutoBrands: ISetState<IProps['autoBrands']>;
  groups: IRowsWithCount<IProductGroup[]>;
  setGroups: ISetState<IProps['groups']>;
}

const ProductOfferPageContentSeller: FC<IProps> = ({
  productOffer,
  autoTypes,
  setAutoTypes,
  autoBrands,
  setAutoBrands,
  groups,
  setGroups,
}) => {
  const { product } = productOffer;
  const { locale } = useLocale();
  const router = useRouter();
  const [form] = Form.useForm();
  const [branches, setBranches] = useState<IProductBranch[]>(
    product?.branches?.filter(el => !el.isMain) || [],
  );
  const [mainBranch, setMainBranch] = useState<IProductBranch>(
    product?.branches?.find(el => el.isMain),
    // getInitialProductBranch({ isMain: true }),
  );
  const [files, setFiles] = useState<IUploadedFile[]>(
    product?.productFiles?.map(el => ({ id: el.fileId })) || [],
  );
  const [applicabilities, setApplicabilities] = useState<
    IRowsWithCount<IProductApplicability[]>
  >({
    count: 0,
    rows: [],
  });
  const [addedApplicabilities, setAddedApplicabilities] = useState<
    IProductApplicability[]
  >([]);
  const [updatedApplicabilities, setUpdatedApplicabilities] = useState<
    IProductApplicability[]
  >([]);
  const [deletedApplicabilityIds, setDeletedApplicabilityIds] = useState<
    string[]
  >([]);
  const [analogProducts, setAnalogProducts] = useState<
    IRowsWithCount<IProduct[]>
  >({
    count: 0,
    rows: [],
  });
  const [addedAnalogIds, setAddedAnalogIds] = useState<string[]>([]);
  const [deletedAnalogIds, setDeletedAnalogIds] = useState<string[]>([]);
  const [changeAllowed, setChangeAllowed] = useState(true);
  const [submitAwaiting, setSubmitAwaiting] = useState(false);
  const { status, color } = defineProductOfferStatus(productOffer, locale);

  const handleSubmit = async (values: any) => {
    if (submitAwaiting) return;
    setSubmitAwaiting(true);

    const data = {
      product: {
        article: values.article,
        name: values.name,
        description: stripString(values.description),
        manufacturer: values.manufacturer,
        width: values.width,
        height: values.height,
        weight: values.weight,
        length: values.length,
        files,
        branches: [],
        applicabilities: {
          added: addedApplicabilities,
          updated: updatedApplicabilities,
          deleted: deletedApplicabilityIds,
        },
        analogs: {
          added: addedAnalogIds,
          deleted: deletedAnalogIds,
        },
      },
    };
    data.product.branches = [mainBranch].concat(branches).map((branch, i) => {
      const suffix = i === 0 ? '' : `-${i - 1}`;
      const branchData = {
        id: branch?.id,
        isMain: branch?.isMain,
        tag: values?.['tag' + suffix],
        description: stripString(values?.['description' + suffix]),
        autoTypeId: values?.['autoTypeId' + suffix],
        autoBrandId: values?.['autoBrandId' + suffix],
        autoModelIds: (values?.['autoModelIds' + suffix] as string[]) || [],
        groupId: values?.['groupId' + suffix],
        subgroupId: values?.['subgroupId' + suffix],
      };
      if (branchData.autoTypeId === 'none') branchData.autoTypeId = null;
      if (branchData.autoBrandId === 'none') branchData.autoBrandId = null;
      branchData.autoModelIds = branchData.autoModelIds.filter(
        el => el !== 'none',
      );
      if (branchData.groupId === 'none') branchData.groupId = null;
      if (branchData.subgroupId === 'none') branchData.subgroupId = null;
      return branchData;
    });
    console.log(data);

    const res = await APIRequest({
      method: 'put',
      url: API_ENDPOINTS.PRODUCT_OFFER(productOffer.id),
      data: {
        productOffer: {
          ...productOffer,
          product: data.product,
        },
      },
      requireAuth: true,
    });
    setSubmitAwaiting(false);
    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }

    setAddedApplicabilities([]);
    setUpdatedApplicabilities([]);
    setDeletedApplicabilityIds([]);
    setAddedAnalogIds([]);
    setDeletedAnalogIds([]);
    openNotification(res?.data?.message);
    router.reload();
  };

  return (
    <Page className="product-offer-page register-form">
      <BreadCrumbs
        list={[
          {
            link: APP_PATHS.PRODUCT_OFFER_LIST,
            text: locale.digitization.digitization,
          },
          {
            link: APP_PATHS.PRODUCT_OFFER(productOffer.id),
            text: productOffer.product.name,
          },
        ]}
      />
      <PageTop title={`Редактирование: ${productOffer.product.name}`} />
      <PageContent>
        <h3 className="mb-10">
          {locale.common.status}: <span style={{ color }}>{status}</span>
        </h3>
        {!!productOffer.comment && (
          <Alert
            className="mb-10"
            message={productOffer.comment}
            type={
              productOffer.status === PRODUCT_OFFER_STATUSES.ACCEPTED
                ? 'success'
                : 'error'
            }
            showIcon
          />
        )}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ height: '100%' }}
          className="product-form"
          initialValues={getInitialProductFormValue(product)}
        >
          <ProductForm
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
            files={files}
            setFiles={setFiles}
            form={form}
            changeAllowed={true}
            onChangeAllowedUpdate={value => setChangeAllowed(value)}
            applicabilities={applicabilities}
            setApplicabilities={setApplicabilities}
            addedApplicabilities={addedApplicabilities}
            setAddedApplicabilities={setAddedApplicabilities}
            updatedApplicabilities={updatedApplicabilities}
            setUpdatedApplicabilities={setUpdatedApplicabilities}
            deletedApplicabilityIds={deletedApplicabilityIds}
            setDeletedApplicabilityIds={setDeletedApplicabilityIds}
            analogProducts={analogProducts}
            setAnalogProducts={setAnalogProducts}
            addedAnalogIds={addedAnalogIds}
            setAddedAnalogIds={setAddedAnalogIds}
            deletedAnalogIds={deletedAnalogIds}
            setDeletedAnalogIds={setDeletedAnalogIds}
            action="update"
          />
        </Form>
      </PageContent>
      {productOffer.status !== PRODUCT_OFFER_STATUSES.ACCEPTED && (
        <Summary containerClassName="d-flex justify-content-end">
          <Button
            onClick={e => {
              e.preventDefault();
              form.submit();
            }}
            className="gray ml-10"
            disabled={!changeAllowed}
            loading={submitAwaiting}
          >
            Обновить
          </Button>
        </Summary>
      )}
    </Page>
  );
};

export default ProductOfferPageContentSeller;
