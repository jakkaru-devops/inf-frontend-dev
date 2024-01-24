import { useEffect, useState } from 'react';
import MetricsListPageContent from './Content';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS_V2 } from 'data/api.data';
import { IMetrics, ITopCustomer } from '../../interfaces';

const MetricsPage = () => {
  const [metrics, setMetrics] = useState<IMetrics>();
  const [topCustomers, setTopCustomers] = useState<ITopCustomer[]>();

  useEffect(() => {
    const fetchData = async () => {
      const res = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS_V2.statistics.metrics,
      });
      setMetrics(res.data);

      const customers = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS_V2.statistics.topCustomer,
      });
      setTopCustomers(customers.data);
    };

    fetchData();
  }, []);

  return (
    <MetricsListPageContent metrics={metrics} topCustomers={topCustomers} />
  );
};

export default MetricsPage;
