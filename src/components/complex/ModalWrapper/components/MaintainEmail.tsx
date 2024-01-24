import { ChangeEvent, FC, useState } from 'react';
import { Form, Input, Button } from 'antd';
import { Container, FormGroup } from 'components/common';
import { validateEmail } from 'utils/forms.utils';
import { RuleObject } from 'antd/lib/form';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import { useLocale } from 'hooks/locale.hook';
import { useAuth } from 'hooks/auth.hook';

export const MaintainEmail: FC<{
  btnText: string;
  closeModal: () => void;
}> = ({ btnText, closeModal }) => {
  const auth = useAuth();
  const { locale } = useLocale();
  const [email, setEmail] = useState(auth.user.email);

  const handleSubmit = async () => {
    const res = await APIRequest<any>({
      method: 'put',
      url: API_ENDPOINTS.USER,
      requireAuth: true,
      data: { user: { id: auth.user.id, email } },
    });

    if (!res.isSucceed) return;

    closeModal();

    window.location.reload();
  };

  const validateEmailInput = (rule: RuleObject, value: string) => {
    return new Promise<void>((resolve, reject) => {
      const result = validateEmail(value);
      if (!result) {
        reject(locale.validations.incorrectEmail);
      } else {
        resolve();
      }
    });
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  return (
    <Container size="extraSmall">
      <Form initialValues={{ email }} layout="vertical" onFinish={handleSubmit}>
        <FormGroup>
          <Form.Item
            name="email"
            label={locale.common.email}
            className="mb-20"
            rules={[{ validator: validateEmailInput }]}
          >
            <Input onChange={handleInputChange} />
          </Form.Item>
        </FormGroup>

        <Button
          type="primary"
          htmlType="submit"
          block
          className="mb-15"
          disabled={auth.user.email === email}
        >
          {btnText}
        </Button>
      </Form>
    </Container>
  );
};
