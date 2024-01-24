import { Button } from 'antd';
import { Container } from 'components/common';
import { FC } from 'react';

export const AlertMessage: FC<{
  message: string;
  closeModal: () => void;
}> = ({ message, closeModal }) => (
  <Container size="small" className="text-center">
    <h2 className="text_38">{message}</h2>

    <Button
      type="primary"
      className="mt-40"
      style={{ margin: 'auto' }}
      onClick={closeModal}
    >
      Ок
    </Button>
  </Container>
);
