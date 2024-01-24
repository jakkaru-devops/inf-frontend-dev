import { Form, Button, Modal, Input, Alert } from 'antd';
import _ from 'lodash';
import {
  BreadCrumbs,
  Page,
  PageTop,
  PageContent,
  FormGroup,
} from 'components/common';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import {
  IOrganization,
  IOrganizationSellerRejection,
} from 'sections/Organizations/interfaces';
import OrganizationSellerFormFragment from 'sections/Organizations/components/OrganizationSellerFormFragment';
import { ChangeEvent, FC, useEffect, useState } from 'react';
import { generateUrl, openNotification } from 'utils/common.utils';
import {
  getOrgFormData,
  getOrgSellerFormData,
} from 'sections/Organizations/utils';
import { APIRequest } from 'utils/api.utils';
import { useRouter } from 'next/router';
import { deepenObject } from 'utils/object.utils';
import { ISellerAutoBrand, IUser } from 'sections/Users/interfaces';
import OrganizationBranchOfficeItem from 'sections/Organizations/components/BranchOfficeView';
import socketService from 'services/socket';
import { REGISTER_SELLER_FILE_LIST } from 'sections/Auth/data';
import { deleteRegisterFile, uploadRegisterFile } from 'sections/Auth/utils';
import { IRegisterFileExtended } from 'sections/Auth/interfaces';
import { useLocale } from 'hooks/locale.hook';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';
import SimplifiedRegSeller from 'sections/Organizations/components/OrganizationSellerFormFragment/simplifiedRegSeller';
import classNames from 'classnames';
import CategoriesSelectionModal from 'sections/Catalog/components/CategoriesSelectionModal';

interface IProps {
  organization: IOrganization;
  user: IUser;
  setUser: (user: IUser) => void;
}

const OrganizationSellerApplicationPageContent: FC<IProps> = ({
  organization,
  user,
  setUser,
}) => {
  const registerAdvanced = true;

  // Deprecated
  /* const registerAdvanced =
    !!organization?.priceBenefitPercentAcquiring &&
    !!organization?.priceBenefitPercentInvoice; */

  const { locale } = useLocale();
  const router = useRouter();
  const [form] = Form.useForm();

  const [state, setState] = useState({
    ...getOrgFormData(organization),
    ...getOrgSellerFormData(user),
    'org.formEnabled': true,
    'org.offerForSuppliers': true,
    'org.supplyAgreementRules': true,
    'personal.personalDataProcessing': true,
    'personal.agencyContract': true,
    'user.personalDataProcessing': true,
    'user.agencyContract': true,
  });
  const [fileList, setFileList] = useState({
    personal: user
      ? REGISTER_SELLER_FILE_LIST.map(localFile => {
          const file = user.sellerRegisterFiles.find(
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
        })
      : [],
  });
  const [categorySelectionVisible, setCategorySelectionVisible] =
    useState(false);
  const [selectedAutoBrands, setSelectedAutoBrands] = useState<
    ISellerAutoBrand[]
  >(user?.sellerAutoBrands || []);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(
    user?.sellerProductGroups?.map(({ id }) => id),
  );

  const [rejection, setRejection] = useState({
    message: '',
    modalVisible: false,
  });

  const rejectionAvailable =
    user.sellers[0].rejections.filter(el => !el.isResponded).length <= 0;

  useEffect(() => {
    setTimeout(() => {
      socketService.socket
        .off('SERVER:SELLER_REGISTER_APPLICATION_REPEAT')
        .on('SERVER:SELLER_REGISTER_APPLICATION_REPEAT', data => {
          let message = `Повторная заявка на регистрацию продавца`;
          openNotification(message, {
            onClick: () => {
              router.push(
                APP_PATHS.ORGANIZATION_SELLER_APPLICATION(
                  data.organizationId,
                  data.orgSellerId,
                ),
              );
            },
          });
          setTimeout(() => {
            router.reload();
          }, 2000);
        });
    }, 10);
  }, []);

  const uploadFile = async (
    e: ChangeEvent<HTMLInputElement>,
    type: 'user' | 'org',
    label: string,
  ) => {
    uploadRegisterFile({
      e,
      type,
      label,
      fileList,
      setFileList,
    });
  };

  const deleteFile = async (type: 'user' | 'org', label: string) => {
    deleteRegisterFile({
      type,
      label,
      fileList,
      setFileList,
    });
  };

  const resetCategories = () => {
    setSelectedAutoBrands([]);
    setSelectedGroupIds([]);
  };

  /**
   * Send register request to API
   */
  const handleFormSubmit = async (values: any) => {
    const data: any = deepenObject(values);

    // Check if product categories are selected by user
    if (!selectedAutoBrands.length && !selectedGroupIds.length) {
      openNotification('Необходимо выбрать категории товаров');
      setCategorySelectionVisible(true);
      return;
    }

    data.userId = user.id;
    data.organizationId = organization.id;

    // Add product categories to request body
    data.user.sellerAutoBrands = selectedAutoBrands;
    data.user.sellerProductGroups = selectedGroupIds.map(id => ({ id }));

    // Specify equest status
    data.status = 'accept';

    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.CONFIRM_ORGANIZATION_SELLER,
      data,
      requireAuth: true,
    });
    if (!res.isSucceed) {
      openNotification(res.message);
      return;
    }

    router.push(
      generateUrl(
        {
          history: DEFAULT_NAV_PATHS.ORGANIZATION(
            organization.id,
            organization.name,
          ),
        },
        {
          pathname: APP_PATHS.ORGANIZATION(organization.id),
        },
      ),
    );
  };

  const handleReject = async () => {
    let data = {
      userId: user.id,
      organizationId: organization.id,
      message: rejection.message,
    };

    if (!rejection.message) {
      openNotification('Требуется указать причину отказа для продавца');
      return;
    }

    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.REJECT_ORGANIZATION_SELLER,
      data,
      requireAuth: true,
    });
    if (!res.isSucceed) {
      openNotification(res.message);
      return;
    }
    openNotification('Заявка на регистрацию отклонена');
    setRejection({
      ...rejection,
      message: '',
      modalVisible: false,
    });

    const rejectionData: IOrganizationSellerRejection = res.data?.rejection;

    const newUser = user;
    newUser.sellers[0].rejections = [rejectionData];

    setUser({
      ...newUser,
    });
  };

  const sellerBranchOffice =
    organization.branches.find(el => el.id === user.sellers[0].branchId) ||
    organization.branches[0];

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
            link: APP_PATHS.ORGANIZATION_SELLER_APPLICATION(
              organization.id,
              user.id,
            ),
            text: 'Проверка продавца',
          },
        ]}
      />
      <PageTop title="Проверка продавца" />
      <PageContent containerProps={{ size: 'small' }}>
        <Form
          className={classNames('register-form', {
            'simplifield-form': registerAdvanced,
          })}
          form={form}
          initialValues={{
            ...state,
          }}
          onFinish={handleFormSubmit}
        >
          <section className="register-form__section">
            <h3 className="register-form__section__title">
              Личные данные продавца
            </h3>
            <h3 className="register-form__section__subtitle">
              Все поля обязательны для заполнения!
            </h3>

            {user.sellers[0].rejections[0] && (
              <>
                <FormGroup title="Последний отказ">
                  <Alert
                    message={user.sellers[0].rejections[0].message}
                    type={
                      user.sellers[0].rejections[0].isResponded
                        ? 'success'
                        : 'error'
                    }
                    showIcon
                  />
                </FormGroup>
                <hr className="mt-10 mb-10" />
              </>
            )}

            {!registerAdvanced ? (
              <OrganizationSellerFormFragment
                form={form}
                fileList={fileList.personal}
                state={state}
                setState={setState}
                uploadFile={uploadFile}
                deleteFile={deleteFile}
              />
            ) : (
              <SimplifiedRegSeller state={state} fileList={fileList.personal} />
            )}
          </section>

          <div className="register-form__section__title mt-30 mb-10">
            {sellerBranchOffice.isMain ? 'Главный офис' : 'Филиал'}
          </div>
          <div className="d-flex">
            <div className="org-branch-office-list">
              <OrganizationBranchOfficeItem
                organization={organization}
                branch={{
                  ...sellerBranchOffice,
                  sellers: [user.sellers[0]],
                }}
              />
            </div>
          </div>

          <div className="row mb-15 w-100 btn-block__manager">
            <div className="col w-100">
              <Button
                type="primary"
                className="w-100 mt-30"
                onClick={() => setCategorySelectionVisible(true)}
              >
                Категории продавца
              </Button>
            </div>
          </div>

          <div className="row btn-block__manager">
            <div className="col mr-10" style={{ width: '40%' }}>
              <Button
                className="w-100"
                onClick={() =>
                  setRejection({
                    ...rejection,
                    modalVisible: true,
                  })
                }
                disabled={!rejectionAvailable}
              >
                {locale.common.reject}
              </Button>
            </div>
            <div className="col ml-10 pr-10" style={{ width: '60%' }}>
              <Button
                type="primary"
                htmlType="submit"
                className="w-100 m-0"
                onClick={() => {
                  form
                    .validateFields()
                    .then(() => {})
                    .catch(() => {
                      openNotification('Не все поля корректно заполнены');
                    });
                }}
              >
                Подтвердить регистрацию
              </Button>
            </div>
          </div>
        </Form>
      </PageContent>

      <CategoriesSelectionModal
        open={categorySelectionVisible}
        onClose={() => setCategorySelectionVisible(false)}
        onSave={() => setCategorySelectionVisible(false)}
        resetCategories={resetCategories}
        selectedAutoBrands={selectedAutoBrands}
        setSelectedAutoBrands={setSelectedAutoBrands}
        selectedGroupIds={selectedGroupIds}
        setSelectedGroupIds={setSelectedGroupIds}
      />

      <Modal
        open={rejection.modalVisible}
        onCancel={() =>
          setRejection({
            ...rejection,
            modalVisible: false,
          })
        }
        centered
        title="Укажите причину отказа"
        footer={
          <>
            <div className="d-flex justify-content-end">
              <Button type="primary" onClick={() => handleReject()}>
                Потдтвердить отказ
              </Button>
            </div>
          </>
        }
      >
        <Input.TextArea
          value={rejection.message}
          onChange={e =>
            setRejection({
              ...rejection,
              message: e.target.value,
            })
          }
        />
      </Modal>
    </Page>
  );
};

export default OrganizationSellerApplicationPageContent;
