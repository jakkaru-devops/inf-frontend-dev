import { Button, Modal, Popconfirm, Popover } from 'antd';
import { MessageOutlined, CloseOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { FC, Fragment, SetStateAction } from 'react';
import { APP_PATHS } from 'data/paths.data';
import { convertAddressToString } from 'components/common/YandexMap/utils';
import { IOrderRequest } from 'sections/Orders/interfaces';
import {
  KeyValueItem,
  Table,
  PageContent,
  Summary,
  Link,
  TabGroup,
  RateString,
  Container,
  InputNumber,
} from 'components/common';
import formatDate from 'date-fns/format';
import { getUserName } from 'sections/Users/utils';
import { useHandlers } from './handlers/partialPayment.customer.handlers';
import addDays from 'date-fns/addDays';
import { startChatWithUser } from 'components/complex/Messenger/utils/messenger.utils';
import {
  generateInnerUrl,
  openNotification,
  renderHtml,
} from 'utils/common.utils';
import OrderAttachmentListModal from 'sections/Orders/components/OrderAttachmentListModal';
import OrderAttachmentListExtendable from 'sections/Orders/components/OrderAttachmentListExtendable';

const OrderRequestPartialPaymentContentCustomer: FC<{
  orderRequest: IOrderRequest;
  setOrderRequest: (value: IOrderRequest) => void;
  setAddressModalVisible: (value: SetStateAction<boolean>) => void;
}> = ({ orderRequest, setOrderRequest, setAddressModalVisible }) => {
  const {
    locale,
    submitAwaiting,
    tabList,
    currentOffer,
    totalProductList,
    productDeletionAllowed,
    attachments,
    setAttachments,
    attachmentsModalOpen,
    setAttachmentsModalOpen,
    describedProducts,
    isEditingMode,
    setIsEditingMode,
    deleteProductId,
    setDeleteProductId,
    handlers,
  } = useHandlers({ orderRequest, setOrderRequest });

  return (
    <Fragment>
      <PageContent className="h-100-flex">
        <KeyValueItem
          keyText="Дата запроса"
          value={formatDate(
            new Date(orderRequest.createdAt),
            'dd.MM.yyyy HH:mm',
          )}
          className="mb-10"
        />

        <TabGroup list={tabList}>
          {!!currentOffer && (
            <div className="d-flex justify-content-between align-items-end">
              <div>
                <KeyValueItem
                  keyText="Продавец"
                  value={
                    <span className="d-flex">
                      <Link
                        href={generateInnerUrl(
                          APP_PATHS.SELLER(currentOffer.sellerId),
                          {
                            text: getUserName(currentOffer.seller),
                          },
                        )}
                        className="text-underline mr-10"
                      >
                        {getUserName(currentOffer.seller)}
                      </Link>

                      <Link
                        href={generateInnerUrl(
                          APP_PATHS.SELLER_REVIEWS(currentOffer.sellerId),
                          {
                            text: getUserName(currentOffer.seller),
                          },
                        )}
                      >
                        <RateString
                          color={'#FFB800'}
                          emptyColor={'#c4c4c4'}
                          rate={(
                            currentOffer.seller.ratingValue || 0
                          ).gaussRound(1)}
                          max={5}
                          size={20}
                        />
                      </Link>
                      <KeyValueItem
                        keyText="Отзывы"
                        value={currentOffer.seller.reviews.length}
                        keyClassName="text-normal"
                        className="ml-10"
                      />
                      <KeyValueItem
                        keyText="Продаж"
                        value={currentOffer.seller.salesNumber || 0}
                        keyClassName="text-normal"
                        className="ml-10"
                      />
                    </span>
                  }
                />
                <KeyValueItem
                  keyText="Адрес доставки"
                  value={convertAddressToString(orderRequest.address)}
                  onValueClick={() => setAddressModalVisible(true)}
                />
                <KeyValueItem
                  keyText="Условие доставки"
                  value={
                    currentOffer.transportCompany
                      ? currentOffer.transportCompany.name
                      : 'самовывоз'
                  }
                />
                {orderRequest.comment && (
                  <KeyValueItem
                    keyText="Комментарий"
                    value={renderHtml(orderRequest.comment)}
                    inline={false}
                  />
                )}
                <OrderAttachmentListExtendable
                  attachments={attachments}
                  setAttachments={setAttachments}
                  order={orderRequest}
                  setOrder={setOrderRequest}
                  offer={currentOffer}
                  withUploads
                />
              </div>
              <div>
                <div className="d-flex justify-content-end">
                  <Button
                    type="primary"
                    onClick={() =>
                      startChatWithUser({
                        companionId: currentOffer.sellerId,
                        companionRole: 'seller',
                        orderRequestId: orderRequest.id,
                      })
                    }
                  >
                    {'Чат с продавцом'} <MessageOutlined />
                  </Button>
                </div>
              </div>
            </div>
          )}
          {!currentOffer ? (
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
              <OrderAttachmentListExtendable
                attachments={attachments}
                setAttachments={setAttachments}
                order={orderRequest}
                setOrder={setOrderRequest}
                withUploads
              />

              <Table
                cols={[
                  { content: '№', width: '5%' },
                  { content: 'Наименование', width: '44%' },
                  { content: 'Производитель', width: '11%' },
                  { content: 'Артикул', width: '10%' },
                  { content: 'Кол-во', width: '15%' },
                  { content: 'Сумма, ₽', width: '15%' },
                ]}
                rows={totalProductList.map((product, i) => ({
                  cols: [
                    { content: i + 1 },
                    {
                      content: (
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
                              {product.product.name}
                            </Link>
                          ) : (
                            product?.reserveName
                          )}
                        </div>
                      ),
                    },
                    {
                      content:
                        product?.product?.manufacturer ||
                        product?.reserveManufacturer ||
                        '-',
                    },
                    {
                      content:
                        product?.product?.article || product?.reserveArticle,
                    },
                    { content: product.count },
                    {
                      content: product.totalPrice
                        .roundFraction()
                        .separateBy(' '),
                    },
                  ],
                }))}
                className="mt-20"
              />
              <ul className="sub-table">
                <li className="sub-table__item">Итого:</li>
                <li className="sub-table__item" style={{ width: '15%' }}>
                  {totalProductList
                    .map(({ count }) => count)
                    .reduce((a, b) => a + b, 0)}
                </li>
                <li className="sub-table__item" style={{ width: '15%' }}>
                  {totalProductList
                    .map(({ totalPrice }) => totalPrice)
                    .reduce((a, b) => a + b, 0)
                    .roundFraction()
                    .separateBy(' ')}
                </li>
              </ul>
              <ul className="sub-table pb-50">
                <li className="sub-table__item">Оплачено:</li>
                <li className="sub-table__item" style={{ width: '15%' }}></li>
                <li className="sub-table__item" style={{ width: '15%' }}>
                  {orderRequest?.paidSum?.roundFraction()?.separateBy(' ') ||
                    '-'}
                </li>
              </ul>
            </>
          ) : (
            <>
              <Container
                className="d-flex justify-content-between align-items-center bg-light-gray mt-10 mb-20"
                verticalPadding
              >
                <div className="d-flex">
                  <span>{currentOffer.organization.name}</span>
                </div>
                <KeyValueItem
                  keyText="Цены указаны"
                  value={currentOffer.organization.hasNds ? 'с НДС' : 'без НДС'}
                />
              </Container>

              <Table
                cols={[
                  { content: '№', width: '4%' },
                  {
                    content: 'Наименование',
                    width: !isEditingMode ? '24%' : '17%',
                  },
                  { content: 'Производитель', width: '11%' },
                  { content: 'Артикул', width: '10%' },
                  { content: 'Кол-во', width: '7%' },
                  { content: 'Цена за ед, ₽', width: '9%' },
                  { content: 'Кол-во в наличии', width: '7%' },
                  {
                    content: 'Под заказ',
                    width: '9%',
                    childrens: ['кол-во', 'поступление*'],
                  },
                  { content: 'Сумма, ₽', width: '10%', highlightBorder: true },
                  isEditingMode && { content: 'Выбор', width: '7%' },
                ]}
                rows={currentOffer.products
                  .filter(product => product?.isSelected)
                  .map((product, i) => {
                    return {
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
                                      <div className="star-mark-overlay-title">
                                        Изменено
                                      </div>
                                      <div className="star-mark-overlay-name">
                                        {product?.product?.name ||
                                          product?.reserveName}
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
                                      <div className="star-mark-overlay-title">
                                        Изменено
                                      </div>
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
                                product?.reserveArticle ||
                                '-'}
                              {!!product?.altArticle && (
                                <Popover
                                  placement="right"
                                  content={
                                    <Fragment>
                                      <div className="star-mark-overlay-title">
                                        Изменено
                                      </div>
                                      <div className="star-mark-overlay-name">
                                        {product?.product?.article ||
                                          product?.reserveArticle}
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
                          content: !isEditingMode ? (
                            product.count
                          ) : (
                            <InputNumber
                              value={product.count}
                              onChange={value =>
                                handlers.changeProductCount(product.id, value)
                              }
                              min={1}
                              className="show-controls type-primary width-small text-center"
                              precision={0}
                            />
                          ),
                        },
                        {
                          content: product.unitPrice
                            .roundFraction()
                            .separateBy(' '),
                        },
                        {
                          content: product.quantity,
                        },
                        {
                          content: [
                            product.deliveryQuantity || '-',
                            !!product.deliveryTerm
                              ? formatDate(
                                  addDays(new Date(), product.deliveryTerm),
                                  'dd.MM.yyyy',
                                )
                              : '-',
                          ],
                        },
                        {
                          content: (product.count * product.unitPrice)
                            .roundFraction()
                            .separateBy(' '),
                        },
                        isEditingMode && {
                          content: (
                            <Button
                              size="small"
                              shape="circle"
                              className={classNames('no-bg no-border', {
                                'color-primary': productDeletionAllowed,
                                'color-gray': !productDeletionAllowed,
                              })}
                              onClick={() => {
                                if (productDeletionAllowed)
                                  setDeleteProductId(product.id);
                                else
                                  openNotification(
                                    'Нельзя удалить единственный товар в заказе',
                                  );
                              }}
                              style={{
                                fontSize: 16,
                              }}
                            >
                              <CloseOutlined />
                            </Button>
                          ),
                        },
                      ],
                    };
                  })}
              />
              <ul className="sub-table">
                <li className="sub-table__item">Итого:</li>
                <li className="sub-table__item" style={{ width: '7%' }}>
                  {currentOffer.products
                    .filter(({ isSelected }) => isSelected)
                    .map(({ count }) => count)
                    .reduce((a, b) => a + b, 0)}
                </li>
                <li className="sub-table__item" style={{ width: '9%' }}></li>
                <li className="sub-table__item" style={{ width: '7%' }}></li>
                <li className="sub-table__item" style={{ width: '9%' }}></li>
                <li className="sub-table__item" style={{ width: '9%' }}></li>
                <li
                  className="sub-table__item border-highlighted"
                  style={{ width: '10%' }}
                >
                  {currentOffer.products
                    .filter(({ isSelected }) => isSelected)
                    .map(({ unitPrice, count }) => unitPrice * count)
                    .reduce((a, b) => a + b, 0)
                    .roundFraction()
                    .separateBy(' ')}
                </li>
                {isEditingMode && (
                  <li className="sub-table__item" style={{ width: '7%' }}></li>
                )}
              </ul>
              <ul className="sub-table pb-50">
                <li className="sub-table__item">Оплачено:</li>
                <li className="sub-table__item" style={{ width: '7%' }}></li>
                <li className="sub-table__item" style={{ width: '9%' }}></li>
                <li className="sub-table__item" style={{ width: '7%' }}></li>
                <li className="sub-table__item" style={{ width: '9%' }}></li>
                <li className="sub-table__item" style={{ width: '9%' }}></li>
                <li className="sub-table__item" style={{ width: '10%' }}>
                  {currentOffer?.paidSum?.roundFraction()?.separateBy(' ') ||
                    (orderRequest?.orders?.length === 1 &&
                      orderRequest?.paidSum
                        ?.roundFraction()
                        ?.separateBy(' ')) ||
                    '-'}
                </li>
                {isEditingMode && (
                  <li className="sub-table__item" style={{ width: '7%' }}></li>
                )}
              </ul>
            </>
          )}
        </TabGroup>
      </PageContent>
      <Summary containerClassName="justify-content-end">
        {!isEditingMode ? (
          <>
            {!orderRequest?.paymentRefundRequest?.refundSum && (
              <Button
                type="primary"
                className="color-white ml-10"
                onClick={() => setIsEditingMode(true)}
              >
                Редактировать
              </Button>
            )}
            {!orderRequest?.paymentRefundRequest && (
              <Button
                type="primary"
                className="color-white gray ml-10"
                onClick={handlers.requestPaymentRefund}
              >
                Запрос на возврат денежных средств
              </Button>
            )}

            {attachments?.length > 0 && (
              <Button
                type="primary"
                className={classNames(['color-white ml-10'])}
                onClick={() => setAttachmentsModalOpen(true)}
              >
                Вложения
              </Button>
            )}
            {!!orderRequest?.paymentRefundRequest?.refundSum &&
              orderRequest?.paymentRefundRequest?.refundSum ===
                orderRequest?.paidSum && (
                <Popconfirm
                  title={`Вы действительно хотите удалить Запрос ${orderRequest.idOrder}?`}
                  okText="Удалить"
                  cancelText="Отмена"
                  onConfirm={handlers.deleteOrderRequest}
                  placement="bottomRight"
                >
                  <Button type="primary" className="color-white gray ml-10">
                    Удалить запрос
                  </Button>
                </Popconfirm>
              )}
            {!!orderRequest?.paymentRefundRequest?.refundSum && (
              <Link
                href={generateInnerUrl(
                  APP_PATHS.ORDER_REQUEST_OFFER_LIST(orderRequest.id),
                  {
                    text: locale.navigation.offers,
                  },
                )}
                className="ml-10"
              >
                <Button type="primary" className="color-white">
                  Предложения
                </Button>
              </Link>
            )}
          </>
        ) : (
          <Button
            type="primary"
            className="color-white ml-10"
            onClick={() => handlers.saveChanges()}
            loading={submitAwaiting}
          >
            Сохранить
          </Button>
        )}
      </Summary>

      {attachments && (
        <OrderAttachmentListModal
          open={attachmentsModalOpen}
          onClose={() => setAttachmentsModalOpen(false)}
          attachments={attachments}
          setAttachments={setAttachments}
          order={orderRequest}
          setOrder={setOrderRequest}
          offer={currentOffer}
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
          {!!currentOffer && currentOffer?.products?.length === 1 && (
            <>
              <br />
              Сделка с {getUserName(currentOffer.seller)} будет расторгнута
            </>
          )}
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
            onClick={() => handlers.deleteProduct(deleteProductId)}
          >
            Удалить
          </Button>
        </div>
      </Modal>
    </Fragment>
  );
};

export default OrderRequestPartialPaymentContentCustomer;
