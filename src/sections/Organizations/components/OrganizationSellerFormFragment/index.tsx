import { ChangeEvent, FC, useEffect } from 'react';
import { Form, Input } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { AddressInputGroup, FormGroup, MaskedInput } from 'components/common';
import { useFormValidation } from 'hooks/formValidation.hooks';
import RegisterFileList from 'sections/Auth/components/RegisterFileList';
import { IRegisterFileExtended } from 'sections/Auth/interfaces';
import { useLocale } from 'hooks/locale.hook';
import classNames from 'classnames';
import { IAddress, ISetState } from 'interfaces/common.interfaces';
import { useAuth } from 'hooks/auth.hook';

interface IProps {
  fileList: IRegisterFileExtended[];
  form: FormInstance<any>;
  state: any;
  setState: ISetState<any>;
  comparedData?: any;
  comparedAddress?: IAddress;
  comparedFileList?: IRegisterFileExtended[];
  phoneDisabled?: boolean;
  uploadFile: (
    e: ChangeEvent<HTMLInputElement>,
    type: 'user' | 'org',
    label: string,
  ) => void;
  deleteFile: (type: 'user' | 'org', label: string) => void;
  disabled?: boolean;
}

const OrganizationSellerFormFragment: FC<IProps> = ({
  fileList,
  form,
  state,
  setState,
  comparedData,
  comparedAddress,
  comparedFileList,
  phoneDisabled = true,
  uploadFile,
  deleteFile,
  disabled,
}) => {
  const auth = useAuth();
  const { locale } = useLocale();
  const { validateMaskedInput, validateEmailInput, validateDateInput } =
    useFormValidation();

  useEffect(() => {
    form.setFieldsValue({
      'user.personalDataProcessing': true,
    });
  }, []);

  return (
    <div className="row row--content">
      <div className="col col--content">
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

        <FormGroup title="Паспорт">
          <Form.Item
            name="user.requisites.passportSeries"
            rules={[{ validator: validateMaskedInput }]}
          >
            <MaskedInput
              placeholder="Серия"
              format="passportNumberSeries"
              disabled={disabled}
              className={classNames({
                highlighted:
                  !!comparedData &&
                  state['user.requisites.passportSeries'] !==
                    comparedData['user.requisites.passportSeries'],
              })}
            />
          </Form.Item>
          <Form.Item
            name="user.requisites.passportNumber"
            rules={[{ validator: validateMaskedInput }]}
          >
            <MaskedInput
              placeholder="Номер"
              format="passportNumberNumber"
              disabled={disabled}
              className={classNames({
                highlighted:
                  !!comparedData &&
                  state['user.requisites.passportNumber'] !==
                    comparedData['user.requisites.passportNumber'],
              })}
            />
          </Form.Item>
          <Form.Item
            name="user.requisites.passportGiver"
            rules={[
              {
                required: true,
                whitespace: true,
                message: locale.validations.required,
              },
            ]}
          >
            <Input
              placeholder="Кем выдан"
              disabled={disabled}
              className={classNames({
                highlighted:
                  !!comparedData &&
                  state['user.requisites.passportGiver'] !==
                    comparedData['user.requisites.passportGiver'],
              })}
            />
          </Form.Item>
          <Form.Item
            name="user.requisites.passportGettingDate"
            rules={[{ validator: validateDateInput }]}
          >
            <MaskedInput
              placeholder="Дата выдачи"
              format="date"
              disabled={disabled}
              className={classNames({
                highlighted:
                  !!comparedData &&
                  state['user.requisites.passportGettingDate'] !==
                    comparedData['user.requisites.passportGettingDate'],
              })}
            />
          </Form.Item>
          <Form.Item
            name="user.requisites.passportLocationUnitCode"
            rules={[{ validator: validateMaskedInput }]}
          >
            <MaskedInput
              placeholder="Код под-ия"
              format="passportLocationUnitCode"
              disabled={disabled}
              className={classNames({
                highlighted:
                  !!comparedData &&
                  state['user.requisites.passportLocationUnitCode'] !==
                    comparedData['user.requisites.passportLocationUnitCode'],
              })}
            />
          </Form.Item>
        </FormGroup>

        <FormGroup title="ИНН">
          <Form.Item
            name="user.requisites.inn"
            rules={[{ validator: validateMaskedInput }]}
          >
            <MaskedInput
              format="inn-12"
              disabled={disabled}
              className={classNames({
                highlighted:
                  !!comparedData &&
                  state['user.requisites.inn'] !==
                    comparedData['user.requisites.inn'],
              })}
            />
          </Form.Item>
        </FormGroup>

        <FormGroup title="СНИЛС">
          <Form.Item
            name="user.requisites.snils"
            rules={[{ validator: validateMaskedInput }]}
          >
            <MaskedInput
              format="snils"
              disabled={disabled}
              className={classNames({
                highlighted:
                  !!comparedData &&
                  state['user.requisites.snils'] !==
                    comparedData['user.requisites.snils'],
              })}
            />
          </Form.Item>
        </FormGroup>

        <AddressInputGroup
          title="Адрес прописки"
          prefix="user.address."
          form={form}
          comparedData={comparedAddress}
        />
      </div>
      <div className="col col--content">
        <FormGroup title="Банковские реквизиты">
          <Form.Item
            name="user.requisites.bankName"
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
              disabled={disabled}
              className={classNames({
                highlighted:
                  !!comparedData &&
                  state['user.requisites.bankName'] !==
                    comparedData['user.requisites.bankName'],
              })}
            />
          </Form.Item>
          <Form.Item
            name="user.requisites.bankBik"
            rules={[{ validator: validateMaskedInput }]}
          >
            <MaskedInput
              placeholder="БИК банка"
              format="bik"
              disabled={disabled}
              className={classNames({
                highlighted:
                  !!comparedData &&
                  state['user.requisites.bankBik'] !==
                    comparedData['user.requisites.bankBik'],
              })}
            />
          </Form.Item>
          <Form.Item
            name="user.requisites.bankKs"
            rules={[{ validator: validateMaskedInput }]}
          >
            <MaskedInput
              placeholder="К/с банка"
              format="ks"
              disabled={disabled}
              className={classNames({
                highlighted:
                  !!comparedData &&
                  state['user.requisites.bankKs'] !==
                    comparedData['user.requisites.bankKs'],
              })}
            />
          </Form.Item>
          <Form.Item
            name="user.requisites.bankRs"
            rules={[{ validator: validateMaskedInput }]}
          >
            <MaskedInput
              placeholder="Р/с банка"
              format="rs"
              disabled={disabled}
              className={classNames({
                highlighted:
                  !!comparedData &&
                  state['user.requisites.bankRs'] !==
                    comparedData['user.requisites.bankRs'],
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

        <FormGroup title="Прикрепите скан">
          <RegisterFileList
            fileList={fileList}
            comparedFileList={comparedFileList}
            type="user"
            uploadFile={uploadFile}
            deleteFile={deleteFile}
            icon={auth?.currentRole?.label === 'seller' ? 'upload' : 'download'}
            allowControl={true}
            disabled={disabled}
          />
        </FormGroup>
      </div>
    </div>
  );
};

export default OrganizationSellerFormFragment;
