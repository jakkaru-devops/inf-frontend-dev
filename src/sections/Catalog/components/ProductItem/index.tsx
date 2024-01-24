import classNames from 'classnames';
import { Button } from 'antd';
import useHandlers from './handlers';
import { IProduct } from 'sections/Catalog/interfaces/products.interfaces';
import {
  ICatalogLayout,
  IProductItemFormat,
} from 'sections/Catalog/interfaces/catalog.interfaces';
import { APP_PATHS } from 'data/paths.data';
import { Link } from 'components/common';
import { useRouter } from 'next/router';
import { generateInnerUrl, generateUrl } from 'utils/common.utils';
import { FC, Fragment } from 'react';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';
import { IAcatProduct } from 'sections/CatalogExternal/interfaces';

interface IProps {
  product: IProduct;
  externalProductData?: any;
  href?: string;
  format?: IProductItemFormat;
  layout?: ICatalogLayout;
  queries?: any;
  isHighlighted?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  onLinkClick?: () => void;
}

const ProductItem: FC<IProps> = ({
  product,
  externalProductData,
  href,
  format = 'default',
  layout = 'tile',
  isHighlighted,
  onClick,
  onDoubleClick,
  onLinkClick,
}) => {
  const router = useRouter();
  const {
    locale,
    auth,
    quantity,
    isInCart,
    isInFavorites,
    isInOrderRequest,
    permissions,
    handleQuantityChange,
    handleCartButtonClick,
    handleFavoriteButtonClick,
    handleAddToOrderRequestButtonClick,
    productPageUrl,
  } = useHandlers({
    product,
    externalProductData,
  });

  return (
    <li
      className={classNames('product-item', {
        'format-min': format === 'min',
        'layout-row': layout === 'row',
        highlighted: isHighlighted,
      })}
    >
      <div
        className="product-item__inner"
        onClick={onClick}
        onDoubleClick={onDoubleClick}
      >
        <div className="col col-left">
          <div
            className={classNames('product-item__img', {
              'product-item__img--no-photo': !product.preview,
            })}
          >
            <img
              src={product.preview || '/img/icons/no-photo.svg'}
              alt={product.name}
              className="catalog__img"
            />
          </div>
        </div>
        <div className="col col-right">
          {!!onLinkClick ? (
            <div
              className="product-item__title link"
              onClick={e => {
                e.stopPropagation();
                onLinkClick();
              }}
            >
              {product.name}
            </div>
          ) : (
            <Link
              href={
                href ||
                generateInnerUrl(APP_PATHS.PRODUCT(product.id), {
                  text: product.name,
                })
              }
              className="product-item__title"
            >
              {product.name}
            </Link>
          )}
          <div className="product-item__content-wrapper">
            <div className="product-item__content">
              <div className="product-item__article">{product.article}</div>
              {!!product?.manufacturer && (
                <div className="product-item__manufacturer">
                  {product.manufacturer}
                </div>
              )}
              {!!product?.minPrice && (
                <div className="product-item__min-price">
                  От {product.minPrice.roundFraction().separateBy(' ')} ₽
                </div>
              )}
            </div>
          </div>
          {format === 'default' && (
            <Fragment>
              {permissions.addToCart &&
                (!!product?.minPrice ? (
                  <div className="product-item__button-wrapper">
                    <Link
                      href={generateInnerUrl(APP_PATHS.PRODUCT(product.id), {
                        text: product.name,
                      })}
                      className="d-block w-100"
                    >
                      <Button
                        type="default"
                        className={classNames(
                          'product-item__button product-item__button--prices',
                          {
                            'layout-tile': layout === 'tile',
                          },
                        )}
                      >
                        Смотреть цены
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="product-item__button-wrapper">
                    <Link
                      href={generateInnerUrl(APP_PATHS.PRODUCT(product.id), {
                        text: product.name,
                      })}
                      className="d-block w-100"
                    >
                      <Button
                        type="default"
                        className={classNames(
                          'product-item__button product-item__button--prices',
                          {
                            'layout-tile': layout === 'tile',
                          },
                        )}
                      >
                        Перейти к товару
                      </Button>
                    </Link>
                  </div>
                ))}
              {!!externalProductData && (
                <div className="product-item__button-wrapper">
                  <Button
                    type="default"
                    className={classNames(
                      'product-item__button product-item__button--prices',
                      {
                        'layout-tile': layout === 'tile',
                      },
                    )}
                    onClick={e => {
                      e.stopPropagation();
                      onLinkClick();
                    }}
                  >
                    Смотреть предложения
                  </Button>
                </div>
              )}
              {permissions.addToOrderRequest && (
                <div className="product-item__button-wrapper">
                  <Button
                    type="primary"
                    className="product-item__button"
                    onClick={handleAddToOrderRequestButtonClick}
                  >
                    {!isInOrderRequest
                      ? 'Добавить в запрос'
                      : 'Удалить из запроса'}
                  </Button>
                </div>
              )}
              {permissions.addToEditRequest && (
                <div className="product-item__button-wrapper">
                  {!!router.query?.isSale ? (
                    <Button
                      type="primary"
                      className="product-item__button"
                      onClick={e => {
                        e.preventDefault();

                        router.push(
                          generateUrl(
                            {
                              history: DEFAULT_NAV_PATHS.ADD_SALE_PRODUCT,
                              sourceProductId: product.id,
                              isSale: null,
                            },
                            {
                              pathname: APP_PATHS.ADD_SALE_PRODUCT,
                              removeCurrentParams: true,
                            },
                          ),
                        );
                      }}
                    >
                      Добавить в распродажу
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      className="product-item__button"
                      onClick={e => {
                        e.preventDefault();
                        router.push(
                          generateUrl(
                            {
                              sourceProductId: product.id,
                              history: []
                                .concat(router.query.history as string[])
                                .concat([
                                  JSON.stringify([
                                    APP_PATHS.PRODUCT(product.id),
                                    product.name,
                                  ]),
                                  JSON.stringify([
                                    APP_PATHS.ADD_PRODUCT_OFFER,
                                    'Редактирование',
                                  ]),
                                ]),
                            },
                            {
                              pathname: APP_PATHS.ADD_PRODUCT_OFFER,
                            },
                          ),
                        );
                      }}
                    >
                      Редактировать
                    </Button>
                  )}
                </div>
              )}
              {permissions.edit && (
                <div className="product-item__button-wrapper">
                  <Button
                    type="primary"
                    className="product-item__button"
                    onClick={e => {
                      e.preventDefault();
                      router.push(
                        generateUrl(
                          {
                            history: []
                              .concat(router.query.history as string[])
                              .concat([
                                JSON.stringify([
                                  APP_PATHS.PRODUCT(product.id),
                                  product.name,
                                ]),
                                JSON.stringify([
                                  APP_PATHS.EDIT_PRODUCT(product.id),
                                  'Редактирование',
                                ]),
                              ]),
                          },
                          {
                            pathname: APP_PATHS.EDIT_PRODUCT(product.id),
                          },
                        ),
                      );
                    }}
                  >
                    Редактировать
                  </Button>
                </div>
              )}
            </Fragment>
          )}
        </div>
      </div>
    </li>
  );
};

export default ProductItem;
