import { Button, Modal } from 'antd';
import { IOrder, IOrderRequest } from '../../interfaces';
import { FC, useState } from 'react';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import { Container, TextEditor } from 'components/common';
import { ISetState } from 'interfaces/common.interfaces';
import { useRouter } from 'next/router';

interface IProps {
  open: boolean;
  onCancel: () => void;
  currentOffer: IOrder;
  setOrder: ISetState<IOrderRequest>;
}

const ReasonRejectShippingConditionModal: FC<IProps> = ({
  open,
  onCancel,
  currentOffer,
  setOrder,
}) => {
  const router = useRouter();
  const [reason, setReason] = useState<string>();

  const sendReasonHandler = async (offerId, approved, reason) => {
    const res = await APIRequest({
      method: 'patch',
      url: `${API_ENDPOINTS.APPROVED_TO_CHANGE_SHIPPING_CONDITION}/${offerId}`,
      // params: { id: offerId },
      data: {
        approved,
        reason,
      },
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
    onCancel();
  };

  return (
    <>
      <Modal
        open={open}
        onCancel={onCancel}
        destroyOnClose={true}
        centered={true}
        footer={null}
        className="close-icon-hidden header-hidden header-border-hidden footer-hidden"
        width={550}
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
          <div className="w-100 mb-10">
            <p
              style={{
                textAlign: 'center',
                fontSize: 17,
                maxWidth: 400,
                margin: '0 auto 30px auto',
              }}
            >
              Укажите причину отклонения
            </p>
            <TextEditor
              value={reason}
              name="comment"
              height="120px"
              width="100%"
              onChange={reason => setReason(reason)}
            />
            <Button
              type="primary"
              onClick={() => {
                sendReasonHandler(currentOffer.id, false, reason);
              }}
              style={{ width: 170, margin: '15px auto 0' }}
            >
              Отправить
            </Button>
          </div>
        </Container>
      </Modal>
    </>
  );
};

export default ReasonRejectShippingConditionModal;
