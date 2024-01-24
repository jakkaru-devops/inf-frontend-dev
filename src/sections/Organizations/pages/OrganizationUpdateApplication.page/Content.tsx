import { Alert, Button, Form, Input, Modal } from 'antd';
import {
  BreadCrumbs,
  FormGroup,
  Page,
  PageContent,
  PageTop,
  PageTopPanel,
} from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import { useLocale } from 'hooks/locale.hook';
import { FC, useMemo } from 'react';
import { IRegisterFileExtended } from 'sections/Auth/interfaces';
import OrganizationFormFragment from 'sections/Organizations/components/OrganizationFormFragment';
import { REGISTER_ORG_FILE_LIST } from 'sections/Organizations/data';
import { IOrganizationUpdateApplication } from 'sections/Organizations/interfaces';
import { getOrgFormData } from 'sections/Organizations/utils';
import { openNotification } from 'utils/common.utils';
import { useHandlers } from './handlers';

interface IProps {
  updateApplication: IOrganizationUpdateApplication;
}

const OrganizationUpdateApplicationPageContent: FC<IProps> = ({
  updateApplication,
}) => {
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
    rejection,
    setRejection,
    handleFormSubmit,
    handleReject,
  } = useHandlers({
    organization: {
      ...updateApplication,
      id: updateApplication?.organizationId,
    },
    updateApplication,
  });

  const comparedData = useMemo(
    () => ({
      ...getOrgFormData(updateApplication),
      'org.formEnabled': true,
      'org.offerForSuppliers': true,
      'org.supplyAgreementRules': true,
    }),
    [],
  );

  return (
    <Page>
      <BreadCrumbs
        list={[
          {
            link: APP_PATHS.ORGANIZATION_LIST,
            text: locale.organizations.organizationList,
          },
          {
            link: APP_PATHS.ORGANIZATION(updateApplication.id),
            text: updateApplication.name,
          },
          {
            link: APP_PATHS.ORGANIZATION_UPDATE_APPLICATION(
              updateApplication.id,
              updateApplication.id,
            ),
            text: 'Запрос на обновление',
          },
        ]}
      />
      <PageTop title={updateApplication.name} />
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

            {updateApplication?.rejections?.[0] && (
              <>
                <hr className="mt-10 mb-10" />
                <FormGroup title={locale.organizations.lastRefusal}>
                  <Alert
                    message={updateApplication.rejections[0].message}
                    type={
                      updateApplication.rejections[0].isResponded
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
              comparedData={comparedData}
              comparedJuristicAddress={updateApplication?.juristicAddress}
              comparedMailingAddress={updateApplication?.mailingAddress}
              comparedActualAddress={updateApplication?.actualAddress}
              comparedFileList={REGISTER_ORG_FILE_LIST.map(localFile => {
                const file = updateApplication.files.find(
                  el => el.label === localFile.label,
                );
                return {
                  label: localFile.label,
                  name: localFile.name,
                  localFile: file ? (file.file as any) : null,
                  file: file ? file.file : null,
                  entityTypes: localFile.entityTypes,
                  type: localFile.type,
                  path: localFile.path,
                } as IRegisterFileExtended;
              })}
              uploadFile={uploadFile}
              deleteFile={deleteFile}
              searchByInnEnabled={false}
            />
          </section>

          <div className="row mt-20">
            <div className="col" style={{ width: '50%' }}>
              <Button
                className="w-100 gray"
                onClick={() =>
                  setRejection(prev => ({
                    ...prev,
                    modalVisible: true,
                  }))
                }
              >
                {locale.common.reject}
              </Button>
            </div>
            <div className="col" style={{ width: '50%' }}>
              <Button
                type="primary"
                className="w-100 gray"
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
                Подтвердить
              </Button>
            </div>
          </div>
        </Form>
      </PageContent>

      <Modal
        open={rejection.modalVisible}
        onCancel={() =>
          setRejection(prev => ({
            ...prev,
            modalVisible: false,
          }))
        }
        centered
        title="Укажите причину отказа"
        footer={null}
        className="footer-hidden"
        width={500}
      >
        <Input.TextArea
          value={rejection.text}
          onChange={e =>
            setRejection(prev => ({
              ...prev,
              text: e.target.value,
            }))
          }
          className="w-100"
          style={{
            minHeight: 100,
          }}
        />
        <div className="d-flex justify-content-end mt-15">
          <Button
            type="primary"
            className="gray"
            style={{ width: 150 }}
            onClick={() => handleReject()}
            disabled={!rejection?.text?.trim()?.length}
          >
            Отклонить
          </Button>
        </div>
      </Modal>
    </Page>
  );
};

export default OrganizationUpdateApplicationPageContent;
