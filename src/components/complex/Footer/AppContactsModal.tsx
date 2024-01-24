import { Modal } from 'antd';
import { useLocale } from 'hooks/locale.hook';
import { FC } from 'react';

interface IProps {
  open: boolean;
  onCancel: () => void;
  width?: number | string;
}

const AppContactsModal: FC<IProps> = ({ open, onCancel, width }) => {
  const { locale } = useLocale();

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      centered
      title={locale.common.contacts}
      footer={null}
      wrapClassName="app-info__modal-wrapper"
      className="app-info__modal"
      width={width || 600}
    >
      <div className="app-info">
        <h2 className="app-info__contact-info-item">ООО «ИНФИНИТУМ»</h2>
        <h2 className="app-info__contact-info-item">
          <strong>{locale.common.phone}:</strong>{' '}
          <a href="tel:+73952717700" className="text-underline color-context">
            8 (3952) 717-700
          </a>
        </h2>
        <h2 className="app-info__contact-info-item">
          <strong>{locale.common.email}:</strong>{' '}
          <a
            href="mailto:info@inf.market"
            className="text-underline color-context"
          >
            info@inf.market
          </a>
        </h2>
        <h2 className="app-info__contact-info-item">
          <strong>Юридический адрес:</strong> 665800, Иркутская область, г.
          Ангарск, нп. Второй промышленный массив, квл. 41, стр. 15, оф. 57
        </h2>
        <h2 className="app-info__contact-info-item">
          <strong>Почтовый адрес:</strong> 664017, г. Иркутск, а/я 53
        </h2>
        <h2 className="app-info__contact-info-item">
          <strong>ИНН:</strong> 3801147025
        </h2>
        <h2 className="app-info__contact-info-item">
          <strong>КПП:</strong> 380101001
        </h2>
        <h2 className="app-info__contact-info-item">
          <strong>ОГРН:</strong> 1183850035973
        </h2>
      </div>
    </Modal>
  );
};

export default AppContactsModal;
