import { Button, Form } from 'antd';
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
import { getInitialProductBranch } from 'sections/Catalog/data';
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
import { generateUrl, openNotification } from 'utils/common.utils';

interface IProps {
  autoTypes: IRowsWithCount<IAutoType[]>;
  setAutoTypes: ISetState<IProps['autoTypes']>;
  autoBrands: IRowsWithCount<IAutoBrand[]>;
  setAutoBrands: ISetState<IProps['autoBrands']>;
  groups: IRowsWithCount<IProductGroup[]>;
  setGroups: ISetState<IProps['groups']>;
}

export const SEARCH_TIMEOUT_MS = 300;

const AddProductPageContent: FC<IProps> = ({
  autoTypes,
  setAutoTypes,
  autoBrands,
  setAutoBrands,
  groups,
  setGroups,
}) => {
  const router = useRouter();
  const { locale } = useLocale();
  const [form] = Form.useForm();
  const [branches, setBranches] = useState<IProductBranch[]>([]);
  const [mainBranch, setMainBranch] = useState<IProductBranch>(
    getInitialProductBranch({ isMain: true }),
  );
  const [files, setFiles] = useState<IUploadedFile[]>([]);
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
      url: API_ENDPOINTS.PRODUCT_LIST,
      data,
      requireAuth: true,
    });
    setSubmitAwaiting(false);
    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }
    const resData: { product: IProduct } = res.data;
    router.push(
      generateUrl(
        {
          history: DEFAULT_NAV_PATHS.EDIT_PRODUCT(
            resData.product.id,
            resData.product.name,
          ),
        },
        {
          pathname: APP_PATHS.EDIT_PRODUCT(resData.product.id),
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
      />
      <PageTop title={locale.digitization.digitization} />
      <PageContent>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ height: '100%' }}
          className="product-form"
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
            changeAllowed={false}
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
            action="create"
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
          Добавить
        </Button>
      </Summary>
    </Page>
  );
};

export default AddProductPageContent;
