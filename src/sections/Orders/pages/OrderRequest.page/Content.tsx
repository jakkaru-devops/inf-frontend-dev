import { FC, useState } from 'react';
import {
  BreadCrumbs,
  DeliveryAddressModal,
  Page,
  PageContent,
  PageTop,
} from 'components/common';
import { IOrderRequest } from 'sections/Orders/interfaces';
import { APP_PATHS } from 'data/paths.data';
import { IOrganization } from 'sections/Organizations/interfaces';
import OrderRequestContentCustomer from './Content.customer';
import OrderRequestContentSeller from './Content.seller';
import OrderRequestContentManager from './Content.manager';
import OrderRequestPartialPaymentContentCustomer from './PartialPayment.customer';
import OrderRequestPartialPaymentContentManager from './PartialPayment.manager';
import { IUser } from 'sections/Users/interfaces';
import { useLocale } from 'hooks/locale.hook';
import OrderRequestPartialPaymentContentSeller from './PartialPayment.seller';
import { useRouter } from 'next/router';
import { useAuth } from 'hooks/auth.hook';

interface IProps {
  orderRequest: IOrderRequest;
  setOrderRequest: (value: IOrderRequest) => void;
  organizations: IOrganization[];
  sellers: IUser[];
}

const OrderRequestPageContent: FC<IProps> = ({
  orderRequest,
  setOrderRequest,
  organizations,
  sellers,
}) => {
  const auth = useAuth();
  const { locale } = useLocale();
  const router = useRouter();

  const [addressModaVisible, setAddressModalVisible] = useState(false);

  if (!orderRequest) {
    return (
      <Page>
        <BreadCrumbs
          list={[
            { link: APP_PATHS.ORDER_REQUEST_LIST, text: 'Запросы' },
            {
              link: APP_PATHS.ORDER_REQUEST(
                router.query?.orderRequestId as string,
              ),
              text: `Запрос не найден`,
            },
          ]}
        />
        <PageTop title="Запрос" />
        <PageContent>Запрос не найден</PageContent>
      </Page>
    );
  }

  const isPartialPayment =
    orderRequest.paidSum &&
    (!orderRequest.paymentRefundRequest ||
      (orderRequest.paymentRefundRequest &&
        !orderRequest.paymentRefundRequest.refundSum));

  return (
    <Page className="order-request-page">
      <BreadCrumbs
        list={[
          { link: APP_PATHS.ORDER_REQUEST_LIST, text: 'Запросы' },
          {
            link: APP_PATHS.ORDER_REQUEST(orderRequest.id),
            text: `${orderRequest.idOrder}`,
          },
        ]}
      />
      <PageTop title={`Запрос ${orderRequest.idOrder}`} />
      {auth?.currentRole?.label === 'customer' && (
        <>
          {!isPartialPayment ? (
            <OrderRequestContentCustomer
              orderRequest={orderRequest}
              setAddressModalVisible={setAddressModalVisible}
              sellers={sellers}
            />
          ) : (
            <OrderRequestPartialPaymentContentCustomer
              orderRequest={orderRequest}
              setOrderRequest={setOrderRequest}
              setAddressModalVisible={setAddressModalVisible}
            />
          )}
        </>
      )}
      {auth?.currentRole?.label === 'seller' && (
        <>
          {!isPartialPayment ? (
            <OrderRequestContentSeller
              orderRequest={orderRequest}
              setOrderRequest={setOrderRequest}
              organizations={organizations}
              setAddressModalVisible={setAddressModalVisible}
            />
          ) : (
            <OrderRequestPartialPaymentContentSeller
              orderRequest={orderRequest}
              setOrderRequest={setOrderRequest}
              organizations={organizations}
              setAddressModalVisible={setAddressModalVisible}
            />
          )}
        </>
      )}
      {['manager', 'operator'].includes(auth?.currentRole?.label) && (
        <>
          {!isPartialPayment ? (
            <OrderRequestContentManager
              orderRequest={orderRequest}
              setOrderRequest={setOrderRequest}
              setAddressModalVisible={setAddressModalVisible}
              sellers={sellers}
            />
          ) : (
            <OrderRequestPartialPaymentContentManager
              orderRequest={orderRequest}
              setOrderRequest={setOrderRequest}
              setAddressModalVisible={setAddressModalVisible}
            />
          )}
        </>
      )}

      <DeliveryAddressModal
        address={orderRequest.address}
        setAddress={() => {}}
        open={addressModaVisible}
        onCancel={() => setAddressModalVisible(false)}
        allowControl={false}
        title={locale.orders.deliveryAddress}
      />
    </Page>
  );
};

export default OrderRequestPageContent;
