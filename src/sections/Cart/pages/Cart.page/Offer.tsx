import { Checkbox } from 'antd';
import classNames from 'classnames';
import {
  InputNumber,
  KeyValueItem,
  Link,
  PageTopPanel,
  RateString,
  Table,
} from 'components/common';
import { ITableCol } from 'components/common/Table/interfaces';
import { convertAddressToString } from 'components/common/YandexMap/utils';
import { APP_PATHS } from 'data/paths.data';
import { useCart } from 'hooks/cart.hook';
import { useProductHandlers } from 'hooks/productHandlers.hook';
import { IAddress } from 'interfaces/common.interfaces';
import { FC, Fragment, useState } from 'react';
import { ICartProduct } from 'sections/Cart/interfaces/interfaces';
import { ICartOffer } from 'sections/Cart/interfaces/cart.interfaces';
import { IProduct } from 'sections/Catalog/interfaces/products.interfaces';
import TransportCompaniesModal from 'sections/Orders/components/TransportCompaniesModal';
import { ITransportCompany } from 'sections/Shipping/interfaces';
import {
  formatPrice,
  generateInnerUrl,
  openNotification,
} from 'utils/common.utils';
import RequestPaymentPostponeModal from './RequestPaymentPostponeModal';
import { useRouter } from 'next/router';
import { IJuristicSubject } from 'sections/JuristicSubject/interfaces';
import RequestPaymentPostponeModalCustomer from 'sections/Orders/components/PostponedPaymentModalCustomer';

interface IProps {
  offer: ICartOffer;
  setOffer: (offer: ICartOffer) => void;
  offerIndex: number;
  updateCartProduct: (
    cartProduct: ICartProduct,
    params: {
      productIndexInCart: number;
      productIndexInOffer: number;
      offerIndex: number;
      preventServerUpdate?: boolean;
    },
  ) => void;
  updateCartOffer: (
    offer: ICartOffer,
    data: { deliveryMethod: string },
  ) => Promise<void>;
  deleteCartProduct: (
    cartProduct: ICartProduct,
    indexes: {
      productIndexInCart: number;
      productIndexInOffer: number;
      offerIndex: number;
    },
  ) => void;
  updateAwaiting: boolean;
  transportCompanies: ITransportCompany[];
  deliveryAddress: IAddress;
  customerOrganizations: IJuristicSubject[];
}

const CartOffer: FC<IProps> = ({
  offer,
  setOffer,
  offerIndex,
  updateCartProduct,
  updateCartOffer,
  deleteCartProduct,
  updateAwaiting,
  transportCompanies,
  deliveryAddress,
  customerOrganizations,
}) => {
  const cart = useCart();
  const { indexInCartProducts } = useProductHandlers();
  const [transportCompaniesModalOpen, setTransportCompaniesModalOpen] =
    useState(false);
  const [paymentPostponeOpen, setPaymentPostponeOpen] = useState(false);

  const totalSelectedQuantity = offer.products
    .map(product => product.quantity)
    .reduce((a, b) => a + b, 0);
  const totalAvailabledQuantity = offer.products
    .map(product => product.availabledAmount)
    .reduce((a, b) => a + b, 0);
  const totalPrice = offer.products
    .map(product => product.quantity * product.unitPrice)
    .reduce((a, b) => a + b, 0);
  const selectedProductsCount = offer.products.filter(
    product => product.isSelected,
  ).length;
  const allProductsSelected = offer.products.length === selectedProductsCount;
  const selectedTransportCompany = transportCompanies.find(
    ({ id }) => id === offer.deliveryMethod,
  );

  const updateCartProductQuantity = (
    priceOfferId: number,
    product: IProduct,
    value: number,
    productIndex: number,
  ) => {
    const indexInCart = indexInCartProducts(product, {
      priceOfferId,
    });
    updateCartProduct(
      {
        ...cart.products[indexInCart],
        quantity: value,
      },
      {
        productIndexInCart: indexInCart,
        productIndexInOffer: productIndex,
        offerIndex,
      },
    );
  };

  const updateCartProductIsSelected = (
    priceOfferId: number,
    product: IProduct,
    value: boolean,
    productIndex: number,
  ) => {
    const indexInCart = indexInCartProducts(product, {
      priceOfferId,
    });
    updateCartProduct(
      {
        ...cart.products[indexInCart],
        isSelected: value,
      },
      {
        productIndexInCart: indexInCart,
        productIndexInOffer: productIndex,
        offerIndex,
      },
    );
  };

  const updateDeliveryMethod = async (value: string) => {
    if (updateAwaiting) return;

    await updateCartOffer(offer, { deliveryMethod: value }).then(() => {
      for (let i = 0; i < offer.products.length; i++) {
        const product = offer.products[i];
        const indexInCart = indexInCartProducts(product.product, {
          priceOfferId: product.priceOfferId,
        });
        const cartProductData = cart.products[indexInCart];
        updateCartProduct(
          {
            ...cartProductData,
            deliveryMethod: value,
            isSelected: cartProductData.isSelected,
          },
          {
            productIndexInCart: indexInCart,
            productIndexInOffer: i,
            offerIndex,
            preventServerUpdate: true,
          },
        );
      }
    });
  };

  const deleteProduct = (
    priceOfferId: number,
    product: IProduct,
    productIndex: number,
  ) => {
    if (updateAwaiting) return;
    const indexInCart = indexInCartProducts(product, {
      priceOfferId,
    });
    deleteCartProduct(cart.products[indexInCart], {
      productIndexInCart: indexInCart,
      productIndexInOffer: productIndex,
      offerIndex,
    });
  };

  const subTableCols: ITableCol[] = [
    {
      content: 'Итого',
    },
    {
      content: totalSelectedQuantity.separateBy(' '),
      width: '7%',
    },
    {
      content: totalAvailabledQuantity.separateBy(' '),
      width: '9%',
    },
    {
      content: null,
      width: '9%',
    },
    {
      content: totalPrice.roundFraction().separateBy(' ') + ' ₽',
      width: '10%',
    },
    {
      content: null,
      width: '8%',
      highlightBorder: true,
    },
    {
      content: (
        <span
          style={{ cursor: 'pointer' }}
          onClick={() => {
            if (updateAwaiting) return;
            for (let i = 0; i < offer.products.length; i++) {
              const product = offer.products[i];
              updateCartProductIsSelected(
                product.priceOfferId,
                product.product,
                !allProductsSelected,
                i,
              );
            }
          }}
          className="color-primary text-underline user-select-none"
        >
          {allProductsSelected ? 'Снять всё' : 'Выбрать все'}
        </span>
      ),
      width: '7%',
    },
  ];

  const openPaymentPostponeModal = () => {
    if (
      !!offer?.postponedPayment &&
      (offer.postponedPayment.status === 'REJECTED' ||
        offer.postponedPayment.isClosed)
    )
      return;

    setPaymentPostponeOpen(true);
  };

  return (
    <div className="mb-40">
      <div className="d-flex justify-content-between mb-20">
        <div>
          <KeyValueItem
            keyText="Продавец"
            value={
              <span className="d-flex">
                <Link
                  href={generateInnerUrl(APP_PATHS.SELLER(offer.seller.id), {
                    text: offer.seller.fullName,
                  })}
                  className="mr-10 text-underline"
                >
                  {offer.seller.fullName}
                </Link>
                <Link
                  href={generateInnerUrl(
                    APP_PATHS.SELLER_REVIEWS(offer.seller.id),
                    {
                      text: offer.seller.fullName,
                      searchParams: {
                        tab: 'reviews',
                      },
                    },
                  )}
                >
                  <RateString
                    color={'#FFB800'}
                    emptyColor={'#c4c4c4'}
                    rate={(offer.seller.ratingValue || 0).gaussRound(1)}
                    max={5}
                    size={20}
                  />
                </Link>

                <KeyValueItem
                  keyText="Отзывы"
                  value={offer.seller.reviewsNumber}
                  keyClassName="text-normal"
                  className="ml-10"
                />
                <KeyValueItem
                  keyText="Продаж"
                  value={offer.seller.salesNumber || 0}
                  keyClassName="text-normal"
                  className="ml-10"
                />
              </span>
            }
          />
          <KeyValueItem
            keyText="Адрес поставщика"
            value={convertAddressToString(offer.organization.address)}
          />
        </div>
        <div style={{ maxWidth: '45%' }}>
          <KeyValueItem
            keyText="Адрес доставки"
            value={convertAddressToString(deliveryAddress) || '-'}
            className="text-right"
            valueStyle={{ display: 'inline' }}
          />
        </div>
      </div>

      <div className="bg-light-gray pb-10 pt-10 pl-15 pr-15 mb-5">
        <div className="d-flex justify-content-between">
          <div>
            <div className="text_16">{offer.organization.name}</div>
            <div
              className="color-primary text-underline cursor-pointer"
              onClick={openPaymentPostponeModal}
            >
              {!offer?.postponedPayment ? (
                'Нужна отсрочка платежа при работе с данным поставщиком?'
              ) : (
                <Fragment>
                  {offer.postponedPayment.status === 'PENDING' &&
                    `Запрошена отсрочка оплаты ${offer.postponedPayment.daysRequested} дней, ожидание согласования продавцом`}
                  {offer.postponedPayment.status === 'APPROVED' &&
                    `Согласована отсрочка оплаты до ${offer.postponedPayment.daysApproved} дней` +
                      (!!offer.postponedPayment?.maxSum
                        ? `, максимальная сумма до ${formatPrice(
                            offer.postponedPayment?.maxSum,
                          )} руб.`
                        : '')}
                  {offer.postponedPayment.status === 'REJECTED' &&
                    'Работа в отсрочку с данным продавцом невозможна'}
                </Fragment>
              )}
            </div>
          </div>

          <KeyValueItem
            keyText="Цены указаны"
            value={offer.organization.hasNds ? 'с НДС' : 'без НДС'}
          />
        </div>
      </div>

      <Table
        cols={[
          { content: '№', width: '5%' },
          {
            content: 'Наименование',
            width: '24%',
          },
          {
            content: 'Производитель',
            width: '11%',
          },
          {
            content: 'Артикул',
            width: '10%',
          },
          {
            content: 'Кол-во',
            width: '7%',
          },
          {
            content: (
              <span>
                Кол-во
                <br />у продавца
              </span>
            ),
            width: '9%',
          },
          {
            content: 'Цена за ед.',
            width: '9%',
          },
          {
            content: 'Сумма',
            width: '10%',
          },
          {
            content: (
              <span>
                Срок
                <br />
                под заказ
              </span>
            ),
            width: '8%',
            highlightBorder: true,
          },
          {
            content: 'Выбор',
            width: '7%',
          },
        ]}
        rows={offer.products.map((product, i) => ({
          cols: [
            { content: i + 1 },
            {
              content: (
                <Link
                  href={generateInnerUrl(
                    !!product?.sale
                      ? APP_PATHS.SALE_PRODUCT(product.sale.id)
                      : APP_PATHS.PRODUCT(product.product.id),
                    {
                      text: product.product.name,
                    },
                  )}
                  className="color-black"
                  style={{
                    display: 'inline',
                  }}
                >
                  {product.product.name}
                </Link>
              ),
            },
            { content: product.product?.manufacturer || '-' },
            { content: product.product.article },
            {
              content: (
                <InputNumber
                  value={product.quantity || 1}
                  onChange={value => {
                    if (updateAwaiting) return;
                    updateCartProductQuantity(
                      product.priceOfferId,
                      product.product,
                      value,
                      i,
                    );
                  }}
                  precision={0}
                  min={1}
                  max={product.availabledAmount}
                  keyboard={false}
                  size="small"
                  className="type-primary width-small show-controls text-center"
                  placeholder="0"
                />
              ),
            },
            { content: product.availabledAmount.separateBy(' ') },
            {
              content: product.unitPrice.roundFraction().separateBy(' ') + ' ₽',
            },
            {
              content:
                (product.quantity * product.unitPrice)
                  .roundFraction()
                  .separateBy(' ') + ' ₽',
            },
            { content: '-' },
            {
              content: (
                <div
                  className="d-flex"
                  style={{ width: '100%', height: '100%' }}
                >
                  <div
                    className="checkbox-wrapper d-flex justify-content-center align-items-center"
                    style={{
                      width: '50%',
                      height: '100%',
                      borderRight: '1px solid #767676',
                    }}
                  >
                    <Checkbox
                      checked={product.isSelected}
                      onChange={e => {
                        if (updateAwaiting) return;
                        updateCartProductIsSelected(
                          product.priceOfferId,
                          product.product,
                          e.target.checked,
                          i,
                        );
                      }}
                    />
                  </div>
                  <div
                    style={{ width: '50%', height: '100%' }}
                    className="d-flex justify-content-center align-items-center"
                  >
                    <button
                      className="no-bg no-border d-flex align-items-center cursor-pointer"
                      onClick={() =>
                        deleteProduct(product.priceOfferId, product.product, i)
                      }
                    >
                      <img
                        src="/img/close.svg"
                        alt="close"
                        className="svg tableInf__delteIcon"
                      />
                    </button>
                  </div>
                </div>
              ),
              style: {
                padding: 0,
              },
            },
          ],
        }))}
      />
      <ul className="sub-table">
        {subTableCols.map(({ content, width, highlightBorder }, i) => (
          <li
            key={i}
            className={classNames('sub-table__item', {
              'border-highlighted': highlightBorder,
            })}
            style={{ width }}
          >
            {content}
          </li>
        ))}
      </ul>

      <PageTopPanel>
        <div
          style={{
            padding: '0 10px',
            display: 'flex',
            fontSize: 14,
          }}
        >
          <div
            style={{
              padding: '0 10px',
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <span style={{ cursor: 'pointer', display: 'flex' }}>
              <span className="mr-10">Доставка:</span>
              {!!offer?.deliveryMethod &&
                offer.deliveryMethod !== 'pickup' &&
                !!selectedProductsCount && (
                  <span className="mr-10">
                    <Checkbox
                      disabled={!selectedProductsCount}
                      checked={true}
                      onChange={() => {
                        if (updateAwaiting || !selectedProductsCount) return;
                        updateDeliveryMethod(null);
                      }}
                    />
                  </span>
                )}
              {selectedTransportCompany && !!selectedProductsCount && (
                <span className="mr-10">{selectedTransportCompany.name}</span>
              )}
              <span
                className="color-primary text-underline"
                onClick={() => setTransportCompaniesModalOpen(true)}
              >
                {offer.deliveryMethod === 'pickup' || !selectedProductsCount
                  ? 'выбрать транспортную компанию'
                  : 'посмотреть все предложения'}
              </span>
            </span>
            <div
              style={{ display: 'flex' }}
              onClick={e => {
                if (!selectedProductsCount) {
                  e.preventDefault();
                  openNotification('Сначала выберите товар');
                }
              }}
            >
              <Checkbox
                checked={
                  offer.deliveryMethod === 'pickup' && !!selectedProductsCount
                }
                onChange={e => {
                  if (updateAwaiting) return;
                  updateDeliveryMethod(e.target.checked ? 'pickup' : null);
                }}
                disabled={!selectedProductsCount}
              >
                Самовывоз
              </Checkbox>
            </div>
          </div>
        </div>
      </PageTopPanel>

      <TransportCompaniesModal
        open={transportCompaniesModalOpen}
        onClose={() => setTransportCompaniesModalOpen(false)}
        companiesProps={{
          companies: transportCompanies,
          selectedCompanies: [offer.deliveryMethod],
          disabled: !selectedProductsCount,
          onChange: (companyId, checked) =>
            updateDeliveryMethod(checked ? companyId : null),
        }}
      />
      {!!offer?.postponedPayment ? (
        <RequestPaymentPostponeModalCustomer
          open={!!paymentPostponeOpen}
          onClose={() => setPaymentPostponeOpen(false)}
          postponedPayment={offer.postponedPayment}
          onSubmit={() => {
            setOffer({
              ...offer,
              postponedPayment: null,
            });
            setPaymentPostponeOpen(false);
          }}
        />
      ) : (
        <RequestPaymentPostponeModal
          open={paymentPostponeOpen}
          onClose={() => setPaymentPostponeOpen(false)}
          offer={offer}
          customerOrganizations={customerOrganizations}
          onSubmit={postponedPayment => {
            setOffer({
              ...offer,
              postponedPayment,
            });
            setPaymentPostponeOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default CartOffer;
