import { Button, Modal } from 'antd';
import { IOrder, IReasonToRejectShippingCondition } from '../../interfaces';
import { FC } from 'react';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import { Container } from 'components/common';
import { renderHtml } from 'utils/common.utils';

interface IProps {
  open: boolean;
  onCancel: () => void;
  currentOffer: IOrder;
  reason: IReasonToRejectShippingCondition;
}

const CheckReasonRejectChangeConditions: FC<IProps> = ({
  open,
  onCancel,
  currentOffer,
  reason,
}) => {
  const deleteReasonHandler = async offerId => {
    const res = await APIRequest({
      method: 'delete',
      url: `${API_ENDPOINTS.GET_REASON_REJECT_SHIPPING_CONDITION}/${offerId}`,
      requireAuth: true,
    });
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
        width={600}
        bodyStyle={{ paddingTop: 0 }}
      >
        <Container size="middle" style={{ padding: '20px 10px 0' }}>
          <h3
            style={{
              fontSize: 30,
              fontWeight: 700,
              textAlign: 'center',
            }}
          >
            Смена условий доставки отклонена
          </h3>
          <div
            className="w-100 mb-10"
            style={{
              textAlign: 'center',
              fontSize: 17,
              maxWidth: 400,
              margin: '0 auto 30px auto',
            }}
          >
            {!!reason?.reason && renderHtml(reason?.reason)}
          </div>
          <Button
            type="primary"
            onClick={() => {
              deleteReasonHandler(currentOffer?.id) && onCancel();
            }}
            style={{ width: 170, margin: '30px auto 0' }}
          >
            Ок
          </Button>
        </Container>
      </Modal>
    </>
  );
};

export default CheckReasonRejectChangeConditions;
