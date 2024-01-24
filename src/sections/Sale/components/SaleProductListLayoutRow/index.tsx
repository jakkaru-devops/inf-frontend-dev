import { FC } from 'react';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import SaleProductItemRow from '../SaleProductItemRow';
import { ISaleProduct } from 'sections/Sale/interfaces/sale.interfaces';

interface IProps {
  products: IRowsWithCount<ISaleProduct[]>;
}

const SaleProductListViewList: FC<IProps> = ({ products }) => {
  return (
    <table className="ml-15 w-100">
      <tbody>
        <tr className="sale-product-item-rows table-header">
          <th className="sale-product-item-rows__col"></th>
          <th className="sale-product-item-rows__col">Наименование</th>
          <th className="sale-product-item-rows__col">Артикул</th>
          <th className="sale-product-item-rows__col">Поставщик</th>
          <th className="sale-product-item-rows__col">Город</th>
          <th className="sale-product-item-rows__col">Остаток, шт</th>
          <th className="sale-product-item-rows__col">Цена за шт.₽</th>
          <th className="sale-product-item-rows__col"></th>
        </tr>
      </tbody>
      <tbody>
        {products?.rows.map((product, index) => {
          return <SaleProductItemRow product={product} key={index} />;
        })}
      </tbody>
    </table>
  );
};

export default SaleProductListViewList;
