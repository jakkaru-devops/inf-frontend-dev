import { Button } from 'antd';
import { InputNumber } from 'components/common';
import { IModalPropsBasic } from 'components/common/Modal/interfaces';
import { API_ENDPOINTS_V2 } from 'data/api.data';
import { FC, Fragment, useState } from 'react';
import { IPostponedPayment } from 'sections/Orders/interfaces';
import { APIRequest } from 'utils/api.utils';
import { openNotification } from 'utils/common.utils';

interface IProps extends IModalPropsBasic {
  postponedPayment: IPostponedPayment;
  onSubmit: (postponedPayment: IPostponedPayment) => void;
}

const PostponedPaymentModalCustomerContent: FC<IProps> = ({
  postponedPayment,
  onSubmit,
  onClose,
}) => {
  const [daysRequested, setDaysRequested] = useState(
    postponedPayment.status === 'PENDING'
      ? postponedPayment.daysRequested
      : postponedPayment?.daysApproved || postponedPayment.daysRequested,
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (typeof daysRequested !== 'number') {
      openNotification('Необходимо указать срок отсрочки');
      return;
    }

    setSubmitting(true);
    const res = await APIRequest({
      method: 'patch',
      url: API_ENDPOINTS_V2.postponedPayments.updateDaysRequested(
        postponedPayment.id,
      ),
      data: {
        daysRequested,
      },
    });
    setSubmitting(false);

    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }

    onSubmit(res.data);
  };

  return (
    <Fragment>
      <div className="postponed-payment-modal__title">Отсрочка платежей</div>
      <div className="postponed-payment-modal__organization mb-20">
        {postponedPayment.organization.name}
        <br />
        {postponedPayment.organization.inn}
      </div>

      <div className="d-flex align-items-center mb-15">
        <span className="postponed-payment-modal__pre-input">Отсрочка:</span>
        <div className="d-flex ml-10">
          <InputNumber
            value={daysRequested}
            onChange={value => setDaysRequested(value)}
            precision={0}
            min={0}
            size="small"
          />
          <span className="ml-5">дней</span>
        </div>
      </div>

      <p className="mb-10">
        Вы можете запросить любой срок отсрочки платежа, после чего продавец
        рассмотрит возможность предоставить отсрочку.
      </p>
      <p className="mb-10">
        По результатам рассмотрения Вы получите уведомление.
      </p>
      <p className="mb-10">
        Согласованный срок отсрочки действует для всех сделок с данным
        продавцом.
      </p>
      <p className="mb-10">
        Если установить максимальное значение чека для отсрочки платежа равным
        0, это будет означать отсутствие ограничения.
      </p>

      {postponedPayment.status === 'PENDING' && (
        <div className="color-primary">
          <p className="mb-10">
            Вы уже запросили отсрочку платежа, она находится в процессе
            рассмотрения продавцом.
          </p>
          <p>
            Вы можете изменить условия или отменить запрос. Для отмены запроса
            установить значение отсрочки равное 0 дней и нажмите кнопку
            “Сохранить”
          </p>
        </div>
      )}
      {postponedPayment.status === 'APPROVED' && (
        <p className="mb-10 color-primary">
          Вам уже согласована отсрочка платежа. Вы можете изменить условия после
          чего будет направлен запрос на согласование с продавцом.
        </p>
      )}

      <div className="d-flex justify-content-end mt-20">
        {!postponedPayment.isClosed && (
          <Button className="gray" onClick={handleSubmit} loading={submitting}>
            Сохранить
          </Button>
        )}
        <Button className="gray ml-10" onClick={() => onClose()}>
          Закрыть
        </Button>
      </div>
    </Fragment>
  );
};

export default PostponedPaymentModalCustomerContent;
