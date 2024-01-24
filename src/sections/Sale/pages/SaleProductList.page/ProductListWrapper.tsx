import { EmptyListMark } from 'components/common';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { FC, Fragment, ReactNode, useContext } from 'react';
import { IProduct } from 'sections/Catalog/interfaces/products.interfaces';
import { ProductListContext } from 'sections/Catalog/pages/ProductList.page/context';

interface IProps {
  products: IRowsWithCount<IProduct[]>;
  children: ReactNode;
}

const SaleProductListWrapper: FC<IProps> = ({ products, children }) => {
  return (
    <Fragment>
      <div className="w-100">
        {!!products.count ? (
          !!products.rows.length ? (
            children
          ) : (
            <EmptyListMark>Товары не найдены</EmptyListMark>
          )
        ) : (
          <EmptyListMark>В распродаже нет товаров</EmptyListMark>
        )}
      </div>
    </Fragment>
  );
};

export default SaleProductListWrapper;
