import { Table } from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import { IOrderRequest } from 'sections/Orders/interfaces';
import formatDate from 'date-fns/format';
import { useLocale } from 'hooks/locale.hook';
import { generateInnerUrl } from 'utils/common.utils';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { FC } from 'react';
import OrdersStatusFilter from 'sections/Orders/components/OrdersStatusFilter';
import { ORDER_REQUEST_STATUSES } from 'sections/Orders/data';
import { useAuth } from 'hooks/auth.hook';
import { ITableRow } from 'components/common/Table/interfaces';
import { Popover } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

interface IProps {
  orderRequests: {
    count: number;
    rows: IOrderRequest[];
  };
  dataLoaded: boolean;
}

const OrderRequestListTableCustomer: FC<IProps> = ({
  orderRequests,
  dataLoaded,
}) => {
  const auth = useAuth();
  const { locale } = useLocale();
  const router = useRouter();

  return (
    <Table
      cols={[
        { content: '№', width: '15%' },
        { content: 'Дата запроса', width: '15%' },
        { content: 'Кол-во товаров', width: '10%' },
        {
          content: (
            <OrdersStatusFilter
              statuses={
                auth?.currentRole?.label === 'customer'
                  ? ORDER_REQUEST_STATUSES.customer
                  : ORDER_REQUEST_STATUSES.manager
              }
            />
          ),
          width: '20%',
        },
        {
          content: 'Категория товара',
          width: '30%',
        },
        { content: 'Кол-во предложений', width: '10%' },
      ]}
      rowsLoading={!dataLoaded}
      rows={orderRequests.rows.map((orderRequest): ITableRow => {
        const categoriesText =
          (orderRequest?.categories || []).join(' / ') || '-';

        return {
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
              content: formatDate(
                new Date(orderRequest.createdAt),
                'dd.MM.yyyy',
              ),
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
            {
              content:
                categoriesText?.length <= 45 ? (
                  <span title={categoriesText} className="one-line-text">
                    {categoriesText}
                  </span>
                ) : (
                  <Popover
                    placement="bottom"
                    content={
                      <div style={{ maxWidth: 400 }}>{categoriesText}</div>
                    }
                  >
                    <div className="d-flex align-items-center w-100">
                      <span className="one-line-text">{categoriesText}</span>
                      <InfoCircleOutlined
                        style={{ fontSize: 15 }}
                        className="ml-5"
                      />
                    </div>
                  </Popover>
                ),
            },
            { content: orderRequest.orders.length },
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
          className: classNames('cursor-pointer', {
            deleteReq: !!orderRequest.managerDeletedAt,
          }),
          notificationsNumber: orderRequest.unreadNotifications?.length || 0,
        };
      })}
    />
  );
};

export default OrderRequestListTableCustomer;
