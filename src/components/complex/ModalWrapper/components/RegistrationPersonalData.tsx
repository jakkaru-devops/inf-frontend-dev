import { Button, Form, Input } from 'antd';
import { Container, FormGroup } from 'components/common';
import { API_ENDPOINTS } from 'data/paths.data';
import { useAuth } from 'hooks/auth.hook';
import { useFormValidation } from 'hooks/formValidation.hooks';
import { useLocale } from 'hooks/locale.hook';
import { useModalsState } from 'hooks/modal.hook';
import { FC } from 'react';
import { IJuristicSubject } from 'sections/JuristicSubject/interfaces';
import { APIRequest } from 'utils/api.utils';
import { openNotification } from 'utils/common.utils';

interface IProps {
  jurSubjectId: IJuristicSubject['id'];
  selectedAction: 'handleInvoicePayment' | 'handleCardPayment';
  paymentActions: {
    handleInvoicePayment?: (jurSubjectId: IJuristicSubject['id']) => void;
    handleCardPayment?: (jurSubjectId?: IJuristicSubject['id']) => void;
  };
}

export const RegistrationPersonalData: FC<IProps> = props => {
  const auth = useAuth();
  const { locale } = useLocale();

  const [form] = Form.useForm();

  const { validateEmailInput } = useFormValidation();

  const { Modal: Registration, openModal } = useModalsState();

  const handleSubmit = async values => {
    const { lastname, firstname, middlename, email } = values;

    if (
      lastname !== auth.user.lastname ||
      firstname !== auth.user.firstname ||
      middlename !== auth.user.middlename ||
      email !== auth.user.email
    ) {
      const res = await APIRequest<any>({
        method: 'put',
        url: API_ENDPOINTS.USER,
        data: {
          user: { id: auth.user.id, lastname, firstname, middlename, email },
        },
        requireAuth: true,
      });

      if (!res.isSucceed) return;
    }

    if (props.jurSubjectId === 'add') {
      openModal('registrationJuristicSubject');
      return;
    }

    await props.paymentActions[props.selectedAction](props.jurSubjectId);
  };

  return (
    <Container size="small">
      <Registration {...props} />

      <h2 className="text_24 color-black mb-40">Регистрация</h2>

      <h3 className="register-form__section__title">
        {locale.other.personalDataCustomer}
      </h3>
      <h3 className="register-form__section__subtitle">
        {locale.organizations.requiredFields}
      </h3>

      <Form
        className="register-form"
        onFinish={handleSubmit}
        form={form}
        initialValues={{
          lastname: auth.user.lastname,
          firstname: auth.user.firstname,
          middlename: auth.user.middlename,
          email: auth.user.email,
        }}
      >
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
            <Input placeholder="Фамилия" readOnly={!!auth.user.lastname} />
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
            <Input placeholder="Имя" readOnly={!!auth.user.firstname} />
          </Form.Item>
          <Form.Item name="middlename">
            <Input placeholder="Отчество" readOnly={!!auth.user.middlename} />
          </Form.Item>
        </FormGroup>

        <FormGroup title="Электронная почта">
          <Form.Item name="email" rules={[{ validator: validateEmailInput }]}>
            <Input readOnly={!!auth.user.email} />
          </Form.Item>
        </FormGroup>

        <Button
          type="primary"
          className="mt-30"
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
          Продолжить
        </Button>
      </Form>
    </Container>
  );
};
