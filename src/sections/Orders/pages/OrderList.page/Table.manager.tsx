import { Table } from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import { IOrderRequest } from 'sections/Orders/interfaces';
import formatDate from 'date-fns/format';
import { convertAddressToString } from 'components/common/YandexMap/utils';
import { hasOrderRefunds } from './utils';
import RefundIcon from 'sections/Refunds/components/RefundIcon';
import { Checkbox } from 'antd';
import { ITableRow } from 'components/common/Table/interfaces';
import { getUserName } from 'sections/Users/utils';
import { useLocale } from 'hooks/locale.hook';
import { generateInnerUrl } from 'utils/common.utils';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import OrdersStatusFilter from 'sections/Orders/components/OrdersStatusFilter';
import { ORDER_HISTORY_STATUSES, ORDER_STATUSES } from 'sections/Orders/data';
import { FC, Fragment } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { useAuth } from 'hooks/auth.hook';
import { ISetState } from 'interfaces/common.interfaces';

interface IProps {
  isHistory: boolean;
  orders: {
    rows: IOrderRequest[];
    count: number;
  };
  setOrders: ISetState<{
    rows: IOrderRequest[];
    count: number;
  }>;
}

const OrderListTableManager: FC<IProps> = ({
  orders,
  setOrders,
  isHistory,
}) => {
  const auth = useAuth();
  const { locale } = useLocale();
  const router = useRouter();

  const toggleOrderCollapsed = (order: IOrderRequest) => {
    order.isCollapsed = !order.isCollapsed;
    setOrders({
      ...orders,
      rows: [...orders.rows],
    });
  };

  const rows: ITableRow[] = [];

  for (const order of orders.rows) {
    const postponedPaymentDate = _.orderBy(
      order.orders.filter(offer => !!offer?.paymentPostponedAt),
      'paymentPostponedAt',
      'desc',
    )?.[0]?.paymentPostponedAt;

    // Primary rows
    rows.push({
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
        {
          content: (
            <span
              className="text-underline cursor-pointer user-select-none"
              onClick={e => {
                e.stopPropagation();
                toggleOrderCollapsed(order);
              }}
            >
              {!order.isCollapsed ? 'развернуть' : 'свернуть'}
            </span>
          ),
        },
        { content: convertAddressToString(order.address) },
        {
          content:
            order.orders.length > 0
              ? order.orders
                  .map(({ reward }) => reward?.amount || 0)
                  .reduce((a, b) => a + b, 0)
                  .roundFraction()
                  .separateBy(' ') + ' ₽'
              : '-',
        },
        auth?.currentRole?.label === 'operator' && {
          content: (
            <div>
              <Checkbox
                indeterminate={
                  order.orders.filter(({ reward }) => !!reward?.supplierPaid)
                    .length > 0 &&
                  order.orders.filter(({ reward }) => !!reward?.supplierPaid)
                    .length !== order.orders.length
                }
                checked={
                  order.orders.filter(({ reward }) => !!reward?.supplierPaid)
                    .length === order.orders.length
                }
                className="ml-0 mb-3 readonly"
              />
              <Checkbox
                indeterminate={
                  order.orders.filter(({ reward }) => !!reward?.sellerFeePaidAt)
                    .length > 0 &&
                  order.orders.filter(({ reward }) => !!reward?.sellerFeePaidAt)
                    .length !== order.orders.length
                }
                checked={
                  order.orders.filter(({ reward }) => !!reward?.sellerFeePaidAt)
                    .length === order.orders.length
                }
                className="ml-0 readonly"
              />
            </div>
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
    });

    if (order.isCollapsed) {
      for (let i = 0; i < order.orders.length; i++) {
        const offer = order.orders[i];
        // Subrows
        rows.push({
          cols: [
            {
              content: (
                <>
                  {getUserName(offer.seller, 'full')}
                  {hasOrderRefunds(order) && <RefundIcon />}
                </>
              ),
              href: generateInnerUrl(APP_PATHS.SELLER(offer.sellerId), {
                text: getUserName(offer?.seller, 'full'),
              }),
              className: 'relative',
            },
            {
              content: !isHistory
                ? order.paymentDate
                  ? formatDate(new Date(order.paymentDate), 'dd.MM.yyyy')
                  : '-'
                : offer.completionDate
                ? formatDate(new Date(offer.completionDate), 'dd.MM.yyyy')
                : '-',
            },
            {
              content: offer.products
                .map(({ count }) => count)
                .flat()
                .reduce((a, b) => a + b, 0),
            },
            {
              content: locale.orders.status?.[offer.status] || (
                <span className="color-primary">Ожидается оплата</span>
              ),
            },
            {
              content: !!locale.orders.status?.[offer.status] ? (
                <div>
                  <div
                    className={classNames({
                      'color-primary': order.status === 'APPROVED',
                    })}
                  >
                    {locale.orders.status[offer.status]}
                  </div>
                  {offer.status === 'PAYMENT_POSTPONED' &&
                    !!offer?.paymentPostponedAt && (
                      <div className="color-primary" style={{ fontSize: 12 }}>
                        срок оплаты до:{' '}
                        {moment(offer.paymentPostponedAt).format('DD.MM.yyyy')}
                      </div>
                    )}
                </div>
              ) : (
                <span className="color-primary">Ожидается оплата</span>
              ),
            },
            { content: convertAddressToString(order.address) },
            {
              content:
                (offer?.reward?.amount || 0).roundFraction().separateBy(' ') +
                ' ₽',
            },
            auth?.currentRole?.label === 'operator' && {
              content:
                offer.status === 'PAID' ? (
                  <div>
                    <Checkbox
                      checked={!!offer?.reward?.supplierPaid}
                      className="ml-0 mb-3 readonly"
                    />
                    <Checkbox
                      checked={!!offer?.reward?.sellerFeePaidAt}
                      className="ml-0 readonly"
                    />
                  </div>
                ) : (
                  '-'
                ),
            },
          ],
          notificationsNumber: order.unreadNotifications?.length || 0,
          borderTop: i === 0,
          borderBottom: i === order.orders.length - 1,
        });
      }
    }
  }

  return (
    <Table
      cols={[
        { content: '№', width: '12%' },
        {
          content: !isHistory ? 'Дата оплаты' : 'Дата завершения',
          width: '9%',
        },
        { content: 'Кол-во товаров', width: '7%' },
        {
          content: (
            <OrdersStatusFilter
              statuses={
                !isHistory
                  ? ORDER_STATUSES.manager
                  : ORDER_HISTORY_STATUSES.manager
              }
              statusKey="status"
              statusText={
                <Fragment>
                  Статус
                  <br />
                  покупателя
                </Fragment>
              }
            />
          ),
          width: '16%',
        },
        {
          content: (
            <OrdersStatusFilter
              statuses={
                !isHistory
                  ? ORDER_STATUSES.seller
                  : ORDER_HISTORY_STATUSES.seller
              }
              statusKey="sellerStatus"
              statusText={
                <Fragment>
                  Статус
                  <br />
                  продавца
                </Fragment>
              }
            />
          ),
          width: '12%',
        },
        { content: 'Пункт доставки', width: '26%' },
        {
          content: 'Вознаграждение',
          width: auth?.currentRole?.label === 'operator' ? '11%' : '18%',
        },
        auth?.currentRole?.label === 'operator' && {
          content: 'Оплачено',
          width: '7%',
        },
      ]}
      rows={rows}
    />
  );
};

export default OrderListTableManager;
