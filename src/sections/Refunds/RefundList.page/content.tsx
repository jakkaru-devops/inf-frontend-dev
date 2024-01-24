import {
  BreadCrumbs,
  Page,
  PageContent,
  PageTop,
  Summary,
  Table,
  Pagination,
  PageTopPanel,
  Container,
} from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import { IOrderRequest } from 'sections/Orders/interfaces';
import RefundIcon from '../components/RefundIcon';
import { useLocale } from 'hooks/locale.hook';
import { ISetState, IRowsWithCount } from 'interfaces/common.interfaces';
import { generateInnerUrl, generateUrl } from 'utils/common.utils';
import { Button } from 'antd';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import OrderIdFilter from 'sections/Orders/components/OrderIdFilter';
import OrdersStatusFilter from 'sections/Orders/components/OrdersStatusFilter';
import { REFUND_STATUSES } from 'sections/Orders/data';
import { useAuth } from 'hooks/auth.hook';
import { FC } from 'react';

interface IProps {
  orders: IRowsWithCount<IOrderRequest[]>;
  newItemsCount: number;
  setNewItemsCount: ISetState<number>;
}

const RefundListPageContent: FC<IProps> = ({
  orders,
  newItemsCount,
  setNewItemsCount,
}) => {
  const { locale } = useLocale();
  const router = useRouter();
  const auth = useAuth();

  // count sellers order price
  if (auth.currentRole.label === 'seller') {
    for (let order of orders.rows) {
      order.totalPrice = order.orders
        .flatMap(({ products }) =>
          products.map(product => product.quantity * product.unitPrice),
        )
        .reduce((a, b) => a + b, 0);
    }
  }

  return (
    <Page>
      <BreadCrumbs
        list={[
          {
            link: APP_PATHS.REFUND_LIST,
            text: 'Возврат/обмен',
          },
        ]}
      />
      <PageTop
        title={
          <div className="d-flex align-items-center">
            <h2>Возврат/обмен</h2>
            {newItemsCount > 0 && (
              <Button
                type="default"
                className="ml-20 mt-5"
                onClick={() => {
                  router.push(generateUrl({ page: 1 }));
                  setNewItemsCount(0);
                }}
              >
                <span>Показать новые запросы возврат/обмен</span>
                <span className="ml-15">{newItemsCount}</span>
              </Button>
            )}
          </div>
        }
      />
      <PageTopPanel>
        <Container>
          <OrderIdFilter />
        </Container>
      </PageTopPanel>
      <PageContent>
        <Table
          cols={[
            { content: '№', width: '10%' },
            {
              content: (
                <OrdersStatusFilter
                  statuses={REFUND_STATUSES?.[auth.currentRole.label] || []}
                  statusText="Статус заказа"
                />
              ),
              width: '20%',
            },
            { content: 'Кол-во товаров', width: '15%' },
            { content: 'Сумма заказа', width: '20%' },
            { content: 'Кол-во товаров к возврату', width: '15%' },
            { content: 'Сумма товаров к возврату', width: '20%' },
          ]}
          rows={orders.rows.map(order => ({
            cols: [
              {
                content: (
                  <>
                    {order.idOrder}
                    <RefundIcon />
                  </>
                ),
                href: generateInnerUrl(APP_PATHS.ORDER(order.id), {
                  text: order.idOrder,
                }),
                className: 'relative',
              },
              {
                content: (
                  <span
                    className={classNames({
                      'color-primary': order.status === 'APPROVED',
                    })}
                  >
                    {locale.orders.status[order.status]}
                  </span>
                ),
              },
              {
                content: order.orders
                  .flatMap(({ products }) => products.map(({ count }) => count))
                  .reduce((a, b) => a + b, 0)
                  .separateBy(' '),
              },
              {
                content: (
                  order?.totalPrice ||
                  order?.orders
                    ?.flatMap(offer => offer.products)
                    ?.map(({ count, unitPrice }) => count * unitPrice)
                    .reduce((a, b) => a + b, 0)
                )
                  ?.roundFraction()
                  ?.separateBy(' '),
              },
              {
                content: order.orders
                  .flatMap(({ products }) =>
                    products.map(
                      ({ refundExchangeRequest }) =>
                        refundExchangeRequest?.quantity || 0,
                    ),
                  )
                  .reduce((a, b) => a + b, 0),
              },
              {
                content: order.orders
                  .flatMap(({ products }) =>
                    products.map(
                      product =>
                        (product.refundExchangeRequest?.quantity || 0) *
                        product.unitPrice,
                    ),
                  )
                  .reduce((a, b) => a + b, 0)
                  .roundFraction()
                  .separateBy(' '),
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
          }))}
        />
        {!orders.count && (
          <h3 className="text-center mt-15">Заказы не найдены</h3>
        )}
      </PageContent>
      {orders.count > 0 && (
        <Summary containerClassName="justify-content-between">
          <Pagination total={orders.count} pageSize={10} />
        </Summary>
      )}
    </Page>
  );
};

export default RefundListPageContent;
