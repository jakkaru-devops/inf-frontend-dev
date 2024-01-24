import { Table } from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import { IOrderRequest } from 'sections/Orders/interfaces';
import formatDate from 'date-fns/format';
import { hasOrderRefunds } from './utils';
import RefundIcon from 'sections/Refunds/components/RefundIcon';
import { useLocale } from 'hooks/locale.hook';
import { generateInnerUrl } from 'utils/common.utils';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import OrdersStatusFilter from 'sections/Orders/components/OrdersStatusFilter';
import { ORDER_HISTORY_STATUSES, ORDER_STATUSES } from 'sections/Orders/data';
import { calculateOrderCash } from 'sections/Orders/utils';
import { getUserName } from 'sections/Users/utils';
import moment from 'moment';
import { FC } from 'react';

interface IProps {
  isHistory: boolean;
  orders: {
    rows: IOrderRequest[];
    count: number;
  };
}

const OrderListTableSeller: FC<IProps> = ({ orders, isHistory }) => {
  const { locale } = useLocale();
  const router = useRouter();

  return (
    <Table
      cols={[
        { content: '№', width: '12%' },
        {
          content: !isHistory ? 'Дата оплаты' : 'Дата завершения',
          width: '13%',
        },
        { content: 'Кол-во товаров', width: '10%' },
        {
          content: (
            <OrdersStatusFilter
              statuses={
                !isHistory
                  ? ORDER_STATUSES.seller
                  : ORDER_HISTORY_STATUSES.seller
              }
            />
          ),
          width: '20%',
        },
        { content: 'ФИО покупателя', width: '30%' },
        { content: 'CASH', width: '15%' },
      ]}
      rows={orders.rows.map(order => {
        const offer = order?.orders?.[0];

        return {
          cols: [
            {
              content: (
                <>
                  {order.idOrder}
                  {hasOrderRefunds(order) && <RefundIcon />}
                </>
              ),
              href: generateInnerUrl(APP_PATHS.ORDER(order.id), {
                text: order.idOrder,
              }),
              className: 'relative',
            },
            {
              content: !isHistory
                ? order.paymentDate
                  ? formatDate(new Date(order.paymentDate), 'dd.MM.yyyy')
                  : '-'
                : order.orders[0]?.receivingDate
                ? formatDate(
                    new Date(order.orders[0]?.receivingDate), // not completionDate. completionDate fills up when a manager confirms payment from company to the seller
                    'dd.MM.yyyy',
                  )
                : '-',
            },
            {
              content: order.orders
                .map(({ products }) => products.map(({ count }) => count))
                .flat()
                .reduce((a, b) => a + b, 0),
            },
            {
              content: (
                <div>
                  <div
                    className={classNames({
                      'color-primary': order.status === 'APPROVED',
                    })}
                  >
                    {locale.orders.status[order.status]}
                  </div>
                  {offer.status === 'PAYMENT_POSTPONED' &&
                    !!offer?.paymentPostponedAt && (
                      <div className="color-primary" style={{ fontSize: 12 }}>
                        срок оплаты до:{' '}
                        {moment(offer.paymentPostponedAt).format('DD.MM.yyyy')}
                      </div>
                    )}
                </div>
              ),
            },
            { content: getUserName(order?.customer, 'full') },
            {
              content: (
                <span
                  className={
                    order.status !== 'REWARD_PAID' ? 'color-primary' : ''
                  }
                >
                  {!!order?.orders?.[0]?.reward
                    ? `${order?.orders?.[0]?.reward?.amount} ₽`
                    : `${calculateOrderCash(
                        order?.orders?.[0]?.totalPrice,
                        order?.orders?.[0]?.organization?.priceBenefitPercent,
                        true,
                      ).gaussRound(2)} ₽`}
                </span>
              ),
            },
          ],
          onClick: () =>
            router.push(
              generateInnerUrl(APP_PATHS.ORDER(order.id), {
                text: order.idOrder,
              }),
            ),
          className: 'cursor-pointer',
          notificationsNumber: order.unreadNotifications?.length || 0,
        };
      })}
    />
  );
};

export default OrderListTableSeller;
