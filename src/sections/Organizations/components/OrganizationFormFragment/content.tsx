import { Fragment, useContext, useState } from 'react';
import { Form, Select, Alert, Input, Radio } from 'antd';
import classNames from 'classnames';
import { AddressInputGroup, FormGroup, MaskedInput } from 'components/common';
import { useFormValidation } from 'hooks/formValidation.hooks';
import { OrgFormFragmentContext } from './context';
import OrgBranchSelect from './OrgBranchSelect';
import RegisteredOrg from './RegisteredOrg';
import InnInput from './InnInput';
import RegisterFileList from 'sections/Auth/components/RegisterFileList';
import { APP_PATHS } from 'data/paths.data';
import { useRouter } from 'next/router';
import { ORGANIZATION_TYPES } from 'sections/Organizations/data';
import { isManager } from 'sections/Users/utils';
import { useAuth } from '../../../../hooks/auth.hook';

const OrgFormFragmentContent = () => {
  const {
    auth,
    locale,
    form,
    state,
    setState,
    comparedData,
    comparedJuristicAddress,
    comparedActualAddress,
    fileList,
    uploadFile,
    deleteFile,
    searchByInnEnabled,
  } = useContext(OrgFormFragmentContext);

  const {
    validateMaskedInput,
    validateEmailInput,
    validateRadio,
    validateNumber,
  } = useFormValidation();
  const router = useRouter();
  const [isExtendedCommission, setIsExtendedCommission] = useState(
    !!(
      state['org.priceBenefitPercentAcquiring'] &&
      state['org.priceBenefitPercentInvoice']
    ),
  );

  if (
    state['org.isRegistered'] &&
    auth?.currentRole?.label === 'seller' &&
    state['org.creatorUser.id'] !== auth?.user?.id &&
    state['org.formEnabled'] &&
    searchByInnEnabled
  ) {
    return <RegisteredOrg />;
  }

  const isServiceOrganization: boolean = !!state?.['org.isServiceOrganization'];

  const authUser = useAuth();

  const isSellerEditPage =
    router.route === '/personal-area/settings' &&
    authUser.currentRole.label === 'seller';

  return (
    <Fragment>
      <InnInput />

      {state['org.formEnabled'] && (
        <Fragment>
          {state['org.notFound'] && (
            <Alert
              message="По введенному ИНН компания не найдена. Введите реквизиты вручную"
              className="mb-15"
            />
          )}

          <FormGroup
            className={classNames({
              'is-disabled': !state['org.formEnabled'],
              hidden:
                (!isManager(auth.currentRole) && !state['org.notFound']) ||
                (isManager(auth.currentRole) && !state['org.formEnabled']),
            })}
          >
            <Form.Item name="org.entityType">
              <Select
                onChange={(value: number) =>
                  setState({
                    ...state,
                    'org.entityType': value,
                    'org.entityCode': ORGANIZATION_TYPES[value],
                  })
                }
                disabled={!state['org.formEnabled']}
                className={classNames('bg-light-gray', {
                  highlighted:
                    !!comparedData &&
                    state['org.entityType'] !== comparedData['org.entityType'],
                })}
              >
                <Select.Option value={'АО'}>
                  АО - Акционерное общество
                </Select.Option>
                <Select.Option value={'ПАО'}>
                  ПАО - Публичное акционерное общество
                </Select.Option>
                <Select.Option value={'НАО'}>
                  НАО - Непубличное акционерное общество
                </Select.Option>
                <Select.Option value={'ООО'}>
                  ООО - Общество с ограниченной ответственностью
                </Select.Option>
                <Select.Option value={'ИП'}>
                  ИП - Индивидуальный предприниматель
                </Select.Option>
              </Select>
            </Form.Item>
          </FormGroup>

          <div className="row row--content">
            <div className="col col--content">
              <FormGroup
                title={
                  state['org.entityType'] === 'ИП'
                    ? 'Наименование ИП'
                    : 'Наименование юр. лица'
                }
              >
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
                  <Input
                    disabled={isSellerEditPage}
                    className={classNames({
                      highlighted:
                        !!comparedData &&
                        state['org.name'] !== comparedData['org.name'],
                    })}
                  />
                </Form.Item>
              </FormGroup>

              <AddressInputGroup
                editable={!isSellerEditPage}
                title="Юридический адрес"
                prefix="org.juristicAddress."
                form={form}
                comparedData={comparedJuristicAddress}
              />

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
                  <Input
                    disabled={isSellerEditPage}
                    placeholder="Наименование банка"
                    className={classNames({
                      highlighted:
                        !!comparedData &&
                        state['org.bankName'] !== comparedData['org.bankName'],
                    })}
                  />
                </Form.Item>
                <Form.Item
                  name="org.bankBik"
                  rules={[{ validator: validateMaskedInput }]}
                >
                  <MaskedInput
                    disabled={isSellerEditPage}
                    placeholder="БИК банка"
                    format="bik"
                    className={classNames({
                      highlighted:
                        !!comparedData &&
                        state['org.bankBik'] !== comparedData['org.bankBik'],
                    })}
                  />
                </Form.Item>
                <Form.Item
                  name="org.bankKs"
                  rules={[{ validator: validateMaskedInput }]}
                >
                  <MaskedInput
                    disabled={isSellerEditPage}
                    placeholder="К/с банка"
                    format="ks"
                    className={classNames({
                      highlighted:
                        !!comparedData &&
                        state['org.bankKs'] !== comparedData['org.bankKs'],
                    })}
                  />
                </Form.Item>
                <Form.Item
                  name="org.bankRs"
                  rules={[{ validator: validateMaskedInput }]}
                >
                  <MaskedInput
                    disabled={isSellerEditPage}
                    placeholder="Р/с банка"
                    format="rs"
                    className={classNames({
                      highlighted:
                        !!comparedData &&
                        state['org.bankRs'] !== comparedData['org.bankRs'],
                    })}
                  />
                </Form.Item>
              </FormGroup>
            </div>
            <div className="col col--content">
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
                  <Input
                    disabled={isSellerEditPage}
                    className={classNames({
                      highlighted:
                        !!comparedData &&
                        state['org.shopName'] !== comparedData['org.shopName'],
                    })}
                  />
                </Form.Item>
              </FormGroup>
              <AddressInputGroup
                editable={!isSellerEditPage}
                title="Фактический адрес"
                prefix="org.actualAddress."
                form={form}
                comparedData={comparedActualAddress}
              />
              <OrgBranchSelect isSeller={isSellerEditPage} />
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
                    <Input
                      disabled={isSellerEditPage}
                      placeholder="Фамилия"
                      className={classNames({
                        highlighted:
                          !!comparedData &&
                          state['org.directorLastname'] !==
                            comparedData['org.directorLastname'],
                      })}
                    />
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
                    <Input
                      disabled={isSellerEditPage}
                      placeholder="Имя"
                      className={classNames({
                        highlighted:
                          !!comparedData &&
                          state['org.directorFirstname'] !==
                            comparedData['org.directorFirstname'],
                      })}
                    />
                  </Form.Item>
                  <Form.Item name="org.directorMiddlename">
                    <Input
                      disabled={isSellerEditPage}
                      placeholder="Отчество"
                      className={classNames({
                        highlighted:
                          !!comparedData &&
                          state['org.directorMiddlename'] !==
                            comparedData['org.directorMiddlename'],
                      })}
                    />
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
                    <Input
                      disabled={isSellerEditPage}
                      placeholder="Фамилия"
                      className={classNames({
                        highlighted:
                          !!comparedData &&
                          state['org.directorLastname'] !==
                            comparedData['org.directorLastname'],
                      })}
                    />
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
                    <Input
                      disabled={isSellerEditPage}
                      placeholder="Имя"
                      className={classNames({
                        highlighted:
                          !!comparedData &&
                          state['org.directorFirstname'] !==
                            comparedData['org.directorFirstname'],
                      })}
                    />
                  </Form.Item>
                  <Form.Item name="org.directorMiddlename">
                    <Input
                      disabled={isSellerEditPage}
                      placeholder="Отчество"
                      className={classNames({
                        highlighted:
                          !!comparedData &&
                          state['org.directorMiddlename'] !==
                            comparedData['org.directorMiddlename'],
                      })}
                    />
                  </Form.Item>
                </FormGroup>
              )}
              <FormGroup title="Телефон организации">
                <Form.Item
                  name="org.phone"
                  rules={[{ validator: validateMaskedInput }]}
                >
                  <MaskedInput
                    disabled={isSellerEditPage}
                    format="phoneNumber"
                    placeholder="+7(___) ___-__-__"
                    className={classNames({
                      highlighted:
                        !!comparedData &&
                        state['org.phone'] !== comparedData['org.phone'],
                    })}
                  />
                </Form.Item>
              </FormGroup>
              <FormGroup title="E-mail организации">
                <Form.Item
                  name="org.email"
                  rules={[{ validator: validateEmailInput }]}
                >
                  <Input
                    disabled={isSellerEditPage}
                    className={classNames({
                      highlighted:
                        !!comparedData &&
                        state['org.email'] !== comparedData['org.email'],
                    })}
                  />
                </Form.Item>
              </FormGroup>

              {/* Процент комиссии */}
              {!isServiceOrganization && (
                <Fragment>
                  {!isExtendedCommission ? (
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
                        <Input
                          disabled={isSellerEditPage}
                          min={0}
                          max={100}
                          suffix={
                            isManager(auth?.currentRole) && (
                              <img
                                onClick={() => {
                                  setIsExtendedCommission(prev => !prev);
                                }}
                                className="iconPencilCommission"
                                src="/img/pencil.svg"
                                alt="pencil"
                              />
                            )
                          }
                          className={classNames('w-100', {
                            highlighted:
                              !!comparedData &&
                              state['org.priceBenefitPercent'] !==
                                comparedData['org.priceBenefitPercent'],
                          })}
                        />
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
                                  min: 2.5,
                                  max: 100,
                                }),
                            },
                          ]}
                        >
                          <Input
                            disabled={isSellerEditPage}
                            min={2.5}
                            max={100}
                            className={classNames('w-100', {
                              highlighted:
                                !!comparedData &&
                                state['org.priceBenefitPercentAcquiring'] !==
                                  comparedData[
                                    'org.priceBenefitPercentAcquiring'
                                  ],
                            })}
                          />
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
                                  min: 0.1,
                                  max: 100,
                                }),
                            },
                          ]}
                        >
                          <Input
                            disabled={isSellerEditPage}
                            min={0.1}
                            max={100}
                            className={classNames('w-100', {
                              highlighted:
                                !!comparedData &&
                                state['org.priceBenefitPercentInvoice'] !==
                                  comparedData[
                                    'org.priceBenefitPercentInvoice'
                                  ],
                            })}
                          />
                        </Form.Item>
                      </FormGroup>

                      {['manager', 'operator'].includes(
                        auth?.currentRole?.label,
                      ) && (
                        <button
                          className={classNames([
                            'color-primary',
                            'btnBackCommission',
                          ])}
                          onClick={() => {
                            setIsExtendedCommission(prev => !prev);
                          }}
                        >
                          {' '}
                          Назад
                        </button>
                      )}
                    </Fragment>
                  )}

                  <FormGroup title="Прикрепите скан">
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
                          : deleteFile(type, label)
                      }
                      icon={
                        auth?.currentRole?.label === 'seller' ||
                        router.pathname === APP_PATHS.ADD_ORGANIZATION
                          ? 'upload'
                          : 'download'
                      }
                      allowControl={true}
                    />
                  </FormGroup>
                </Fragment>
              )}

              <FormGroup title="Компания работает">
                <Form.Item
                  name="org.hasNds"
                  rules={[{ validator: validateRadio }]}
                >
                  <Radio.Group
                    className={classNames('d-flex', {
                      highlighted:
                        !!comparedData &&
                        state['org.hasNds'] !== comparedData['org.hasNds'],
                    })}
                  >
                    <Radio disabled={isSellerEditPage} value={true}>
                      с НДС
                    </Radio>
                    <Radio disabled={isSellerEditPage} value={false}>
                      без НДС
                    </Radio>
                  </Radio.Group>
                </Form.Item>
              </FormGroup>
            </div>
          </div>

          {auth?.currentRole?.label === 'seller' &&
            !state['org.isRegistered'] && (
              <div
                style={{
                  lineHeight: 1.1,
                  margin: '20px auto 0',
                  fontWeight: 700,
                  color: '#525252',
                }}
              >
                Документы:
                <br />
                {state['org.entityType'] === 'ИП'
                  ? 'Паспорт (главная, прописка)'
                  : 'Устав'}
                , ИНН, {state['org.entityType'] === 'ИП' ? 'ОГРНИП' : 'ОГРН'},
                карточку предприятия необходимо отправить на info@inf.market
              </div>
            )}
        </Fragment>
      )}
    </Fragment>
  );
};

export default OrgFormFragmentContent;
