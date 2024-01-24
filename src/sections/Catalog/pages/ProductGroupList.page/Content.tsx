import { Button, Checkbox, Form, Input, Modal, Popconfirm } from 'antd';
import {
  BreadCrumbs,
  Container,
  KeyValueItem,
  Link,
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
import {
  generateInnerUrl,
  generateUrl,
  openNotification,
} from 'utils/common.utils';

interface IProps {
  productGroups: IRowsWithCount<IProductGroup[]>;
  setProductGroups: ISetState<IRowsWithCount<IProductGroup[]>>;
}

const ProductGroupListPageContent: FC<IProps> = ({
  productGroups,
  setProductGroups,
}) => {
  const router = useRouter();
  const { locale } = useLocale();
  const [createForm] = Form.useForm();
  const [updateForm] = Form.useForm();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [updateProductGroupData, setUpdateProductGroupData] =
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

  const addProductGroup = async (values: any) => {
    const name = values.name;
    const isSideGroup = values.isSideGroup;
    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.PRODUCT_GROUP_LIST,
      data: {
        name,
        isSideGroup: !!isSideGroup,
      },
      requireAuth: true,
    });
    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }
    const resData: { productGroup: IProductGroup } = res.data;
    setProductGroups(prev => ({
      count: prev.count + 1,
      rows: prev.rows.concat(resData.productGroup),
    }));
    openNotification(`Категория ${resData?.productGroup?.name} добавлена`);
    setCreateModalVisible(false);
    createForm.resetFields();
  };

  const updateProductGroup = async (id: string, values: any) => {
    const name = values.name;
    const isSideGroup = values.isSideGroup;
    const res = await APIRequest({
      method: 'put',
      url: API_ENDPOINTS.PRODUCT_GROUP(id),
      data: {
        name,
        isSideGroup: !!isSideGroup,
      },
      requireAuth: true,
    });
    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }
    const resData: { productGroup: IProductGroup } = res.data;
    const productGroup = productGroups.rows.find(el => el.id === id);
    if (!!productGroup) {
      productGroup.name = resData?.productGroup?.name;
      setProductGroups({ ...productGroups });
      setStateCounter(prev => prev + 1);
    }
    openNotification(`Категория ${name} обновлена`);
    setUpdateProductGroupData(null);
    updateForm.resetFields();
  };

  const deleteProductGroup = async (id: string) => {
    const res = await APIRequest({
      method: 'delete',
      url: API_ENDPOINTS.PRODUCT_GROUP(id),
      requireAuth: true,
    });
    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }
    const resData: { productGroup: IProductGroup } = res.data;
    setProductGroups(prev => ({
      count: prev.count - 1,
      rows: prev.rows.filter(item => item.id !== id),
    }));
    openNotification(`Категория ${resData?.productGroup?.name} удалена`);
  };

  const startEditing = (productGroup: IProductGroup) => {
    updateForm.setFieldsValue({
      name: productGroup.name,
    });
    setUpdateProductGroupData(productGroup);
  };

  return (
    <Page>
      <BreadCrumbs
        list={[
          { link: APP_PATHS.ALL_PRODUCT_CATEGORIES, text: 'Категории товаров' },
          { link: APP_PATHS.PRODUCT_GROUP_LIST, text: 'Категории' },
        ]}
      />
      <PageTop title="Категории" />
      <PageTopPanel>
        <Container>
          <KeyValueItem
            keyText="Найти по названию"
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
          cols={[
            {
              content: 'Наименование',
              width: '60%',
            },
            {
              content: (
                <>
                  Сопутствующие
                  <br />
                  товары
                </>
              ),
              width: '15%',
            },
            {
              content: 'Подкатегории',
              width: '15%',
            },
            {
              content: null,
              width: '10%',
            },
          ]}
          rows={productGroups.rows.map(productGroup => ({
            cols: [
              {
                content: (
                  <div className="d-flex align-items-center">
                    <span
                      className="text-underline cursor-pointer color-primary-hover"
                      onClick={() => startEditing(productGroup)}
                    >
                      {productGroup.name}
                    </span>
                  </div>
                ),
              },
              {
                content: (
                  <Checkbox checked={productGroup.catalog !== 'AUTO_PARTS'} />
                ),
              },
              {
                content: (
                  <Link
                    href={generateInnerUrl(
                      APP_PATHS.PRODUCT_GROUP(productGroup.id),
                      {
                        text: productGroup.name,
                        searchParams: {
                          search: null,
                        },
                      },
                    )}
                  >
                    Перейти
                  </Link>
                ),
              },
              {
                content: (
                  <div className="d-flex justify-content-center w-100">
                    <Popconfirm
                      title="Подтвердите удаление"
                      onConfirm={() => deleteProductGroup(productGroup.id)}
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
        {!productGroups?.rows?.length && (
          <h3 className="text-center mt-15">Категории не найдены</h3>
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
        title="Добавить категорию"
        footer={<></>}
        className="footer-hidden"
        centered
      >
        <Form layout="vertical" onFinish={addProductGroup} form={createForm}>
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
          <Form.Item
            name="isSideGroup"
            colon={false}
            valuePropName="checked"
            className="mb-10"
          >
            <Checkbox>Сопутствующие товары</Checkbox>
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
        open={!!updateProductGroupData}
        onCancel={() => setUpdateProductGroupData(null)}
        title={updateProductGroupData?.name}
        footer={<></>}
        className="footer-hidden"
        centered
      >
        <Form
          layout="vertical"
          onFinish={values =>
            updateProductGroup(updateProductGroupData?.id, values)
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
          <Form.Item
            name="isSideGroup"
            colon={false}
            valuePropName="checked"
            className="mb-10"
          >
            <Checkbox>Сопутствующие товары</Checkbox>
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

export default ProductGroupListPageContent;
