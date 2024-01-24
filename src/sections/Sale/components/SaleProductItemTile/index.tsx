import { Button, Modal } from 'antd';
import { ConfirmModal, Link } from 'components/common';
import { useRouter } from 'next/router';
import { FC, useState } from 'react';
import { APP_PATHS } from 'data/paths.data';
import {
  generateInnerUrl,
  generateUrl,
  openNotification,
} from 'utils/common.utils';
import { APIRequest } from 'utils/api.utils';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';
import classNames from 'classnames';
import { ISaleProduct } from 'sections/Sale/interfaces/sale.interfaces';
import { useAuth } from 'hooks/auth.hook';
import { API_ENDPOINTS_V2 } from 'data/api.data';
import QuantityCounter from '../QuantityCounter';
import { useProductHandlers } from 'hooks/productHandlers.hook';

interface IProps {
  product: ISaleProduct;
}

const SaleProductItemTile: FC<IProps> = ({ product }) => {
  const router = useRouter();
  const auth = useAuth();
  const [deletionModalVisible, setDeletionModalVisible] = useState(false);
  const [deletionSubmitting, setDeletionSubmitting] = useState(false);
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

  // Удаление товара в распродаже
  const handleDelete = async () => {
    try {
      setDeletionSubmitting(true);
      const res = await APIRequest({
        method: 'delete',
        url: API_ENDPOINTS_V2.sale.deleteProduct(product.sale.id),
        data: {
          priceOfferId,
        },
        requireAuth: true,
      });
      setDeletionSubmitting(false);
      if (!res.isSucceed) {
        openNotification(res?.message);
        return;
      }
      openNotification(res?.message || 'Товар удален');
      setDeletionModalVisible(false);
      router.push(router.asPath);
    } catch (e) {
      console.log('failed to uninstall saleProduct');
      setDeletionSubmitting(false);
    }
  };

  return (
    <li className="sale-product-item ml-15">
      <div className="h-100-flex">
        <div
          className={classNames([
            'sale-product-item__img',
            {
              'sale-product-item__no-photo': !preview,
            },
          ])}
        >
          <img src={preview || '/img/no-photo.svg'} alt="photo" />
        </div>
        <div className="sale-product-item__title ">
          <Link
            href={generateInnerUrl(APP_PATHS.SALE_PRODUCT(product.sale.id), {
              text: name,
            })}
            className="sale-product-item__title"
          >
            {name}
          </Link>
        </div>
        <div className="sale-product-item__content">
          <h5>{article}</h5>
          <h5>{organization?.name}</h5>
          <h5>{supplierAddress.city.replace(/^г+/, '')}</h5>
        </div>
        <div className="sale-product-item__price">
          <div className="d-flex align-items-center">
            <h5 className="previousPrice mr-10">
              {!!previousPrice &&
                `${previousPrice
                  .toFixed(2)
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
                  .replace(/\./g, ',')} ₽`}
            </h5>
            <h5 className="newPrice">
              {price
                .toFixed(2)
                .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
                .replace(/\./g, ',')}{' '}
              ₽
            </h5>
          </div>
          {amount && <h5>Осталось: {amount} шт.</h5>}
        </div>
        {auth.currentRole.label === 'seller' && (
          <Button
            shape="circle"
            className="product-item__delete-button no-bg no-border color-primary"
            onClick={e => {
              e.preventDefault();
              setDeletionModalVisible(true);
            }}
            title={'Удалить товар'}
          >
            <img src="/img/icons/close2.svg" alt="delete" />
          </Button>
        )}
      </div>
      <div>
        {auth.currentRole.label === 'customer' && (
          <div className="sale-product-item__button-wrapper">
            <QuantityCounter
              count={count}
              setCount={setCount}
              className="sale-product-item__counter"
              disabledUp={disabledUp}
              disabledDown={disabledDown}
            />
            <Button
              type="primary"
              className={classNames('sale-product-item__button', {
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
      </div>

      <ConfirmModal
        open={deletionModalVisible}
        onClose={() => setDeletionModalVisible(false)}
        title="Вы уверены что хотите удалить товар?"
        onConfirm={handleDelete}
        submitAwaiting={deletionSubmitting}
      />
    </li>
  );
};

export default SaleProductItemTile;
