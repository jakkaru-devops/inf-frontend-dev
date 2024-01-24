import { Button, Form } from 'antd';
import { Container, Link } from 'components/common';
import { FC, Fragment } from 'react';
import JuristicSubjectFormFragment from 'sections/JuristicSubject/components/JuristicSubjectFormFragment';
import { IJuristicSubject } from 'sections/JuristicSubject/interfaces';
import { generateUrl, openNotification } from 'utils/common.utils';
import { useHandlers } from './handlers';
import { IUserRoleLabelsDefault } from 'sections/Users/interfaces';

interface IProps {
  jurSubject: IJuristicSubject;
}

const CustomerOrganizationContent: FC<IProps> = ({ jurSubject }) => {
  const {
    locale,
    auth,
    form,
    state,
    setState,
    editable,
    handleEditToggle,
    handleSaveChanges,
  } = useHandlers({
    jurSubject,
  });

  return (
    <Fragment>
      <div className="d-flex justify-content-between align-items-center">
        <h3 className="mb-20">{jurSubject.name}</h3>
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
          initialValues={{
            ...state,
          }}
          onFinish={values => {
            if (editable) handleSaveChanges(values);
          }}
        >
          <section className="register-form__section">
            <div className="register-form__section__title mb-20 color-primary">
              {locale.organizations.dataCompanies}
            </div>

            <JuristicSubjectFormFragment
              form={form}
              state={state}
              searchByInnAvailable={false}
              setState={setState}
              editable={editable}
            />

            {(auth.user.id && auth.user.id === jurSubject.userId) ||
              ((
                ['manager', 'operator'] as Array<IUserRoleLabelsDefault>
              ).includes(auth.currentRole.label) && (
                <Button
                  type="primary"
                  htmlType="button"
                  className="mt-20"
                  style={{ marginLeft: 'auto' }}
                  disabled={!state['jurSubject.formEnabled']}
                  onClick={() => {
                    if (!editable) {
                      handleEditToggle();
                      return;
                    }

                    form
                      .validateFields()
                      .then(() => form.submit())
                      .catch(() => {
                        openNotification('Не все поля корректно заполнены');
                      });
                  }}
                >
                  {editable ? 'Сохранить' : 'Редактировать'}
                </Button>
              ))}
          </section>
        </Form>
      </Container>
    </Fragment>
  );
};

export default CustomerOrganizationContent;
