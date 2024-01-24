import { InputNumber, Table } from 'components/common';
import { FC, RefObject } from 'react';
import { IOfferSelectedProduct } from 'store/reducers/offerProductSelection.reducer';
import {
  MessageOutlined,
  DownloadOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import OfferComplexInput from './OfferComplexInput';
import { generateInnerUrl } from 'utils/common.utils';
import { APP_PATHS } from 'data/paths.data';
import {
  calculateOrderCash,
  calculateProductSum,
  handleInputsFocusMove,
} from 'sections/Orders/utils';
import { InputRef } from 'antd';
import { IOrganization } from 'sections/Organizations/interfaces';
import { ISetState } from 'interfaces/common.interfaces';

interface IProps {
  products: IOfferSelectedProduct[];
  updateAllowed: boolean;
  isEditingMode: boolean;
  productsRefs: Array<{
    name: RefObject<InputRef>;
    manufacturer: RefObject<InputRef>;
    article: RefObject<InputRef>;
    unitPrice: RefObject<HTMLInputElement>;
    count: RefObject<HTMLInputElement>;
    deliveryQuantity: RefObject<HTMLInputElement>;
    deliveryTerm: RefObject<HTMLInputElement>;
  }>;
  selectedOrganization: IOrganization;
  handleProductUpdate: (product: IOfferSelectedProduct, i: number) => void;
  deleteOfferProduct: (index: number) => void;
  handleNewProductValueChange: (
    value: IOfferSelectedProduct['newProduct'],
    i: number,
  ) => void;
  setActiveProductIndex: ISetState<number>;
}

const RequestSellerTable: FC<IProps> = ({
  products,
  updateAllowed,
  isEditingMode,
  productsRefs,
  selectedOrganization,
  handleProductUpdate,
  deleteOfferProduct,
  handleNewProductValueChange,
  setActiveProductIndex,
}) => {
  return (
    <Table
      cols={[
        { content: '№', width: '4%' },
        { content: 'Наименование', width: '22%' },
        { content: 'Производитель', width: '11%' },
        { content: 'Артикул', width: '11%' },
        { content: 'Кол-во', width: '5%' },
        { content: 'Цена за ед, ₽', width: '10%' },
        { content: 'Кол-во в наличии', width: '7%' },
        {
          content: 'Под заказ',
          width: '7%',
          childrens: ['кол-во', 'срок, дн'],
        },
        { content: 'Сумма, ₽', width: '9%', highlightBorder: true },
        { content: 'CASH, ₽', width: '7%' },
      ]}
      rows={products.map((product, i) => ({
        cols: [
          {
            content: (
              <div
                style={{
                  position: 'relative',
                }}
              >
                {i + 1}
                {products.length > 1 &&
                  !product?.requestProductId &&
                  updateAllowed && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '50%',
                        right: '100%',
                        marginRight: 25,
                        transform: 'translateY(-50%)',
                        cursor: 'pointer',
                        color: '#aaa',
                      }}
                      onClick={() => deleteOfferProduct(i)}
                    >
                      <CloseOutlined />
                    </span>
                  )}
              </div>
            ),
          },
          {
            content: (
              <OfferComplexInput
                product={product}
                label="name"
                altLabel="altName"
                reserveLabel="reserveName"
                productUrl={
                  !!product?.product
                    ? generateInnerUrl(APP_PATHS.PRODUCT(product.product.id), {
                        text: product.product.name,
                      })
                    : null
                }
                isEditingMode={isEditingMode}
                inputRef={productsRefs[i].name}
                updateAllowed={updateAllowed}
                onUpdate={value =>
                  handleProductUpdate(
                    {
                      ...product,
                      altName: value,
                    },
                    i,
                  )
                }
                onNewProductUpdate={value =>
                  handleNewProductValueChange(
                    {
                      ...product.newProduct,
                      name: value,
                    },
                    i,
                  )
                }
                onFocusMove={e => {
                  handleInputsFocusMove({
                    e,
                    yIndex: i,
                    yLength: products.length,
                    inputName: 'name',
                    refs: productsRefs,
                  });
                }}
                startEditingProduct={() => setActiveProductIndex(i)}
              />
            ),
          },
          {
            content: (
              <OfferComplexInput
                product={product}
                label="manufacturer"
                altLabel="altManufacturer"
                reserveLabel="reserveManufacturer"
                isEditingMode={isEditingMode}
                inputRef={productsRefs[i].manufacturer}
                updateAllowed={updateAllowed}
                onUpdate={value =>
                  handleProductUpdate(
                    {
                      ...product,
                      altManufacturer: value,
                    },
                    i,
                  )
                }
                onNewProductUpdate={value =>
                  handleNewProductValueChange(
                    {
                      ...product.newProduct,
                      manufacturer: value,
                    },
                    i,
                  )
                }
                onFocusMove={e => {
                  handleInputsFocusMove({
                    e,
                    yIndex: i,
                    yLength: products.length,
                    inputName: 'manufacturer',
                    refs: productsRefs,
                  });
                }}
              />
            ),
          },
          {
            content: (
              <OfferComplexInput
                product={product}
                label="article"
                altLabel="altArticle"
                reserveLabel="reserveArticle"
                isEditingMode={isEditingMode}
                inputRef={productsRefs[i].article}
                updateAllowed={updateAllowed}
                onUpdate={value =>
                  handleProductUpdate(
                    {
                      ...product,
                      altArticle: value,
                    },
                    i,
                  )
                }
                onNewProductUpdate={value =>
                  handleNewProductValueChange(
                    {
                      ...product.newProduct,
                      article: value,
                    },
                    i,
                  )
                }
                onFocusMove={e => {
                  handleInputsFocusMove({
                    e,
                    yIndex: i,
                    yLength: products.length,
                    inputName: 'article',
                    refs: productsRefs,
                  });
                }}
              />
            ),
          },
          { content: product.quantity || '-' },
          {
            content: (
              <InputNumber
                value={product?.unitPrice || null}
                onChange={(value: number) =>
                  handleProductUpdate(
                    {
                      ...product,
                      unitPrice: value,
                    },
                    i,
                  )
                }
                inputRef={productsRefs[i].unitPrice}
                onKeyDown={e =>
                  handleInputsFocusMove({
                    e,
                    yIndex: i,
                    yLength: products.length,
                    inputName: 'unitPrice',
                    refs: productsRefs,
                  })
                }
                min={0}
                precision={2}
                size="small"
                textCenter
                colorPrimary
                placeholder="0"
              />
            ),
          },
          {
            content: (
              <InputNumber
                value={product?.count || null}
                onChange={(value: number) =>
                  handleProductUpdate(
                    {
                      ...product,
                      count: value,
                    },
                    i,
                  )
                }
                inputRef={productsRefs[i].count}
                onKeyDown={e =>
                  handleInputsFocusMove({
                    e,
                    yIndex: i,
                    yLength: products.length,
                    inputName: 'count',
                    refs: productsRefs,
                  })
                }
                min={0}
                precision={0}
                size="small"
                textCenter
                colorPrimary
                placeholder="0"
              />
            ),
          },
          {
            content: [
              <InputNumber
                value={product?.deliveryQuantity || null}
                onChange={(value: number) =>
                  handleProductUpdate(
                    {
                      ...product,
                      deliveryQuantity: value,
                    },
                    i,
                  )
                }
                inputRef={productsRefs[i].deliveryQuantity}
                onKeyDown={e =>
                  handleInputsFocusMove({
                    e,
                    yIndex: i,
                    yLength: products.length,
                    inputName: 'deliveryQuantity',
                    refs: productsRefs,
                  })
                }
                min={0}
                precision={0}
                size="small"
                textCenter
                colorPrimary
                placeholder="0"
              />,
              <InputNumber
                value={product?.deliveryTerm || null}
                onChange={(value: number) =>
                  handleProductUpdate(
                    {
                      ...product,
                      deliveryTerm: value,
                    },
                    i,
                  )
                }
                inputRef={productsRefs[i].deliveryTerm}
                onKeyDown={e =>
                  handleInputsFocusMove({
                    e,
                    yIndex: i,
                    yLength: products.length,
                    inputName: 'deliveryTerm',
                    refs: productsRefs,
                  })
                }
                min={0}
                precision={0}
                size="small"
                textCenter
                colorPrimary
                placeholder="0"
              />,
            ],
          },
          {
            content: (
              <span className="text-bold">
                {calculateProductSum(product).roundFraction().separateBy(' ')}
              </span>
            ),
          },
          {
            content: (
              <span className="text-bold">
                {selectedOrganization.priceBenefitPercent && (
                  <>
                    {(
                      calculateOrderCash(
                        calculateProductSum(product),
                        selectedOrganization?.priceBenefitPercent,
                        true,
                      ) || 0
                    )
                      .roundFraction()
                      .separateBy(' ')}{' '}
                  </>
                )}
              </span>
            ),
          },
        ],
      }))}
      className="mt-20"
    />
  );
};

export default RequestSellerTable;
