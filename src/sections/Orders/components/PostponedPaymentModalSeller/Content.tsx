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

const PostponedPaymentModalSellerContent: FC<IProps> = ({
  postponedPayment,
  onSubmit,
  onClose,
}) => {
  const [daysApproved, setDaysApproved] = useState(
    postponedPayment.status === 'PENDING'
      ? postponedPayment.daysRequested
      : postponedPayment?.daysApproved || postponedPayment.daysRequested,
  );
  const [maxSum, setMaxSum] = useState(postponedPayment?.maxSum);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (typeof daysApproved !== 'number') {
      openNotification('Необходимо указать срок отсрочки');
      return;
    }

    setSubmitting(true);
    const res = await APIRequest({
      method: 'put',
      url: API_ENDPOINTS_V2.postponedPayments.update(postponedPayment.id),
      data: {
        daysApproved,
        maxSum,
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
        {postponedPayment.customerOrganization.name}
        <br />
        {postponedPayment.customerOrganization.inn}
      </div>

      <div className="d-flex align-items-center mb-15">
        <span className="postponed-payment-modal__pre-input">Отсрочка:</span>
        <div className="d-flex ml-10">
          <InputNumber
            value={daysApproved}
            onChange={value => setDaysApproved(value)}
            precision={0}
            min={0}
            size="small"
          />
          <span className="ml-5">дней</span>
        </div>
      </div>

      <p className="mb-10">
        Если Вы не согласовываете отсрочку или хотите удалить уже согласованную,
        можете установить значение 0 дней.
      </p>
      <p className="mb-15">
        Обратите внимание, что данный срок отсрочки распространяется на все
        запросы или заказы для данной организации, сумма которых не превышает
        значение максимальной суммы.
      </p>

      <div className="d-flex align-items-center mb-15">
        <span className="postponed-payment-modal__pre-input">
          Макс. сумма чека:
        </span>
        <div className="d-flex ml-10">
          <InputNumber
            value={maxSum}
            onChange={value => setMaxSum(value)}
            precision={0}
            min={0}
            size="small"
          />
          <span className="ml-5">руб.</span>
        </div>
      </div>

      <p className="mb-10">
        Если установить максимальное значение чека для отсрочки платежа равным
        0, это будет означать отсутствие ограничения.
      </p>

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

export default PostponedPaymentModalSellerContent;
