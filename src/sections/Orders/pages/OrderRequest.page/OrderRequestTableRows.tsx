import classNames from 'classnames';
import { FC } from 'react';
import { IOrderRequestTable } from 'sections/Orders/interfaces';
import { formatPrice } from 'utils/common.utils';

const OrderRequestTableRows: FC<IOrderRequestTable> = ({
  title,
  totalPaidSum,
  quantityProducts,
  quantityAvailable,
  cash,
  changeAllowed,
  addOfferProduct,
}) => {
  if (typeof cash === 'number') cash = formatPrice(cash);

  return (
    <table>
      <tbody>
        <tr className="sub-table">
          <td
            className={classNames([
              'sub-table__item',
              !!addOfferProduct && changeAllowed && 'add-row',
            ])}
          >
            {!!addOfferProduct && changeAllowed && (
              <span
                className="color-primary text-underline cursor-pointer"
                onClick={() => addOfferProduct()}
              >
                Добавить строку
              </span>
            )}
            <span>{title}:</span>
          </td>
          <td className="sub-table__item" style={{ width: '5%' }}>
            {quantityProducts}
          </td>
          <td className="sub-table__item" style={{ width: '10%' }}></td>
          <td className="sub-table__item" style={{ width: '7%' }}>
            {quantityAvailable}
          </td>
          <td className="sub-table__item" style={{ width: '7%' }}></td>
          <td className="sub-table__item" style={{ width: '7%' }}></td>
          <td
            className="sub-table__item border-highlighted"
            style={{ width: '9%' }}
          >
            {totalPaidSum}
          </td>
          <td className="sub-table__item" style={{ width: '7%' }}>
            {cash}
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default OrderRequestTableRows;
