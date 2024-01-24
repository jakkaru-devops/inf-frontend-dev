import { IMetrics } from 'sections/Metrics/interfaces';

const TableMetricsCompany = ({
  customerOrganizations,
  customers,
  orders,
  ordersIndividuals,
  rejectedOrdersPercent,
  rejectedRequestsPercent,
  requests,
  requestsIndividuals,
  sellers,
  suppliers,
}: IMetrics) => {
  return (
    <table className="metrics-company">
      <tbody>
        <tr className="metrics-company__rows bg-light-gray">
          <th className="p-5">Метрика</th>
          <th className="p-5">Всего</th>
          <th className="p-5">За неделю</th>
        </tr>
        <tr className="metrics-company__rows">
          <td>Количество поставщиков</td>
          <td className="numbers-column">{suppliers?.total}</td>
          <td className="numbers-column">{suppliers?.week}</td>
        </tr>
        <tr className="metrics-company__rows">
          <td>Количество продавцов</td>
          <td className="numbers-column">{sellers?.total}</td>
          <td className="numbers-column">{sellers?.week}</td>
        </tr>
        <tr className="metrics-company__rows">
          <td>Количество покупателей</td>
          <td className="numbers-column">{customerOrganizations?.total}</td>
          <td className="numbers-column">{customerOrganizations?.week}</td>
        </tr>
        <tr className="metrics-company__rows">
          <td>Количество снабженцев</td>
          <td className="numbers-column">{customers?.total}</td>
          <td className="numbers-column">{customers?.week}</td>
        </tr>
        <tr className="metrics-company__rows">
          <td>Общее количество запросов</td>
          <td>{requests?.total}</td>
          <td>{requests?.week}</td>
        </tr>
        <tr className="metrics-company__rows">
          <td>Процент отказов по запросам</td>
          <td>{rejectedRequestsPercent?.total}%</td>
          <td>{rejectedRequestsPercent?.week}%</td>
        </tr>
        <tr className="metrics-company__rows">
          <td>Общее количество заказов</td>
          <td>{orders?.total}</td>
          <td>{orders?.week}</td>
        </tr>
        <tr className="metrics-company__rows">
          <td>Процент отказов по заказам</td>
          <td>{rejectedOrdersPercent?.total}%</td>
          <td>{rejectedOrdersPercent?.week}%</td>
        </tr>
        <tr className="metrics-company__rows">
          <td>Количество запросов от физ.лиц</td>
          <td>{requestsIndividuals?.total}</td>
          <td>{requestsIndividuals?.week}</td>
        </tr>
        <tr className="metrics-company__rows">
          <td>Количество заказов от физ.лиц</td>
          <td>{ordersIndividuals?.total}</td>
          <td>{ordersIndividuals?.week}</td>
        </tr>
      </tbody>
    </table>
  );
};

export default TableMetricsCompany;
