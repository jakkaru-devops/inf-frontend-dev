import { Button } from 'antd';
import { Container, Modal, TransportCompaniesList } from 'components/common';
import { IModalProps } from 'components/common/Modal/interfaces';
import { ITransportCompaniesListProps } from 'components/common/TransportCompaniesList';
import { FC } from 'react';

interface IProps extends IModalProps {
  companiesProps: ITransportCompaniesListProps;
}

const TransportCompaniesModal: FC<IProps> = ({ companiesProps, ...props }) => {
  return (
    <Modal {...props} width={800} hideHeaderBorder hideCloseIcon>
      <div className="d-flex justify-content-between align-items-center">
        <span style={{ fontSize: 30, fontWeight: 700 }}>
          Выберите транспортную компанию
        </span>
        <Button type="primary" onClick={props.onClose}>
          Сохранить
        </Button>
      </div>
      <p className="mb-30">
        Стоимость и сроки доставки ориентировочные.
        <br />
        Окончательная стоимость услуг будет уточнена по результатам взвешивания
        и обмера груза при приемке на складе.
      </p>
      <TransportCompaniesList {...companiesProps} />
    </Modal>
  );
};

export default TransportCompaniesModal;
