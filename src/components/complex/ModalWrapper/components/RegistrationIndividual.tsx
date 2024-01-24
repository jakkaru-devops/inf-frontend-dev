import { FC, Fragment, useEffect, useState } from 'react';
import { Button, Form, Input, Checkbox, Modal } from 'antd';
import { Container, FormGroup, Link } from 'components/common';
import { useFormValidation } from 'hooks/formValidation.hooks';
import { DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import { RULES_AND_AGREEMENTS } from '../data';
import { IUser } from 'sections/Users/interfaces';
import { IJuristicSubject } from 'sections/JuristicSubject/interfaces';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import { useLocale } from 'hooks/locale.hook';
import { openNotification } from 'utils/common.utils';
import { useAuth } from 'hooks/auth.hook';

interface IRulesAndAgreements {
  url: string;
  label: string;
  name: string;
}

interface IProps {
  paymentActions: {
    handleInvoicePayment?: (jurSubjectId: IJuristicSubject['id']) => void;
    handleCardPayment?: (jurSubjectId?: IJuristicSubject['id']) => void;
  };
}

interface IModalVisible {
  open: boolean;
  item?: IRulesAndAgreements;
}

const getInitialFormValues = (user: IUser) => {
  const values = {
    lastname: user.lastname,
    firstname: user.firstname,
    middlename: user.middlename,
    email: user.email,
    personalDataProcessingPolicy: true,
  };

  RULES_AND_AGREEMENTS.forEach(({ label }) => {
    values[label] = false;
  });

  return values;
};

export const RegistrationIndividual: FC<IProps> = ({ paymentActions }) => {
  const auth = useAuth();
  const { locale } = useLocale();
  const [form] = Form.useForm();

  const { validateEmailInput, validateCheckbox } = useFormValidation();

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

      if (!res.isSucceed) {
        openNotification(res?.message);
        return;
      }
    }

    await paymentActions.handleCardPayment();
  };

  const [modal, setModal] = useState<IModalVisible>({
    open: false,
    item: undefined,
  });

  const handleOpenModal = (handle: boolean) => {
    setModal(prevState => {
      return { ...prevState, open: handle };
    });
  };

  useEffect(() => {
    form.setFieldsValue({
      personalDataProcessingPolicy: true,
    });
  }, []);

  return (
    <Container size="small">
      <Modal
        open={modal.open}
        onCancel={() => {
          handleOpenModal(false);
        }}
        centered
        width={'1000px'}
        footer={null}
        title={modal.item?.name}
        children={
          <object>
            <embed
              src={modal.item?.url}
              width="100%"
              style={{ height: '90vh' }}
              type="application/pdf"
            />
          </object>
        }
      />
      <h2 className="text_24 color-black mb-20">
        Регистрация
        <br />
        Физическое лицо
      </h2>

      <Form
        className="register-form"
        onFinish={handleSubmit}
        form={form}
        initialValues={getInitialFormValues(auth.user)}
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

        <div className="mt-15 mb-15" style={{ width: '260px' }}>
          {RULES_AND_AGREEMENTS.map((item, i) => (
            <Fragment key={i}>
              <Form.Item
                name={item.label}
                rules={[{ validator: validateCheckbox }]}
                valuePropName="checked"
                className="mt-10"
              >
                <Checkbox>
                  {locale.other[item.label]} <br />
                </Checkbox>
              </Form.Item>

              <EyeOutlined
                style={{ fontSize: 18 }}
                className="color-primary"
                onClick={() => {
                  setModal({ item, open: true });
                }}
              />
              <Link
                href={item.url}
                style={{ marginLeft: '5px' }}
                target="_blank"
                rel="noopener"
                download={item.label + '.pdf'}
              >
                <DownloadOutlined style={{ fontSize: 18 }} />
              </Link>
            </Fragment>
          ))}
        </div>

        <Button
          type="primary"
          style={{ margin: 'auto' }}
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
          Зарегистрироваться и перейти к оплате
        </Button>
      </Form>
    </Container>
  );
};
