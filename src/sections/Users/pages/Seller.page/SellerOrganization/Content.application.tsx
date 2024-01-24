import { Form, Button, Alert } from 'antd';
import { Container, FormGroup, Link } from 'components/common';
import {
  IOrganization,
  IOrganizationSeller,
} from 'sections/Organizations/interfaces';
import OrganizationFormFragment from 'sections/Organizations/components/OrganizationFormFragment';
import { useHandlers } from './handlers.application';
import { useLocale } from 'hooks/locale.hook';
import { generateUrl, openNotification } from 'utils/common.utils';
import { FC, Fragment } from 'react';
import { useAuth } from 'hooks/auth.hook';

interface IProps {
  organization: IOrganization;
  orgSeller: IOrganizationSeller;
}

const SellerOrganizationApplicationContent: FC<IProps> = ({
  organization,
  orgSeller,
}) => {
  const auth = useAuth();
  const { locale } = useLocale();
  const {
    router,
    form,
    state,
    setState,
    branchOffices,
    setBranchOffices,
    fileList,
    setFileList,
    uploadFile,
    deleteFile,
    handleFormSubmit,
  } = useHandlers({
    orgSeller,
    organization,
    auth,
  });

  return (
    <Fragment>
      <div className="d-flex justify-content-between align-items-center mb-10">
        <h2 className="mb-0">{locale.organizations.sendRebid}</h2>
        <Button className="ml-20">
          <Link href={generateUrl({ organizationId: null })}>
            {locale.other.backToOrganizations}
          </Link>
        </Button>
      </div>
      <Container size="small">
        <Form
          className="register-form"
          form={form}
          initialValues={{
            ...state,
            personalDataHandlingAgreement: false,
            agencyContractAgreement: false,
            'personal.phone': auth.user.phone,
          }}
          onFinish={handleFormSubmit}
        >
          <section className="register-form__section mt-50">
            <div className="register-form__section__title">
              {locale.organizations.dataCompanies}
            </div>
            <div className="register-form__section__subtitle">
              {locale.organizations.requiredFields}
            </div>

            {state['org.authUserIsBeingSeller'] && (
              <Alert
                message={locale.organizations.alreadyRegistered}
                className="mt-10 mb-10"
              />
            )}

            {organization?.rejections?.[0] && (
              <>
                <hr className="mt-10 mb-10" />
                <FormGroup title={locale.organizations.lastRefusal}>
                  <Alert
                    message={organization.rejections[0].message}
                    type={
                      organization.rejections[0].isResponded
                        ? 'success'
                        : 'error'
                    }
                    showIcon
                  />
                </FormGroup>
                <hr className="mt-10 mb-10" />
              </>
            )}

            <OrganizationFormFragment
              form={form}
              branches={branchOffices}
              setBranches={setBranchOffices}
              fileList={fileList.org}
              state={state}
              setState={setState}
              uploadFile={uploadFile}
              deleteFile={deleteFile}
              searchByInnEnabled={true}
            />
          </section>

          <div className="d-table m-auto">
            <Button
              type="primary"
              htmlType="submit"
              className="w-100 mt-20"
              disabled={state['org.authUserIsBeingSeller']}
              onClick={() => {
                form
                  .validateFields()
                  .then(() => {})
                  .catch(() => {
                    openNotification('Не все поля корректно заполнены');
                  });
              }}
            >
              {locale.other.sendRegistrationRequest}
            </Button>
          </div>
        </Form>
      </Container>
    </Fragment>
  );
};

export default SellerOrganizationApplicationContent;
