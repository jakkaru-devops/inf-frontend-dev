import { useState } from 'react';
import RowInfoCompany from './RowInfoCompany';
import { IWeeks } from 'sections/Metrics/interfaces';
import { formatPrice } from 'utils/common.utils';

interface IProps {
  organizationName: string;
  requestsNumber: number;
  ordersNumber: number;
  totalOrdersSum: number;
  weeks: IWeeks[];
}

const RowTopCompany = ({
  organizationName,
  requestsNumber,
  ordersNumber,
  totalOrdersSum,
  weeks,
}: IProps) => {
  const [hiddenInfo, setHiddenInfo] = useState<boolean>(true);
  const viewInfo = () => {
    setHiddenInfo(!hiddenInfo);
  };

  return (
    <>
      <tr className="top-company__rows cursor-pointer" onClick={viewInfo}>
        <td>{organizationName}</td>
        <td>{requestsNumber}</td>
        <td>{ordersNumber}</td>
        <td>{formatPrice(totalOrdersSum)} руб.</td>
      </tr>
      {weeks.map((item, index) => {
        return (
          <RowInfoCompany
            hidden={hiddenInfo}
            key={index}
            weekEnd={item.weekEnd}
            weekStart={item.weekStart}
            totalOrdersSum={item.totalOrdersSum}
            requestsNumber={item.requestsNumber}
            ordersNumber={item.ordersNumber}
          />
        );
      })}
    </>
  );
};

export default RowTopCompany;
