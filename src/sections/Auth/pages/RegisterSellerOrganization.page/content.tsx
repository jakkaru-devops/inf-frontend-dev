import { Form, Button, Alert } from 'antd';
import _ from 'lodash';
import { APP_PATHS } from 'data/paths.data';
import {
  BreadCrumbs,
  FormGroup,
  Page,
  PageContent,
  PageTop,
  PageTopPanel,
} from 'components/common';
import useHandlers from './handlers';
import OrganizationFormFragment from 'sections/Organizations/components/OrganizationFormFragment';
import { IOrganization } from 'sections/Organizations/interfaces';
import { openNotification } from 'utils/common.utils';
import { FC } from 'react';

interface IProps {
  org: IOrganization;
}

const RegisterSellerOrganizationPageContent: FC<IProps> = ({ org }) => {
  const {
    locale,
    form,
    branches,
    setBranches,
    fileList,
    state,
    setState,
    uploadFile,
    deleteFile,
    handleFormSubmit,
  } = useHandlers({
    org,
  });

  return (
    <Page>
      <BreadCrumbs
        list={[
          {
            link: APP_PATHS.REGISTER_SELLER_ORGANIZATION,
            text: locale.user.register,
          },
        ]}
      />
      <PageTop title={locale.user.register} />
      <PageTopPanel />
      <PageContent containerProps={{ size: 'small', noPadding: true }}>
        <Form
          className="register-form"
          form={form}
          initialValues={{
            ...state,
            personalDataHandlingAgreement: false,
            agencyContractAgreement: false,
          }}
          onFinish={handleFormSubmit}
        >
          <section className="register-form__section">
            <div className="register-form__section__title">
              {locale.organizations.dataCompanies}
            </div>
            <div className="register-form__section__subtitle">
              {locale.organizations.requiredFields}
            </div>

            {org && org.rejections[0] && (
              <>
                <hr className="mt-10 mb-10" />
                <FormGroup title={locale.organizations.lastRefusal}>
                  <Alert
                    message={org.rejections[0].message}
                    type={org.rejections[0].isResponded ? 'success' : 'error'}
                    showIcon
                  />
                </FormGroup>
                <hr className="mt-10 mb-10" />
              </>
            )}

            <OrganizationFormFragment
              form={form}
              branches={branches}
              setBranches={setBranches}
              fileList={fileList.org}
              state={state}
              setState={setState}
              uploadFile={uploadFile}
              deleteFile={deleteFile}
              searchByInnEnabled={!org}
            />
          </section>

          <div className="d-table m-auto">
            <Button
              type="primary"
              htmlType="submit"
              className="w-100 mt-20"
              disabled={!state['org.formEnabled']}
              onClick={() => {
                form
                  .validateFields()
                  .then(() => {})
                  .catch(() => {
                    openNotification('Не все поля корректно заполнены');
                  });
              }}
            >
              {!org
                ? locale.organizations.sendRegisterRequest
                : locale.organizations.sendTuRegisterRequest}
            </Button>
          </div>
        </Form>
      </PageContent>
    </Page>
  );
};

export default RegisterSellerOrganizationPageContent;
