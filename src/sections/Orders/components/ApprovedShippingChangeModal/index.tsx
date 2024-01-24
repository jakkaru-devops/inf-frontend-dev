import { Button, Modal } from 'antd';
import { IOrder, IOrderRequest } from '../../interfaces';
import { FC, useState } from 'react';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import { Container } from 'components/common';
import { ISetState } from 'interfaces/common.interfaces';
import { useRouter } from 'next/router';
import ReasonRejectShippingConditionModal from '../ReasonRejectShippingConditionModal';

interface IProps {
  open: boolean;
  onCancel: () => void;
  setOrder: ISetState<IOrderRequest>;
  currentOffer: IOrder;
  order: IOrderRequest;
}

const ApprovedShippingChangeModal: FC<IProps> = ({
  open,
  onCancel,
  setOrder,
  currentOffer,
  order,
}) => {
  const router = useRouter();
  const [reasonRejectShippingCondition, setReasonRejectShippingCondition] =
    useState<boolean>(false);

  const handleTransportCompanyChange = async (
    offerId: string,
    approved: boolean,
  ) => {
    const res = await APIRequest({
      method: 'patch',
      url: `${API_ENDPOINTS.APPROVED_TO_CHANGE_SHIPPING_CONDITION}/${offerId}`,
      // params: { id: offerId },
      data: { approved },
      requireAuth: true,
    });

    if (!res.isSucceed) return;
    const orderRes = await APIRequest({
      method: 'get',
      url: API_ENDPOINTS.ORDER_REQUEST,
      params: {
        id: router.query.orderId,
      },
      requireAuth: true,
    });
    if (!res.isSucceed) return;
    setOrder(orderRes.data);
  };

  const onClickModalHandler = (offerId: string, approved: boolean) => {
    onCancel();
    handleTransportCompanyChange(offerId, approved);
  };

  const onReasonModalHandler = () => {
    onCancel();
    setReasonRejectShippingCondition(false);
  };
  console.log(currentOffer);

  return (
    <>
      <ReasonRejectShippingConditionModal
        open={reasonRejectShippingCondition}
        setOrder={setOrder}
        onCancel={() => onReasonModalHandler()}
        currentOffer={currentOffer}
      />
      <Modal
        open={open}
        onCancel={onCancel}
        centered={true}
        footer={null}
        className="close-icon-hidden header-hidden header-border-hidden footer-hidden"
        width={550}
        maskClosable={false}
        bodyStyle={{ paddingTop: 0 }}
      >
        <Container size="middle" style={{ padding: '20px 30px 0' }}>
          <h3
            style={{
              fontSize: 30,
              fontWeight: 700,
              textAlign: 'center',
            }}
          >
            Изменены условия доставки
          </h3>
          <p
            style={{
              textAlign: 'center',
              fontSize: 17,
              maxWidth: 400,
              margin: '0 auto 30px auto',
            }}
          >
            Покупатель изменил условия доставки с{' '}
            {currentOffer.transportCompany?.name || '"Самовывоз"'} на{' '}
            {currentOffer.notConfirmedTransportCompany?.name || '"Самовывоз"'}
          </p>
          <div
            className="w-100 mb-10"
            style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}
          >
            <Button
              type="primary"
              onClick={() => {
                onClickModalHandler(currentOffer.id, true);
              }}
              style={{ minWidth: 150 }}
            >
              Принять
            </Button>
            <Button
              type="primary"
              onClick={() => {
                setReasonRejectShippingCondition(true);
              }}
              style={{ minWidth: 150 }}
            >
              Отклонить
            </Button>
          </div>
        </Container>
      </Modal>
    </>
  );
};

export default ApprovedShippingChangeModal;
