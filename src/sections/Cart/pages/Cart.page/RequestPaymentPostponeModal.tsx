import { Button, Select } from 'antd';
import { InputNumber, Modal } from 'components/common';
import { IModalPropsBasic } from 'components/common/Modal/interfaces';
import { API_ENDPOINTS_V2 } from 'data/api.data';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';
import { APP_PATHS } from 'data/paths.data';
import Link from 'next/link';
import { FC, useState } from 'react';
import { ICartOffer } from 'sections/Cart/interfaces/cart.interfaces';
import { IJuristicSubject } from 'sections/JuristicSubject/interfaces';
import { IPostponedPayment } from 'sections/Orders/interfaces';
import { APIRequest } from 'utils/api.utils';
import { generateUrl, openNotification } from 'utils/common.utils';

interface IProps extends IModalPropsBasic {
  offer: ICartOffer;
  customerOrganizations: IJuristicSubject[];
  onSubmit: (postponedPayment: IPostponedPayment) => void;
}

const RequestPaymentPostponeModal: FC<IProps> = ({
  offer,
  customerOrganizations,
  onSubmit,
  ...modalProps
}) => {
  const [customerOrganizationId, setCustomerOrganizationId] = useState<
    IJuristicSubject['id']
  >(customerOrganizations.length === 1 ? customerOrganizations[0].id : null);
  const [daysRequested, setDaysRequested] = useState<number>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!daysRequested) {
      openNotification('Необходимо указать срок отсрочки');
      return;
    }

    setSubmitting(true);
    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS_V2.postponedPayments.create,
      data: {
        customerOrganizationId,
        warehouseId: offer.warehouse.id,
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
    <Modal
      {...modalProps}
      centered
      destroyOnClose
      className="postponed-payment-modal"
    >
      <div className="postponed-payment-modal__title">Отсрочка платежей</div>
      <div className="postponed-payment-modal__organization mb-20">
        {offer.organization.name}
        <br />
        {offer.organization.inn}
      </div>

      {customerOrganizations.length !== 1 && (
          <div className="d-flex align-items-center mb-15">
          <span className="mr-10">Выберите организацию:</span>

          {!!customerOrganizations?.length ? (
            <Select
              value={customerOrganizationId}
              onChange={value => setCustomerOrganizationId(value)}
              style={{ minWidth: 200 }}
              size="small"
            >
              {customerOrganizations.map(org => (
                <Select.Option key={org.id} value={org.id}>
                  {org.name} {org.inn}
                </Select.Option>
              ))}
            </Select>
          ) : (
            <Link
              href={generateUrl(
                {
                  history: DEFAULT_NAV_PATHS.USER_SETTINGS,
                  tab: 'organizations',
                  organizationId: 'add',
                },
                { pathname: APP_PATHS.USER_SETTINGS_ORGANIZATIONS },
              )}
              className="text-underline"
            >
              Необходимо добавить организацию
            </Link>
          )}
        </div>
      )}

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
      <p>
        Если установить максимальное значение чека для отсрочки платежа равным
        0, это будет означать отсутствие ограничения.
      </p>

      <div className="d-flex justify-content-end mt-15">
        <Button className="gray" onClick={handleSubmit} loading={submitting}>
          Сохранить
        </Button>
        <Button className="gray ml-10" onClick={() => modalProps.onClose()}>
          Закрыть
        </Button>
      </div>
    </Modal>
  );
};

export default RequestPaymentPostponeModal;
