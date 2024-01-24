import classNames from 'classnames';
import formatDate from 'date-fns/format';

interface IProps {
  weekEnd: string;
  weekStart: string;
  totalOrdersSum: number;
  ordersNumber: number;
  hidden: boolean;
  requestsNumber: number;
}

const RowInfoCompany = ({
  weekEnd,
  weekStart,
  totalOrdersSum,
  ordersNumber,
  hidden,
  requestsNumber,
}: IProps) => {
  return (
    <>
      <tr
        className={classNames(['top-company__rows bg-light-gray '], {
          ['hidden-row']: hidden,
        })}
      >
        <td>{`${formatDate(new Date(weekStart), 'dd.MM')} - ${formatDate(
          new Date(weekEnd),
          'dd.MM  yyyy',
        )}`}</td>
        <td>{requestsNumber}</td>
        <td>{ordersNumber}</td>
        <td>
          {totalOrdersSum
            .toFixed(2)
            .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
            .replace(/\./g, ',')}{' '}
          руб.
        </td>
      </tr>
    </>
  );
};

export default RowInfoCompany;
