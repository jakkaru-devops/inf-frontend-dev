import { Button, Form } from 'antd';
import { Container } from 'components/common';
import { API_ENDPOINTS } from 'data/paths.data';
import { useLocale } from 'hooks/locale.hook';
import { FC, useState } from 'react';
import JuristicSubjectFormFragment from 'sections/JuristicSubject/components/JuristicSubjectFormFragment';
import { IJuristicSubject } from 'sections/JuristicSubject/interfaces';
import { ORGANIZATION_TYPES } from 'sections/Organizations/data';
import { APIRequest } from 'utils/api.utils';
import { openNotification } from 'utils/common.utils';
import { deepenObject } from 'utils/object.utils';

interface IProps {
  jurSubjects: IJuristicSubject[];
  jurSubjectId: IJuristicSubject['id'];
  selectedAction: 'handleInvoicePayment' | 'handleCardPayment';
  paymentActions: {
    handleInvoicePayment?: (jurSubjectId: IJuristicSubject['id']) => void;
    handleCardPayment?: (jurSubjectId?: IJuristicSubject['id']) => void;
  };
}

export const RegistrationJuristicSubject: FC<IProps> = ({
  jurSubjects,
  jurSubjectId,
  paymentActions,
  selectedAction,
}) => {
  const { locale } = useLocale();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const [state, setState] = useState({
    'jurSubject.formEnabled': false,
    'jurSubject.notFound': false,
  });

  const handleFormSubmit = async values => {
    const data = {
      juristicSubject: deepenObject(values).jurSubject,
    };
    data.juristicSubject.entityCode = state['jurSubject.entityCode'];
    data.juristicSubject.entityCode =
      ORGANIZATION_TYPES?.[data.juristicSubject.entityType] ||
      state['jurSubject.entityCode'];

    console.log('organizations', jurSubjects);

    let organizationId = jurSubjects?.find(
      el => el.inn === data?.juristicSubject?.inn,
    )?.id;

    if (!organizationId) {
      setSubmitting(true);
      const res = await APIRequest<IJuristicSubject>({
        method: 'post',
        url: API_ENDPOINTS.USER_JURISTIC_SUBJECT,
        data,
        requireAuth: true,
      });
      setSubmitting(false);

      if (!res.isSucceed) {
        openNotification(res?.message);
        return;
      }

      organizationId = res.data.id;
    }

    setSubmitting(true);
    try {
      await paymentActions[selectedAction](organizationId);
    } catch (err) {
      setSubmitting(false);
    }
    setSubmitting(false);
  };

  return (
    <Container size="middle">
      <h2 className="text_24 color-black mb-20">
        Регистрация
        {form.getFieldValue('jurSubject.entityType') === 'ИП'
          ? '. ИП'
          : '. Юридическое лицо'}
      </h2>

      <Form
        className="register-form"
        form={form}
        initialValues={state}
        onFinish={props => handleFormSubmit(props)}
      >
        <section className="register-form__section">
          <div className="register-form__section__title">
            {locale.organizations.dataCompanies}
          </div>
          <div className="register-form__section__subtitle">
            {locale.organizations.requiredFields}
          </div>

          <JuristicSubjectFormFragment
            form={form}
            state={state}
            setState={setState}
            editable
            rulesAndAgreementsRequired
          />
        </section>

        <div className="d-table m-auto">
          <Button
            type="primary"
            htmlType="submit"
            className="w-100 mt-20"
            disabled={!state['jurSubject.formEnabled']}
            onClick={() => {
              form
                .validateFields()
                .then(() => {})
                .catch(() => {
                  openNotification('Не все поля корректно заполнены');
                });
            }}
            loading={submitting}
          >
            Зарегистрироваться и перейти к оплате
          </Button>
        </div>
      </Form>
    </Container>
  );
};
