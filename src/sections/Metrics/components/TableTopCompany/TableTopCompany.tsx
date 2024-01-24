import { ITopCustomer } from 'sections/Metrics/interfaces';
import RowTopCompany from './RowTopCompany';
import { useLocale } from 'hooks/locale.hook';

interface IProps {
  topCustomers: ITopCustomer[];
}

const TableTopCompany = ({ topCustomers }: IProps) => {
  const { locale } = useLocale();

  return (
    <>
      <h2>{locale.common.topCustomers}</h2>
      <div className="mb-50">
        <table className="top-company">
          <tbody>
            <tr className="top-company__rows  bg-light-gray ">
              <th>Наименование</th>
              <th>Количество запросов</th>
              <th>Количество заказов</th>
              <th>Сумма заказов</th>
            </tr>
            {topCustomers &&
              topCustomers.map((org, index) => (
                <RowTopCompany
                  key={index}
                  organizationName={org.name}
                  requestsNumber={org.requestsNumber}
                  ordersNumber={org.ordersNumber}
                  totalOrdersSum={org.totalOrdersSum}
                  weeks={org.weeks}
                />
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default TableTopCompany;
