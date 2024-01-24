import { Button, Form, Input, Modal, Popconfirm, Select } from 'antd';
import {
  BreadCrumbs,
  Container,
  KeyValueItem,
  Page,
  PageContent,
  PageTop,
  PageTopPanel,
  Summary,
  Table,
} from 'components/common';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { useLocale } from 'hooks/locale.hook';
import { ISetState, IRowsWithCount } from 'interfaces/common.interfaces';
import { useRouter } from 'next/router';
import { FC, useState } from 'react';
import { IProductGroup } from 'sections/Catalog/interfaces/categories.interfaces';
import { APIRequest } from 'utils/api.utils';
import { generateUrl, openNotification } from 'utils/common.utils';

interface IProps {
  productGroup: IProductGroup;
  productSubgroups: IRowsWithCount<IProductGroup[]>;
  setProductSubgroups: ISetState<IRowsWithCount<IProductGroup[]>>;
}

const ProductGroupPageContent: FC<IProps> = ({
  productGroup,
  productSubgroups,
  setProductSubgroups,
}) => {
  const router = useRouter();
  const { locale } = useLocale();
  const [createForm] = Form.useForm();
  const [updateForm] = Form.useForm();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [updateProductSubgroupData, setUpdateProductSubgroupData] =
    useState<IProductGroup>(null);
  const [searchTimeout, setSearchTimeout] = useState(null as NodeJS.Timeout);
  const [searchValue, setSearchValue] = useState(null);
  const [stateCounter, setStateCounter] = useState(0);

  const handleSearch = (value: string) => {
    setSearchValue(value);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    setSearchTimeout(
      setTimeout(() => {
        router.push(
          generateUrl({
            search: value,
          }),
        );
      }, 500),
    );
    return () => clearTimeout(searchTimeout);
  };

  const addProductSubgroup = async (values: any) => {
    const name = values.name;
    const parentId = productGroup.id;
    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.PRODUCT_GROUP_LIST,
      data: {
        name,
        parentId,
        isSideGroup: productGroup.catalog !== 'AUTO_PARTS',
      },
      requireAuth: true,
    });
    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }
    const resData: { productGroup: IProductGroup } = res.data;
    const productSubgroupData = resData.productGroup;
    setProductSubgroups(prev => ({
      count: prev.count + 1,
      rows: prev.rows.concat(productSubgroupData),
    }));
    openNotification(`Подкатегория ${productSubgroupData?.name} добавлена`);
    setCreateModalVisible(false);
    createForm.resetFields();
  };

  const updateProductSubgroup = async (id: string, values: any) => {
    const name = values.name;
    const res = await APIRequest({
      method: 'put',
      url: API_ENDPOINTS.PRODUCT_GROUP(id),
      data: {
        name,
        isSideGroup: productGroup.catalog !== 'AUTO_PARTS',
      },
      requireAuth: true,
    });
    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }
    const resData: { productGroup: IProductGroup } = res.data;
    const productSubgroupData = resData.productGroup;
    const productSubgroup = productSubgroups.rows.find(el => el.id === id);
    if (!!productSubgroup) {
      productSubgroup.name = productSubgroupData?.name;
      setProductSubgroups({ ...productSubgroups });
      setStateCounter(prev => prev + 1);
    }
    openNotification(`Подкатегория ${name} обновлена`);
    setUpdateProductSubgroupData(null);
    updateForm.resetFields();
  };

  const deleteProductSubgroup = async (id: string) => {
    const res = await APIRequest({
      method: 'delete',
      url: API_ENDPOINTS.PRODUCT_GROUP(id),
      requireAuth: true,
    });
    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }
    const resData: { productSubgroup: IProductGroup } = res.data;
    setProductSubgroups(prev => ({
      count: prev.count - 1,
      rows: prev.rows.filter(item => item.id !== id),
    }));
    openNotification(`Подкатегория ${resData?.productSubgroup?.name} удалена`);
  };

  const startEditing = (productSubgroup: IProductGroup) => {
    updateForm.setFieldsValue({
      name: productSubgroup.name,
    });
    setUpdateProductSubgroupData(productSubgroup);
  };

  return (
    <Page>
      <BreadCrumbs
        list={[
          { link: APP_PATHS.ALL_PRODUCT_CATEGORIES, text: 'Категории товаров' },
          { link: APP_PATHS.PRODUCT_GROUP_LIST, text: 'Категории' },
          {
            link: APP_PATHS.PRODUCT_GROUP(productGroup.id),
            text: productGroup.name,
          },
        ]}
      />
      <PageTop title={productGroup.name} />
      <PageTopPanel>
        <Container>
          <KeyValueItem
            keyText="найти подкатегорию по названию"
            keyClassName="text-normal"
            value={
              <Input
                size="small"
                className="ml-5"
                value={searchValue}
                onChange={e => handleSearch(e.target.value)}
              />
            }
            noColon
          />
        </Container>
      </PageTopPanel>
      <PageContent>
        <Table
          title="Подкатегории"
          cols={[
            {
              content: 'Наименование',
              width: '90%',
            },
            {
              content: null,
              width: '10%',
            },
          ]}
          rows={productSubgroups.rows.map(productSubgroup => ({
            cols: [
              {
                content: (
                  <div className="d-flex align-items-center">
                    <span
                      className="text-underline cursor-pointer color-primary-hover"
                      onClick={() => startEditing(productSubgroup)}
                    >
                      {productSubgroup.name}
                    </span>
                  </div>
                ),
              },
              {
                content: (
                  <div className="d-flex justify-content-center w-100">
                    <Popconfirm
                      title="Подтвердите удаление"
                      onConfirm={() =>
                        deleteProductSubgroup(productSubgroup.id)
                      }
                      cancelText="Отмена"
                      okText="Ок"
                    >
                      <button
                        className="tableInf__delete"
                        title="Удалить"
                        style={{
                          marginLeft: 0,
                        }}
                      >
                        <img
                          src="/img/close.svg"
                          alt=""
                          className="svg tableInf__delteIcon"
                        />
                      </button>
                    </Popconfirm>
                  </div>
                ),
              },
            ],
          }))}
        />
        {!productSubgroups?.rows?.length && (
          <h3 className="text-center mt-15">Подкатегории не найдены</h3>
        )}
      </PageContent>
      <Summary containerClassName="justify-content-end">
        <Button type="primary" onClick={() => setCreateModalVisible(true)}>
          Добавить
        </Button>
      </Summary>

      <Modal
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        title="Добавить подкатегорию"
        footer={<></>}
        className="footer-hidden"
        centered
      >
        <Form layout="vertical" onFinish={addProductSubgroup} form={createForm}>
          <Form.Item
            name="name"
            label="Название"
            rules={[
              {
                required: true,
                whitespace: true,
                message: locale.validations.required,
              },
            ]}
          >
            <Input />
          </Form.Item>
          <div className="d-flex justify-content-end">
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Добавить
              </Button>
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Modal
        open={!!updateProductSubgroupData}
        onCancel={() => setUpdateProductSubgroupData(null)}
        title={updateProductSubgroupData?.name}
        footer={<></>}
        className="footer-hidden"
        centered
      >
        <Form
          layout="vertical"
          onFinish={values =>
            updateProductSubgroup(updateProductSubgroupData?.id, values)
          }
          form={updateForm}
        >
          <Form.Item
            name="name"
            label="Название"
            rules={[
              {
                required: true,
                whitespace: true,
                message: locale.validations.required,
              },
            ]}
          >
            <Input />
          </Form.Item>
          <div className="d-flex justify-content-end">
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Обновить
              </Button>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </Page>
  );
};

export default ProductGroupPageContent;
