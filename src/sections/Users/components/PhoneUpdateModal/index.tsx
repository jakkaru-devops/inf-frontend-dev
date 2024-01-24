import { Button, Form, Input, Modal } from 'antd';
import { Container, FormGroup } from 'components/common';
import { API_ENDPOINTS } from 'data/paths.data';
import { useLocale } from 'hooks/locale.hook';
import {
  ChangeEvent,
  createRef,
  FC,
  LegacyRef,
  useEffect,
  useState,
} from 'react';
import InputMask, { ReactInputMask } from 'react-input-mask';
import { APIRequest } from 'utils/api.utils';
import { openNotification, secondsToHms } from 'utils/common.utils';
import { IUser } from 'sections/Users/interfaces';

interface IProps {
  phone: string;
  open: boolean;
  onCancel: () => void;
  onSuccess: (phone: string) => void;
}

const PhoneUpdateModal: FC<IProps> = ({
  phone: phoneInit,
  open,
  onCancel,
  onSuccess,
}) => {
  const { locale } = useLocale();
  const [form] = Form.useForm();

  const [timer, setTimer] = useState<number | null>(null);
  const [state, setState] = useState({
    phone: phoneInit,
    confirmCode: '',
    isConfirmCodeGotten: false,
  });
  const phoneInputRef: LegacyRef<any> = createRef();
  const confirmCodeInputRef: LegacyRef<any> = createRef();
  const inputsUntyped: any[] = [
    () => (inputProps: ReactInputMask) =>
      (
        <Input
          {...inputProps}
          disabled={state.isConfirmCodeGotten}
          ref={phoneInputRef}
        />
      ),
    () => (inputProps: ReactInputMask) =>
      (
        <Input
          {...inputProps}
          disabled={!state.isConfirmCodeGotten}
          ref={confirmCodeInputRef}
        />
      ),
  ];

  useEffect(() => {
    if (!state.isConfirmCodeGotten) {
      if (phoneInputRef.current) {
        phoneInputRef.current.input.focus();
      }
    } else {
      if (confirmCodeInputRef.current) {
        confirmCodeInputRef.current.input.focus();
      }
    }
  }, [state.isConfirmCodeGotten]);

  useEffect(() => {
    const interval = setInterval(() => {
      timer > 0 && setTimer(timer - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };

  const getCode = async () => {
    setSubmitting(true);

    const res = await APIRequest({
      method: 'patch',
      url: API_ENDPOINTS.CHANGE_PHONE,
      data: { phone: state.phone },
      requireAuth: true,
    });

    setSubmitting(false);

    if (!res.isSucceed) {
      openNotification(res.message);
      return;
    }

    if (res.data?.success) {
      setTimer(60 + 30);
      return setState({ ...state, isConfirmCodeGotten: true });
    }
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);

    const res = await APIRequest({
      method: 'patch',
      url: API_ENDPOINTS.CHANGE_PHONE,
      data: { phone: state.phone, confirmCode: state.confirmCode },
      requireAuth: true,
    });

    setSubmitting(false);

    if (!res.isSucceed) {
      openNotification(res.message);
      return;
    }
    const userData: IUser = res.data.user;

    setState(prev => ({
      ...prev,
      confirmCode: '',
      isConfirmCodeGotten: false,
    }));
    form.setFieldsValue({
      confirmCode: '',
    });
    setTimer(null);
    onSuccess(userData.phone);
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title="Изменить номер телефона"
      footer={<></>}
      className="footer-hidden"
      centered
    >
      <Container size="extraSmall">
        <Form
          form={form}
          initialValues={state}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <FormGroup>
            <Form.Item
              name="phone"
              label={locale.common.phone}
              className="mb-20"
            >
              <InputMask
                mask="+7(999) 999-99-99"
                placeholder="+7(___) ___-__-__"
                name="phone"
                value={state.phone}
                onChange={handleInputChange}
                disabled={state.isConfirmCodeGotten}
              >
                {inputsUntyped[0]()}
              </InputMask>
            </Form.Item>
          </FormGroup>

          {timer > 0 ? (
            <span className="ant-statistic-title text-center block mb-10">
              На ваш номер отправлен СМС код <br />
              Новый код можно запросить через {secondsToHms(timer)}
            </span>
          ) : (
            <Button
              type="primary"
              block
              className="mb-15"
              onClick={getCode}
              loading={submitting}
              disabled={state.phone === phoneInit}
            >
              {!state.isConfirmCodeGotten
                ? locale.user.getCode
                : locale.user.getCodeAgain}
            </Button>
          )}

          <Form.Item name="confirmCode" label={locale.user.smsCode}>
            <InputMask
              mask="999999"
              name="confirmCode"
              value={state.confirmCode}
              onChange={handleInputChange}
              disabled={!state.isConfirmCodeGotten}
            >
              {inputsUntyped[1]()}
            </InputMask>
          </Form.Item>

          {state.isConfirmCodeGotten &&
            state.confirmCode.replace(/_/g, '').length > 5 && (
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={submitting}
                disabled={state.phone === phoneInit}
                className="mb-15"
              >
                {locale.user.confirm}
              </Button>
            )}
        </Form>
      </Container>
    </Modal>
  );
};

export default PhoneUpdateModal;
