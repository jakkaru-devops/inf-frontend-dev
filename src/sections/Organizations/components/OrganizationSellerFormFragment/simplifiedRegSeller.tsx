import { Checkbox, Form, Input } from 'antd';
import classNames from 'classnames';
import { FormGroup, MaskedInput } from 'components/common';
import { useFormValidation } from 'hooks/formValidation.hooks';
import { useLocale } from 'hooks/locale.hook';
import { useModalsState } from 'hooks/modal.hook';
import { IRegisterFileExtended } from 'sections/Auth/interfaces';
import { EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import { downloadFileByPath } from 'utils/files.utils';
import { FC, Fragment } from 'react';
import { useAuth } from 'hooks/auth.hook';

interface IProps {
  state: any;
  comparedData?: any;
  phoneDisabled?: boolean;
  disabled?: boolean;
  fileList: IRegisterFileExtended[];
  uploadAllFiles?: boolean;
  advanced?: boolean;
}

const SimplifiedRegSeller: FC<IProps> = ({
  state,
  comparedData,
  phoneDisabled = true,
  disabled,
  fileList,
  uploadAllFiles,
  advanced,
}) => {
  const { locale } = useLocale();
  const { validateMaskedInput, validateEmailInput, validateCheckbox } =
    useFormValidation();
  const auth = useAuth();

  //openFile
  const { Modal, openModal } = useModalsState(6);
  const handleOpenModal = (index: number) => {
    openModal('document', index);
  };

  return (
    <div className="row row--content justify-content-center">
      <div className="col col--content" style={{ width: '100%' }}>
        <FormGroup title="ФИО">
          <Form.Item
            name="user.lastname"
            rules={[
              {
                required: true,
                whitespace: true,
                message: locale.validations.required,
              },
            ]}
          >
            <Input
              placeholder="Фамилия"
              disabled={disabled}
              className={classNames({
                highlighted:
                  !!comparedData &&
                  state['user.lastname'] !== comparedData['user.lastname'],
              })}
            />
          </Form.Item>
          <Form.Item
            name="user.firstname"
            rules={[
              {
                required: true,
                whitespace: true,
                message: locale.validations.required,
              },
            ]}
          >
            <Input
              placeholder="Имя"
              disabled={disabled}
              className={classNames({
                highlighted:
                  !!comparedData &&
                  state['user.firstname'] !== comparedData['user.firstname'],
              })}
            />
          </Form.Item>
          <Form.Item name="user.middlename">
            <Input
              placeholder="Отчество"
              disabled={disabled}
              className={classNames({
                highlighted:
                  !!comparedData &&
                  state['user.middlename'] !== comparedData['user.middlename'],
              })}
            />
          </Form.Item>
        </FormGroup>

        <FormGroup title="Телефон">
          <Form.Item
            name="user.phone"
            rules={[{ validator: validateMaskedInput }]}
          >
            <MaskedInput
              placeholder="+7(___) ___-__-__"
              format="phoneNumber"
              disabled={phoneDisabled}
              className={classNames({
                highlighted:
                  !!comparedData &&
                  state['user.phone'] !== comparedData['user.phone'],
              })}
            />
          </Form.Item>
        </FormGroup>

        <FormGroup title="E-mail">
          <Form.Item
            name="user.email"
            rules={[{ validator: validateEmailInput }]}
          >
            <Input
              disabled={disabled}
              className={classNames({
                highlighted:
                  !!comparedData &&
                  state['user.email'] !== comparedData['user.email'],
              })}
            />
          </Form.Item>
        </FormGroup>

        <Fragment>
          <Form.Item
            name="user.isAgreeEmailNotification"
            // rules={[{ validator: validateCheckbox }]}
            valuePropName="checked"
          >
            <Checkbox
              disabled={disabled}
              defaultChecked={state['user.isAgreeEmailNotification']}
              className={classNames({
                highlighted:
                  !!comparedData &&
                  state['user.isAgreeEmailNotification'] !==
                    comparedData['user.isAgreeEmailNotification'],
              })}
            >
              <div
                className="register-form__file-item__wrapper"
                style={{ marginBottom: 2 }}
              >
                <span>Получать уведомления на почту</span>
              </div>
            </Checkbox>
          </Form.Item>
        </Fragment>

        <FormGroup title="E-mail для уведомлений">
          <Form.Item name="user.emailNotification">
            <Input
              disabled={disabled}
              className={classNames({
                highlighted:
                  !!comparedData &&
                  state['user.emailNotification'] !==
                    comparedData['user.emailNotification'],
              })}
            />
          </Form.Item>
        </FormGroup>
        {fileList?.map((file, i) => {
          return (
            <Fragment key={i}>
              {file.type === 'check' && !uploadAllFiles && (
                <li
                  key={i}
                  className={classNames('register-form__file-item', {
                    'is-uploaded': true,
                  })}
                  style={{
                    marginTop: 7,
                  }}
                >
                  <Form.Item
                    name={file.label}
                    rules={[{ validator: validateCheckbox }]}
                    valuePropName="checked"
                  >
                    <Checkbox
                      defaultChecked={file?.checked}
                      disabled={file?.disabled}
                    >
                      <div
                        className="register-form__file-item__wrapper"
                        style={{ marginBottom: 2 }}
                      >
                        <span className="register-form__file-item__name">
                          {file.name}
                        </span>
                      </div>
                    </Checkbox>
                  </Form.Item>

                  {auth?.currentRole?.label === 'seller' && (
                    <div className="register-form__file-item__icon-group">
                      <div
                        className="register-form__file-item__view"
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleOpenModal(i);
                        }}
                      >
                        <EyeOutlined />
                      </div>
                      <div
                        className="register-form__file-item__download"
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          downloadFileByPath(file.path, file.name + '.pdf');
                        }}
                      >
                        <DownloadOutlined />
                      </div>
                    </div>
                  )}
                </li>
              )}
              <Modal doc={fileList[4]} index={4} />
              <Modal doc={fileList[5]} index={5} />
            </Fragment>
          );
        })}

        {auth?.currentRole?.label === 'seller' && !advanced && (
          <div
            style={{
              lineHeight: 1.1,
              marginTop: 20,
              fontWeight: 700,
              color: '#525252',
            }}
          >
            Документы:
            <br />
            Паспорт, прописка, ИНН, СНИЛС необходимо отправить на
            info@inf.market
          </div>
        )}
      </div>
    </div>
  );
};

export default SimplifiedRegSeller;
