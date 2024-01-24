import { Modal } from 'components/common';
import { IModalPropsBasic } from 'components/common/Modal/interfaces';
import { FC } from 'react';

interface IProps extends IModalPropsBasic {
  redirectToExternalCatalog: () => void;
  redirectToCatalog: () => void;
  startEnterManually: () => void;
}

const NewOfferProductModal: FC<IProps> = ({
  redirectToExternalCatalog,
  redirectToCatalog,
  startEnterManually,
  ...modalProps
}) => {
  return (
    <Modal
      {...modalProps}
      centered
      footer={null}
      className="add-product-to-request-modal"
      width={480}
    >
      <h2 className="text-center">Добавить товар</h2>
      <div className="d-flex justify-content-between mb-20">
        <div className="item" onClick={redirectToExternalCatalog}>
          <img src="/img/icons/catalog.svg" alt="" />
          <span>Поиск по каталогам</span>
        </div>
        <div className="item" onClick={redirectToCatalog}>
          <img src="/img/catalog.svg" alt="" />
          <span>Запчасти</span>
        </div>
        <div className="item" onClick={startEnterManually}>
          <div className="square">+</div>
          <span>Ввести вручную</span>
        </div>
      </div>
    </Modal>
  );
};

export default NewOfferProductModal;
