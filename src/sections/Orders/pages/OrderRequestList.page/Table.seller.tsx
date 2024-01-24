import { Table } from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import { IOrderRequest } from 'sections/Orders/interfaces';
import formatDate from 'date-fns/format';
import { useLocale } from 'hooks/locale.hook';
import { generateInnerUrl } from 'utils/common.utils';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import OrdersStatusFilter from 'sections/Orders/components/OrdersStatusFilter';
import { ORDER_REQUEST_STATUSES } from 'sections/Orders/data';
import { getUserName } from 'sections/Users/utils';
import { FC } from 'react';

interface IProps {
  orderRequests: IRowsWithCount<IOrderRequest[]>;
  dataLoaded: boolean;
}

const OrderRequestListTableSeller: FC<IProps> = ({
  orderRequests,
  dataLoaded,
}) => {
  const { locale } = useLocale();
  const router = useRouter();

  return (
    <Table
      cols={[
        { content: '№', width: '15%' },
        { content: 'Дата', width: '12%' },
        { content: 'Кол-во товаров', width: '12%' },
        {
          content: (
            <OrdersStatusFilter statuses={ORDER_REQUEST_STATUSES.seller} />
          ),
          width: '25%',
        },
        { content: 'ФИО покупателя', width: '36%' },
      ]}
      rowsLoading={!dataLoaded}
      rows={orderRequests.rows.map(orderRequest => ({
        cols: [
          {
            content: `${orderRequest.idOrder}`,
            href: generateInnerUrl(APP_PATHS.ORDER_REQUEST(orderRequest.id), {
              text: orderRequest.idOrder,
              searchParams: {
                page: null,
              },
            }),
          },
          {
            content: formatDate(new Date(orderRequest.createdAt), 'dd.MM.yyyy'),
          },
          {
            content:
              orderRequest.products
                .map(({ quantity }) => quantity)
                .reduce((a, b) => a + b, 0) || '-',
          },
          {
            content: (
              <span
                className={classNames({
                  'color-primary': orderRequest.status === 'APPROVED',
                })}
              >
                {locale.orders.status[orderRequest.status]}
              </span>
            ),
          },
          { content: getUserName(orderRequest?.customer, 'full') },
        ],
        onClick: () =>
          router.push(
            generateInnerUrl(APP_PATHS.ORDER_REQUEST(orderRequest.id), {
              text: orderRequest.idOrder,
              searchParams: {
                page: null,
              },
            }),
          ),
        className: 'cursor-pointer',
        notificationsNumber: orderRequest.unreadNotifications?.length || 0,
      }))}
    />
  );
};

export default OrderRequestListTableSeller;
