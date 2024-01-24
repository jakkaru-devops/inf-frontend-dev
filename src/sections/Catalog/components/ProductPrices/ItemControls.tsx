import classNames from 'classnames';
import { useProductHandlers } from 'hooks/productHandlers.hook';
import {
  IProduct,
  IProductPriceOffer,
} from 'sections/Catalog/interfaces/products.interfaces';
import MinusIcon from './MinusIcon';
import PlusIcon from './PlusIcon';
import { FC } from 'react';
import { Button } from 'antd';
import QuantityCounter from 'sections/Sale/components/QuantityCounter';

interface IProps {
  product: IProduct;
  priceOffer: IProductPriceOffer;
  manipulationAvailable: boolean;
  groupIndex: number;
  itemIndex: number;
  updateQuantity: (
    groupIndex: number,
    itemIndex: number,
    value: number,
  ) => void;
}

const ProductPriceItemControls: FC<IProps> = ({
  product,
  priceOffer,
  manipulationAvailable,
  groupIndex,
  itemIndex,
  updateQuantity,
}) => {
  const { isInCart, addProductToCart, goToCart } = useProductHandlers();
  const quantity = priceOffer?.quantity || 1;
  const disabledDown = quantity <= 1;
  const disabledUp = quantity >= priceOffer.productAmount;

  return (
    <div className="d-flex align-items-center pr-10">
      <QuantityCounter
        count={quantity}
        setCount={value => updateQuantity(groupIndex, itemIndex, value)}
        disabledUp={disabledUp}
        disabledDown={disabledDown}
      />
      {isInCart(product, {
        priceOfferId: priceOffer.id,
      }) ? (
        <Button
          className="quantityCounter-button-active"
          onClick={goToCart}
          disabled={!manipulationAvailable}
        >
          В корзине
        </Button>
      ) : (
        <Button
          className={classNames('quantityCounter-button', {
            disabled: !priceOffer.productAmount,
          })}
          onClick={() =>
            addProductToCart({
              product,
              quantity,
              priceOffer,
            })
          }
          disabled={!manipulationAvailable}
        >
          В корзину
        </Button>
      )}
    </div>
  );
};

export default ProductPriceItemControls;
