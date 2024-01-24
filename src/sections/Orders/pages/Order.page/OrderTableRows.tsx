import { FC } from 'react';
import { IOrderRequestTable } from 'sections/Orders/interfaces';

const OrderTableRows: FC<IOrderRequestTable> = ({
  title,
  totalPaidSum,
  quantityProducts,
  cash,
}) => {
  return (
    <table className="table">
      <tbody>
        <tr className="sub-table">
          <td className="sub-table__item">{title}:</td>
          <td className="sub-table__item" style={{ width: '5%' }}>
            {quantityProducts}
          </td>
          <td className="sub-table__item" style={{ width: '9%' }}></td>
          <td className="sub-table__item" style={{ width: '7%' }}></td>
          <td className="sub-table__item" style={{ width: '9%' }}></td>
          <td className="sub-table__item" style={{ width: '9%' }}></td>
          <td
            className="sub-table__item border-highlighted"
            style={{ width: '10%' }}
          >
            {/* {(
            (offer.products
                .map(({ count, unitPrice }) => count * unitPrice)
                .reduce((a, b) => a + b, 0) /
                100) *
                offer?.organization?.priceBenefitPercent
                )
                .roundFraction()
            .separateBy(' ')} */}
            {totalPaidSum}
          </td>
          <td className="sub-table__item" style={{ width: '7%' }}></td>
        </tr>
      </tbody>
    </table>
  );
};

export default OrderTableRows;
