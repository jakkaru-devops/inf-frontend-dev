import { FC, Fragment, useEffect, useState } from 'react';
import { Form, Select, Alert, Input, Radio, Checkbox, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { FormInstance } from 'antd/lib/form';
import classNames from 'classnames';
import { FormGroup, MaskedInput, AddressInputGroup } from 'components/common';
import { useFormValidation } from 'hooks/formValidation.hooks';
import { useHandlers } from './handlers';
import { RULES_AND_AGREEMENTS } from 'components/complex/ModalWrapper/data';
import { DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { IRegisterFileExtended } from 'sections/Auth/interfaces';
import { useModalsState } from 'hooks/modal.hook';
import { downloadFileByPath } from 'utils/files.utils';
import { ISetState } from 'interfaces/common.interfaces';
import { useAuth } from 'hooks/auth.hook';
import { isManager } from 'sections/Users/utils';

interface IProps {
  form: FormInstance<any>;
  state: any;
  setState: ISetState<any>;
  searchByInnAvailable?: boolean;
  editable?: boolean;
  rulesAndAgreementsRequired?: boolean;
}

const JuristicSubjectFormFragment: FC<IProps> = ({
  form,
  state,
  setState,
  searchByInnAvailable = true,
  editable = false,
  rulesAndAgreementsRequired = true,
}) => {
  const auth = useAuth();
  const {
    locale,
    loading,
    handleJurSubjectInnChange,
    handleJurSubjectAddressFiasId,
  } = useHandlers({
    form,
    state,
    setState,
    searchByInnAvailable,
  });
  const { validateMaskedInput, validateInn, validateRadio, validateCheckbox } =
    useFormValidation();
  const router = useRouter();
  const { Modal, openModal } = useModalsState();

  const [doc, setDoc] = useState<IRegisterFileExtended>(null);

  const isRegistered = state['jurSubject.isRegistered'];
  const deep = '../'.repeat(router.route.match(/\//g).length - 1);

  useEffect(() => {
    form.setFieldsValue({
      personalDataProcessingPolicy: true,
    });
  }, []);

  return (
    <>
      <FormGroup title="ИНН">
        <Form.Item name="jurSubject.inn" rules={[{ validator: validateInn }]}>
          <Input
            max={12}
            onChange={e => {
              setState({
                ...state,
                'jurSubject.inn': e.target.value,
              });
              handleJurSubjectInnChange(e.target.value);
            }}
            readOnly={!editable}
            suffix={
              loading ? (
                <Spin
                  size="small"
                  indicator={
                    <LoadingOutlined
                      style={{ fontSize: 15 }}
                      className="color-primary"
                    />
                  }
                />
              ) : state['jurSubject.isRegistered'] ? (
                <span style={{ color: '#ccc' }}>
                  организация уже есть в базе
                </span>
              ) : (
                <></> // focus falls from the input if suffix value changes from positive to null
              )
            }
          />
        </Form.Item>
      </FormGroup>

      {state['jurSubject.notFound'] && (
        <Alert
          message="По введенному ИНН компания не найдена. Введите реквизиты вручную"
          className="mb-15"
        />
      )}

      <FormGroup
        className={classNames({
          'is-disabled': !state['jurSubject.formEnabled'],
          hidden:
            (!isManager(auth?.currentRole) && !state['jurSubject.notFound']) ||
            (isManager(auth?.currentRole) && !state['jurSubject.formEnabled']),
        })}
      >
        <Form.Item name="jurSubject.entityType">
          <Select
            onChange={(value: number) =>
              setState({ ...state, 'jurSubject.entityType': value })
            }
            disabled={!state['jurSubject.formEnabled'] || !editable}
            className="bg-light-gray"
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

      {state['jurSubject.formEnabled'] && (
        <div className="row row--content">
          <div className="col col--content">
            <FormGroup title="Наименование организации">
              <Form.Item
                name="jurSubject.name"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: locale.validations.required,
                  },
                ]}
              >
                <Input readOnly={!editable || isRegistered} />
              </Form.Item>
            </FormGroup>

            <AddressInputGroup
              title="Юридический адрес"
              prefix="jurSubject.juristicAddress."
              form={form}
              editable={editable && !isRegistered}
            />

            {state['jurSubject.entityType'] !== 'ИП' && (
              <FormGroup title="КПП">
                <Form.Item
                  name="jurSubject.kpp"
                  rules={[{ validator: validateMaskedInput }]}
                >
                  <MaskedInput
                    format="kpp"
                    readOnly={!editable || isRegistered}
                  />
                </Form.Item>
              </FormGroup>
            )}

            {state['jurSubject.entityType'] === 'ИП' ? (
              <FormGroup title="ОГРНИП">
                <Form.Item
                  name="jurSubject.ogrn"
                  rules={[{ validator: validateMaskedInput }]}
                >
                  <MaskedInput
                    format="ogrnip"
                    readOnly={!editable || isRegistered}
                  />
                </Form.Item>
              </FormGroup>
            ) : (
              <FormGroup title="ОГРН">
                <Form.Item
                  name="jurSubject.ogrn"
                  rules={[{ validator: validateMaskedInput }]}
                >
                  <MaskedInput
                    format="ogrn"
                    readOnly={!editable || isRegistered}
                  />
                </Form.Item>
              </FormGroup>
            )}

            <FormGroup title="E-mail организации (не обязательно)">
              <Form.Item name="jurSubject.email" rules={[{ required: false }]}>
                <Input readOnly={!editable || isRegistered} />
              </Form.Item>
            </FormGroup>

            <FormGroup title="Банковские реквизиты">
              <Form.Item
                name="jurSubject.bankName"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: locale.validations.required,
                  },
                ]}
              >
                <Input
                  placeholder="Наименование банка"
                  readOnly={!editable || isRegistered}
                />
              </Form.Item>
              <Form.Item
                name="jurSubject.bankBik"
                rules={[{ validator: validateMaskedInput }]}
              >
                <MaskedInput
                  placeholder="БИК банка"
                  format="bik"
                  readOnly={!editable || isRegistered}
                />
              </Form.Item>
              <Form.Item
                name="jurSubject.bankKs"
                rules={[{ validator: validateMaskedInput }]}
              >
                <MaskedInput
                  placeholder="К/с банка"
                  format="ks"
                  readOnly={!editable || isRegistered}
                />
              </Form.Item>
              <Form.Item
                name="jurSubject.bankRs"
                rules={[{ validator: validateMaskedInput }]}
              >
                <MaskedInput
                  placeholder="Р/с банка"
                  format="rs"
                  readOnly={!editable || isRegistered}
                />
              </Form.Item>
            </FormGroup>
          </div>

          <div className="col col--content">
            <AddressInputGroup
              title="Почтовый адрес"
              prefix="jurSubject.mailingAddress."
              form={form}
              editable={editable && !isRegistered}
            />

            <FormGroup title="Компания работает">
              <Form.Item
                name="jurSubject.hasNds"
                rules={[{ validator: validateRadio }]}
              >
                <Radio.Group
                  className="d-flex"
                  disabled={!editable || isRegistered}
                >
                  <Radio value={true}>с НДС</Radio>
                  <Radio value={false}>без НДС</Radio>
                </Radio.Group>
              </Form.Item>
            </FormGroup>

            <div className="mt-15 mb-15" style={{ width: '260px' }}>
              {RULES_AND_AGREEMENTS.map((item, i) => (
                <Fragment key={i}>
                  {rulesAndAgreementsRequired ? (
                    <Form.Item
                      name={item.label}
                      rules={[{ validator: validateCheckbox }]}
                      valuePropName="checked"
                      className="mt-10"
                    >
                      <Checkbox
                        disabled={!editable}
                        defaultChecked={isRegistered}
                      >
                        {locale.other[item.label]}
                      </Checkbox>
                    </Form.Item>
                  ) : (
                    <span className="block">{locale.other[item.label]}</span>
                  )}

                  <div className="d-flex ml-25">
                    <div
                      className="register-form__file-item__view color-primary"
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDoc({
                          label: item.label,
                          name: item.name,
                          path: item.url,
                          type: 'check',
                          file: null,
                          localFile: null,
                        });
                        openModal('document');
                      }}
                    >
                      <EyeOutlined style={{ fontSize: 18 }} />
                    </div>
                    <div
                      className="register-form__file-item__download color-primary ml-5"
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        const newDoc = {
                          label: item.label,
                          name: item.name,
                          path: item.url,
                          type: 'check',
                          file: null,
                          localFile: null,
                        };
                        downloadFileByPath(newDoc.path, newDoc.name + '.pdf');
                      }}
                    >
                      <DownloadOutlined style={{ fontSize: 18 }} />
                    </div>
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      )}
      {!!doc && <Modal doc={doc} />}
    </>
  );
};

export default JuristicSubjectFormFragment;
