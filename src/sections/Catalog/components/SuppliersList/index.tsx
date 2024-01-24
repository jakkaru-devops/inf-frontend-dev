import { Button } from 'antd';
import { Table } from 'components/common';
import { useAuth } from 'hooks/auth.hook';
import { useCart } from 'hooks/cart.hook';
import { useProductHandlers } from 'hooks/productHandlers.hook';
import { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useDeepCompareEffect } from 'react-use';
import {
  IProduct,
  ISupplier,
} from 'sections/Catalog/interfaces/products.interfaces';
import QuantityCounter from 'sections/Sale/components/QuantityCounter';
import { updateUserCartProduct } from 'services/updateUserCartProduct.service';
import { suffixDef } from 'utils/common.utils';

interface IProps {
  suppliersList: ISupplier[];
  product?: IProduct;
}

const MAX_QUANTITY_FOR_REQUEST: number = 1000;
const INITIAL_SUPPLIERS_COUNT_TO_SHOW: number = 5;

const SuppliersList: FC<IProps> = ({ suppliersList, product }) => {
  const auth = useAuth();
  const cart = useCart();
  const dispatch = useDispatch();
  const { indexInCartProducts } = useProductHandlers();
  const [quantity, setQuantity] = useState<number>(() => {
    const indexInCart = indexInCartProducts(product, null);
    return indexInCart !== -1 ? cart.products[indexInCart]?.quantity : 1;
  });
  const disabledUp = quantity >= MAX_QUANTITY_FOR_REQUEST;
  const disabledDown = quantity <= 1;
  const [data, setData] = useState<ISupplier[]>(
    suppliersList.slice(0, INITIAL_SUPPLIERS_COUNT_TO_SHOW),
  );
  const isShowedAll = data.length > INITIAL_SUPPLIERS_COUNT_TO_SHOW;

  const onToogleList = () => {
    setData(isShowedAll ? suppliersList.slice(0, 5) : suppliersList);
  };

  const { isInCart, addToRequest, goToRequest } = useProductHandlers();

  useEffect(() => {
    const indexInCart = indexInCartProducts(product, null);
    if (indexInCart === -1) return;

    setQuantity(cart.products[indexInCart]?.quantity);
  }, []);

  useDeepCompareEffect(() => {
    setData(suppliersList.slice(0, INITIAL_SUPPLIERS_COUNT_TO_SHOW));
  }, [suppliersList]);

  const updateQuantity = async (value: number) => {
    const indexInCart = indexInCartProducts(product, null);
    if (indexInCart !== -1) {
      const cartProduct = cart.products[indexInCart];
      await updateUserCartProduct({
        cartProduct: {
          ...cartProduct,
          quantity: value,
        },
        cartProducts: cart.products,
        index: indexInCart,
        auth,
        dispatch,
      });
    }
    setQuantity(value);
  };

  return (
    <div className="suppliersList">
      <div className="suppliersList__content">
        <span className="suppliersList__description">
          {suppliersList.length ? (
            <>
              Вы можете сделать запрос, чтобы получить предложения с ценами от
              поставщиков. Обычно поставщики отвечают в течении нескольких
              часов. <br />
              По данной категории товаров, у нас есть {
                suppliersList.length
              }{' '}
              {suffixDef(suppliersList.length, [
                'поставщик',
                'поставщика',
                'поставщиков',
              ])}
              :
            </>
          ) : (
            <>
              Вы можете сделать запрос, чтобы получить предложения с ценами от
              других поставщиков. Обычно поставщики отвечают в течении
              нескольких часов.
            </>
          )}
        </span>
        <div className="suppliersList__counter">
          <QuantityCounter
            count={quantity}
            setCount={updateQuantity}
            disabledUp={disabledUp}
            disabledDown={disabledDown}
          />
          {isInCart(product, null) ? (
            <Button
              className="quantityCounter-button-active"
              onClick={goToRequest}
            >
              В запросе
            </Button>
          ) : (
            <Button
              type="primary"
              className="quantityCounter-button"
              onClick={() => addToRequest(product, quantity)}
            >
              В запрос
            </Button>
          )}
        </div>
      </div>
      {!!suppliersList.length && (
        <div className="suppliersList__table">
          <Table
            cols={[
              { content: 'Наименование', width: '60%' },
              { content: 'ИНН', width: '40%' },
            ]}
            rows={data.map(supplier => {
              return {
                cols: [{ content: supplier.name }, { content: supplier.inn }],
              };
            })}
          />
        </div>
      )}

      {suppliersList.length > 4 && (
        <button onClick={onToogleList} className="suppliersList__button mt-20">
          {isShowedAll ? 'Свернуть' : 'Показать всех'}
        </button>
      )}
    </div>
  );
};

export default SuppliersList;
