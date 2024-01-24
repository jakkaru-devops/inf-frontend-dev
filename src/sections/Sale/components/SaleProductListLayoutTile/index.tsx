import { FC } from 'react';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import SaleProductItemTile from '../SaleProductItemTile';
import { ISaleProduct } from 'sections/Sale/interfaces/sale.interfaces';

interface IProps {
  products: IRowsWithCount<ISaleProduct[]>;
}

const SaleProductListLayoutTile: FC<IProps> = ({ products }) => {
  return (
    <ul className="product-sale">
      {products?.rows.map((product, index) => (
        <SaleProductItemTile product={product} key={index} />
      ))}
    </ul>
  );
};

export default SaleProductListLayoutTile;
