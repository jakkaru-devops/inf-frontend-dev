import { Form, Button, Input, Modal, Alert } from 'antd';
import {
  BreadCrumbs,
  Page,
  PageTop,
  PageContent,
  PageTopPanel,
  FormGroup,
} from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import { IOrganization } from 'sections/Organizations/interfaces';
import OrganizationFormFragment from 'sections/Organizations/components/OrganizationFormFragment';
import { useHandlers } from './handlers.application';
import { useLocale } from 'hooks/locale.hook';
import { openNotification } from 'utils/common.utils';
import { FC } from 'react';

interface IProps {
  organization: IOrganization;
}

const OrganizationPageContentApplication: FC<IProps> = ({ organization }) => {
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
    handleReject,
    rejectionData,
    setRejectionData,
    orgRejectionAvailable,
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
            text: locale.organizations.checkOrganization,
          },
        ]}
      />
      <PageTop title={locale.organizations.checkOrganization} />
      <PageTopPanel />
      <PageContent containerProps={{ size: 'small' }}>
        <Form
          className="register-form"
          form={form}
          initialValues={{
            ...state,
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
              branches={branches}
              setBranches={setBranches}
              fileList={fileList.org}
              state={state}
              setState={setState}
              uploadFile={uploadFile}
              deleteFile={deleteFile}
              searchByInnEnabled={false}
            />
          </section>

          {/* Submition buttons */}
          <div className="row mt-20">
            <div className="col" style={{ width: '50%' }}>
              <Button
                className="w-100"
                onClick={() =>
                  setRejectionData({
                    ...rejectionData,
                    modalVisible: true,
                  })
                }
                disabled={!orgRejectionAvailable}
              >
                {locale.common.reject}
              </Button>
            </div>
            <div className="col" style={{ width: '50%' }}>
              <Button
                type="primary"
                className="w-100"
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
                {locale.common.register}
              </Button>
            </div>
          </div>
        </Form>
      </PageContent>

      <Modal
        open={rejectionData.modalVisible}
        onCancel={() =>
          setRejectionData({
            ...rejectionData,
            modalVisible: false,
          })
        }
        centered
        title={locale.organizations.rejectionReason}
        footer={
          <>
            <div className="d-flex justify-content-end">
              <Button type="primary" onClick={() => handleReject()}>
                {locale.organizations.confirmRefusal}
              </Button>
            </div>
          </>
        }
      >
        <FormGroup title={locale.organizations.organization} className="mb-10">
          <Input.TextArea
            value={rejectionData.message}
            onChange={e =>
              setRejectionData({
                ...rejectionData,
                message: e.target.value,
              })
            }
          />
        </FormGroup>
      </Modal>
    </Page>
  );
};

export default OrganizationPageContentApplication;
