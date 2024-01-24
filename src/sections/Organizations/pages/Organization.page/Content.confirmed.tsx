import { Form } from 'antd';
import {
  BreadCrumbs,
  Page,
  PageTop,
  PageContent,
  Link,
} from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import { IOrganization } from 'sections/Organizations/interfaces';
import { useHandlers } from './handlers.confirmed';
import OrganizationView from 'sections/Organizations/components/OrganizationView';
import OrganizationBranchOfficeItem from 'sections/Organizations/components/BranchOfficeView';
import { getUserName } from 'sections/Users/utils';
import { useLocale } from 'hooks/locale.hook';
import { generateInnerUrl } from 'utils/common.utils';
import { FC } from 'react';

interface IProps {
  organization: IOrganization;
}

const OrganizationPageContentConfirmed: FC<IProps> = ({ organization }) => {
  const { locale } = useLocale();
  const {
    router,
    form,
    state,
    setState,
    branchOffices,
    setBranchOffices,
    fileList,
    uploadFile,
    removeFile,
    banOrg,
    deleteOrg,
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
        ]}
      />
      <PageTop title={organization.name} />
      <PageContent containerProps={{ size: 'middle' }}>
        <Form
          className="register-form"
          form={form}
          initialValues={{
            ...state,
          }}
        >
          <section className="register-form__section">
            <div className="register-form__section__title mb-20">
              {locale.organizations.dataCompanies}
            </div>

            <OrganizationView
              organization={organization}
              form={form}
              branchOffices={branchOffices}
              setBranchOffices={setBranchOffices}
              fileList={fileList.org}
              state={state}
              setState={setState}
              editButtonHref={generateInnerUrl(
                APP_PATHS.EDIT_ORGANIZATION(organization.id),
                {
                  text: 'Редактирование',
                },
              )}
              uploadFile={uploadFile}
              removeFile={removeFile}
              searchByInnEnabled={false}
              banOrg={banOrg}
              deleteOrg={deleteOrg}
            />

            {!!organization?.updateApplications?.length && (
              <div className="mt-30 mb-30">
                <div className="register-form__section__title">
                  Запросы на обновление данных
                </div>
                {organization?.updateApplications.map(application => {
                  const matchNotification = (
                    organization.unreadNotifications || []
                  ).find(el => el?.data?.applicationId === application.id);
                  return (
                    <li
                      key={application.id}
                      className="d-flex align-items-center"
                    >
                      <Link
                        href={generateInnerUrl(
                          APP_PATHS.ORGANIZATION_UPDATE_APPLICATION(
                            organization.id,
                            application.id,
                          ),
                          {
                            text: 'Запрос на обновление данных',
                          },
                        )}
                      >
                        {getUserName(application.user)}
                      </Link>
                      {!!matchNotification && (
                        <span className="notification-circle ml-10">1</span>
                      )}
                    </li>
                  );
                })}
              </div>
            )}

            <div className="register-form__section__title mb-10">
              {locale.organizations.mainOffice}
            </div>
            <div className="d-flex">
              <div className="org-branch-office-list">
                {organization.branches
                  .filter(el => el.isMain)
                  .map(branchOffice => (
                    <OrganizationBranchOfficeItem
                      key={branchOffice.id}
                      organization={organization}
                      branch={branchOffice}
                    />
                  ))}
              </div>
            </div>

            {organization.branches.filter(el => !el.isMain).length > 0 && (
              <>
                <div className="register-form__section__title mt-30 mb-10">
                  {locale.organizations.branches}
                </div>
                <div className="d-flex">
                  <div className="org-branch-office-list">
                    {organization.branches
                      .filter(el => !el.isMain)
                      .map(branch => (
                        <OrganizationBranchOfficeItem
                          key={branch.id}
                          organization={organization}
                          branch={branch}
                        />
                      ))}
                  </div>
                </div>
              </>
            )}

            {organization.unconfirmedSellers &&
              organization.unconfirmedSellers.length > 0 && (
                <>
                  <div className="register-form__section__title mt-30 mb-10">
                    {locale.organizations.appSellers}
                  </div>
                  <div className="org-seller-application-list">
                    {organization.unconfirmedSellers.map(seller => (
                      <div
                        key={seller.id}
                        className="org-seller-application-item"
                      >
                        <Link
                          href={generateInnerUrl(
                            APP_PATHS.ORGANIZATION_SELLER_APPLICATION(
                              organization.id,
                              seller.userId,
                            ),
                            {
                              text: getUserName(seller.user),
                            },
                          )}
                        >
                          {getUserName(seller.user)}
                        </Link>
                      </div>
                    ))}
                  </div>
                </>
              )}
          </section>
        </Form>
      </PageContent>
    </Page>
  );
};

export default OrganizationPageContentConfirmed;
