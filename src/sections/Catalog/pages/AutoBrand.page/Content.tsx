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
import {
  IAutoBrand,
  IAutoModel,
  IAutoType,
} from 'sections/Catalog/interfaces/categories.interfaces';
import { APIRequest } from 'utils/api.utils';
import { generateUrl, openNotification } from 'utils/common.utils';

interface IProps {
  autoTypes: IRowsWithCount<IAutoType[]>;
  autoBrand: IAutoBrand;
  autoModels: IRowsWithCount<IAutoModel[]>;
  setAutoModels: ISetState<IRowsWithCount<IAutoModel[]>>;
}

const AutoBrandPageContent: FC<IProps> = ({
  autoTypes,
  autoBrand,
  autoModels,
  setAutoModels,
}) => {
  const router = useRouter();
  const { locale } = useLocale();
  const [createForm] = Form.useForm();
  const [updateForm] = Form.useForm();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [updateAutoModelData, setUpdateAutoModelData] =
    useState<IAutoModel>(null);
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

  const addAutoModel = async (values: any) => {
    const name = values.name;
    const autoTypeId = values.autoTypeId;
    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.AUTO_MODEL_LIST,
      data: {
        name,
        autoBrandId: autoBrand.id,
        autoTypeId,
      },
      requireAuth: true,
    });
    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }
    const resData: { autoModel: IAutoModel } = res.data;
    setAutoModels(prev => ({
      count: prev.count + 1,
      rows: prev.rows.concat(resData.autoModel),
    }));
    openNotification(`Модель ${resData?.autoModel?.name} добавлена`);
    setCreateModalVisible(false);
    createForm.resetFields();
  };

  const updateAutoModel = async (id: string, values: any) => {
    const name = values.name;
    const autoTypeId = values.autoTypeId;
    const res = await APIRequest({
      method: 'put',
      url: API_ENDPOINTS.AUTO_MODEL(id),
      data: {
        name,
        autoTypeId,
      },
      requireAuth: true,
    });
    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }
    const resData: { autoModel: IAutoModel } = res.data;
    const autoModel = autoModels.rows.find(el => el.id === id);
    if (!!autoModel) {
      autoModel.name = resData?.autoModel?.name;
      autoModel.autoTypeId = resData?.autoModel?.autoTypeId;
      setAutoModels({ ...autoModels });
      setStateCounter(prev => prev + 1);
    }
    openNotification(`Модель ${name} обновлена`);
    setUpdateAutoModelData(null);
    updateForm.resetFields();
  };

  const deleteAutoModel = async (id: string) => {
    const res = await APIRequest({
      method: 'delete',
      url: API_ENDPOINTS.AUTO_MODEL(id),
      requireAuth: true,
    });
    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }
    const resData: { autoModel: IAutoModel } = res.data;
    setAutoModels(prev => ({
      count: prev.count - 1,
      rows: prev.rows.filter(item => item.id !== id),
    }));
    openNotification(`Модель ${resData?.autoModel?.name} удалена`);
  };

  const startEditing = (autoModel: IAutoModel) => {
    updateForm.setFieldsValue({
      name: autoModel.name,
      autoTypeId: autoModel.autoTypeId,
    });
    setUpdateAutoModelData(autoModel);
  };

  return (
    <Page>
      <BreadCrumbs
        list={[
          { link: APP_PATHS.ALL_PRODUCT_CATEGORIES, text: 'Категории товаров' },
          { link: APP_PATHS.AUTO_BRAND_LIST, text: 'Марки' },
          { link: APP_PATHS.AUTO_BRAND(autoBrand.id), text: autoBrand.name },
        ]}
      />
      <PageTop title={autoBrand.name} />
      <PageTopPanel>
        <Container>
          <KeyValueItem
            keyText="найти модель по названию"
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
          title="Модели"
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
          rows={autoModels.rows.map(autoModel => ({
            cols: [
              {
                content: (
                  <div className="d-flex align-items-center">
                    <span
                      className="text-underline cursor-pointer color-primary-hover"
                      onClick={() => startEditing(autoModel)}
                    >
                      {autoModel.name}
                    </span>
                  </div>
                ),
              },
              {
                content: (
                  <div className="d-flex justify-content-center w-100">
                    <Popconfirm
                      title="Подтвердите удаление"
                      onConfirm={() => deleteAutoModel(autoModel.id)}
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
        {!autoModels?.rows?.length && (
          <h3 className="text-center mt-15">Модели не найдены</h3>
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
        title="Добавить модель"
        footer={<></>}
        className="footer-hidden"
        centered
      >
        <Form layout="vertical" onFinish={addAutoModel} form={createForm}>
          <Form.Item
            name="autoTypeId"
            label="Вид"
            rules={[
              {
                required: true,
                whitespace: true,
                message: locale.validations.required,
              },
            ]}
          >
            <Select>
              {autoTypes.rows.map(autoType => (
                <Select.Option key={autoType.id} value={autoType.id}>
                  {autoType.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
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
        open={!!updateAutoModelData}
        onCancel={() => setUpdateAutoModelData(null)}
        title={updateAutoModelData?.name}
        footer={<></>}
        className="footer-hidden"
        centered
      >
        <Form
          layout="vertical"
          onFinish={values => updateAutoModel(updateAutoModelData?.id, values)}
          form={updateForm}
        >
          <Form.Item
            name="autoTypeId"
            label="Вид"
            rules={[
              {
                required: true,
                whitespace: true,
                message: locale.validations.required,
              },
            ]}
          >
            <Select>
              {autoTypes.rows.map(autoType => (
                <Select.Option key={autoType.id} value={autoType.id}>
                  {autoType.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
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

export default AutoBrandPageContent;
