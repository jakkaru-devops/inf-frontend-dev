import { Form, Button } from 'antd';
import _ from 'lodash';
import { APP_PATHS } from 'data/paths.data';
import {
  BreadCrumbs,
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
  organization: IOrganization;
}

const EditOrganizationPageContent: FC<IProps> = ({ organization }) => {
  const {
    locale,
    auth,
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
    organization,
  });

  return (
    <Page>
      <BreadCrumbs
        list={[
          {
            link: APP_PATHS.ORGANIZATION_LIST,
            text: locale.organizations.organizationList,
          },
          {
            link: APP_PATHS.ORGANIZATION(organization.id),
            text: organization.name,
          },
          {
            link: APP_PATHS.EDIT_ORGANIZATION(organization.id),
            text: 'Редактирование',
          },
        ]}
      />
      <PageTop title="Редактировать организацию" />
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
            <div className="register-form__section__title">Данные компании</div>
            <div className="register-form__section__subtitle">
              Все поля обязательны для заполнения!
            </div>

            <OrganizationFormFragment
              form={form}
              branches={branches}
              setBranches={setBranches}
              fileList={fileList.org}
              state={state}
              setState={setState}
              uploadFile={uploadFile}
              deleteFile={deleteFile}
              searchByInnEnabled={!organization}
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
              Сохранить изменения
            </Button>
          </div>
        </Form>
      </PageContent>
    </Page>
  );
};

export default EditOrganizationPageContent;
