import { FC, Fragment, useEffect } from 'react';
import { Form, Button, Alert } from 'antd';
import { API_ENDPOINTS } from 'data/paths.data';
import { Container, Link } from 'components/common';
import { APIRequest } from 'utils/api.utils';
import {
  generateUrl,
  openNotification,
  validateAddressFiasId,
} from 'utils/common.utils';
import { IUser } from 'sections/Users/interfaces';
import { IOrganization } from 'sections/Organizations/interfaces';
import { getOrgSellerFormData } from 'sections/Organizations/utils';
import useHandlers from 'sections/Auth/pages/RegisterSellerOrganization.page/handlers';
import OrganizationFormFragment from 'sections/Organizations/components/OrganizationFormFragment';
import { deepenObject } from 'utils/object.utils';
import { validateAddress } from 'components/common/YandexMap/utils';
import { REGISTER_ORG_FILE_LIST } from 'sections/Organizations/data';
import { getExtendedFile } from 'sections/Auth/utils';
import { useLocale } from 'hooks/locale.hook';
import { useAuth } from 'hooks/auth.hook';

interface IProps {
  user: IUser;
}

const SellerAddOrganizationContent: FC<IProps> = ({ user }) => {
  const auth = useAuth();
  const { locale } = useLocale();
  const {
    router,
    form,
    branches,
    setBranches,
    fileList,
    setFileList,
    state,
    setState,
    uploadFile,
    deleteFile,
  } = useHandlers({
    org: null,
  });

  useEffect(() => {
    const userFormData = getOrgSellerFormData(user);
    setState({
      ...state,
      userFormData,
    });
    form.setFieldsValue(userFormData);

    setFileList({
      ...fileList,
      org: REGISTER_ORG_FILE_LIST.map(file => getExtendedFile(file)),
    });
  }, []);

  /**
   * Send register request to API
   */
  const handleFormSubmit = async (values: any) => {
    const data = deepenObject(values);
    data.personal = {};
    const stateData = deepenObject(state);

    // Check if organization form is enabled, inn is filled
    if (!state['org.formEnabled']) {
      openNotification(locale.other.companyDataComplete);
      return;
    }

    data.org.actualAddress = {
      ...stateData.org.actualAddress,
      ...data.org.actualAddress,
    };
    data.org.juristicAddress = {
      ...stateData.org.juristicAddress,
      ...data.org.juristicAddress,
    };
    data.org.mailingAddress = {
      ...stateData.org.mailingAddress,
      ...data.org.mailingAddress,
    };

    const isItemsSelected = state['org.isRegistered']
      ? !!validateAddressFiasId(data.org.actualAddress)
      : !!validateAddressFiasId(data.org.actualAddress) &&
        !!validateAddressFiasId(data.org.juristicAddress) &&
        !!validateAddressFiasId(data.org.mailingAddress);

    // Validate if org branches are filled correctly
    for (const branch of branches.list) {
      if (!validateAddress(branch.actualAddress)) {
        openNotification('Не все адреса филлиалов корректно заполнены');
        return;
      }
    }

    // Validate if user selected address from suggestions
    if (!isItemsSelected) {
      openNotification(
        'Пожалуйста, выберите подходящий адрес из всплывающих подсказок',
      );
      return;
    }

    // Seller user id
    data.personal.userId = user.id;

    // Add organization data to request body
    data.org.id = state['org.id'];
    data.org.isRegistered = state['org.isRegistered'];
    data.org.selectedBranch = branches.list[branches.index];
    data.org.entityCode = stateData.org.entityCode || data.org.entityCode;
    data.org.branches = branches.list;
    data.org.files = fileList.org
      .filter(orgFile => !!orgFile && orgFile.file)
      .filter(
        orgFile =>
          !orgFile.entityTypes ||
          (orgFile.entityTypes.includes('REST') &&
            values['org.entityType'] !== 'ИП') ||
          (orgFile.entityTypes.includes('ИП') &&
            values['org.entityType'] === 'ИП'),
      );

    // Create seller for current user if org is already registered
    if (data.org.isRegistered) {
      // Request to API
      const res = await APIRequest({
        method: 'post',
        url: API_ENDPOINTS.ORGANIZATION_SELLER,
        data,
        requireAuth: true,
      });
      if (!res.isSucceed) {
        openNotification(res.message);
        return;
      }

      const resOrg: IOrganization = res.data.organization;
      if (resOrg) {
        router.push(generateUrl({ organizationId: resOrg.id }));
      } else {
        router.push(generateUrl({ organizationId: null }));
      }

      // Create organization if it is not registered yet
    } else {
      // Request to API
      const res = await APIRequest({
        method: 'post',
        url: API_ENDPOINTS.ORGANIZATION,
        data,
        requireAuth: true,
      });
      if (!res.isSucceed) {
        openNotification(res.message);
        return;
      }

      const resOrg: IOrganization = res.data.organization;
      if (resOrg) {
        router.push(generateUrl({ organizationId: resOrg.id }));
      } else {
        router.push(generateUrl({ organizationId: null }));
      }
    }
  };

  return (
    <Fragment>
      <div className="d-flex justify-content-between mb-10">
        <h2>{locale.other.newAppl}</h2>
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

            <OrganizationFormFragment
              form={form}
              branches={branches}
              setBranches={setBranches}
              fileList={fileList.org}
              state={state}
              setState={setState}
              uploadFile={uploadFile}
              deleteFile={deleteFile}
              searchByInnEnabled={true}
            />
          </section>

          <div className="d-table m-auto">
            {/* <Button
									type="primary"
									className="w-100 mt-30"
									onClick={() => setCategorySelectingVisible(true)}
								>Выбрать категорию</Button> */}
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
              {locale.organizations.sendRegisterRequest}
            </Button>
          </div>
        </Form>
      </Container>
    </Fragment>
  );
};

export default SellerAddOrganizationContent;
