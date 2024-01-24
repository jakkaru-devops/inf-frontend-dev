import { Checkbox, Popover } from 'antd';
import {
  Container,
  KeyValueItem,
  Link,
  PageTopPanel,
  Table,
  InputNumber,
} from 'components/common';
import { ITableCol, ITableRow } from 'components/common/Table/interfaces';
import { Tooltip } from 'components/common/Tooltip';
import { InfoText } from './InfoText';
import {
  IOrder,
  IOrderRequest,
  IRequestProduct,
} from 'sections/Orders/interfaces';
import { useModalsState } from 'hooks/modal.hook';
import { CloseOutlined } from '@ant-design/icons';
import { IAddress, ISetState } from 'interfaces/common.interfaces';
import { APP_PATHS } from 'data/paths.data';
import { ITransportCompany } from 'sections/Shipping/interfaces';
import { generateInnerUrl, openNotification } from 'utils/common.utils';
import { FC, Fragment } from 'react';
import { IProduct } from 'sections/Catalog/interfaces/products.interfaces';

interface IProps {
  offer: IOrder;
  setOffer: (offerData: IOrder) => void;
  orderRequest: IOrderRequest;
  manipulationAvailable: boolean;
  selectedView: boolean;
  transportCompanies: ITransportCompany[];
  updateAwaiting: boolean;
  filterProductId: IProduct['id'];
  handlers: {
    handleChangeProducts: (props: {
      offerId: IOrder['id'];
      products?: {
        id: string;
        count: number;
        isSelected: boolean;
      }[];
      requestProduct?: {
        id: string;
        count: number;
        isSelected: boolean;
      };
    }) => void;
    handleTransportCompanyChange: (
      orderId: string,
      transportCompanyId: IOrder['transportCompanyId'] | 'pickup' | null,
    ) => void;
    setOrgBranch: ISetState<{
      address: IAddress;
      orgName: string;
    }>;
    fetchOffer: (offerId: IOrder['id']) => Promise<void>;
  };
}

export const OfferItem: FC<IProps> = ({
  offer,
  setOffer,
  orderRequest,
  manipulationAvailable,
  selectedView,
  transportCompanies,
  updateAwaiting,
  filterProductId,
  handlers: {
    handleChangeProducts,
    handleTransportCompanyChange,
    setOrgBranch,
    fetchOffer,
  },
}) => {
  const { Modal, openModal } = useModalsState();

  const selectedProductsCount = offer.products.filter(
    product => product.isSelected,
  ).length;
  const allProductsSelected =
    offer.products.filter(product => !product.isSelected).length === 0;
  const selectedTransportCompany = transportCompanies.find(
    ({ id }) => id === offer.transportCompanyId,
  );

  const calculateProductSum = (product: IRequestProduct) =>
    product.count * product.unitPrice;

  const calculateTotal = () =>
    offer.products
      .filter(({ isSelected }) => isSelected)
      .map(product => calculateProductSum(product))
      .filter(Boolean)
      .reduce((a, b) => a + b, 0);

  const calculateQuantity = () =>
    offer.products
      .filter(({ isSelected }) => isSelected)
      .map(({ count }) => count)
      .reduce((a, b) => a + b, 0);

  const calculateSellerQuantity = () =>
    offer.products
      .filter(({ isSelected }) => isSelected)
      .map(product => product.quantity)
      .filter(Boolean)
      .reduce((a, b) => a + b, 0);

  const cols: ITableCol[] = [
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
      width: '9%',
    },
    {
      content: 'Кол-во',
      width: '7%',
    },
    {
      content: 'Цена за ед, ₽',
      width: '9%',
    },
    {
      content: 'Кол-во в наличии',
      width: '7%',
    },
    {
      content: 'Под заказ',
      childrens: ['кол-во', 'срок, дн'],
      width: '7%',
    },
    {
      content: 'Сумма, ₽',
      width: '8%',
    },
    {
      content: 'Выбор',
      width: '6%',
    },
  ];

  const rows: ITableRow[] = offer.products
    .filter(({ isSelected }) => (selectedView ? isSelected : true))
    .map((product, i) => ({
      cols: [
        { content: i + 1 },
        {
          content: (
            <Fragment>
              <div>
                {!!product?.product ? (
                  <Link
                    href={generateInnerUrl(
                      APP_PATHS.PRODUCT(product.product.id),
                      {
                        text: product.product.name,
                      },
                    )}
                    className="color-black"
                  >
                    {product?.altName || product.product.name}
                  </Link>
                ) : (
                  product?.altName || product?.reserveName
                )}
              </div>
              {!!product?.altName && (
                <Popover
                  placement="right"
                  content={
                    <Fragment>
                      <div className="star-mark-overlay-title">Изменено</div>
                      <div className="star-mark-overlay-name">
                        {product?.product?.name || product?.reserveName}
                      </div>
                    </Fragment>
                  }
                  overlayClassName="star-mark-overlay"
                >
                  <img
                    src="/img/icons/star-mark.svg"
                    alt=""
                    className="star-mark"
                  />
                </Popover>
              )}
            </Fragment>
          ),
        },
        {
          content: (
            <Fragment>
              {product?.altManufacturer ||
                product?.product?.manufacturer ||
                product?.reserveManufacturer ||
                '-'}
              {!!product?.altManufacturer && (
                <Popover
                  placement="right"
                  content={
                    <Fragment>
                      <div className="star-mark-overlay-title">Изменено</div>
                      <div className="star-mark-overlay-name">
                        {product?.product?.manufacturer ||
                          product?.reserveManufacturer ||
                          '-'}
                      </div>
                    </Fragment>
                  }
                  overlayClassName="star-mark-overlay"
                >
                  <img
                    src="/img/icons/star-mark.svg"
                    alt=""
                    className="star-mark"
                  />
                </Popover>
              )}
            </Fragment>
          ),
        },
        {
          content: (
            <Fragment>
              {product?.altArticle ||
                product?.product?.article ||
                product?.reserveArticle}
              {!!product?.altArticle && (
                <Popover
                  placement="right"
                  content={
                    <Fragment>
                      <div className="star-mark-overlay-title">Изменено</div>
                      <div className="star-mark-overlay-name">
                        {product?.product?.article || product?.reserveArticle}
                      </div>
                    </Fragment>
                  }
                  overlayClassName="star-mark-overlay"
                >
                  <img
                    src="/img/icons/star-mark.svg"
                    alt=""
                    className="star-mark"
                  />
                </Popover>
              )}
            </Fragment>
          ),
        },
        {
          content: (
            <InputNumber
              value={product.count || 1}
              onChange={value => {
                handleChangeProducts({
                  offerId: offer.id,
                  requestProduct: {
                    id: product.id,
                    isSelected: product.isSelected,
                    count: value,
                  },
                });
              }}
              precision={0}
              min={1}
              max={
                (product?.quantity || 0) + (product?.deliveryQuantity || 0) || 1
              }
              keyboard={false}
              size="small"
              className="type-primary width-small show-controls text-center"
              placeholder="0"
            />
          ),
        },
        { content: product.unitPrice.roundFraction().separateBy(' ') },
        { content: product.quantity || '-' },
        {
          content: [
            product.deliveryQuantity || '-',
            product.deliveryTerm || '-',
          ],
        },
        {
          content: (product.count * product.unitPrice)
            .roundFraction()
            .separateBy(' '),
        },
        {
          content: !selectedView ? (
            <Checkbox
              checked={product.isSelected}
              onChange={e => {
                if (updateAwaiting) return;
                handleChangeProducts({
                  offerId: offer.id,
                  requestProduct: {
                    id: product.id,
                    count: product.count,
                    isSelected: e.target.checked,
                  },
                });
              }}
              disabled={!manipulationAvailable}
            />
          ) : (
            <CloseOutlined
              className="text_18 color-primary"
              onClick={() => {
                if (updateAwaiting) return;
                handleChangeProducts({
                  offerId: offer.id,
                  requestProduct: {
                    id: product.id,
                    count: product.count,
                    isSelected: false,
                  },
                });
              }}
            />
          ),
        },
      ],
    }));

  const subTableCols: ITableCol[] = [
    {
      content: 'Итого',
      width: '10%',
    },
    {
      content: `${calculateQuantity()}`,
      width: '7%',
    },
    {
      content: null,
      width: '9%',
    },
    {
      content: `${calculateSellerQuantity()}`,
      width: '7%',
    },
    {
      content: null,
      width: '7%',
    },
    {
      content: null,
      width: '7%',
    },
    {
      content: calculateTotal().roundFraction().separateBy(' '),
      width: '8%',
    },
    {
      content: !selectedView && (
        <span
          style={{ cursor: 'pointer' }}
          onClick={() =>
            manipulationAvailable &&
            !updateAwaiting &&
            handleChangeProducts({
              offerId: offer.id,
              products: offer.products.map(product => ({
                id: product.id,
                count: product.count,
                isSelected: !allProductsSelected,
              })),
            })
          }
          className="color-primary text-underline user-select-none"
        >
          {allProductsSelected ? 'Снять всё' : 'Выбрать все'}
        </span>
      ),
      width: '6%',
    },
  ];

  return (
    <div className="offers-page__item">
      <Modal
        offer={offer}
        orderRequest={orderRequest}
        updateAwaiting={updateAwaiting}
        handlers={{ handleTransportCompanyChange }}
      />

      <InfoText
        orderRequest={orderRequest}
        offer={offer}
        setOffer={setOffer}
        seller={offer.seller}
        setOrgBranch={setOrgBranch}
      />

      <Container
        className="d-flex justify-content-between bg-light-gray mb-20 pb-15 pt-15"
        verticalPadding
      >
        <span className="text_16">{offer.organization.name}</span>
        {!!filterProductId && (
          <a
            style={{
              textDecoration: 'underline',
              color: '#db0d0d',
              fontSize: '13px',
            }}
            onClick={() => fetchOffer(offer.id)}
          >
            Показать все предложение
          </a>
        )}
        <KeyValueItem
          keyText="Цены указаны"
          value={offer.organization.hasNds ? 'с НДС' : 'без НДС'}
        />
      </Container>

      <Table cols={cols} rows={rows} />

      <ul className="sub-table sub-table__last-selected">
        {subTableCols.map(({ content, width }, i) => (
          <li key={i} className="sub-table__item" style={{ width }}>
            {content}
          </li>
        ))}
      </ul>

      <PageTopPanel>
        <div
          style={{
            padding: '0 10px',
            display: 'flex',
          }}
        >
          {/*<span style={{ fontWeight: 800 }}>Доставка:</span>{' '}*/}
          <div
            style={{
              padding: '0 10px',
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <span style={{ cursor: 'pointer', display: 'flex' }}>
              {!!offer?.transportCompanyId &&
                offer.transportCompanyId !== 'pickup' &&
                !!selectedProductsCount && (
                  <span className="mr-10">
                    <Checkbox
                      disabled={!selectedProductsCount}
                      checked={true}
                      onChange={() => {
                        if (updateAwaiting || !selectedProductsCount) return;
                        handleTransportCompanyChange(offer.id, null);
                      }}
                    />
                  </span>
                )}
              <span className="mr-10">
                {offer.transportCompanyId !== 'pickup' &&
                  selectedTransportCompany &&
                  !!selectedProductsCount &&
                  selectedTransportCompany.name}
              </span>
              <span
                className="color-primary text-underline"
                onClick={() =>
                  manipulationAvailable && openModal('transportCompanies')
                }
              >
                {!offer.transportCompanyId ||
                offer.transportCompanyId === 'pickup' ||
                !selectedProductsCount
                  ? 'выбрать транспортную компанию'
                  : 'посмотреть все предложения'}
              </span>
            </span>
            <div
              style={{ display: 'flex' }}
              onClick={e => {
                if (!selectedProductsCount) {
                  e.preventDefault();
                  openNotification('Сначала выберите товар из предложения');
                }
              }}
            >
              <Checkbox
                checked={offer.isPickup && !!selectedProductsCount}
                onChange={e => {
                  if (updateAwaiting) return;
                  handleTransportCompanyChange(
                    offer.id,
                    e.target.checked ? 'pickup' : null,
                  );
                }}
                disabled={!manipulationAvailable || !selectedProductsCount}
              >
                Самовывоз
              </Checkbox>
            </div>
          </div>
        </div>
      </PageTopPanel>

      <span className="offers-page__item__sub-info">
        <Tooltip
          title="*стоимость и сроки доставки ориентировочные"
          message="Окончательная стоимость услуг будет уточнена по результатам взвешиванияи обмера груза при приемке на склад."
        />
      </span>
    </div>
  );
};
