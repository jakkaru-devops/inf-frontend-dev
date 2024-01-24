import { Button, Checkbox, Form, Input } from 'antd';
import {
  BreadCrumbs,
  FormGroup,
  MaskedInput,
  Page,
  PageContent,
  PageTop,
  PageTopPanel,
} from 'components/common';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { useFormValidation } from 'hooks/formValidation.hooks';
import { useLocale } from 'hooks/locale.hook';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { EMPLOYEE_ROLES } from 'sections/Users/data';
import { IUser } from 'sections/Users/interfaces';
import { APIRequest } from 'utils/api.utils';
import { generateInnerUrl, openNotification } from 'utils/common.utils';
import { deepenObject, flattenObject } from 'utils/object.utils';

const INITIAL_FORM_PARAMS = {
  form: {
    disabled: false,
  },
  email: {
    disabled: false,
  },
  name: {
    disabled: false,
  },
  city: {
    disabled: false,
  },
  roles: {
    disabled: false,
  },
};

const AddEmployeePage = () => {
  const { locale } = useLocale();
  const { validateEmailInput, validateMaskedInput } = useFormValidation();
  const router = useRouter();
  const [form] = Form.useForm();
  const [formParams, setFormParams] = useState(INITIAL_FORM_PARAMS);

  const handlePhoneChange = async (value: string) => {
    if (!value.isEmpty() && value[value.length - 1] !== '_') {
      const res = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.USER,
        params: {
          phone: value,
          include: ['address', 'roles'],
        },
      });
      if (!res.isSucceed) return;
      const user: IUser = res.data.user;
      const newFormParams = formParams;
      const formFields = [];

      if (user.email) {
        newFormParams.email.disabled = true;
        formFields.push({ name: 'email', value: user.email });
      }
      if (user.firstname && user.lastname) {
        newFormParams.name.disabled = true;
        formFields.push(
          { name: 'lastname', value: user.lastname },
          { name: 'firstname', value: user.firstname },
          { name: 'middlename', value: user.middlename },
        );
      }
      if (user.address && (user.address.city || user.address.settlement)) {
        newFormParams.city.disabled = true;
        formFields.push({
          name: 'address.city',
          value: user.address.city || user.address.settlement,
        });
      }
      if (user.roles) {
        for (const role of user.roles) {
          if (EMPLOYEE_ROLES.concat('superadmin').indexOf(role.label) !== -1) {
            newFormParams.roles.disabled = true;
            newFormParams.form.disabled = true;
            formFields.push({ name: `roles.${role}`, value: true });
          }
        }
      }

      setFormParams({ ...newFormParams });
      form.setFields(formFields);
    } else {
      if (formParams.form.disabled) {
        setFormParams({ ...INITIAL_FORM_PARAMS });
        form.setFieldsValue(
          flattenObject({
            roles: {
              operator: false,
              manager: false,
              moderator: false,
            },
            firstname: null,
            lastname: null,
            middlename: null,
            address: {
              city: null,
            },
            email: null,
          }),
        );
      }
    }
  };

  const handleSubmit = async (values: any) => {
    const userData = deepenObject(values);
    userData.roles = Object.keys(userData.roles)
      .filter(key => !!userData.roles[key])
      .map(roleLabel => ({
        label: roleLabel,
      }));

    if (userData.roles.length === 0) {
      openNotification(locale.validations.requeredRole);
      return;
    }

    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.USER_WORKER,
      data: {
        user: userData,
      },
      requireAuth: true,
    });
    if (!res.isSucceed) {
      openNotification(res.message);
      return;
    }

    openNotification(res.data.message);
    setTimeout(() => {
      router.push(generateInnerUrl(APP_PATHS.EMPLOYEE_LIST));
    }, 1000);
  };

  return (
    <Page>
      <BreadCrumbs
        list={[
          { link: APP_PATHS.EMPLOYEE_LIST, text: locale.other.staff },
          { link: APP_PATHS.ADD_EMPLOYEE, text: locale.catalog.add },
        ]}
      />
      <PageTop title={locale.other.addEmployee} />
      <PageTopPanel />
      <PageContent containerProps={{ size: 'small' }}>
        <Form className="register-form" onFinish={handleSubmit} form={form}>
          <FormGroup title={locale.other.phone}>
            <Form.Item
              name="phone"
              rules={[{ validator: validateMaskedInput }]}
            >
              <MaskedInput
                format="phoneNumber"
                onChange={e => handlePhoneChange(e.target.value)}
              />
            </Form.Item>
          </FormGroup>
          <FormGroup className="mt-10">
            <Form.Item name="roles.operator" valuePropName="checked">
              <Checkbox disabled={formParams.roles.disabled}>
                {locale.user.operator}
              </Checkbox>
            </Form.Item>
            <Form.Item name="roles.manager" valuePropName="checked">
              <Checkbox disabled={formParams.roles.disabled}>
                {locale.user.manager}
              </Checkbox>
            </Form.Item>
            <Form.Item name="roles.moderator" valuePropName="checked">
              <Checkbox disabled={formParams.roles.disabled}>
                {locale.user.moderator}
              </Checkbox>
            </Form.Item>
          </FormGroup>
          <FormGroup title={locale.other.fullName}>
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
              <Input
                placeholder={locale.common.lastname}
                disabled={formParams.name.disabled}
              />
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
              <Input
                placeholder={locale.user.name}
                disabled={formParams.name.disabled}
              />
            </Form.Item>
            <Form.Item name="middlename">
              <Input
                placeholder={locale.common.patronymic}
                disabled={formParams.name.disabled}
              />
            </Form.Item>
          </FormGroup>
          <FormGroup title={locale.address.city}>
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
              <Input disabled={formParams.city.disabled} />
            </Form.Item>
          </FormGroup>
          <FormGroup title={locale.other.mail}>
            <Form.Item name="email" rules={[{ validator: validateEmailInput }]}>
              <Input disabled={formParams.email.disabled} />
            </Form.Item>
          </FormGroup>

          <Button
            type="primary"
            htmlType="submit"
            disabled={formParams.form.disabled}
            onClick={() => {
              form
                .validateFields()
                .then(() => {})
                .catch(() => {
                  openNotification('Не все поля корректно заполнены');
                });
            }}
          >
            {locale.common.create}
          </Button>

          {formParams.form.disabled && (
            <div className="color-primary">
              {locale.validations.employeePhoneAlreadyRegistered}
            </div>
          )}
        </Form>
      </PageContent>
    </Page>
  );
};

export default AddEmployeePage;
