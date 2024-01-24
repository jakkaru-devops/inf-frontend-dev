import { Preloader, Table } from 'components/common';
import { ISetState } from 'interfaces/common.interfaces';
import { FC, Fragment, useEffect, useState } from 'react';
import catalogService from 'sections/Catalog/catalog.service';
import {
  IProduct,
  IProductPriceOfferGroup,
} from 'sections/Catalog/interfaces/products.interfaces';
import { formatPrice, openNotification } from 'utils/common.utils';
import { ITableCol, ITableRow } from 'components/common/Table/interfaces';
import { useAuth } from 'hooks/auth.hook';
import ProductPriceItemControls from './ItemControls';
import { updateUserCartProduct } from 'services/updateUserCartProduct.service';
import { useProductHandlers } from 'hooks/productHandlers.hook';
import { useCart } from 'hooks/cart.hook';
import { useDispatch } from 'react-redux';

interface IProps {
  product: IProduct;
  priceOfferGroups: IProductPriceOfferGroup[];
  setPriceOfferGroups: ISetState<IProps['priceOfferGroups']>;
}

const ProductPrices: FC<IProps> = ({
  product,
  priceOfferGroups,
  setPriceOfferGroups,
}) => {
  const auth = useAuth();
  const cart = useCart();
  const dispatch = useDispatch();
  const [dataLoaded, setDataLoaded] = useState(false);
  const [stateCounter, setStateCounter] = useState(0);
  const manipulationAvailable =
    !auth.isAuthenticated || auth.currentRole.label === 'customer';
  const { indexInCartProducts } = useProductHandlers();

  const fetchData = async () => {
    const res = await catalogService.getProductsPrices({
      productId: product.id,
    });
    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }

    const groups = res.data;
    for (const group of groups) {
      for (const priceOffer of group.children) {
        const indexInCart = indexInCartProducts(product, {
          priceOfferId: priceOffer.id,
        });
        if (indexInCart === -1) continue;
        priceOffer.quantity = cart.products[indexInCart]?.quantity;
      }
    }

    setPriceOfferGroups(groups);
    setDataLoaded(true);
  };

  useEffect(() => {
    fetchData();
  }, [product.id]);

  const updateQuantity = async (
    groupIndex: number,
    itemIndex: number,
    value: number,
  ) => {
    if (
      value < 1 ||
      value > priceOfferGroups[groupIndex].children[itemIndex].productAmount
    )
      return;

    const priceOffer = priceOfferGroups[groupIndex].children[itemIndex];
    priceOffer.quantity = value;
    setPriceOfferGroups([...priceOfferGroups]);

    const indexInCart = indexInCartProducts(product, {
      priceOfferId: priceOffer.id,
    });
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

    setStateCounter(prev => prev + 1);
  };

  const toggleGroupExpanded = (index: number) => {
    priceOfferGroups[index].isExpanded = !priceOfferGroups[index].isExpanded;
    setPriceOfferGroups([...priceOfferGroups]);
    setStateCounter(prev => prev + 1);
  };

  if (!dataLoaded)
    return (
      <div>
        <Preloader />
      </div>
    );

  return (
    <div className="product-prices">
      <Table
        cols={[
          {
            content: 'Поставщик',
            width: '27%',
          },
          {
            content: 'Наименование',
            width: '25%',
          },
          { content: 'Склад', width: '10%' },
          { content: 'Цена за шт., ₽', width: '13%' },
          manipulationAvailable && { content: 'Действия', width: '25%' },
        ].filter(Boolean)}
        rows={priceOfferGroups.map((group, groupIndex) => ({
          cols: [
            {
              content: (
                <div className="product-prices__organization">
                  <div>{group.organization.name}</div>
                  <div className="product-prices__organization-inn">
                    ИНН: {group.organization.inn}
                  </div>
                </div>
              ),
            },
            {
              content:
                group.productName +
                (group.children.length === 1 &&
                !!group.children[0]?.manufacturer
                  ? ` (${group.children[0].manufacturer})`
                  : ''),
            },
            {
              content: (
                <div className="product-prices__organization">
                  <div>{group.children?.[0]?.address?.settlement}</div>
                  <div className="product-prices__organization-inn">
                    {group.productAmount.separateBy(' ')} шт.
                  </div>
                </div>
              ),
            },
            {
              content: (
                <div className="d-flex justify-content-center">
                  {group.children.length >= 2
                    ? `От ${formatPrice(group.minPrice)} руб.`
                    : `${formatPrice(group.minPrice)} руб.`}
                </div>
              ),
            },
            manipulationAvailable && {
              content: (
                <Fragment>
                  {group.children.length === 1 ? (
                    <ProductPriceItemControls
                      product={product}
                      priceOffer={group.children[0]}
                      manipulationAvailable={manipulationAvailable}
                      groupIndex={groupIndex}
                      itemIndex={0}
                      updateQuantity={updateQuantity}
                    />
                  ) : (
                    <div
                      className="color-primary cursor-pointer user-select-none justify-content-end "
                      onClick={() => toggleGroupExpanded(groupIndex)}
                    >
                      {!group.isExpanded ? 'Посмотреть цены' : 'Свернуть'}
                      <span className="ml-10">
                        <svg
                          width="14"
                          height="8"
                          viewBox="0 0 14 8"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{
                            transition: '.3s',
                            transform: !group.isExpanded
                              ? 'none'
                              : 'rotate(180deg)',
                          }}
                        >
                          <path
                            d="M1 1L7 6L13 1"
                            stroke="#E5332A"
                            strokeWidth="2"
                          />
                        </svg>
                      </span>
                    </div>
                  )}
                </Fragment>
              ),
            },
          ].filter(Boolean),
          childContent: group?.isExpanded ? (
            <Table
              cols={
                [
                  {
                    content: (
                      <div
                        className="d-flex"
                        style={{ minHeight: 50, height: '100%' }}
                      >
                        <span
                          style={{
                            width: '52%',
                            borderRight: '1px solid #e5e5e5',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: 5,
                          }}
                        >
                          Наименование
                        </span>
                        <span
                          style={{
                            width: '48%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: 5,
                          }}
                        >
                          Производитель
                        </span>
                      </div>
                    ),
                    width: '52%',
                    style: {
                      padding: 0,
                    },
                  },
                  { content: 'Остаток, шт', width: '10%' },
                  {
                    content: 'Цена за шт., ₽',
                    width: '13%',
                  },
                  manipulationAvailable && { content: '', width: '25%' },
                ].filter(Boolean) as ITableCol[]
              }
              rows={group.children.map(
                (item, itemIndex): ITableRow => ({
                  cols: [
                    !!item?.manufacturer
                      ? {
                          content: (
                            <div
                              className="d-flex"
                              style={{
                                minHeight: 50,
                                width: '100%',
                                height: '100%',
                              }}
                            >
                              <span
                                style={{
                                  width: '52%',
                                  borderRight: '1px solid #e5e5e5',
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  padding: 5,
                                }}
                              >
                                {item.productName}
                              </span>
                              <span
                                style={{
                                  width: '48%',
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  padding: 5,
                                }}
                              >
                                {item.manufacturer || '-'}
                              </span>
                            </div>
                          ),
                          width: '52%',
                          style: {
                            padding: 0,
                          },
                        }
                      : { content: item.productName },
                    { content: item.productAmount },
                    {
                      content: !!item?.previousPrice ? (
                        <div>
                          <div className="product-prices__previous-price">
                            {formatPrice(item.previousPrice)} руб.
                          </div>
                          <div className="product-prices__sale-price">
                            {formatPrice(item.price)} руб.
                          </div>
                        </div>
                      ) : (
                        `${formatPrice(item.price)} руб.`
                      ),
                    },
                    manipulationAvailable && {
                      content: (
                        <ProductPriceItemControls
                          product={product}
                          priceOffer={item}
                          manipulationAvailable={manipulationAvailable}
                          groupIndex={groupIndex}
                          itemIndex={itemIndex}
                          updateQuantity={updateQuantity}
                        />
                      ),
                    },
                  ].filter(Boolean) as ITableCol[],
                }),
              )}
              style={
                groupIndex < priceOfferGroups.length - 1
                  ? {
                      borderBottom: '1px solid #767676',
                    }
                  : null
              }
            />
          ) : null,
        }))}
      />
    </div>
  );
};

export default ProductPrices;
