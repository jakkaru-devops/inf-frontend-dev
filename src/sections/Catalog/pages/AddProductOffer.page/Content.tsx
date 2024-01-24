import { Button, Form } from 'antd';
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
import { useOfferProductSelection } from 'hooks/offerProductSelection.hook';
import { ISetState, IRowsWithCount } from 'interfaces/common.interfaces';
import { useRouter } from 'next/router';
import { FC, useState } from 'react';
import { useDispatch } from 'react-redux';
import ProductForm from 'sections/Catalog/components/ProductForm';
import {
  getInitialProductBranch,
  getInitialProductFormValue,
} from 'sections/Catalog/data';
import {
  IAutoBrand,
  IAutoType,
  IProductGroup,
} from 'sections/Catalog/interfaces/categories.interfaces';
import {
  IProduct,
  IProductApplicability,
  IProductBranch,
  IProductOffer,
} from 'sections/Catalog/interfaces/products.interfaces';
import { setOfferProductSelectionProduct } from 'store/reducers/offerProductSelection.reducer';
import { APIRequest } from 'utils/api.utils';
import { generateUrl, openNotification } from 'utils/common.utils';

interface IProps {
  sourceProduct?: IProduct;
  autoTypes: IRowsWithCount<IAutoType[]>;
  setAutoTypes: ISetState<IProps['autoTypes']>;
  autoBrands: IRowsWithCount<IAutoBrand[]>;
  setAutoBrands: ISetState<IProps['autoBrands']>;
  groups: IRowsWithCount<IProductGroup[]>;
  setGroups: ISetState<IProps['groups']>;
}

const AddProductOfferPageContent: FC<IProps> = ({
  sourceProduct,
  autoTypes,
  setAutoTypes,
  autoBrands,
  setAutoBrands,
  groups,
  setGroups,
}) => {
  const offerProductSelection = useOfferProductSelection();
  const dispatch = useDispatch();
  const router = useRouter();
  const { locale } = useLocale();
  const [form] = Form.useForm();
  const [branches, setBranches] = useState<IProductBranch[]>(
    sourceProduct?.branches?.filter(el => !el.isMain) || [],
  );
  const [mainBranch, setMainBranch] = useState<IProductBranch>(
    sourceProduct?.branches?.find(el => el.isMain) ||
      getInitialProductBranch({ isMain: true }),
  );
  const [files, setFiles] = useState<IUploadedFile[]>(
    sourceProduct?.productFiles?.map(el => ({ id: el.fileId })) || [],
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

  const handleSubmit = async (values: any) => {
    if (submitAwaiting) return;
    setSubmitAwaiting(true);

    const data = {
      product: {
        article: values.article,
        name: values.name,
        description: values.description,
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
        sourceBranchId: branch?.id || null,
        isMain: !!branch?.isMain,
        tag: values?.['tag' + suffix],
        description: values?.['description' + suffix],
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

    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.PRODUCT_OFFER_LIST,
      data: {
        productOffer: {
          product: data.product,
          sourceProductId: sourceProduct?.id,
        },
      },
      requireAuth: true,
    });
    setSubmitAwaiting(false);
    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }

    const productOfferData: IProductOffer = res.data.productOffer;

    openNotification(res?.data?.message);

    if (router.query.orderRequestId) {
      dispatch(
        setOfferProductSelectionProduct(
          {
            orderRequestId: null,
            product: productOfferData.product,
          },
          offerProductSelection.activeProductIndex,
          offerProductSelection,
        ),
      );
      router.push(
        generateUrl(
          {
            history: []
              .concat(router.query.history)
              .filter(
                (value, i) => i < [].concat(router.query.history).length - 1,
              ),
          },
          {
            pathname: APP_PATHS.ORDER_REQUEST(
              router.query.orderRequestId as string,
            ),
          },
        ),
      );
    } else {
      router.push(APP_PATHS.PRODUCT_OFFER(res?.data?.productOffer?.id));
    }
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
            link: APP_PATHS.ADD_PRODUCT_OFFER,
            text: locale.catalog.newProduct,
          },
        ]}
      />
      <PageTop title={locale.digitization.digitization} />
      <PageContent>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ height: '100%' }}
          className="product-form"
          initialValues={getInitialProductFormValue(sourceProduct)}
        >
          <ProductForm
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
            changeAllowed={!!sourceProduct}
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
            action={!!sourceProduct ? 'update' : 'create'}
          />
        </Form>
      </PageContent>
      <Summary containerClassName="d-flex justify-content-end">
        <Button
          onClick={e => {
            e.preventDefault();
            form.submit();
          }}
          className="gray"
          disabled={!changeAllowed}
          loading={submitAwaiting}
        >
          Отправить на модерацию
        </Button>
      </Summary>
    </Page>
  );
};

export default AddProductOfferPageContent;
