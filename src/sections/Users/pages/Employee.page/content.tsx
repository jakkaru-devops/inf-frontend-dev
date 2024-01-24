import { Button, Checkbox, Form, Input, Modal } from 'antd';
import {
  BreadCrumbs,
  FormGroup,
  MaskedInput,
  Page,
  PageContent,
  PageTop,
  PageTopPanel,
} from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import { useFormValidation } from 'hooks/formValidation.hooks';
import { IUser } from 'sections/Users/interfaces';
import { getUserName } from 'sections/Users/utils';
import { openNotification } from 'utils/common.utils';
import { flattenObject } from 'utils/object.utils';
import { useHandlers } from './handlers';
import { FC } from 'react';

interface IProps {
  user: IUser;
}

const getInitialFormValues = (user: IUser): any => {
  const result = flattenObject(user);
  for (const role of user.roles) {
    result[`roles.${role.label}`] = true;
  }
  return result;
};

const EmployeePageContent: FC<IProps> = ({ user }) => {
  const {
    locale,
    form,
    deletion,
    setDeletion,
    blocking,
    setBlocking,
    handleDeletionCheckboxChange,
    handleDeletionSubmit,
    handleBlockingCheckboxChange,
    handleUpdateSubmit,
  } = useHandlers({ user });
  const { validateEmailInput, validateMaskedInput } = useFormValidation();

  return (
    <Page>
      <BreadCrumbs
        list={[
          { link: APP_PATHS.EMPLOYEE_LIST, text: 'Сотрудники' },
          {
            link: APP_PATHS.EMPLOYEE(user.id),
            text: getUserName(user, 'full'),
          },
        ]}
      />
      <PageTop title={getUserName(user, 'full')} />
      <PageTopPanel />
      <PageContent containerProps={{ size: 'small' }}>
        <Form
          className="register-form"
          onFinish={handleUpdateSubmit}
          form={form}
          initialValues={getInitialFormValues(user)}
        >
          <FormGroup title="Номер телефона">
            <Form.Item
              name="phone"
              rules={[
                { validator: validateMaskedInput },
                {
                  required: true,
                  whitespace: true,
                  message: locale.validations.required,
                },
              ]}
            >
              <MaskedInput format="phoneNumber" />
            </Form.Item>
          </FormGroup>
          <FormGroup className="mt-10">
            <Form.Item name="roles.operator" valuePropName="checked">
              <Checkbox>оператор</Checkbox>
            </Form.Item>
            <Form.Item name="roles.manager" valuePropName="checked">
              <Checkbox>менеджер</Checkbox>
            </Form.Item>
            <Form.Item name="roles.moderator" valuePropName="checked">
              <Checkbox>модератор</Checkbox>
            </Form.Item>
          </FormGroup>
          <FormGroup title="ФИО">
            <Form.Item
              name="lastname"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: locale.validations.required,
                },
              ]}
            >
              <Input placeholder="Фамилия" />
            </Form.Item>
            <Form.Item
              name="firstname"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: locale.validations.required,
                },
              ]}
            >
              <Input placeholder="Имя" />
            </Form.Item>
            <Form.Item name="middlename">
              <Input placeholder="Отчество" />
            </Form.Item>
          </FormGroup>
          <FormGroup title="Город">
            <Form.Item
              name="address.city"
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
          </FormGroup>
          <FormGroup title="Электронная почта">
            <Form.Item name="email" rules={[{ validator: validateEmailInput }]}>
              <Input />
            </Form.Item>
          </FormGroup>

          <div className="d-flex justify-content-between mt-10">
            <div>
              <Button
                type="primary"
                htmlType="submit"
                onClick={() => {
                  form
                    .validateFields()
                    .then(() => {})
                    .catch(() => {
                      openNotification('Не все поля корректно заполнены');
                    });
                }}
              >
                Обновить
              </Button>
            </div>
            <div className="d-flex">
              <Button
                type="primary"
                style={{ marginLeft: 7 }}
                onClick={() => setBlocking({ ...blocking, modalVisible: true })}
              >
                Блокировка
              </Button>
            </div>
          </div>
        </Form>
      </PageContent>

      <Modal
        open={blocking.modalVisible}
        onCancel={() => setBlocking({ ...blocking, modalVisible: false })}
        centered
        title="Блокировка"
        footer={null}
      >
        <h4 className="mb-15">
          Выберите роли пользователя, которые должны быть заблокированы
        </h4>
        {user.roles.length < 4 && (
          <Checkbox
            checked={blocking.roles['all']}
            onChange={e =>
              handleBlockingCheckboxChange('all', e.target.checked)
            }
          >
            Полная блокировка
          </Checkbox>
        )}
        {user.roles.map(userRole => (
          <Checkbox
            key={userRole.label}
            disabled={blocking.roles['all']}
            checked={blocking.roles['all'] || blocking.roles[userRole.label]}
            onChange={e =>
              handleBlockingCheckboxChange(userRole.label, e.target.checked)
            }
            style={{
              marginLeft: 0,
              marginTop: 10,
            }}
          >
            {locale.user[userRole.label]}
          </Checkbox>
        ))}
      </Modal>
    </Page>
  );
};

export default EmployeePageContent;
