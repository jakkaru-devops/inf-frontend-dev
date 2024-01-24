import { Button, Form } from 'antd';
import {
  BreadCrumbs,
  Page,
  PageTop,
  PageContent,
  Container,
  Link,
} from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import { Fragment, useContext, useEffect } from 'react';
import JuristicSubjectFormFragment from 'sections/JuristicSubject/components/JuristicSubjectFormFragment';
import { generateUrl, openNotification } from 'utils/common.utils';
import { Context } from '../context';
import { useHandlers } from './handlers';

const CustomerAddOrganization = () => {
  const { locale, form, state, setState, handleFormSubmit } = useHandlers();
  const { setSummaryContentLeft } = useContext(Context);

  useEffect(() => {
    setSummaryContentLeft(null);
  }, []);

  return (
    <Fragment>
      <div className="d-flex justify-content-between align-items-center">
        <h2 className="mb-20">Добавить организацию</h2>
        <Button className="ml-20">
          <Link href={generateUrl({ organizationId: null })}>
            {locale.other.backToOrganizations}
          </Link>
        </Button>
      </div>

      <Container size="small" style={{ marginLeft: 0 }} noPadding>
        <Form
          className="register-form"
          form={form}
          initialValues={state}
          onFinish={handleFormSubmit}
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
            />

            {state['jurSubject.formEnabled'] && (
              <Button
                type="primary"
                htmlType="submit"
                className="mt-20"
                style={{ marginLeft: 'auto' }}
                disabled={!state['jurSubject.formEnabled']}
                onClick={() => {
                  form
                    .validateFields()
                    .then(() => {})
                    .catch(() => {
                      openNotification('Не все поля корректно заполнены');
                    });
                }}
              >
                Сохранить
              </Button>
            )}
          </section>
        </Form>
      </Container>
    </Fragment>
  );
};

export default CustomerAddOrganization;
