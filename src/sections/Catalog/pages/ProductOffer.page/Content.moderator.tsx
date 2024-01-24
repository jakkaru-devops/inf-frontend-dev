import { Button, Form, Input, Alert, Modal } from 'antd';
import {
  BreadCrumbs,
  Page,
  PageContent,
  PageTop,
  Summary,
} from 'components/common';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { useLocale } from 'hooks/locale.hook';
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
import { ISetState, IRowsWithCount } from 'interfaces/common.interfaces';
import ProductForm from 'sections/Catalog/components/ProductForm';
import { openNotification, stripString } from 'utils/common.utils';
import { useRouter } from 'next/router';
import { IUploadedFile } from 'components/common/FileInput/interfaces';
import { APIRequest } from 'utils/api.utils';
import { FC, useState } from 'react';

interface IProps {
  productOffer: IProductOffer;
  autoTypes: IRowsWithCount<IAutoType[]>;
  setAutoTypes: ISetState<IProps['autoTypes']>;
  autoBrands: IRowsWithCount<IAutoBrand[]>;
  setAutoBrands: ISetState<IProps['autoBrands']>;
  groups: IRowsWithCount<IProductGroup[]>;
  setGroups: ISetState<IProps['groups']>;
}

const ProductOfferPageContentModerator: FC<IProps> = ({
  productOffer,
  autoTypes,
  setAutoTypes,
  autoBrands,
  setAutoBrands,
  groups,
  setGroups,
}) => {
  const { product, sourceProduct } = productOffer;
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
  const [rejectSubmitAwaiting, setRejectSubmitAwaiting] = useState(false);
  const [rejection, setRejection] = useState({
    modalVisible: false,
    text: '',
  });
  const { status, color } = defineProductOfferStatus(productOffer, locale);
  const sourceProductData = {
    branches: sourceProduct?.branches?.filter(el => !el.isMain) || [],
    mainBranch: sourceProduct?.branches?.find(el => el.isMain),
    files: sourceProduct?.productFiles?.map(el => ({ id: el.fileId })) || [],
    form: Form.useForm()[0],
  };

  const handleAccept = async (values: any) => {
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
        sourceBranchId: branch?.sourceBranchId,
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
      method: 'post',
      url: API_ENDPOINTS.PRODUCT_OFFER_ACCEPT(productOffer.id),
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
    router.push(APP_PATHS.PRODUCT_OFFER_LIST);
  };

  const handleReject = async () => {
    if (rejectSubmitAwaiting) return;
    setRejectSubmitAwaiting(true);

    if (!rejection?.text?.trim()?.length) {
      openNotification('Необходимо указать причину отказа');
      return;
    }

    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.PRODUCT_OFFER_REJECT(productOffer.id),
      data: {
        comment: rejection.text,
      },
      requireAuth: true,
    });
    setRejectSubmitAwaiting(false);
    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }

    openNotification(res?.data?.message);
    setRejection({
      modalVisible: false,
      text: '',
    });
    router.reload();
  };

  console.log(sourceProduct);

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
      <PageTop
        title={`${locale.digitization.digitization}: ${productOffer.product.name}`}
      />

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
        <div className="product-card__title card-title">
          {!!sourceProduct
            ? 'Запрос на редактирование'
            : 'Запрос на добавление'}
        </div>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAccept}
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

        <br />
        {sourceProduct &&
          productOffer.status !== PRODUCT_OFFER_STATUSES.ACCEPTED && (
            <div>
              <div className="product-card">
                <span className="product-card__title mt-10 mb-10">
                  Карточка товара
                </span>
                <Form
                  form={sourceProductData.form}
                  layout="vertical"
                  onFinish={() => {}}
                  className="product-form"
                  initialValues={getInitialProductFormValue(sourceProduct)}
                >
                  <ProductForm
                    product={sourceProduct}
                    autoTypes={autoTypes}
                    setAutoTypes={setAutoTypes}
                    autoBrands={autoBrands}
                    setAutoBrands={setAutoBrands}
                    groups={groups}
                    setGroups={setGroups}
                    branches={sourceProductData.branches}
                    setBranches={() => {}}
                    mainBranch={sourceProductData.mainBranch}
                    setMainBranch={() => {}}
                    files={sourceProductData.files}
                    setFiles={() => {}}
                    form={sourceProductData.form}
                    changeAllowed={true}
                    onChangeAllowedUpdate={() => {}}
                    applicabilities={{ count: 0, rows: [] }} // TODO
                    setApplicabilities={null} // TODO
                    addedApplicabilities={[]}
                    setAddedApplicabilities={null}
                    updatedApplicabilities={[]}
                    setUpdatedApplicabilities={null}
                    deletedApplicabilityIds={[]}
                    setDeletedApplicabilityIds={null}
                    analogProducts={{ count: 0, rows: [] }}
                    setAnalogProducts={null}
                    addedAnalogIds={[]}
                    setAddedAnalogIds={null}
                    deletedAnalogIds={[]}
                    setDeletedAnalogIds={null}
                    action="view"
                  />
                </Form>
              </div>
            </div>
          )}
      </PageContent>
      {productOffer.status !== PRODUCT_OFFER_STATUSES.ACCEPTED && (
        <Summary containerClassName="d-flex justify-content-end">
          <Button
            className="gray"
            onClick={() =>
              setRejection(prev => ({
                ...prev,
                modalVisible: true,
              }))
            }
          >
            Отказать
          </Button>
          <Button
            htmlType="submit"
            className="gray ml-10"
            onClick={e => {
              e.preventDefault();
              form.submit();
            }}
            loading={submitAwaiting}
          >
            Принять
          </Button>
        </Summary>
      )}

      <Modal
        open={rejection.modalVisible}
        onCancel={() =>
          setRejection(prev => ({
            ...prev,
            modalVisible: false,
          }))
        }
        centered
        title="Укажите причину отказа"
        footer={null}
        className="footer-hidden"
        width={500}
      >
        <Input.TextArea
          value={rejection.text}
          onChange={e =>
            setRejection(prev => ({
              ...prev,
              text: e.target.value,
            }))
          }
          className="w-100"
          style={{
            minHeight: 100,
          }}
        />
        <div className="d-flex justify-content-end mt-15">
          <Button
            type="primary"
            className="gray"
            style={{ width: 150 }}
            onClick={() => handleReject()}
            disabled={!rejection?.text?.trim()?.length}
            loading={rejectSubmitAwaiting}
          >
            Отклонить
          </Button>
        </div>
      </Modal>
    </Page>
  );
};

export default ProductOfferPageContentModerator;
