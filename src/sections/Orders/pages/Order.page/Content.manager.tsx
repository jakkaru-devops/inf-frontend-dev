import {
  Container,
  KeyValueItem,
  PageContent,
  RateString,
  TabGroup,
  Table,
  Summary,
  Link,
} from 'components/common';
import {
  Button,
  Checkbox,
  DatePicker,
  ConfigProvider,
  Popover,
  Spin,
  Alert,
} from 'antd';
import antdLocale from 'antd/lib/locale/ru_RU';
import { MessageOutlined, LoadingOutlined } from '@ant-design/icons';
import { IOrderRequest } from 'sections/Orders/interfaces';
import formatDate from 'date-fns/format';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { getUserName } from 'sections/Users/utils';
import { convertAddressToString } from 'components/common/YandexMap/utils';
import { useModalsState } from 'hooks/modal.hook';
import useHandlers from './handlers.ts/manager.handler';
import { hasOfferRefunds } from './utils';
import { startChatWithUser } from 'components/complex/Messenger/utils/messenger.utils';
import { ORDER_CALCULATIONS } from 'sections/Orders/utils';
import addDays from 'date-fns/addDays';
import { generateInnerUrl, generateUrl, renderHtml } from 'utils/common.utils';
import { ISetState } from 'interfaces/common.interfaces';
import moment from 'moment';
import { FC, Fragment, SetStateAction, useState } from 'react';
import DownloadDocModal from 'sections/Orders/components/DownloadDocModal';
import { DownloadOutlined } from '@ant-design/icons';
import { downloadOrderDocService } from 'sections/Orders/services/downloadOrderDoc.service';
import OrderTableRows from './OrderTableRows';
import { useAuth } from 'hooks/auth.hook';
import CancelPaymentModal from 'sections/Orders/components/CancelOrderPaymentModal';
import OrderAttachmentListModal from 'sections/Orders/components/OrderAttachmentListModal';
import OrderAttachmentListExtendable from 'sections/Orders/components/OrderAttachmentListExtendable';

interface IProps {
  order: IOrderRequest;
  setOrder: ISetState<IOrderRequest>;
  setAddressModalVisible: (value: SetStateAction<boolean>) => void;
  setOrgInfoModalVisible: (value: SetStateAction<boolean>) => void;
}

const OrderContentManager: FC<IProps> = ({
  order,
  setOrder,
  setAddressModalVisible,
  setOrgInfoModalVisible,
}) => {
  const auth = useAuth();
  const { Modal: RefundExchangeRequestModal, openModal } = useModalsState();
  const DatePickerUntyped = DatePicker as any;
  const [downloadDocModalVisible, setDownloadDocModalVisible] = useState(false);
  const [downloadDocAwaiting, setDownloadDocAwaiting] = useState(false);

  const {
    locale,
    currentOffer,
    totalProductList,
    rewardState,
    selectedRefundExchangeData,
    attachments,
    setAttachments,
    describedProducts,
    cancelPaymentModalOpen,
    setCancelPaymentModalOpen,
    loaderVisible,
    attachmentsModalOpen,
    setAttachmentsModalOpen,
    paymentSubmitting,
    handlers,
  } = useHandlers(order, setOrder, openModal);

  const tabList = [
    {
      label: 'full',
      title: 'Весь заказ',
      href: generateUrl({ tab: null }),
      isActive: !currentOffer,
    },
    ...order.orders.map((offer, i) => ({
      label: offer.id,
      title: `Продавец ${i + 1}`,
      href: generateUrl({ tab: offer.id }),
      isActive: currentOffer?.id == offer.id,
      rollback: hasOfferRefunds(offer),
    })),
  ];

  const disabledDate = (current: moment.Moment) => {
    return current && current > moment().endOf('day');
  };

  const downloadDoc = async (docType: 'pdf' | 'xlsx') =>
    await downloadOrderDocService({
      url: API_ENDPOINTS.ORDER_DOC(order.id),
      docType,
      awaiting: downloadDocAwaiting,
      setAwaiting: setDownloadDocAwaiting,
      params: {
        offerId: currentOffer?.id,
        sellerNumber:
          order.orders?.findIndex(offer => offer.id === currentOffer?.id) + 1,
      },
    });

  return (
    <Fragment>
      <PageContent>
        {order.paymentDate && (
          <KeyValueItem
            keyText="Дата заказа"
            value={formatDate(new Date(order.paymentDate), 'dd.MM.yyyy HH:mm')}
            style={{ marginTop: -20 }}
          />
        )}
        <KeyValueItem
          keyText="Покупатель"
          value={getUserName(order.customer)}
          href={generateInnerUrl(APP_PATHS.CUSTOMER(order.customerId), {
            text: getUserName(order.customer),
          })}
        />
        <KeyValueItem
          keyText="Плательщик"
          value={
            !!order?.payerId ? order?.payer?.name : getUserName(order.customer)
          }
          href={
            !order?.payerId &&
            generateInnerUrl(APP_PATHS.CUSTOMER(order.customerId), {
              text: getUserName(order.customer),
            })
          }
          hrefTarget="_blank"
          onValueClick={() => setOrgInfoModalVisible(true)}
        />

        <TabGroup list={tabList} className="mt-10">
          {!!currentOffer && (
            <Fragment>
              {currentOffer.status !== 'PAID' &&
                !!currentOffer?.cancelPaymentMessage && (
                  <div className="w-100">
                    <Alert
                      type="error"
                      message={
                        <div>
                          Оплата отменена. Причина:
                          <br />
                          {renderHtml(currentOffer?.cancelPaymentMessage)}
                        </div>
                      }
                      className="mb-15 d-table"
                    />
                  </div>
                )}
              <div className="d-flex justify-content-between">
                <div>
                  <RefundExchangeRequestModal
                    refundExchangeRequest={
                      selectedRefundExchangeData?.refundExchangeRequest
                    }
                    refundExchangeHistory={
                      selectedRefundExchangeData?.refundExchangeHistory
                    }
                  />

                  {currentOffer.status === 'PAYMENT_POSTPONED' &&
                    !!currentOffer?.paymentPostponedAt && (
                      <div style={{ fontSize: 14 }}>
                        <strong
                          className="color-primary"
                          style={{ fontSize: 18, marginTop: -1 }}
                        >
                          !
                        </strong>{' '}
                        <strong className="text-uppercase">
                          Заказ не оплачен
                        </strong>{' '}
                        <span className="color-primary text-lowercase">
                          Срок оплаты до:{' '}
                          {moment(currentOffer?.paymentPostponedAt).format(
                            'DD.MM.yyyy',
                          )}
                        </span>
                      </div>
                    )}

                  {order.paymentDate && (
                    <KeyValueItem
                      keyText="Дата заказа"
                      value={formatDate(
                        new Date(order.paymentDate),
                        'dd.MM.yyyy HH:mm',
                      )}
                    />
                  )}
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
                    value={convertAddressToString(order.address)}
                    onValueClick={() => setAddressModalVisible(true)}
                  />
                  <div className="d-flex">
                    <KeyValueItem
                      keyText="Условие доставки"
                      value={
                        currentOffer.transportCompany
                          ? currentOffer.transportCompany.name
                          : 'самовывоз'
                      }
                    />
                    {currentOffer?.transportCompany && (
                      <>
                        <KeyValueItem
                          keyText="Трек номер"
                          value={currentOffer?.trackNumber ?? '-'}
                          valueClassName="text_14"
                          className="ml-10"
                        />
                        <KeyValueItem
                          keyText="Заказ отгружен"
                          value={
                            currentOffer?.departureDate
                              ? formatDate(
                                  new Date(currentOffer.departureDate),
                                  'dd.MM.yyyy',
                                )
                              : '__.__.____'
                          }
                          valueClassName="text_14"
                          className="ml-10"
                        />
                      </>
                    )}
                  </div>
                  <KeyValueItem
                    keyText="Заказ получен"
                    value={
                      <Checkbox
                        checked={!!currentOffer?.receivingDate}
                        onChange={({ target: { checked } }) =>
                          handlers.updateReceivingDate(checked)
                        }
                      >
                        <ConfigProvider locale={antdLocale}>
                          <DatePickerUntyped
                            value={
                              !!currentOffer?.receivingDate
                                ? moment(currentOffer?.receivingDate)
                                : null
                            }
                            format="DD.MM.YYYY"
                            size="small"
                            onChange={receivingDate =>
                              handlers.updateReceivingDate(receivingDate)
                            }
                            disabledDate={disabledDate}
                          />
                        </ConfigProvider>
                      </Checkbox>
                    }
                    valueClassName="d-inline-block aling-items-center"
                  />
                  {order.comment && (
                    <KeyValueItem
                      keyText="Комментарий"
                      value={renderHtml(order.comment)}
                      inline={false}
                    />
                  )}
                  <OrderAttachmentListExtendable
                    attachments={attachments}
                    setAttachments={setAttachments}
                    order={order}
                    setOrder={setOrder}
                    offer={currentOffer}
                    withUploads
                  />
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                  }}
                >
                  {auth.currentRole.label === 'operator' && (
                    <div>
                      <div
                        className="user-select-none"
                        style={{ position: 'relative' }}
                      >
                        <Checkbox
                          checked={currentOffer.status === 'PAID'}
                          onChange={({ target }) =>
                            target.checked
                              ? handlers.confirmOfferPayment()
                              : setCancelPaymentModalOpen(true)
                          }
                          className="ml-10 mb-5 flex-row-reverse"
                        >
                          Заказ оплачен
                        </Checkbox>
                        {paymentSubmitting && (
                          <Spin
                            style={{
                              position: 'absolute',
                              left: '100%',
                              top: '0',
                              marginLeft: 5,
                            }}
                            indicator={
                              <LoadingOutlined
                                style={{ fontSize: 15 }}
                                className="color-primary"
                              />
                            }
                          />
                        )}
                      </div>

                      {['PAID', 'COMPLETED', 'REWARD_PAID'].includes(
                        order.status,
                      ) && (
                        <div className="mb-10">
                          <Checkbox
                            checked={rewardState[currentOffer.id]?.supplierPaid}
                            onChange={({ target }) =>
                              handlers.handleSupplierPaidCheckbox(
                                target.checked,
                              )
                            }
                            className="text-bold flex-row-reverse mb-5"
                          >
                            Поставщику оплачено
                          </Checkbox>
                          {!currentOffer?.organization
                            ?.priceBenefitPercentAcquiring &&
                            !currentOffer?.organization
                              ?.priceBenefitPercentInvoice &&
                            !currentOffer?.hideSupplierPayments && (
                              <Checkbox
                                checked={
                                  rewardState[currentOffer.id]?.sellerPaid
                                }
                                onChange={({ target }) =>
                                  handlers.handleSellerPaidCheckbox(
                                    target.checked,
                                  )
                                }
                                className="text-bold flex-row-reverse"
                              >
                                Продавцу и ФНС оплачено
                              </Checkbox>
                            )}
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    type="primary"
                    onClick={() =>
                      startChatWithUser({
                        companionId: currentOffer.sellerId,
                        companionRole: 'seller',
                        orderRequestId: order.id,
                      })
                    }
                  >
                    {'Чат с продавцом'} <MessageOutlined />
                  </Button>
                </div>
              </div>
            </Fragment>
          )}
          {!currentOffer ? (
            <Fragment>
              {!(
                ['PAID', 'COMPLETED', 'REWARD_PAID'] as Array<
                  IOrderRequest['status']
                >
              ).includes(order.status) &&
                !!order?.cancelPaymentMessage && (
                  <div className="w-100">
                    <Alert
                      type="error"
                      message={
                        <div>
                          Оплата отменена. Причина:
                          <br />
                          {renderHtml(order?.cancelPaymentMessage)}
                        </div>
                      }
                      className="mb-10 d-table"
                    />
                  </div>
                )}
              <div className="d-flex justify-content-between">
                <div>
                  <KeyValueItem
                    keyText="Адрес доставки"
                    value={convertAddressToString(order.address)}
                    onValueClick={() => setAddressModalVisible(true)}
                  />
                  {order.comment && (
                    <KeyValueItem
                      keyText="Комментарий"
                      value={renderHtml(order.comment)}
                      inline={false}
                    />
                  )}
                  <OrderAttachmentListExtendable
                    attachments={attachments}
                    setAttachments={setAttachments}
                    order={order}
                    setOrder={setOrder}
                    withUploads
                  />
                </div>
                <div>
                  {auth.currentRole.label === 'operator' && (
                    <div
                      className="user-select-none"
                      style={{ position: 'relative' }}
                    >
                      <Checkbox
                        checked={(
                          ['PAID', 'COMPLETED'] as Array<
                            IOrderRequest['status']
                          >
                        ).includes(order.status)}
                        onChange={({ target }) =>
                          target.checked
                            ? handlers.confirmFullOrderPayment()
                            : setCancelPaymentModalOpen(true)
                        }
                        className="ml-10 mb-5"
                      >
                        Заказ оплачен
                      </Checkbox>
                      {paymentSubmitting && (
                        <Spin
                          style={{
                            position: 'absolute',
                            left: '100%',
                            top: '0',
                            marginLeft: 5,
                          }}
                          indicator={
                            <LoadingOutlined
                              style={{ fontSize: 15 }}
                              className="color-primary"
                            />
                          }
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
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
                                APP_PATHS.PRODUCT(product?.product?.id),
                                {
                                  text: product?.product?.name,
                                },
                              )}
                              className="color-black"
                            >
                              {product?.product?.name}
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
              <ul className="sub-table pb-50">
                <li className="sub-table__item" style={{ width: '10%' }}>
                  Итого
                </li>
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
            </Fragment>
          ) : (
            <Fragment>
              <Container
                className="d-flex justify-content-between align-items-center bg-light-gray mt-10 mb-20"
                verticalPadding
              >
                <div className="d-flex">
                  <span>{currentOffer.organization.name}</span>
                </div>
                <div className="d-flex">
                  <KeyValueItem
                    keyText="Цены указаны"
                    value={
                      currentOffer.organization.hasNds ? 'с НДС' : 'без НДС'
                    }
                    className="ml-15"
                  />

                  {!currentOffer?.commissionType && (
                    <KeyValueItem
                      key={order.id}
                      keyText="Комиссия"
                      value={`${currentOffer.organization.priceBenefitPercent}%`}
                      className="ml-15"
                    />
                  )}

                  {currentOffer?.commissionType === 'acquiring' && (
                    <KeyValueItem
                      key={order.id}
                      keyText="Комиссия эквайринг"
                      value={`${currentOffer.organization.priceBenefitPercentAcquiring}%`}
                      className="ml-15"
                    />
                  )}

                  {currentOffer?.commissionType === 'invoice' && (
                    <KeyValueItem
                      key={order.id}
                      keyText="Комиссия по счёту"
                      value={`${currentOffer.organization.priceBenefitPercentInvoice}%`}
                      className="ml-15"
                    />
                  )}

                  {!currentOffer?.commissionType && (
                    <KeyValueItem
                      keyText="CASH"
                      value={ORDER_CALCULATIONS.offerTotalCash(
                        currentOffer.products,
                        currentOffer.organization,
                      )
                        .roundFraction()
                        .separateBy(' ')}
                      className="ml-15"
                    />
                  )}
                </div>
              </Container>

              <Table
                cols={[
                  { content: '№', width: '4%' },
                  { content: 'Наименование', width: '19%' },
                  { content: 'Производитель', width: '11%' },
                  { content: 'Артикул', width: '10%' },
                  { content: 'Кол-во', width: '5%' },
                  { content: 'Цена за ед, ₽', width: '9%' },
                  { content: 'Кол-во в наличии', width: '7%' },
                  {
                    content: 'Под заказ',
                    width: '9%',
                    childrens: ['кол-во', 'поступление*'],
                  },
                  { content: 'Сумма, ₽', width: '10%', highlightBorder: true },
                  {
                    content: 'Возврат/обмен',
                    width: '7%',
                  },
                ]}
                rows={currentOffer.products.map((product, i) => ({
                  cols: [
                    { content: i + 1 },
                    {
                      content: (
                        <Fragment>
                          <div>
                            {!!product?.product ? (
                              <Link
                                href={generateInnerUrl(
                                  APP_PATHS.PRODUCT(product?.product?.id),
                                  {
                                    text: product?.product?.name,
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
                            product?.reserveArticle}
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
                      content: product.count,
                    },
                    {
                      content: product.unitPrice
                        .roundFraction()
                        .separateBy(' '),
                    },
                    {
                      content: product.quantity || '-',
                    },
                    {
                      content: [
                        product?.deliveryQuantity || '-',
                        !!product.deliveryTerm
                          ? formatDate(
                              addDays(
                                new Date(order.paymentDate),
                                product.deliveryTerm,
                              ),
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
                    {
                      content: !!product.refundExchangeRequest ? (
                        <span
                          className="text-underline color-primary"
                          style={{ cursor: 'pointer' }}
                          onClick={() =>
                            handlers.handleOpenRefundExchangeModal(product.id)
                          }
                        >
                          {!!product.refundExchangeRequest
                            ? locale?.refundExchange?.statuses?.[
                                product.refundExchangeRequest.status ===
                                'AGREED'
                                  ? product.refundExchangeRequest
                                      ?.disputeResolution
                                  : product.refundExchangeRequest.status
                              ]
                            : '-'}
                        </span>
                      ) : (
                        '-'
                      ),
                    },
                  ],
                }))}
              />

              <OrderTableRows
                title="Итого"
                totalPaidSum={ORDER_CALCULATIONS.offerTotalPrice(
                  currentOffer.products,
                )
                  .roundFraction()
                  .separateBy(' ')}
                quantityProducts={ORDER_CALCULATIONS.orderedProductsQuantity(
                  currentOffer.products,
                )}
              />
              {!currentOffer?.commissionType &&
                !!currentOffer?.organization?.priceBenefitPercent && (
                  <Fragment>
                    <OrderTableRows
                      title="Комиссия"
                      totalPaidSum={
                        ORDER_CALCULATIONS.offerCommission(
                          currentOffer.organization.priceBenefitPercent,
                          currentOffer.products,
                        )
                          .roundFraction()
                          .separateBy(' ') || 0
                      }
                    />
                    <OrderTableRows
                      title="За вычетом комиссии"
                      totalPaidSum={ORDER_CALCULATIONS.offerTotalPriceMinusCommission(
                        currentOffer.organization.priceBenefitPercent,
                        currentOffer.products,
                      )
                        .roundFraction()
                        .separateBy(' ')}
                    />
                  </Fragment>
                )}
              {currentOffer?.commissionType === 'acquiring' && (
                <Fragment>
                  <OrderTableRows
                    title="Комиссия Эквайринг"
                    totalPaidSum={
                      ORDER_CALCULATIONS.offerCommission(
                        currentOffer.organization.priceBenefitPercentAcquiring,
                        currentOffer.products,
                      )
                        .roundFraction()
                        .separateBy(' ') || 0
                    }
                  />
                  <OrderTableRows
                    title="За вычетом комиссии"
                    totalPaidSum={ORDER_CALCULATIONS.offerTotalPriceMinusCommission(
                      currentOffer.organization.priceBenefitPercentAcquiring,
                      currentOffer.products,
                    )
                      .roundFraction()
                      .separateBy(' ')}
                  />
                </Fragment>
              )}
              {currentOffer?.commissionType === 'invoice' && (
                <Fragment>
                  <OrderTableRows
                    title="Комиссия по счету"
                    totalPaidSum={
                      ORDER_CALCULATIONS.offerCommission(
                        currentOffer.organization.priceBenefitPercentInvoice,
                        currentOffer.products,
                      )
                        .roundFraction()
                        .separateBy(' ') || 0
                    }
                  />
                  <OrderTableRows
                    title="За вычетом комиссии"
                    totalPaidSum={ORDER_CALCULATIONS.offerTotalPriceMinusCommission(
                      currentOffer.organization.priceBenefitPercentInvoice,
                      currentOffer.products,
                    )
                      .roundFraction()
                      .separateBy(' ')}
                  />
                </Fragment>
              )}
            </Fragment>
          )}
        </TabGroup>
      </PageContent>

      <Summary containerClassName="justify-content-end">
        <Button
          type="ghost"
          className="gray ml-10"
          icon={<DownloadOutlined style={{ fontSize: 24, color: 'white' }} />}
          onClick={() => setDownloadDocModalVisible(true)}
        />

        {attachments?.length > 0 && (
          <Button
            type="primary"
            className="color-white ml-10"
            onClick={() => setAttachmentsModalOpen(true)}
          >
            Вложения
          </Button>
        )}
        <Button
          type="primary"
          className="ml-10"
          onClick={() =>
            startChatWithUser({
              companionId: order.customer.id,
              companionRole: 'customer',
              orderRequestId: order.id,
            })
          }
        >
          {'Чат с покупателем'} <MessageOutlined />
        </Button>
      </Summary>
      {loaderVisible && (
        <div className="page-loader">
          <Spin indicator={<LoadingOutlined spin />} />
        </div>
      )}

      {attachments && (
        <OrderAttachmentListModal
          open={attachmentsModalOpen}
          onClose={() => setAttachmentsModalOpen(false)}
          attachments={attachments}
          setAttachments={setAttachments}
          order={order}
          setOrder={setOrder}
          offer={currentOffer}
          withUploads
        />
      )}
      <DownloadDocModal
        open={downloadDocModalVisible}
        onCancel={() => setDownloadDocModalVisible(false)}
        downloadPdf={() => downloadDoc('pdf')}
        downloadXlsx={() => downloadDoc('xlsx')}
        loading={downloadDocAwaiting}
      />
      <CancelPaymentModal
        open={cancelPaymentModalOpen}
        onClose={() => setCancelPaymentModalOpen(false)}
        onSubmit={async ({ message }) => {
          if (!!currentOffer) await handlers.cancelOfferPayment({ message });
          else await handlers.cancelFullOrderPayment({ message });
        }}
      />
    </Fragment>
  );
};

export default OrderContentManager;
