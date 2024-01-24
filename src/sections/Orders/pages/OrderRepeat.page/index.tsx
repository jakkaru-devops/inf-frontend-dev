import { IOrderRequest } from 'sections/Orders/interfaces';
import { API_ENDPOINTS } from 'data/paths.data';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { IUser } from 'sections/Users/interfaces';
import { APIRequest } from 'utils/api.utils';
import OrderRepeatPageContent from './Content';
import PageContainer from 'components/containers/PageContainer';
import { IRowsWithCount } from 'interfaces/common.interfaces';

const OrderRepeatPage = () => {
  const [data, setData] = useState<{
    order: IOrderRequest;
    sellers: IRowsWithCount<IUser[]>;
  }>(null);

  const router = useRouter();

  useEffect(() => {
    if (Object.keys(router.query).length === 0) return;

    const fetchData = async () => {
      const orderRes = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.ORDER_REQUEST,
        params: {
          id: router.query.orderId,
        },
        requireAuth: true,
      });

      const order = orderRes.isSucceed ? orderRes.data : null;

      const sellersRes = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.SELLER_LIST_FOR_ORDER,
        requireAuth: true,
      });
      const sellers = sellersRes.isSucceed
        ? sellersRes.data
        : { count: 0, rows: [] };

      setData({
        order,
        sellers,
      });
    };
    fetchData();
  }, [router.query]);

  return (
    <PageContainer contentLoaded={!!data}>
      <OrderRepeatPageContent {...data} />
    </PageContainer>
  );
};

export default OrderRepeatPage;
