import { Checkbox } from 'antd';
import { Container } from 'components/common';
import { ITransportCompany } from 'sections/Shipping/interfaces';
import { IOrder } from 'sections/Orders/interfaces';
import { openNotification } from 'utils/common.utils';
import { FC } from 'react';

export const TransportCompanies: FC<{
  offer: IOrder;
  companies: Array<ITransportCompany>;
  updateAwaiting: boolean;
  handleTransportCompanyChange: (
    orderId: string,
    transportCompanyId: string,
  ) => void;
}> = ({ offer, companies, updateAwaiting, handleTransportCompanyChange }) => {
  const handleSelectTransportCompany = (transportCompanyId: string) =>
    handleTransportCompanyChange(offer.id, transportCompanyId);

  const selectedProductsCount = offer?.products?.filter(
    product => product?.isSelected,
  )?.length;

  return (
    <Container size="middle">
      <div className="w-100 mb-10">
        {companies.map((transportCompany, i) => {
          return (
            <div
              key={i}
              className="mt-40"
              onClick={e => {
                if (!selectedProductsCount) {
                  e.preventDefault();
                  openNotification('Сначала выберите товар из предложения');
                }
              }}
            >
              <Checkbox
                className="d-flex align-items-center"
                checked={
                  offer.transportCompanyId === transportCompany.id &&
                  !!selectedProductsCount
                }
                onChange={() => {
                  if (updateAwaiting || !selectedProductsCount) return;
                  handleSelectTransportCompany(
                    !offer?.transportCompanyId ? transportCompany.id : null,
                  );
                }}
                disabled={!selectedProductsCount}
                style={{
                  alignItems: 'center',
                }}
              >
                <div className={'d-flex align-items-center'}>
                  <h3 className="mb-0">{transportCompany.name}</h3>
                  <div style={{ position: 'absolute', right: '280px' }}>
                    <span className={'text_14'}>
                      <a href={transportCompany.calculateUrl} target="_blank">
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
  );
};
