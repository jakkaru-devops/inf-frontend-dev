import { Button, Form, Input, Modal } from 'antd';
import { Container, FormGroup } from 'components/common';
import { API_ENDPOINTS } from 'data/paths.data';
import { useFormValidation } from 'hooks/formValidation.hooks';
import { useLocale } from 'hooks/locale.hook';
import { ChangeEvent, FC, useState } from 'react';
import { IUser } from 'sections/Users/interfaces';
import { APIRequest } from 'utils/api.utils';
import { openNotification } from 'utils/common.utils';

interface IProps {
  email: string;
  open: boolean;
  onCancel: () => void;
  onSuccess: (emailNotification: string) => void;
}

const EmailNotificationUpdateModal: FC<IProps> = ({
  email: emailInit,
  open,
  onCancel,
  onSuccess,
}) => {
  const { locale } = useLocale();
  const { validateEmailInput } = useFormValidation();

  const [email, setEmail] = useState(emailInit);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    const res = await APIRequest({
      method: 'patch',
      url: API_ENDPOINTS.UPDATE_EMAIL_NOTIFICATION,
      data: { emailNotification: email },
      requireAuth: true,
    });
    setSubmitting(false);
    if (!res.isSucceed) {
      openNotification(res.message);
      return;
    }
    const userData: IUser = res.data.user;
    console.log(userData.emailNotification);
    onSuccess(userData.emailNotification);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title="Изменить e-mail для уведомлений"
      footer={<></>}
      className="footer-hidden"
      centered
    >
      <Container size="extraSmall">
        <Form
          initialValues={{ email }}
          layout="vertical"
          onFinish={handleSubmit}
        >
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
            disabled={email === emailInit}
            loading={submitting}
          >
            Сохранить
          </Button>
        </Form>
      </Container>
    </Modal>
  );
};

export default EmailNotificationUpdateModal;
