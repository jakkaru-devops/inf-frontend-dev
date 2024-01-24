import { Button, Form, Input, Modal, Popconfirm } from 'antd';
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
import { IAutoBrand } from 'sections/Catalog/interfaces/categories.interfaces';
import { APIRequest } from 'utils/api.utils';
import {
  generateInnerUrl,
  generateUrl,
  openNotification,
} from 'utils/common.utils';

interface IProps {
  autoBrands: IRowsWithCount<IAutoBrand[]>;
  setAutoBrands: ISetState<IRowsWithCount<IAutoBrand[]>>;
}

const AutoBrandListPageContent: FC<IProps> = ({
  autoBrands,
  setAutoBrands,
}) => {
  const router = useRouter();
  const { locale } = useLocale();
  const [createForm] = Form.useForm();
  const [updateForm] = Form.useForm();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [updateAutoBrandData, setUpdateAutoBrandData] =
    useState<IAutoBrand>(null);
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

  const addAutoBrand = async (values: any) => {
    const name = values.name;
    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.AUTO_BRAND_LIST,
      data: {
        name,
      },
      requireAuth: true,
    });
    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }
    const resData: { autoBrand: IAutoBrand } = res.data;
    setAutoBrands(prev => ({
      count: prev.count + 1,
      rows: prev.rows.concat(resData.autoBrand),
    }));
    openNotification(`Марка ${resData?.autoBrand?.name} добавлена`);
    setCreateModalVisible(false);
    createForm.resetFields();
  };

  const updateAutoBrand = async (id: string, values: any) => {
    const name = values.name;
    const res = await APIRequest({
      method: 'put',
      url: API_ENDPOINTS.AUTO_BRAND(id),
      data: {
        name,
      },
      requireAuth: true,
    });
    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }
    const resData: { autoBrand: IAutoBrand } = res.data;
    const autoBrand = autoBrands.rows.find(el => el.id === id);
    if (!!autoBrand) {
      autoBrand.name = resData?.autoBrand?.name;
      setAutoBrands({ ...autoBrands });
      setStateCounter(prev => prev + 1);
    }
    openNotification(`Марка ${name} обновлена`);
    setUpdateAutoBrandData(null);
    updateForm.resetFields();
  };

  const deleteAutoBrand = async (id: string) => {
    const res = await APIRequest({
      method: 'delete',
      url: API_ENDPOINTS.AUTO_BRAND(id),
      requireAuth: true,
    });
    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }
    const resData: { autoBrand: IAutoBrand } = res.data;
    setAutoBrands(prev => ({
      count: prev.count - 1,
      rows: prev.rows.filter(item => item.id !== id),
    }));
    openNotification(`Марка ${resData?.autoBrand?.name} удалена`);
  };

  const startEditing = (autoBrand: IAutoBrand) => {
    updateForm.setFieldsValue({
      name: autoBrand.name,
    });
    setUpdateAutoBrandData(autoBrand);
  };

  return (
    <Page>
      <BreadCrumbs
        list={[
          { link: APP_PATHS.ALL_PRODUCT_CATEGORIES, text: 'Категории товаров' },
          { link: APP_PATHS.AUTO_BRAND_LIST, text: 'Марки' },
        ]}
      />
      <PageTop title="Марки" />
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
              width: '75%',
            },
            {
              content: 'Модели',
              width: '15%',
            },
            {
              content: null,
              width: '10%',
            },
          ]}
          rows={autoBrands.rows.map(autoBrand => ({
            cols: [
              {
                content: (
                  <div className="d-flex align-items-center">
                    <span
                      className="text-underline cursor-pointer color-primary-hover"
                      onClick={() => startEditing(autoBrand)}
                    >
                      {autoBrand.name}
                    </span>
                  </div>
                ),
              },
              {
                content: (
                  <Link
                    href={generateInnerUrl(APP_PATHS.AUTO_BRAND(autoBrand.id), {
                      text: autoBrand.name,
                      searchParams: {
                        search: null,
                      },
                    })}
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
                      onConfirm={() => deleteAutoBrand(autoBrand.id)}
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
        {!autoBrands?.rows?.length && (
          <h3 className="text-center mt-15">Марки не найдены</h3>
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
        title="Добавить марку"
        footer={<></>}
        className="footer-hidden"
        centered
      >
        <Form layout="vertical" onFinish={addAutoBrand} form={createForm}>
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
        open={!!updateAutoBrandData}
        onCancel={() => setUpdateAutoBrandData(null)}
        title={updateAutoBrandData?.name}
        footer={<></>}
        className="footer-hidden"
        centered
      >
        <Form
          layout="vertical"
          onFinish={values => updateAutoBrand(updateAutoBrandData?.id, values)}
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

export default AutoBrandListPageContent;
