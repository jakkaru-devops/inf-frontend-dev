import { FC, useState } from 'react';
import { Button } from 'antd';
import {
  generateInnerUrl,
  generateUrl,
  openNotification,
} from 'utils/common.utils';
import { APP_PATHS } from 'data/paths.data';
import { Link } from 'components/common';
import classNames from 'classnames';
import { ISaleProduct } from 'sections/Sale/interfaces/sale.interfaces';
import { useAuth } from 'hooks/auth.hook';
import QuantityCounter from '../QuantityCounter';
import { useProductHandlers } from 'hooks/productHandlers.hook';
import { useRouter } from 'next/router';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';

interface IProps {
  product: ISaleProduct;
}

const SaleProductItemRow: FC<IProps> = ({ product }) => {
  const router = useRouter();
  const auth = useAuth();
  const [count, setCount] = useState(1);
  const {
    name,
    article,
    preview,
    sale: {
      organization,
      supplierAddress,
      price,
      previousPrice,
      amount,
      priceOfferId,
    },
  } = product;
  const disabledUp = count >= amount;
  const disabledDown = count <= 1;
  const { toggleProductIsInCart, isInCart } = useProductHandlers();

  return (
    <tr className="sale-product-item-rows">
      <td
        className={classNames([
          'sale-product-item-rows__col image',
          {
            'sale-product-item-rows__no-photo': !preview,
          },
        ])}
      >
        <img src={preview || '/img/no-photo.svg'} alt="img" />
      </td>
      <td className="sale-product-item-rows__col ">
        <Link
          href={generateInnerUrl(APP_PATHS.SALE_PRODUCT(product.sale.id), {
            text: name,
          })}
          className="text_13_700"
        >
          {name}
        </Link>
      </td>
      <td className="sale-product-item-rows__col">{article}</td>
      <td className="sale-product-item-rows__col">{organization.name}</td>
      <td className="sale-product-item-rows__col text-center">
        {supplierAddress.city.replace(/^г+/, ' ')}
      </td>
      <td className="sale-product-item-rows__col text-center">{amount}</td>
      <td className="sale-product-item-rows__col price">
        <div>
          <span className="newPrice">
            {price
              .toFixed(2)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
              .replace(/\./g, ',')}
          </span>
          <span className="previousPrice">
            {!!previousPrice &&
              `${previousPrice
                .toFixed(2)
                .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
                .replace(/\./g, ',')}`}
          </span>
        </div>
      </td>
      <td className="sale-product-item-rows__col">
        {auth.currentRole.label === 'customer' && (
          <div className="sale-product-item-rows__button-wrapper">
            <QuantityCounter
              count={count}
              setCount={setCount}
              className="sale-product-item-rows__counter"
              disabledUp={disabledUp}
              disabledDown={disabledDown}
              style={{ height: '3px' }}
            />
            <Button
              type="primary"
              className={classNames('sale-product-item-rows__button', {
                disabled: !amount,
              })}
              onClick={() => {
                if (
                  !isInCart(product, {
                    priceOfferId,
                  })
                ) {
                  if (!amount) {
                    openNotification('Товара нет в наличии');
                    return;
                  }
                  toggleProductIsInCart(
                    { product, quantity: count },
                    { priceOfferId },
                  );
                } else {
                  router.push(
                    generateUrl(
                      { history: DEFAULT_NAV_PATHS.CART },
                      {
                        pathname: APP_PATHS.CART,
                        removeCurrentParams: true,
                      },
                    ),
                  );
                }
              }}
            >
              {!isInCart(product, {
                priceOfferId,
              })
                ? 'Добавить в корзину'
                : 'Перейти в корзину'}
            </Button>
          </div>
        )}
      </td>
    </tr>
  );
};

export default SaleProductItemRow;
