import { Button } from 'antd';
import { Container } from 'components/common';
import { IDBEntity } from 'interfaces/common.interfaces';
import { FC } from 'react';

export const DeleteAgree: FC<{
  id: IDBEntity['id'];
  message: string;
  handleDelete: (id: IDBEntity['id']) => void;
  closeModal: () => void;
}> = ({ id, message, handleDelete, closeModal }) => {
  return (
    <Container size="small" className="text-center">
      <h2 className="text_38">{message}</h2>

      <div className="d-flex mt-40">
        <Button type="primary" className="w-100 mr-5" onClick={closeModal}>
          Отмена
        </Button>
        <Button
          type="primary"
          className="w-100 ml-5"
          onClick={() => handleDelete(id)}
        >
          Удалить
        </Button>
      </div>
    </Container>
  );
};
