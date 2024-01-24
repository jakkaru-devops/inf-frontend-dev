import { Button, Modal } from 'antd';
import { IOrder, IOrderRequest } from '../../interfaces';
import { FC, useEffect, useState } from 'react';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import { Container } from 'components/common';
import { ITransportCompany } from 'sections/Shipping/interfaces';
import { ISetState } from 'interfaces/common.interfaces';
import { useRouter } from 'next/router';
import ChangeTransportCompanyModal from '../СhangeTransportCompanyModal';

interface IProps {
  open: boolean;
  onCancel: () => void;
  setOrder: ISetState<IOrderRequest>;
  order: IOrderRequest;
}

const PickupOrTransportCompanyModal: FC<IProps> = ({
  open,
  onCancel,
  setOrder,
  order,
}) => {
  const router = useRouter();

  const currentOffer = order.orders.find(({ id }) => id == router.query?.tab);

  const [
    changeTransportCompanyModalVisible,
    setChangeTransportCompanyModalVisible,
  ] = useState<boolean>(false);

  const [companies, setCompanies] = useState<ITransportCompany[]>(null);
  const [oneTransportCompany, setOneTransportCompany] = useState<
    ITransportCompany['id']
  >(currentOffer?.transportCompanyId);

  useEffect(() => {
    const fetch = async () => {
      if (!currentOffer?.id) return;
      const { data } = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.SELLER_OFFER_TRANSPORT,
        params: {
          orderId: currentOffer?.id,
        },
      });

      setCompanies(data);
    };
    fetch();
  }, [currentOffer]);

  const handleTransportCompanyChange = async (
    offerId: string,
    transportCompanyId: IOrder['transportCompanyId'] | 'pickup' | null,
  ) => {
    const res = await APIRequest({
      method: 'patch',
      url: `${API_ENDPOINTS.APPLICATION_TO_CHANGE_SHIPPING_CONDITION}/${offerId}`,
      // params: { id: offerId },
      data: { transportCompanyId },
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

  if (!currentOffer || !companies) return <></>;

  const closeModalsHandler = () => {
    setChangeTransportCompanyModalVisible(false);
    onCancel();
  };

  return (
    <>
      <ChangeTransportCompanyModal
        open={changeTransportCompanyModalVisible}
        onCancel={() => closeModalsHandler()}
        setOrder={setOrder}
        order={order}
        companies={companies}
        setCompanies={setCompanies}
        oneTransportCompany={oneTransportCompany}
        setOneTransportCompany={setOneTransportCompany}
      />

      <Modal
        open={open}
        onCancel={onCancel}
        destroyOnClose={true}
        centered={true}
        footer={null}
        className="close-icon-hidden header-hidden footer-hidden header-border-hidden"
        width={450}
        bodyStyle={{ paddingTop: 0 }}
      >
        <Container size="middle" style={{ padding: '20px 30px' }}>
          <h3
            style={{
              fontSize: 30,
              fontWeight: 700,
              textAlign: 'center',
              marginBottom: 30,
            }}
          >
            Способ доставки
          </h3>
          <div
            className="w-100"
            style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}
          >
            <Button
              type="primary"
              onClick={() =>
                handleTransportCompanyChange(currentOffer.id, 'pickup') &&
                onCancel()
              }
              disabled={currentOffer.isPickup}
              style={{ minWidth: 175 }}
            >
              Самовывоз
            </Button>

            <Button
              type="primary"
              onClick={() => {
                setChangeTransportCompanyModalVisible(true);
              }}
              style={{ minWidth: 175 }}
            >
              Транспортная компания
            </Button>
          </div>
        </Container>
      </Modal>
    </>
  );
};

export default PickupOrTransportCompanyModal;
