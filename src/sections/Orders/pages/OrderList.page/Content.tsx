import {
  BreadCrumbs,
  Page,
  PageContent,
  PageTop,
  Summary,
  Pagination,
  PageTopPanel,
  Container,
} from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import { IOrderRequest } from 'sections/Orders/interfaces';
import OrderListTableCustomer from './Table.customer';
import OrderListTableSeller from './Table.seller';
import OrderListTableManager from './Table.manager';
import { useRouter } from 'next/router';
import { Button, Select } from 'antd';
import { FC, useState } from 'react';
import { ISetState, IRowsWithCount } from 'interfaces/common.interfaces';
import { generateUrl } from 'utils/common.utils';
import OrderIdFilter from 'sections/Orders/components/OrderIdFilter';
import { useAuth } from 'hooks/auth.hook';

interface IProps {
  isHistory: boolean;
  orders: IRowsWithCount<IOrderRequest[]>;
  setOrders: ISetState<IProps['orders']>;
  newItemsCount: number;
  setNewItemsCount: ISetState<number>;
}

const MONTHS = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

const getLastYears = (length = 5) =>
  Array.from(new Array(length), (_, i) => new Date().getFullYear() - i);

const OrderListPageContent: FC<IProps> = ({
  isHistory = false,
  orders,
  setOrders,
  newItemsCount,
  setNewItemsCount,
}) => {
  const auth = useAuth();
  const router = useRouter();

  const [filters, setFilters] = useState({
    idOrder: router.query.idOrder || '',
    month: router.query.month || '',
    year: router.query.year || '',
  });
  const [searchTimeout, setSearchTimeout] = useState(null as NodeJS.Timeout);

  const handleFilterChange = (name: string, value: string) => {
    const params = {
      idOrder: '' + filters.idOrder,
      month: '' + filters.month,
      year: '' + filters.year,
      [name]: value,
    };

    if (name === 'month' && value === '') params.year = '';

    setFilters(params);

    // Clear timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Request
    setSearchTimeout(
      setTimeout(() => {
        router.push(generateUrl({ ...params, page: 1 }));
      }, 300),
    );
    return () => clearTimeout(searchTimeout);
  };

  return (
    <Page>
      <BreadCrumbs
        list={[
          {
            link: !isHistory
              ? APP_PATHS.ORDER_LIST
              : APP_PATHS.ORDER_HISTORY_LIST,
            text: !isHistory ? 'Заказы' : 'История заказов',
          },
        ]}
      />
      <PageTop
        title={
          <div className="d-flex align-items-center">
            <h2>{!isHistory ? 'Заказы' : 'История заказов'}</h2>
            {newItemsCount > 0 && (
              <Button
                type="default"
                className="ml-20 mt-5"
                onClick={() => {
                  router.push(generateUrl({ page: 1 }));
                  setNewItemsCount(0);
                }}
              >
                <span>Показать новые заказы</span>
                <span className="ml-15">{newItemsCount}</span>
              </Button>
            )}
          </div>
        }
      />
      {isHistory ? (
        <PageTopPanel>
          <Container className="d-flex align-items-center">
            {isHistory && (
              <>
                <div className="mr-30">
                  <span>Месяц: </span>
                  <Select
                    size="small"
                    placeholder="все"
                    style={{ minWidth: '123px' }}
                    value={filters.month}
                    onChange={value =>
                      handleFilterChange('month', value.toString())
                    }
                  >
                    <Select.Option value={''}>все</Select.Option>
                    {MONTHS.map((month, i) => (
                      <Select.Option
                        key={i}
                        value={(
                          MONTHS.findIndex(el => el === month) + 1
                        ).padZero()}
                      >
                        {month}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
                <div className="mr-30">
                  <span>Год: </span>
                  <Select
                    size="small"
                    placeholder="все"
                    style={{ minWidth: '123px' }}
                    value={filters.year}
                    onChange={value =>
                      handleFilterChange('year', value.toString())
                    }
                    disabled={!router.query.month}
                  >
                    <Select.Option value={''}>все</Select.Option>
                    {getLastYears().map(year => (
                      <Select.Option key={year} value={year}>
                        {year}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              </>
            )}
            <OrderIdFilter />
          </Container>
        </PageTopPanel>
      ) : (
        <PageTopPanel>
          <Container>
            <OrderIdFilter />
          </Container>
        </PageTopPanel>
      )}

      <PageContent>
        {auth?.currentRole?.label === 'customer' && (
          <OrderListTableCustomer orders={orders} isHistory={isHistory} />
        )}
        {auth?.currentRole?.label === 'seller' && (
          <OrderListTableSeller orders={orders} isHistory={isHistory} />
        )}
        {['manager', 'operator'].includes(auth?.currentRole?.label) && (
          <OrderListTableManager
            orders={orders}
            setOrders={setOrders}
            isHistory={isHistory}
          />
        )}
        {!orders?.rows?.length && (
          <h3 className="text-center mt-15">Заказы не найдены</h3>
        )}
      </PageContent>
      {orders.count > 0 && (
        <Summary containerClassName="justify-content-between">
          <Pagination
            total={orders.count}
            pageSize={Number(router.query.pageSize) || 10}
          />
        </Summary>
      )}
    </Page>
  );
};

export default OrderListPageContent;
