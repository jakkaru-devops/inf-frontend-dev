import { Button, Form, Modal } from 'antd';
import {
  BreadCrumbs,
  Page,
  PageContent,
  PageTop,
  Summary,
} from 'components/common';
import { IUploadedFile } from 'components/common/FileInput/interfaces';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { useLocale } from 'hooks/locale.hook';
import { ISetState, IRowsWithCount } from 'interfaces/common.interfaces';
import { useRouter } from 'next/router';
import { FC, useState } from 'react';
import ProductForm from 'sections/Catalog/components/ProductForm';
import { getInitialProductFormValue } from 'sections/Catalog/data';
import {
  IAutoBrand,
  IAutoType,
  IProductGroup,
} from 'sections/Catalog/interfaces/categories.interfaces';
import {
  IProduct,
  IProductApplicability,
  IProductBranch,
} from 'sections/Catalog/interfaces/products.interfaces';
import { APIRequest } from 'utils/api.utils';
import { generateUrl, openNotification, stripString } from 'utils/common.utils';

interface IProps {
  product: IProduct;
  autoTypes: IRowsWithCount<IAutoType[]>;
  setAutoTypes: ISetState<IProps['autoTypes']>;
  autoBrands: IRowsWithCount<IAutoBrand[]>;
  setAutoBrands: ISetState<IProps['autoBrands']>;
  groups: IRowsWithCount<IProductGroup[]>;
  setGroups: ISetState<IProps['groups']>;
}

const EditProductPageContent: FC<IProps> = ({
  product,
  autoTypes,
  setAutoTypes,
  autoBrands,
  setAutoBrands,
  groups,
  setGroups,
}) => {
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
  const [deletionModalVisible, setDeletionModalVisible] = useState(false);
  const [deletionSubmitting, setDeletionSubmitting] = useState(false);
  const [submitAwaiting, setSubmitAwaiting] = useState(false);
  const [stateCounter, setStateCounter] = useState(0);

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

    console.log('DATA', data);

    const res = await APIRequest({
      method: 'put',
      url: API_ENDPOINTS.PRODUCT(product.id),
      data,
      requireAuth: true,
    });
    setSubmitAwaiting(false);
    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }
    const resData: { product: IProduct } = res.data;

    for (const item of addedApplicabilities) {
      const applicability = applicabilities?.rows?.find(
        el => el?.id === item.id,
      );
      if (!applicability) continue;
      applicability.productId = product?.id;
    }
    setApplicabilities({ ...applicabilities });
    setAddedApplicabilities([]);
    setUpdatedApplicabilities([]);
    setDeletedApplicabilityIds([]);
    setAddedAnalogIds([]);
    setDeletedAnalogIds([]);
    setStateCounter(prev => prev + 1);
    openNotification('Товар обновлен');
    // router.push(
    //   generateUrl(
    //     {
    //       history: DEFAULT_NAV_PATHS.EDIT_PRODUCT(
    //         resData.product.id,
    //         resData.product.name,
    //       ),
    //     },
    //     {
    //       pathname: APP_PATHS.EDIT_PRODUCT(resData.product.id),
    //     },
    //   ),
    // );
  };

  const handleDelete = async () => {
    setDeletionSubmitting(true);
    const res = await APIRequest({
      method: 'delete',
      url: API_ENDPOINTS.PRODUCT(product.id),
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
          history: DEFAULT_NAV_PATHS.PRODUCT_OFFER_LIST,
        },
        {
          pathname: APP_PATHS.PRODUCT_OFFER_LIST,
        },
      ),
    );
  };

  return (
    <Page>
      <BreadCrumbs
        list={[
          { link: APP_PATHS.CATALOG, text: locale.catalog.catalog },
          { link: APP_PATHS.ADD_PRODUCT, text: locale.catalog.newProduct },
        ]}
        autoTypes={autoTypes}
      />
      <PageTop title={locale.digitization.digitization} />
      <PageContent>
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
          className="gray"
          disabled={!changeAllowed}
          loading={submitAwaiting}
        >
          Сохранить
        </Button>
      </Summary>

      <Modal
        open={deletionModalVisible}
        onCancel={() => setDeletionModalVisible(false)}
        centered
        className="header-hidden header-border-hidden close-icon-hidden footer-hidden"
        title={null}
        footer={null}
        width={650}
      >
        <h3 style={{ fontSize: 30, fontWeight: 700, textAlign: 'center' }}>
          Вы уверены что хотите удалить товар?
        </h3>
        <div
          className="d-flex justify-content-center mt-20"
          style={{ gap: 10 }}
        >
          <Button
            type="primary"
            onClick={() => setDeletionModalVisible(false)}
            style={{ minWidth: 150 }}
          >
            Отмена
          </Button>
          <Button
            type="primary"
            onClick={() => {
              handleDelete();
            }}
            style={{ minWidth: 150 }}
            loading={deletionSubmitting}
          >
            Подтвердить
          </Button>
        </div>
      </Modal>
    </Page>
  );
};

export default EditProductPageContent;
