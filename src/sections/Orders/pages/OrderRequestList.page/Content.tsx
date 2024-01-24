import {
  BreadCrumbs,
  Page,
  PageContent,
  PagePreloader,
  PageTop,
  Summary,
  Pagination,
  PageTopPanel,
  Container,
} from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import { IOrderRequest } from 'sections/Orders/interfaces';
import OrderRequestListTableCustomer from './Table.customer';
import OrderRequestListTableSeller from './Table.seller';
import { useRouter } from 'next/router';
import { Button } from 'antd';
import { FC } from 'react';
import { ISetState, IRowsWithCount } from 'interfaces/common.interfaces';
import { generateUrl } from 'utils/common.utils';
import OrderIdFilter from 'sections/Orders/components/OrderIdFilter';
import { useAuth } from 'hooks/auth.hook';

interface IProps {
  orderRequests: IRowsWithCount<IOrderRequest[]>;
  dataLoaded: boolean;
  newItemsCount: number;
  setNewItemsCount: ISetState<number>;
}

const OrderRequestListPageContent: FC<IProps> = ({
  orderRequests,
  dataLoaded,
  newItemsCount,
  setNewItemsCount,
}) => {
  const auth = useAuth();
  const router = useRouter();

  return (
    <Page>
      <BreadCrumbs
        list={[{ link: APP_PATHS.ORDER_REQUEST_LIST, text: 'Запросы' }]}
      />
      <PageTop
        title={
          <div className="d-flex align-items-center">
            <h2>Запросы</h2>
            {newItemsCount > 0 && (
              <Button
                type="default"
                className="ml-20 mt-5"
                onClick={() => {
                  router.push(generateUrl({ page: 1 }));
                  setNewItemsCount(0);
                }}
              >
                <span>Показать новые запросы</span>
                <span className="ml-15">{newItemsCount}</span>
              </Button>
            )}
          </div>
        }
      />
      {dataLoaded ? (
        <>
          <PageTopPanel>
            <Container>
              <OrderIdFilter />
            </Container>
          </PageTopPanel>
          <PageContent>
            {auth?.currentRole?.label === 'customer' && (
              <OrderRequestListTableCustomer
                orderRequests={orderRequests}
                dataLoaded={dataLoaded}
              />
            )}
            {auth?.currentRole?.label === 'seller' && (
              <OrderRequestListTableSeller
                orderRequests={orderRequests}
                dataLoaded={dataLoaded}
              />
            )}
            {['manager', 'operator'].includes(auth?.currentRole?.label) && (
              <OrderRequestListTableCustomer
                orderRequests={orderRequests}
                dataLoaded={dataLoaded}
              />
            )}
            {!orderRequests?.rows?.length && (
              <h3 className="text-center mt-15">Запросы не найдены</h3>
            )}
          </PageContent>
          {orderRequests.count > 0 && (
            <Summary containerClassName="justify-content-between">
              <Pagination
                total={orderRequests.count}
                pageSize={Number(router.query.pageSize) || 10}
              />
            </Summary>
          )}
        </>
      ) : (
        <PagePreloader />
      )}
    </Page>
  );
};

export default OrderRequestListPageContent;
