import { Alert, Button, Form } from 'antd';
import { BreadCrumbs, Page, PageTop, PageContent } from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import OrganizationFormFragment from 'sections/Organizations/components/OrganizationFormFragment';
import { useHandlers } from './handlers';
import { useLocale } from 'hooks/locale.hook';
import { openNotification } from 'utils/common.utils';

const CreateOrganizationPage = () => {
  const { locale } = useLocale();
  const {
    form,
    state,
    setState,
    branches,
    setBranches,
    fileList,
    uploadFile,
    deleteFile,
    handleFormSubmit,
  } = useHandlers();

  return (
    <Page>
      <BreadCrumbs
        list={[
          {
            link: APP_PATHS.ORGANIZATION_LIST,
            text: locale.organizations.organizationList,
          },
          {
            link: APP_PATHS.ADD_ORGANIZATION,
            text: locale.organizations.registrOrganization,
          },
        ]}
      />
      <PageTop title={locale.organizations.registrOrganization} />
      <ul className="null registration__list"></ul>
      <PageContent containerProps={{ size: 'small' }}>
        <Form
          className="register-form"
          form={form}
          initialValues={{
            ...state,
          }}
          onFinish={handleFormSubmit}
          style={{ paddingTop: 0 }}
        >
          <section className="register-form__section">
            <h3 className="register-form__section__title mb-20">
              {locale.organizations.dataCompanies}
            </h3>

            <OrganizationFormFragment
              branches={branches}
              setBranches={setBranches}
              form={form}
              fileList={fileList.org}
              state={state}
              setState={setState}
              uploadFile={uploadFile}
              deleteFile={deleteFile}
              searchByInnEnabled={true}
              uploadAllFiles={true}
            />
          </section>

          <div className="d-table m-auto">
            <Button
              type="primary"
              htmlType="submit"
              className="w-100 mt-20"
              disabled={!state['org.formEnabled'] || state['org.isRegistered']}
              onClick={() => {
                form
                  .validateFields()
                  .then(() => {})
                  .catch(() => {
                    openNotification('Не все поля корректно заполнены');
                  });
              }}
            >
              Зарегистрировать
            </Button>
          </div>
        </Form>
      </PageContent>
    </Page>
  );
};

export default CreateOrganizationPage;
