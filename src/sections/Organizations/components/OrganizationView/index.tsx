import { ChangeEvent, FC, Fragment } from 'react';
import { Button, Form, Input, Popconfirm, Radio } from 'antd';
import { FormInstance } from 'antd/lib/form';
import {
  AddressInputGroup,
  FormGroup,
  Link,
  MaskedInput,
} from 'components/common';
import {
  IOrganization,
  IOrganizationBranch,
} from 'sections/Organizations/interfaces';
import { useFormValidation } from 'hooks/formValidation.hooks';
import RegisterFileList from 'sections/Auth/components/RegisterFileList';
import { IRegisterFileExtended } from 'sections/Auth/interfaces';
import { useLocale } from 'hooks/locale.hook';
import { useAuth } from 'hooks/auth.hook';
import { ISetState } from 'interfaces/common.interfaces';

interface IProps {
  organization: IOrganization;
  branchOffices: {
    list: IOrganizationBranch[];
    index: number;
  };
  setBranchOffices: ISetState<{
    list: IOrganizationBranch[];
    index: number;
  }>;
  fileList: IRegisterFileExtended[];
  form: FormInstance<any>;
  state: any;
  setState: ISetState<any>;
  editButtonHref?: string;
  onStartEdit?: (organization: IOrganization) => void;
  uploadFile: (
    e: ChangeEvent<HTMLInputElement>,
    type: 'user' | 'org',
    label: string,
  ) => void;
  removeFile: (type: 'user' | 'org', label: string) => void;
  searchByInnEnabled: boolean;
  banOrg?: () => void;
  deleteOrg?: () => void;
}

const OrganizationView: FC<IProps> = ({
  organization,
  fileList,
  form,
  state,
  editButtonHref,
  onStartEdit,
  uploadFile,
  removeFile,
  banOrg,
  deleteOrg,
}) => {
  const auth = useAuth();
  const { locale } = useLocale();
  const {
    validateMaskedInput,
    validateEmailInput,
    validateInn,
    validateRadio,
    validateNumber,
  } = useFormValidation();

  return (
    <Fragment>
      <div className="row row--content">
        <div className="col col--content">
          <FormGroup title="ИНН">
            <Form.Item name="org.inn" rules={[{ validator: validateInn }]}>
              <Input max={12} readOnly />
            </Form.Item>
          </FormGroup>

          {state['org.entityType'] === 'ИП' && (
            <FormGroup title="Наименование ИП">
              <Form.Item
                name="org.name"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: locale.validations.required,
                  },
                ]}
              >
                <Input readOnly />
              </Form.Item>
            </FormGroup>
          )}

          <AddressInputGroup
            title="Юридический адрес"
            prefix="org.juristicAddress."
            form={form}
            editable={false}
          />
        </div>

        <div className="col col--content">
          <FormGroup title="Банковские реквизиты">
            <Form.Item
              name="org.bankName"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: locale.validations.required,
                },
              ]}
            >
              <Input placeholder="Наименование банка" readOnly />
            </Form.Item>
            <Form.Item
              name="org.bankBik"
              rules={[{ validator: validateMaskedInput }]}
            >
              <MaskedInput placeholder="БИК банка" format="bik" readOnly />
            </Form.Item>
            <Form.Item
              name="org.bankKs"
              rules={[{ validator: validateMaskedInput }]}
            >
              <MaskedInput placeholder="К/с банка" format="ks" readOnly />
            </Form.Item>
            <Form.Item
              name="org.bankRs"
              rules={[{ validator: validateMaskedInput }]}
            >
              <MaskedInput placeholder="Р/с банка" format="rs" readOnly />
            </Form.Item>
          </FormGroup>

          <FormGroup title="Наименование магазина/производства">
            <Form.Item
              name="org.shopName"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: locale.validations.required,
                },
              ]}
            >
              <Input readOnly />
            </Form.Item>
          </FormGroup>

          {state['org.entityType'] === 'ИП' ? (
            <FormGroup title="ФИО ИП">
              <Form.Item
                name="org.directorLastname"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: locale.validations.required,
                  },
                ]}
              >
                <Input placeholder="Фамилия" readOnly />
              </Form.Item>
              <Form.Item
                name="org.directorFirstname"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: locale.validations.required,
                  },
                ]}
              >
                <Input placeholder="Имя" readOnly />
              </Form.Item>
              <Form.Item name="org.directorMiddlename">
                <Input placeholder="Отчество" readOnly />
              </Form.Item>
            </FormGroup>
          ) : (
            <FormGroup title="ФИО директора">
              <Form.Item
                name="org.directorLastname"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: locale.validations.required,
                  },
                ]}
              >
                <Input placeholder="Фамилия" readOnly />
              </Form.Item>
              <Form.Item
                name="org.directorFirstname"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: locale.validations.required,
                  },
                ]}
              >
                <Input placeholder="Имя" readOnly />
              </Form.Item>
              <Form.Item name="org.directorMiddlename">
                <Input placeholder="Отчество" readOnly />
              </Form.Item>
            </FormGroup>
          )}

          <FormGroup title="Телефон организации">
            <Form.Item
              name="org.phone"
              rules={[{ validator: validateMaskedInput }]}
            >
              <MaskedInput
                format="phoneNumber"
                placeholder="+7(___) ___-__-__"
                readOnly
              />
            </Form.Item>
          </FormGroup>

          <FormGroup title="E-mail организации">
            <Form.Item
              name="org.email"
              rules={[{ validator: validateEmailInput }]}
            >
              <Input readOnly />
            </Form.Item>
          </FormGroup>
        </div>

        <div className="col col--content">
          <AddressInputGroup
            title="Фактический адрес"
            prefix="org.actualAddress."
            form={form}
            editable={false}
          />

          {!organization?.isServiceOrganization && (
            <Fragment>
              {!!organization.priceBenefitPercent &&
              !organization.priceBenefitPercentAcquiring &&
              !organization.priceBenefitPercentInvoice ? (
                <FormGroup title="Процент комиссии">
                  <Form.Item
                    name="org.priceBenefitPercent"
                    rules={[
                      {
                        validator: (rule, value) =>
                          validateNumber(value, {
                            min: 6,
                            max: 100,
                          }),
                      },
                    ]}
                  >
                    <Input min={0} max={100} className="w-100" readOnly />
                  </Form.Item>
                </FormGroup>
              ) : (
                <Fragment>
                  <FormGroup title="Процент комиссии: Эквайринг">
                    <Form.Item
                      name="org.priceBenefitPercentAcquiring"
                      rules={[
                        {
                          validator: (rule, value) =>
                            validateNumber(value, {
                              min: 6,
                              max: 100,
                            }),
                        },
                      ]}
                    >
                      <Input min={2.5} max={100} className="w-100" readOnly />
                    </Form.Item>
                  </FormGroup>
                  <FormGroup
                    style={{ marginBottom: '0' }}
                    title="Процент комиссии: По счёту"
                  >
                    <Form.Item
                      name="org.priceBenefitPercentInvoice"
                      rules={[
                        {
                          validator: (rule, value) =>
                            validateNumber(value, {
                              min: 6,
                              max: 100,
                            }),
                        },
                      ]}
                    >
                      <Input min={0.1} max={100} className="w-100" readOnly />
                    </Form.Item>
                  </FormGroup>
                </Fragment>
              )}

              <FormGroup title="Отсканированные документы">
                <RegisterFileList
                  fileList={fileList.filter(
                    el => !!el?.file?.id || el?.type === 'check',
                  )} // Show attached files for old organizations and hide for new ones
                  type="org"
                  orgEntityType={state['org.entityType']}
                  uploadFile={(e, type, label) =>
                    !state['org.formEnabled']
                      ? () => {}
                      : uploadFile(e, type, label)
                  }
                  deleteFile={(type, label) =>
                    !state['org.formEnabled']
                      ? () => {}
                      : removeFile(type, label)
                  }
                  icon={'download'}
                  allowControl={false}
                />
              </FormGroup>
            </Fragment>
          )}

          <FormGroup title="Компания работает">
            <Form.Item name="org.hasNds" rules={[{ validator: validateRadio }]}>
              <Radio.Group className="d-flex" disabled>
                <Radio value={true}>с НДС</Radio>
                <Radio value={false}>без НДС</Radio>
              </Radio.Group>
            </Form.Item>
          </FormGroup>

          {!!editButtonHref && (
            <Link className="w-100" href={editButtonHref}>
              <Button type="primary" className="w-100 mt-20 mb-10">
                Редактировать
              </Button>
            </Link>
          )}
          {!editButtonHref && !!onStartEdit && (
            <Button
              type="primary"
              className="w-100 mt-20 mb-10"
              onClick={() => onStartEdit(organization)}
            >
              Редактировать
            </Button>
          )}
          {['manager', 'operator'].includes(auth?.currentRole?.label) && (
            <>
              <Button type="primary" onClick={banOrg} className="w-100 mb-10">
                {!organization.bannedUntil ? 'Заблокировать' : 'Разблокировать'}
              </Button>
              <Popconfirm
                title="Вы уверены, что хотите удалить организацию?"
                okText="удалить"
                cancelText="отмена"
                onConfirm={deleteOrg}
              >
                <Button type="primary" className="w-100">
                  Удалить
                </Button>
              </Popconfirm>
            </>
          )}
        </div>
      </div>
    </Fragment>
  );
};

export default OrganizationView;
