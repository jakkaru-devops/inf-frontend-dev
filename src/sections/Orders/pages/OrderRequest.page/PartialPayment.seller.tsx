import { Button, Select, Input, Modal, Popover } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import formatDate from 'date-fns/format';
import { APP_PATHS } from 'data/paths.data';
import { calculateOrderCash, handleInputsFocusMove } from './../../utils';
import { convertAddressToString } from 'components/common/YandexMap/utils';
import { getUserName } from 'sections/Users/utils';
import { IOrderRequest, IRequestProduct } from 'sections/Orders/interfaces';
import { IOrganization } from 'sections/Organizations/interfaces';
import { ITableRow } from 'components/common/Table/interfaces';
import {
  KeyValueItem,
  Table,
  Container,
  PageContent,
  Summary,
  Link,
  InputNumber,
} from 'components/common';
import { useHandlers } from './handlers/partialPayment.seller.handlers';
import { FC, Fragment, SetStateAction, useState } from 'react';
import { startChatWithUser } from 'components/complex/Messenger/utils/messenger.utils';
import { generateInnerUrl, renderHtml } from 'utils/common.utils';
import OrderAttachmentListExtendable from 'sections/Orders/components/OrderAttachmentListExtendable';
import OrderAttachmentListModal from 'sections/Orders/components/OrderAttachmentListModal';

interface IProps {
  orderRequest: IOrderRequest;
  setOrderRequest: (value: IOrderRequest) => void;
  organizations: IOrganization[];
  setAddressModalVisible: (value: SetStateAction<boolean>) => void;
}

const OrderRequestPartialPaymentContentSeller: FC<IProps> = ({
  orderRequest,
  setOrderRequest,
  organizations,
  setAddressModalVisible,
}) => {
  const {
    auth,
    router,
    offer,
    isAlreadySuggested,
    requestProductList,
    selectedOrganization,
    isEditingMode,
    deleteProductId,
    setDeleteProductId,
    altProducts,
    attachmentsModalOpen,
    setAttachmentsModalOpen,
    enableEditingMode,
    disableEditingMode,
    handleAltInputChange,
    refs,
    describedProducts,
    productDeletionAllowed,
    setIsEditingMode,
    changeOrganization,
    changeProductCount,
    changeProductUnitPrice,
    changeProductDeliveryQuantity,
    changeProductDeliveryTerm,
    updateOrder,
    deleteProduct,
  } = useHandlers({
    orderRequest,
    setOrderRequest,
    organizations,
  });

  const productsWithIds = orderRequest.products.filter(
    ({ productId }) => productId,
  );
  const [attachments, setAttachments] = useState([
    ...orderRequest.attachments.filter(
      ({ orderId }) => !orderId || orderId === offer?.id,
    ),
    ...describedProducts.flatMap(
      ({ describedProduct: { attachments } }) => attachments,
    ),
  ]);

  const calculateSum = (product: IRequestProduct) => {
    return (
      Math.min(
        (product.quantity || 0) + (product.deliveryQuantity || 0),
        product.count,
      ) * product.unitPrice
    );
  };

  const calculateTotal = () =>
    offer.products
      .map(product => calculateSum(product))
      .filter(Boolean)
      .reduce((a, b) => a + b, 0);

  const calculateTotalCash = () =>
    offer.products
      .map(
        product =>
          calculateOrderCash(
            calculateSum(product),
            selectedOrganization?.priceBenefitPercent,
            true,
          ) || 0,
      )
      .filter(Boolean)
      .reduce((a, b) => a + b, 0);

  const rows: ITableRow[] = offer.products
    .filter(product => product?.isSelected)
    .map((product, i) => {
      const altProduct = altProducts[i];
      return {
        cols: [
          { content: i + 1 },
          {
            content: !isEditingMode ? (
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
                      {product?.altName || product?.product?.name}
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
            ) : (
              <Input
                value={altProduct?.altName}
                onChange={e =>
                  handleAltInputChange(e.target.value, i, 'altName')
                }
                ref={refs[i].altName}
                onKeyDown={e =>
                  handleInputsFocusMove({
                    e,
                    yIndex: i,
                    yLength: requestProductList.length,
                    inputName: 'name',
                    refs,
                  })
                }
                size="small"
                className="type-primary text-center"
              />
            ),
          },
          {
            content: !isEditingMode ? (
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
            ) : (
              <Input
                value={altProduct?.altManufacturer}
                onChange={e =>
                  handleAltInputChange(e.target.value, i, 'altManufacturer')
                }
                ref={refs[i].altManufacturer}
                onKeyDown={e =>
                  handleInputsFocusMove({
                    e,
                    yIndex: i,
                    yLength: requestProductList.length,
                    inputName: 'manufacturer',
                    refs,
                  })
                }
                size="small"
                className="type-primary text-center"
              />
            ),
          },
          {
            content: !isEditingMode ? (
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
            ) : (
              <Input
                value={altProduct?.altArticle}
                onChange={e =>
                  handleAltInputChange(e.target.value, i, 'altArticle')
                }
                ref={refs[i].altArticle}
                onKeyDown={e =>
                  handleInputsFocusMove({
                    e,
                    yIndex: i,
                    yLength: requestProductList.length,
                    inputName: 'article',
                    refs,
                  })
                }
                size="small"
                className="type-primary text-center"
              />
            ),
          },
          {
            content: product?.count || '-',
          },
          {
            content: !isEditingMode ? (
              product.unitPrice.roundFraction().separateBy(' ')
            ) : (
              <InputNumber
                value={product?.unitPrice || null}
                onChange={(value: number) =>
                  changeProductUnitPrice(product, i, value)
                }
                inputRef={refs[i].unitPrice}
                onKeyDown={e =>
                  handleInputsFocusMove({
                    e,
                    yIndex: i,
                    yLength: requestProductList.length,
                    inputName: 'unitPrice',
                    refs,
                  })
                }
                min={0}
                precision={2}
                size="small"
                className="type-primary text-center"
                placeholder="0"
              />
            ),
          },
          {
            content: !isEditingMode ? (
              product.quantity || '-'
            ) : (
              <InputNumber
                value={product?.quantity || null}
                onChange={(value: number) =>
                  changeProductCount(product, i, value)
                }
                inputRef={refs[i].count}
                onKeyDown={e =>
                  handleInputsFocusMove({
                    e,
                    yIndex: i,
                    yLength: requestProductList.length,
                    inputName: 'count',
                    refs,
                  })
                }
                min={0}
                precision={0}
                size="small"
                className="type-primary text-center"
                placeholder="0"
              />
            ),
          },
          {
            content: [
              !isEditingMode ? (
                product?.deliveryQuantity || '-'
              ) : (
                <InputNumber
                  value={product?.deliveryQuantity || null}
                  onChange={(value: number) =>
                    changeProductDeliveryQuantity(product, i, value)
                  }
                  inputRef={refs[i].deliveryQuantity}
                  onKeyDown={e =>
                    handleInputsFocusMove({
                      e,
                      yIndex: i,
                      yLength: requestProductList.length,
                      inputName: 'deliveryQuantity',
                      refs,
                    })
                  }
                  min={0}
                  precision={0}
                  size="small"
                  className="type-primary text-center"
                  placeholder="0"
                />
              ),
              !isEditingMode ? (
                product?.deliveryTerm || ''
              ) : (
                <InputNumber
                  value={product?.deliveryTerm || null}
                  onChange={(value: number) =>
                    changeProductDeliveryTerm(product, i, value)
                  }
                  inputRef={refs[i].deliveryTerm}
                  onKeyDown={e =>
                    handleInputsFocusMove({
                      e,
                      yIndex: i,
                      yLength: requestProductList.length,
                      inputName: 'deliveryTerm',
                      refs,
                    })
                  }
                  min={0}
                  precision={0}
                  size="small"
                  className="type-primary text-center"
                  placeholder="0"
                />
              ),
            ],
          },
          {
            content: calculateSum(product).roundFraction().separateBy(' '),
          },
          {
            content: (
              <span className="text-bold">
                {(
                  calculateOrderCash(
                    calculateSum(product),
                    selectedOrganization?.priceBenefitPercent,
                    true,
                  ) || 0
                )
                  .roundFraction()
                  .separateBy(' ')}{' '}
              </span>
            ),
          },
        ],
      };
    });

  return (
    <Fragment>
      <PageContent className="h-100-flex">
        <div className="d-flex justify-content-between">
          <div>
            <KeyValueItem
              keyText="Дата запроса"
              value={formatDate(
                new Date(orderRequest.createdAt),
                'dd.MM.yyyy HH:mm',
              )}
            />
            <KeyValueItem
              keyText="Покупатель"
              value={getUserName(orderRequest.customer)}
              href={generateInnerUrl(
                APP_PATHS.CUSTOMER(orderRequest.customerId),
                {
                  text: getUserName(orderRequest.customer),
                },
              )}
              hrefTarget="_blank"
            />

            {productsWithIds.length > 0 && (
              <>
                <KeyValueItem
                  keyText="Адрес доставки"
                  value={convertAddressToString(orderRequest.address)}
                  onValueClick={() => setAddressModalVisible(true)}
                />
                {orderRequest.comment && (
                  <KeyValueItem
                    keyText="Комментарий"
                    value={renderHtml(orderRequest.comment)}
                    inline={false}
                  />
                )}
              </>
            )}

            {describedProducts.length > 0 &&
              describedProducts.map(product => (
                <Fragment key={product.id}>
                  <KeyValueItem
                    keyText="Категория товара"
                    value={
                      product?.describedProduct?.autoBrand?.name ||
                      product?.describedProduct?.productGroup?.name
                    }
                  />
                  <KeyValueItem keyText="Количество" value={product.quantity} />
                  {!!product.describedProduct.description && (
                    <KeyValueItem
                      keyText="Описание товара"
                      value={renderHtml(product.describedProduct.description)}
                      inline={false}
                    />
                  )}
                  <KeyValueItem
                    keyText="Адрес доставки"
                    value={convertAddressToString(orderRequest.address)}
                    onValueClick={() => setAddressModalVisible(true)}
                  />
                </Fragment>
              ))}

            <OrderAttachmentListExtendable
              attachments={attachments}
              setAttachments={setAttachments}
              order={orderRequest}
              setOrder={setOrderRequest}
              offer={offer}
              withUploads
            />
          </div>
          <div className="d-flex align-items-end">
            <Button
              type="primary"
              onClick={() =>
                startChatWithUser({
                  companionId: orderRequest.customer.id,
                  companionRole: 'customer',
                  orderRequestId: orderRequest.id,
                })
              }
            >
              {'Чат с покупателем'} <MessageOutlined />
            </Button>
          </div>
        </div>

        <Container
          className="d-flex justify-content-between bg-light-gray mt-20"
          verticalPadding
        >
          <div className="d-flex align-items-center">
            <span>Выбрать организацию</span>
            <Select
              size="small"
              style={{
                width: 200,
              }}
              className="ml-10"
              value={selectedOrganization?.id || null}
              defaultValue={
                isAlreadySuggested &&
                orderRequest.orders.find(
                  ({ sellerId }) => sellerId == auth.user.id,
                ).organization.id
              }
              onChange={organizationId =>
                changeOrganization(organizationId as string)
              }
            >
              {organizations.map(org => (
                <Select.Option key={org.id} value={org.id}>
                  {org.name}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div className="d-flex">
            <KeyValueItem
              keyText="Цены указаны"
              value={
                selectedOrganization
                  ? selectedOrganization.hasNds
                    ? 'с НДС'
                    : 'без НДС'
                  : '-'
              }
              className="mr-15"
            />
            <KeyValueItem
              keyText="Комиссия"
              value={
                selectedOrganization?.priceBenefitPercent
                  ? `${selectedOrganization?.priceBenefitPercent}%`
                  : '-'
              }
            />
          </div>
        </Container>
        <Table
          className="mt-20"
          cols={[
            { content: '№', width: '3%' },
            {
              content: 'Наименование',
              width: '23%',
            },
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
            { content: 'CASH, ₽', width: '7%', highlightBorder: isEditingMode },
          ]}
          rows={rows}
        />
        <ul className="sub-table">
          <li className="sub-table__item">Итого:</li>
          <li className="sub-table__item" style={{ width: '5%' }}>
            {offer.products
              .map(({ count }) => count)
              .reduce((a, b) => a + b, 0)}
          </li>
          <li className="sub-table__item" style={{ width: '10%' }}></li>
          <li className="sub-table__item" style={{ width: '7%' }}>
            {offer.products
              .map(({ quantity }) => quantity)
              .reduce((a, b) => a + b, 0)}
          </li>
          <li className="sub-table__item" style={{ width: '7%' }}></li>
          <li className="sub-table__item" style={{ width: '7%' }}></li>
          <li
            className="sub-table__item border-highlighted"
            style={{ width: '9%' }}
          >
            {calculateTotal().roundFraction().separateBy(' ')}
          </li>
          <li
            className={classNames('sub-table__item', {
              'border-highlighted': isEditingMode,
            })}
            style={{ width: '7%' }}
          >
            {calculateTotalCash().roundFraction().separateBy(' ')}
          </li>
        </ul>
        <ul className="sub-table">
          <li className="sub-table__item">Комиссия:</li>
          <li className="sub-table__item" style={{ width: '5%' }}></li>
          <li className="sub-table__item" style={{ width: '10%' }}></li>
          <li className="sub-table__item" style={{ width: '7%' }}></li>
          <li className="sub-table__item" style={{ width: '7%' }}></li>
          <li className="sub-table__item" style={{ width: '7%' }}></li>
          <li
            className="sub-table__item border-highlighted"
            style={{ width: '9%' }}
          >
            {(
              (calculateTotal() / 100) *
              selectedOrganization?.priceBenefitPercent
            )
              .roundFraction()
              .separateBy(' ') || 0}
          </li>
          <li
            className={classNames('sub-table__item', {
              'border-highlighted': isEditingMode,
            })}
            style={{ width: '7%' }}
          ></li>
        </ul>
        <ul className="sub-table">
          <li className="sub-table__item">За вычетом комиссии:</li>
          <li className="sub-table__item" style={{ width: '5%' }}></li>
          <li className="sub-table__item" style={{ width: '10%' }}></li>
          <li className="sub-table__item" style={{ width: '7%' }}></li>
          <li className="sub-table__item" style={{ width: '7%' }}></li>
          <li className="sub-table__item" style={{ width: '7%' }}></li>
          <li
            className="sub-table__item border-highlighted"
            style={{ width: '9%' }}
          >
            {(
              calculateTotal() -
              (calculateTotal() / 100) *
                selectedOrganization?.priceBenefitPercent
            )
              .roundFraction()
              .separateBy(' ') || 0}
          </li>
          <li
            className={classNames('sub-table__item', {
              'border-highlighted': isEditingMode,
            })}
            style={{ width: '7%' }}
          ></li>
        </ul>
        {!!orderRequest?.orders?.[0]?.paidSum && (
          <ul className="sub-table">
            <li className="sub-table__item">Оплачено:</li>
            <li className="sub-table__item" style={{ width: '5%' }}></li>
            <li className="sub-table__item" style={{ width: '10%' }}></li>
            <li className="sub-table__item" style={{ width: '7%' }}></li>
            <li className="sub-table__item" style={{ width: '7%' }}></li>
            <li className="sub-table__item" style={{ width: '7%' }}></li>
            <li
              className="sub-table__item border-highlighted"
              style={{ width: '9%' }}
            >
              {orderRequest?.orders?.[0]?.paidSum
                ?.roundFraction()
                ?.separateBy(' ') || '-'}
            </li>
            <li className="sub-table__item" style={{ width: '7%' }}></li>
          </ul>
        )}
        <div className="pb-20"></div>
      </PageContent>

      <Summary containerClassName="justify-content-end">
        {!isEditingMode ? (
          <>
            {attachments?.length > 0 && (
              <Button
                type="primary"
                className="color-white"
                onClick={() => setAttachmentsModalOpen(true)}
              >
                Вложения
              </Button>
            )}
            <Button
              type="primary"
              className="color-white gray ml-10"
              onClick={() => enableEditingMode()}
            >
              Редактировать
            </Button>
          </>
        ) : (
          <Fragment>
            <Button
              type="primary"
              className="color-white gray ml-10"
              onClick={() => disableEditingMode()}
            >
              Отмена
            </Button>
            <Button
              type="primary"
              className="color-white gray ml-10"
              onClick={() => updateOrder()}
            >
              Сохранить
            </Button>
          </Fragment>
        )}
      </Summary>

      {!!attachments?.length && (
        <OrderAttachmentListModal
          open={attachmentsModalOpen}
          onClose={() => setAttachmentsModalOpen(false)}
          attachments={attachments}
          setAttachments={setAttachments}
          order={orderRequest}
          setOrder={setOrderRequest}
          offer={offer}
          withUploads
        />
      )}
      <Modal
        open={!!deleteProductId}
        onCancel={() => setDeleteProductId(null)}
        title={null}
        footer={null}
        closeIcon={<></>}
        centered
      >
        <h3 className="text-center mb-15" style={{ marginTop: -10 }}>
          Вы уверены, что хотите удалить товар из предложения?
        </h3>
        <div className="d-flex justify-content-center">
          <Button
            className="color-white gray mr-10"
            style={{ width: 100 }}
            onClick={() => setDeleteProductId(null)}
          >
            Отмена
          </Button>
          <Button
            className="color-white gray"
            style={{ width: 100 }}
            onClick={() => deleteProduct(deleteProductId)}
          >
            Удалить
          </Button>
        </div>
      </Modal>
    </Fragment>
  );
};

export default OrderRequestPartialPaymentContentSeller;
