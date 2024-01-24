import {
  ChangeEvent,
  createRef,
  FC,
  LegacyRef,
  useEffect,
  useState,
} from 'react';
import { Form, Input, Button } from 'antd';
import InputMask, { ReactInputMask } from 'react-input-mask';
import { Container, FormGroup } from 'components/common';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import { useLocale } from 'hooks/locale.hook';
import { secondsToHms } from 'utils/common.utils';
import { useAuth } from 'hooks/auth.hook';

export const EditPhone: FC<{ closeModal: () => void }> = ({ closeModal }) => {
  const auth = useAuth();
  const { locale } = useLocale();

  const [timer, setTimer] = useState<number | null>(null);
  const [state, setState] = useState({
    phone: auth.user.phone,
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
    const { data, isSucceed } = await APIRequest<{ success: boolean }>({
      method: 'post',
      url: API_ENDPOINTS.CHANGE_PHONE,
      requireAuth: true,
      data: { phone: state.phone },
    });

    if (!isSucceed) return;

    if (data?.success) {
      setTimer(60 + 30);
      return setState({ ...state, isConfirmCodeGotten: true });
    }
  };

  const handleSubmit = async () => {
    const { data, isSucceed } = await APIRequest<{
      payload: { token: string };
    }>({
      method: 'post',
      url: API_ENDPOINTS.CHANGE_PHONE,
      requireAuth: true,
      data: { phone: state.phone, confirmCode: state.confirmCode },
    });

    if (!isSucceed || !data.payload.token) return;

    closeModal();

    window.location.reload();
  };

  return (
    <Container size="extraSmall">
      <Form initialValues={state} layout="vertical" onFinish={handleSubmit}>
        <FormGroup>
          <Form.Item name="phone" label={locale.common.phone} className="mb-20">
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
          <Button type="primary" block className="mb-15" onClick={getCode}>
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
            <Button type="primary" htmlType="submit" block className="mb-15">
              {locale.user.confirm}
            </Button>
          )}
      </Form>
    </Container>
  );
};
