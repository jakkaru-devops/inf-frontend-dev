import { Link } from 'components/common';
import { Form, Button } from 'antd';
import {
  IOrganization,
  IOrganizationBranch,
  IOrganizationSeller,
  IOrganizationUpdateApplication,
} from 'sections/Organizations/interfaces';
import { useHandlers } from './handlers.org';
import OrganizationView from 'sections/Organizations/components/OrganizationView';
import { ClockCircleOutlined } from '@ant-design/icons';
import OrganizationBranchOfficeItem from 'sections/Organizations/components/BranchOfficeView';
import { useLocale } from 'hooks/locale.hook';
import { generateUrl } from 'utils/common.utils';
import { FC, Fragment, useEffect, useState } from 'react';
import { API_ENDPOINTS } from 'data/paths.data';
import SellerOrganizationContentEdit from './EditOrganizationForm';
import { APIRequest } from 'utils/api.utils';
import { useAuth } from 'hooks/auth.hook';

interface IProps {
  organization: IOrganization;
  orgSeller: IOrganizationSeller;
}

const SellerOrganizationContent: FC<IProps> = ({ organization, orgSeller }) => {
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
    handleReject,
    rejectionData,
    setRejectionData,
  } = useHandlers({
    organization,
  });
  const [editModeEnabled, setEditModeEnabled] = useState(false);
  const [updateApplication, setUpdateApplication] =
    useState<IOrganizationUpdateApplication>(null);
  const [rejectedApplication, setRejectedApplication] =
    useState<IOrganizationUpdateApplication>(null);

  useEffect(() => {
    if (auth.currentRole.label === 'customer') return;
    // Получение заявки на редактирование данных
    const fetchData = async () => {
      const res = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.ORGANIZATION_UPDATE_APPLICATION,
        params: {
          organizationId: organization.id,
        },
        requireAuth: true,
      });
      setUpdateApplication(res?.data?.organizationUpdateApplication || null);
    };
    fetchData();
  }, []);

  useEffect(() => {
    // Получение отклоненых запросов
    const fetchData = async () => {
      const res = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.ORGANIZATION_UPDATE_APPLICATION,
        params: {
          status: 'any',
        },
        requireAuth: true,
      });
      const applicationData: IOrganizationUpdateApplication =
        res?.data?.organizationUpdateApplication;
      if (!!applicationData?.rejectedAt) {
        setRejectedApplication(applicationData || null);
      }
    };
    fetchData();
  }, []);

  const formContent = (
    <Form
      className="register-form"
      form={form}
      initialValues={{
        ...state,
      }}
      onFinish={handleFormSubmit}
    >
      <section className="register-form__section">
        <div className="register-form__section__title mb-10">
          Данные компании
        </div>

        <OrganizationView
          organization={organization}
          form={form}
          branchOffices={branchOffices}
          setBranchOffices={setBranchOffices}
          fileList={fileList.org}
          state={state}
          setState={setState}
          onStartEdit={
            auth.currentRole.label === 'seller'
              ? () => setEditModeEnabled(true)
              : null
          }
          uploadFile={uploadFile}
          removeFile={deleteFile}
          searchByInnEnabled={false}
        />

        {!!organization.branches.filter(el => el?.current && el.isMain)
          ?.length && (
          <Fragment>
            <div className="register-form__section__title mt-30 mb-10">
              Главный офис
            </div>
            <div className="d-flex">
              <div className="org-branch-office-list">
                {organization.branches
                  .filter((el: IOrganizationBranch) => el.isMain)
                  .map(branch => (
                    <OrganizationBranchOfficeItem
                      key={branch.id}
                      organization={organization}
                      branch={branch}
                    />
                  ))}
              </div>
            </div>
          </Fragment>
        )}
        {organization.branches.filter(el => el?.current && !el.isMain).length >
          0 && (
          <>
            <div className="register-form__section__title mt-30 mb-10">
              Филиалы
            </div>
            <div className="d-flex">
              <div className="org-branch-office-list">
                {organization.branches
                  .filter(el => el?.current && !el.isMain)
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
      </section>
    </Form>
  );

  return (
    <Fragment>
      <div className="d-flex justify-content-between align-items-center">
        <h3 className="mb-20">{organization.name}</h3>
        <Button className="ml-20">
          <Link href={generateUrl({ organizationId: null })}>
            {locale.other.backToOrganizations}
          </Link>
        </Button>
      </div>

      {!editModeEnabled ? (
        !organization.confirmationDate || !orgSeller.confirmationDate ? (
          <>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 100,
              }}
            >
              <ClockCircleOutlined
                style={{ fontSize: 70, color: '#999', marginBottom: 30 }}
              />
              <h2 className="mb-10">Данные проверяются администратором.</h2>
              <h3>Пожалуйста дождитесь оповещения.</h3>
            </div>
          </>
        ) : (
          formContent
        )
      ) : (
        <SellerOrganizationContentEdit
          organization={organization}
          setEditModeEnabled={setEditModeEnabled}
          rejectedApplication={rejectedApplication}
          setUpdateApplication={setUpdateApplication}
        />
      )}
    </Fragment>
  );
};

export default SellerOrganizationContent;
