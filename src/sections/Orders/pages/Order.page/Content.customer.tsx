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
  Alert,
  Button,
  Checkbox,
  ConfigProvider,
  DatePicker,
  Popover,
  Spin,
} from 'antd';
import { MessageOutlined, LoadingOutlined } from '@ant-design/icons';
import {
  IOrderRequest,
  IReasonToRejectShippingCondition,
} from 'sections/Orders/interfaces';
import formatDate from 'date-fns/format';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { getUserName } from 'sections/Users/utils';
import { convertAddressToString } from 'components/common/YandexMap/utils';
import { useModalsState } from 'hooks/modal.hook';
import useHandlers from './handlers.ts/customer.handler';
import { FC, Fragment, SetStateAction, useEffect, useState } from 'react';
import { IUserReview } from 'sections/Users/interfaces';
import { startChatWithUser } from 'components/complex/Messenger/utils/messenger.utils';
import { hasOfferRefunds } from './utils';
import SellerReviewModal from 'sections/Orders/components/SellerReviewModal';
import addDays from 'date-fns/addDays';
import { generateInnerUrl, generateUrl, renderHtml } from 'utils/common.utils';
import { ISetState } from 'interfaces/common.interfaces';
import CheckReasonRejectChangeConditions from '../../components/СheckReasonRejectChangeConditions';
import { APIRequest } from 'utils/api.utils';
import antdLocale from 'antd/lib/locale/ru_RU';
import moment from 'moment';
import differenceInDays from 'date-fns/differenceInDays';
import { useRouter } from 'next/router';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';
import DownloadDocModal from 'sections/Orders/components/DownloadDocModal';
import { DownloadOutlined } from '@ant-design/icons';
import { downloadOrderDocService } from 'sections/Orders/services/downloadOrderDoc.service';
import { ORDER_CALCULATIONS } from 'sections/Orders/utils';
import OrderAttachmentListExtendable from 'sections/Orders/components/OrderAttachmentListExtendable';
import OrderAttachmentListModal from 'sections/Orders/components/OrderAttachmentListModal';

interface IProps {
  order: IOrderRequest;
  setOrder: ISetState<IOrderRequest>;
  reviews: IUserReview[];
  setReviews: ISetState<IUserReview[]>;
  setAddressModalVisible: (value: SetStateAction<boolean>) => void;
  setChangeShippingConditionVisible: (value: SetStateAction<boolean>) => void;
}

const OrderContentCustomer: FC<IProps> = ({
  order,
  setOrder,
  reviews,
  setReviews,
  setAddressModalVisible,
  setChangeShippingConditionVisible,
}) => {
  const router = useRouter();
  const { Modal: RefundExchangeRequestModal, openModal } = useModalsState();
  const [checkRejectReasonVisible, setCheckRejectReasonVisible] =
    useState<boolean>(false);
  const {
    locale,
    currentOffer,
    totalProductList,
    selectedRefundExchangeData,
    allowUpdate,
    reviewModalVisible,
    setReviewModalVisible,
    attachments,
    setAttachments,
    describedProducts,
    loaderVisible,
    attachmentsModalOpen,
    setAttachmentsModalOpen,
    handlers,
  } = useHandlers({ order, setOrder, openModal });
  const DatePickerUntyped = DatePicker as any;

  const [reason, setReason] = useState<IReasonToRejectShippingCondition>();
  const isHistory = ['REWARD_PAID', 'COMPLETED'].includes(order.status);
  const [downloadDocModalVisible, setDownloadDocModalVisible] = useState(false);
  const [downloadDocAwaiting, setDownloadDocAwaiting] = useState(false);

  useEffect(() => {
    const fetchData = async id => {
      const reasonData = await APIRequest<any>({
        method: 'get',
        url: `${API_ENDPOINTS.GET_REASON_REJECT_SHIPPING_CONDITION}/${id}`,
        requireAuth: true,
      });
      if (!reasonData.isSucceed) return;
      setReason(reasonData.data.result);
    };
    fetchData(currentOffer?.id);
  }, [currentOffer]);

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

  useEffect(() => {
    if (
      currentOffer &&
      currentOffer?.receivingDate &&
      !reviews?.find(
        ({ receiverId, authorId, orderId }) =>
          authorId === order.customerId &&
          orderId === order.id &&
          receiverId === currentOffer.sellerId,
      )
    ) {
      setReviewModalVisible(true);
    }
  }, [currentOffer]);

  const changeAvailable =
    !currentOffer?.changedTransportCompany &&
    !currentOffer?.trackNumber &&
    !order?.inHistory;
  const disabledDate = (current: moment.Moment) => {
    return (
      (current && current > moment().endOf('day')) ||
      current < moment(order.createdAt)
    );
  };

  useEffect(() => {
    !!reason?.reason?.length && setCheckRejectReasonVisible(true);
  }, [reason]);

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
      <CheckReasonRejectChangeConditions
        open={checkRejectReasonVisible}
        onCancel={() => setCheckRejectReasonVisible(false)}
        currentOffer={currentOffer}
        reason={reason}
      />
      <PageContent>
        {order.paymentDate && (
          <KeyValueItem
            keyText="Дата заказа"
            value={formatDate(new Date(order.paymentDate), 'dd.MM.yyyy HH:mm')}
            style={{ marginTop: -20 }}
          />
        )}

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
              <div className="d-flex justify-content-between align-items-end">
                <SellerReviewModal
                  open={reviewModalVisible}
                  onCancel={() => setReviewModalVisible(false)}
                  receiverId={currentOffer.sellerId}
                  orderId={order.id}
                  onSuccess={review => {
                    setReviews(prev => prev.concat(review));
                    router.push(
                      generateUrl(
                        {
                          history: DEFAULT_NAV_PATHS.PERSONAL_AREA,
                        },
                        {
                          pathname: APP_PATHS.PERSONAL_AREA,
                        },
                      ),
                    );
                  }}
                />
                <RefundExchangeRequestModal
                  requestProduct={selectedRefundExchangeData?.requestProduct}
                  order={currentOffer}
                  refundExchangeRequest={
                    selectedRefundExchangeData?.refundExchangeRequest
                  }
                  refundExchangeHistory={
                    selectedRefundExchangeData?.refundExchangeHistory
                  }
                />
                <div>
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
                              searchParams: {
                                tab: null,
                              },
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
                        <>
                          {currentOffer?.changedTransportCompany
                            ? 'ожидается изменение на' +
                              ' ' +
                              (currentOffer?.notConfirmedTransportCompany
                                ? currentOffer?.notConfirmedTransportCompany
                                    ?.name
                                : 'самовывоз')
                            : currentOffer?.transportCompany
                            ? currentOffer?.transportCompany?.name
                            : 'самовывоз'}{' '}
                        </>
                      }
                    />{' '}
                    {changeAvailable && (
                      <KeyValueItem
                        keyText=" "
                        value={'изменить'}
                        onValueClick={() =>
                          // changeAvailable &&
                          setChangeShippingConditionVisible(true)
                        }
                      />
                    )}
                    {currentOffer?.transportCompany && (
                      <>
                        <KeyValueItem
                          keyText="Трек номер"
                          value={currentOffer?.trackNumber || '-'}
                          valueClassName="text_14"
                          className="ml-10"
                        />
                        <KeyValueItem
                          keyText="Заказ отгружен"
                          value={
                            !!currentOffer?.departureDate
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
                      ['PAID', 'PAYMENT_POSTPONED'].includes(
                        currentOffer?.status,
                      ) ? (
                        <div
                          className="d-flex align-items-center"
                          style={{ gap: 5 }}
                        >
                          <Checkbox
                            checked={!!currentOffer?.receivingDate}
                            onChange={({ target: { checked } }) =>
                              handlers.updateReceivingDate(checked)
                            }
                          />
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
                              disabled={!!currentOffer?.receivingDate}
                              disabledDate={disabledDate}
                            />
                          </ConfigProvider>
                        </div>
                      ) : (
                        '-'
                      )
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
                  <div className="d-flex justify-content-end">
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
                <KeyValueItem
                  keyText="Цены указаны"
                  value={currentOffer.organization.hasNds ? 'с НДС' : 'без НДС'}
                />
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
                rows={currentOffer.products.map((product, i) => {
                  const refundAvailable =
                    !!product.refundExchangeRequest ||
                    (differenceInDays(
                      new Date(),
                      new Date(currentOffer?.receivingDate),
                    ) >= 0 &&
                      differenceInDays(
                        new Date(),
                        new Date(currentOffer?.receivingDate),
                      ) < 7);

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
                        content:
                          currentOffer?.status === 'PAID' &&
                          !!currentOffer?.receivingDate ? (
                            <span
                              className="text-underline color-primary"
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                if (!refundAvailable) return;
                                handlers.handleOpenRefundExchangeModal(
                                  product.id,
                                );
                              }}
                            >
                              {!!product.refundExchangeRequest
                                ? locale?.refundExchange?.statuses?.[
                                    product.refundExchangeRequest.status ===
                                    'AGREED'
                                      ? product.refundExchangeRequest
                                          ?.disputeResolution
                                      : product.refundExchangeRequest.status
                                  ]
                                : differenceInDays(
                                    new Date(),
                                    new Date(currentOffer?.receivingDate),
                                  ) >= 0 &&
                                  differenceInDays(
                                    new Date(),
                                    new Date(currentOffer?.receivingDate),
                                  ) < 7
                                ? 'оформить'
                                : '-'}
                            </span>
                          ) : (
                            '-'
                          ),
                      },
                    ],
                  };
                })}
              />
              <ul className="sub-table mb-10">
                <li className="sub-table__item">Итого:</li>
                <li className="sub-table__item" style={{ width: '5%' }}>
                  {ORDER_CALCULATIONS.orderedProductsQuantity(
                    currentOffer.products,
                  )}
                </li>
                <li className="sub-table__item" style={{ width: '9%' }}></li>
                <li className="sub-table__item" style={{ width: '7%' }}></li>
                <li className="sub-table__item" style={{ width: '9%' }}></li>
                <li className="sub-table__item" style={{ width: '9%' }}></li>
                <li className="sub-table__item" style={{ width: '10%' }}>
                  {ORDER_CALCULATIONS.offerTotalPrice(currentOffer.products)
                    .roundFraction()
                    .separateBy(' ')}
                </li>
                <li className="sub-table__item" style={{ width: '7%' }}></li>
              </ul>
              <p style={{ fontSize: 12 }}>
                *Дата поступления ориентировочная, точную дату уточняйте у
                продавца
              </p>
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

        {isHistory && (
          <Link
            href={generateInnerUrl(APP_PATHS.ORDER_REPEAT(order.id), {
              text: locale.navigation['order-repeat'],
            })}
          >
            <Button type="primary" className="gray ml-10">
              Повторить запрос
            </Button>
          </Link>
        )}
        {(attachments?.length > 0 || (!!order?.payerId && !!currentOffer)) && (
          <Button
            type="primary"
            className="ml-10 color-white"
            onClick={() => setAttachmentsModalOpen(true)}
          >
            Вложения
          </Button>
        )}
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
    </Fragment>
  );
};

export default OrderContentCustomer;
