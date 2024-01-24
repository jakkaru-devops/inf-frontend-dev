import {
  BreadCrumbs,
  DeliveryAddressModal,
  Page,
  PageContent,
  PageTop,
} from 'components/common';
import { IOrderRequest } from 'sections/Orders/interfaces';
import { APP_PATHS } from 'data/paths.data';
import { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { IUserReview } from 'sections/Users/interfaces';
import { hasOrderRefunds } from '../OrderList.page/utils';
import RefundIcon from 'sections/Refunds/components/RefundIcon';
import OrderContentCustomer from './Content.customer';
import OrderContentSeller from './Content.seller';
import OrderContentManager from './Content.manager';
import { useLocale } from 'hooks/locale.hook';
import OrganizationInfoModal from 'components/common/OrganizationInfoModal';
import { ISetState } from 'interfaces/common.interfaces';
import { generateUrl } from 'utils/common.utils';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';
import PickupOrTransportCompanyModal from '../../components/PickupOrTransportCompanyModal';
import ApprovedShippingChangeModal from '../../components/ApprovedShippingChangeModal';
import { useAuth } from 'hooks/auth.hook';

interface IProps {
  order: IOrderRequest;
  setOrder: ISetState<IOrderRequest>;
  reviews: IUserReview[];
  setReviews: ISetState<IUserReview[]>;
  fetchOrder: () => Promise<void>;
}

const OrderPageContent: FC<IProps> = ({
  order,
  setOrder,
  reviews,
  setReviews,
  fetchOrder,
}) => {
  const auth = useAuth();
  const { locale } = useLocale();
  const router = useRouter();

  const [addressModaVisible, setAddressModalVisible] = useState<boolean>(false);
  const [orgInfoModalVisible, setOrgInfoModalVisible] =
    useState<boolean>(false);
  const [changeShippingConditionVisible, setChangeShippingConditionVisible] =
    useState<boolean>(false);
  const [approvedShippingChangedModal, setApprovedShippingChangedModal] =
    useState<boolean>(false);

  useEffect(() => {
    // if is request
    if (
      ![
        'PAID',
        'PAYMENT_POSTPONED',
        'COMPLETED',
        'DECLINED',
        'REWARD_PAID',
        'SHIPPED',
      ].includes(order.status)
    ) {
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.ORDER_REQUEST(order.id, order.idOrder),
          },
          {
            pathname: APP_PATHS.ORDER_REQUEST(order.id),
          },
        ),
      );
      return;
    }

    // if has active refunds
    if (order.orders.some(el => el.hasActiveRefundExchangeRequest)) {
      router.push(
        generateUrl({
          history: DEFAULT_NAV_PATHS.ORDER_IN_REFUNDS(order.id, order.idOrder),
          fromRefunds: 1,
        }),
      );
      return;
    }

    // if does not have active refunds
    if (!order.orders.some(el => el.hasActiveRefundExchangeRequest)) {
      router.push(
        generateUrl({
          fromRefunds: null,
          history: order.inHistory
            ? DEFAULT_NAV_PATHS.ORDER_IN_HISTORY(order.id, order.idOrder)
            : DEFAULT_NAV_PATHS.ORDER(order.id, order.idOrder),
        }),
      );
      return;
    }

    if (order.orders.some(el => !el.receivingDate) && !order.inHistory) {
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.ORDER(order.id, order.idOrder),
          },
          {
            pathname: APP_PATHS.ORDER(order.id),
          },
        ),
      );
      return;
    }
  }, []);

  const sellerOffer = order.orders.find(
    ({ seller }) => auth.user.id == seller.id,
  );

  if (!order) {
    return (
      <Page>
        <PageTop title="Заказ" />
        <PageContent>Заказ не найден</PageContent>
      </Page>
    );
  }

  return (
    <Page>
      <BreadCrumbs
        list={[
          (router.query.fromRefunds && {
            link: APP_PATHS.REFUND_LIST,
            text: 'Возврат/обмен',
          }) ||
            (['REWARD_PAID', 'COMPLETED'].includes(order.status) && {
              link: APP_PATHS.ORDER_HISTORY_LIST,
              text: 'История заказов',
            }) || {
              link: APP_PATHS.ORDER_LIST,
              text: 'Заказы',
            },
          {
            link: APP_PATHS.ORDER(order.id),
            text: `${order.idOrder}`,
          },
        ]}
      />
      <PageTop
        title={
          <h2 className="null text_38">
            <span className="relative">
              Заказ {order.idOrder}
              {((auth?.currentRole?.label === 'seller' &&
                sellerOffer.products.some(
                  ({ refundExchangeRequest }) => refundExchangeRequest,
                )) ||
                (auth?.currentRole?.label !== 'seller' &&
                  hasOrderRefunds(order))) && (
                <RefundIcon big style={{ right: '-26%' }} />
              )}
            </span>
          </h2>
        }
      />

      {auth?.currentRole?.label === 'customer' && (
        <>
          <OrderContentCustomer
            order={order}
            setOrder={setOrder}
            reviews={reviews}
            setReviews={setReviews}
            setAddressModalVisible={setAddressModalVisible}
            setChangeShippingConditionVisible={
              setChangeShippingConditionVisible
            }
          />
          <PickupOrTransportCompanyModal
            open={changeShippingConditionVisible}
            onCancel={() => {
              setChangeShippingConditionVisible(false);
            }}
            setOrder={setOrder}
            order={order}
          />
        </>
      )}
      {auth?.currentRole?.label === 'seller' && (
        <>
          <OrderContentSeller
            order={order}
            setOrder={setOrder}
            offer={sellerOffer}
            setAddressModalVisible={setAddressModalVisible}
            setOrgInfoModalVisible={setOrgInfoModalVisible}
            setApprovedShippingChangedModal={setApprovedShippingChangedModal}
            fetchOrder={fetchOrder}
          />

          {!order?.inHistory && (
            <ApprovedShippingChangeModal
              order={order}
              open={approvedShippingChangedModal}
              onCancel={() => setApprovedShippingChangedModal(false)}
              setOrder={setOrder}
              currentOffer={sellerOffer}
            />
          )}
        </>
      )}
      {['manager', 'operator'].includes(auth?.currentRole?.label) && (
        <OrderContentManager
          order={order}
          setOrder={setOrder}
          setAddressModalVisible={setAddressModalVisible}
          setOrgInfoModalVisible={setOrgInfoModalVisible}
        />
      )}

      {auth?.currentRole?.label !== 'customer' && !!order.payerId && (
        <>
          <OrganizationInfoModal
            order={order}
            open={orgInfoModalVisible}
            onCancel={() => {
              setOrgInfoModalVisible(false);
            }}
            title={order?.payer?.name}
          />
        </>
      )}

      <DeliveryAddressModal
        address={order.address}
        setAddress={() => {}}
        open={addressModaVisible}
        onCancel={() => setAddressModalVisible(false)}
        allowControl={false}
        title={locale.orders.deliveryAddress}
      />
    </Page>
  );
};

export default OrderPageContent;
