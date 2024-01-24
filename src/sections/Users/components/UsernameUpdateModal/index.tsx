import { Button, Form, Input, Modal } from 'antd';
import { Container, FormGroup } from 'components/common';
import { API_ENDPOINTS } from 'data/paths.data';
import { useLocale } from 'hooks/locale.hook';
import { FC, useState } from 'react';
import { IUser, IUsername } from 'sections/Users/interfaces';
import { APIRequest } from 'utils/api.utils';
import { openNotification } from 'utils/common.utils';

interface IProps {
  username: IUsername;
  open: boolean;
  onCancel: () => void;
  onSuccess: (username: IUsername) => void;
}

const UsernameUpdateModal: FC<IProps> = ({
  username: usernameInit,
  open,
  onCancel,
  onSuccess,
}) => {
  const { locale } = useLocale();

  const [username, setUsername] = useState(usernameInit);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);

    const res = await APIRequest({
      method: 'patch',
      url: API_ENDPOINTS.CHANGE_USERNAME,
      data: { user: { ...username } },
      requireAuth: true,
    });

    setSubmitting(false);

    if (!res.isSucceed) {
      openNotification(res.message);
      return;
    }
    const userData: IUser = res.data.user;

    onSuccess({
      lastname: userData?.lastname,
      firstname: userData?.firstname,
      middlename: userData?.middlename,
    });
  };

  const handleInputChange = (name: string, value: string) => {
    setUsername({
      ...username,
      [name]: value,
    });
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title="Изменить ФИО"
      footer={<></>}
      className="footer-hidden"
      centered
    >
      <Container size="extraSmall">
        <Form
          initialValues={{ ...username }}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <FormGroup>
            <Form.Item
              name="lastname"
              label="Фамилия"
              className="mb-10"
              rules={[{ required: true, message: locale.validations.required }]}
              colon={false}
            >
              <Input
                onChange={e => handleInputChange('lastname', e.target.value)}
              />
            </Form.Item>
            <Form.Item
              name="firstname"
              label="Имя"
              className="mb-10"
              rules={[{ required: true, message: locale.validations.required }]}
              colon={false}
            >
              <Input
                onChange={e => handleInputChange('firstname', e.target.value)}
              />
            </Form.Item>
            <Form.Item
              name="middlename"
              label="Отчество"
              className="mb-20"
              colon={false}
            >
              <Input
                onChange={e => handleInputChange('middlename', e.target.value)}
              />
            </Form.Item>
          </FormGroup>

          <Button
            type="primary"
            htmlType="submit"
            block
            disabled={
              username.lastname === usernameInit.lastname &&
              username.firstname === usernameInit.firstname &&
              username.middlename === usernameInit.middlename
            }
            loading={submitting}
          >
            Сохранить
          </Button>
        </Form>
      </Container>
    </Modal>
  );
};

export default UsernameUpdateModal;
