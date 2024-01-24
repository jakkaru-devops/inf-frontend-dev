import { Table } from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import { IOrderRequest } from 'sections/Orders/interfaces';
import formatDate from 'date-fns/format';
import { convertAddressToString } from 'components/common/YandexMap/utils';
import { hasOrderRefunds } from './utils';
import RefundIcon from 'sections/Refunds/components/RefundIcon';
import { useLocale } from 'hooks/locale.hook';
import { generateInnerUrl } from 'utils/common.utils';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import OrdersStatusFilter from 'sections/Orders/components/OrdersStatusFilter';
import { ORDER_HISTORY_STATUSES, ORDER_STATUSES } from 'sections/Orders/data';
import { FC, Fragment } from 'react';
import moment from 'moment';
import _ from 'lodash';

interface IProps {
  isHistory: boolean;
  orders: {
    rows: IOrderRequest[];
    count: number;
  };
}

const OrderListTableCustomer: FC<IProps> = ({ orders, isHistory }) => {
  const { locale } = useLocale();
  const router = useRouter();

  return (
    <Table
      cols={[
        { content: '№', width: '10%' },
        {
          content: !isHistory ? 'Дата оплаты' : 'Дата завершения',
          width: '15%',
        },
        { content: 'Кол-во товаров', width: '20%' },
        {
          content: (
            <OrdersStatusFilter
              statuses={
                !isHistory
                  ? ORDER_STATUSES.customer
                  : ORDER_HISTORY_STATUSES.customer
              }
            />
          ),
          width: '20%',
        },
        { content: 'Пункт доставки', width: '30%' },
      ]}
      rows={orders.rows.map(order => {
        const postponedPaymentDate = _.orderBy(
          order.orders.filter(offer => !!offer?.paymentPostponedAt),
          'paymentPostponedAt',
          'desc',
        )?.[0]?.paymentPostponedAt;

        return {
          cols: [
            {
              content: (
                <Fragment>
                  {order.idOrder}
                  {hasOrderRefunds(order) && <RefundIcon />}
                </Fragment>
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
                : order.completionDate
                ? formatDate(new Date(order.completionDate), 'dd.MM.yyyy')
                : '-',
            },
            {
              content: order.orders
                .filter(({ status }) =>
                  ['PAID', 'PAYMENT_POSTPONED'].includes(status),
                )
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
                  {order.status === 'PAYMENT_POSTPONED' &&
                    !!order?.paymentPostponedAt && (
                      <div className="color-primary" style={{ fontSize: 12 }}>
                        срок оплаты до:{' '}
                        {moment(postponedPaymentDate).format('DD.MM.yyyy')}
                      </div>
                    )}
                </div>
              ),
            },
            { content: convertAddressToString(order.address) },
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

export default OrderListTableCustomer;
