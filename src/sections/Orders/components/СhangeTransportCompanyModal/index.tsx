import { Button, Checkbox, Modal } from 'antd';
import { IOrder, IOrderRequest } from '../../interfaces';
import { FC, useEffect } from 'react';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import { Container } from 'components/common';
import { ITransportCompany } from 'sections/Shipping/interfaces';
import { ISetState } from 'interfaces/common.interfaces';
import { useRouter } from 'next/router';

interface IProps {
  open: boolean;
  onCancel: () => void;
  setOrder: ISetState<IOrderRequest>;
  order: IOrderRequest;
  companies: ITransportCompany[];
  setCompanies: ISetState<ITransportCompany[]>;
  setOneTransportCompany: ISetState<ITransportCompany['id']>;
  oneTransportCompany: ITransportCompany['id'];
}

const ChangeTransportCompanyModal: FC<IProps> = ({
  open,
  onCancel,
  setOrder,
  order,
  companies,
  setCompanies,
  setOneTransportCompany,
  oneTransportCompany,
}) => {
  const router = useRouter();

  const currentOffer = order.orders.find(({ id }) => id == router.query?.tab);

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
      params: { id: offerId },
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

  const handleSelectTransportCompany = async (transportCompanyId: string) => {
    await handleTransportCompanyChange(currentOffer.id, transportCompanyId);
    await onCancel();
  };
  if (!currentOffer || !companies) return <></>;

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      destroyOnClose={true}
      centered={true}
      footer={null}
      className="close-icon-hidden header-hidden header-border-hidden footer-hidden"
      width={900}
      bodyStyle={{ paddingTop: 0 }}
    >
      <Container size="middle" style={{ padding: '20px 10px 0' }}>
        <div className="d-flex justify-content-between align-items-center">
          <span style={{ fontSize: 30, fontWeight: 700 }}>
            Выберите транспортную компанию
          </span>
          <Button
            type="primary"
            onClick={() => handleSelectTransportCompany(oneTransportCompany)}
            disabled={!oneTransportCompany}
          >
            Сохранить
          </Button>
        </div>
        <p style={{ fontSize: 13, marginTop: 20 }}>
          Стоимость и сроки доставки ориентировочные.
          <br />
          Окончательная стоимость услуг будет уточнена по результатам
          взвешивания и обмера груза при приемке на складе.
        </p>
        <div className="w-100 mb-10">
          {companies.map((transportCompany, i) => {
            return (
              <div key={i} className="mt-40">
                <Checkbox
                  className="d-flex align-items-center"
                  defaultChecked={oneTransportCompany === transportCompany?.id}
                  checked={oneTransportCompany === transportCompany?.id}
                  disabled={
                    currentOffer?.transportCompanyId === transportCompany?.id
                  }
                  onChange={() => setOneTransportCompany(transportCompany?.id)}
                  style={{
                    alignItems: 'center',
                  }}
                >
                  <div className={'d-flex align-items-center'}>
                    <h3 className="mb-0">{transportCompany.name}</h3>
                    <div style={{ position: 'absolute', right: '280px' }}>
                      <span className={'text_14'}>
                        <a href={transportCompany.calculateUrl}>
                          Расчитать стоимость
                        </a>
                      </span>
                    </div>
                  </div>
                </Checkbox>
              </div>
            );
          })}
        </div>
      </Container>
    </Modal>
  );
};

export default ChangeTransportCompanyModal;
