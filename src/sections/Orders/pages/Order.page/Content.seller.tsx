import {
  Container,
  KeyValueItem,
  PageContent,
  Table,
  Summary,
  Link,
} from 'components/common';
import { MessageOutlined, LoadingOutlined } from '@ant-design/icons';
import { ConfigProvider, Popover, Spin } from 'antd';
import antdLocale from 'antd/lib/locale/ru_RU';
import {
  IOrder,
  IOrderAttachment,
  IOrderRequest,
} from 'sections/Orders/interfaces';
import { convertAddressToString } from 'components/common/YandexMap/utils';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import formatDate from 'date-fns/format';
import { getUserName } from 'sections/Users/utils';
import { Button, Checkbox, DatePicker, Input, Popconfirm } from 'antd';
import { ORDER_CALCULATIONS } from 'sections/Orders/utils';
import { useModalsState } from 'hooks/modal.hook';
import useHandlers from './handlers.ts/seller.handler';
import { startChatWithUser } from 'components/complex/Messenger/utils/messenger.utils';
import addDays from 'date-fns/addDays';
import { generateInnerUrl, renderHtml } from 'utils/common.utils';
import { FC, Fragment, SetStateAction, useEffect, useState } from 'react';
import { ISetState } from 'interfaces/common.interfaces';
import moment from 'moment';
import DownloadDocModal from 'sections/Orders/components/DownloadDocModal';
import { DownloadOutlined } from '@ant-design/icons';
import { downloadOrderDocService } from 'sections/Orders/services/downloadOrderDoc.service';
import OrderTableRows from './OrderTableRows';
import GenerateAcceptanceActModal from 'sections/Orders/components/GenerateAcceptanceActModal';
import OrderAttachmentListModal from 'sections/Orders/components/OrderAttachmentListModal';
import OrderAttachmentModal from 'sections/Orders/components/OrderAttachmentModal';
import OrderAttachmentListExtendable from 'sections/Orders/components/OrderAttachmentListExtendable';

interface IProps {
  order: IOrderRequest;
  setOrder: ISetState<IOrderRequest>;
  offer: IOrder;
  setAddressModalVisible: (value: SetStateAction<boolean>) => void;
  setOrgInfoModalVisible: (value: SetStateAction<boolean>) => void;
  setApprovedShippingChangedModal: (value: SetStateAction<boolean>) => void;
  fetchOrder: () => Promise<void>;
}

const OrderContentSeller: FC<IProps> = ({
  order,
  setOrder,
  offer,
  setAddressModalVisible,
  setOrgInfoModalVisible,
  setApprovedShippingChangedModal,
  fetchOrder,
}) => {
  const { Modal: RefundExchangeRequestModal, openModal } = useModalsState();
  const DatePickerUntyped = DatePicker as any;

  const isHistory = !!offer?.receivingDate;

  const {
    locale,
    departureDate,
    trackNumber,
    selectedRefundExchangeData,
    allowUpdate,
    attachments,
    setAttachments,
    describedProducts,
    loaderVisible,
    commission,
    generateAcceptanceActOpen,
    setGenerateAcceptanceActOpen,
    generateAcceptanceActAvailable,
    attachmentsModalOpen,
    setAttachmentsModalOpen,
    openAttachment,
    setOpenAttachment,
    handlers,
  } = useHandlers({ order, setOrder, offer, openModal });
  const [downloadDocModalVisible, setDownloadDocModalVisible] = useState(false);
  const [downloadDocAwaiting, setDownloadDocAwaiting] = useState(false);

  const disabledDate = (current: moment.Moment) => {
    return (
      (current && current > moment().endOf('day')) ||
      current < moment(order.createdAt)
    );
  };

  useEffect(() => {
    !!offer?.changedTransportCompany && setApprovedShippingChangedModal(true);
  }, [offer?.changedTransportCompany]);

  const downloadDoc = async (docType: 'pdf' | 'xlsx') =>
    await downloadOrderDocService({
      url: API_ENDPOINTS.ORDER_DOC(order.id),
      docType,
      awaiting: downloadDocAwaiting,
      setAwaiting: setDownloadDocAwaiting,
      params: {
        offerId: null,
      },
    });

  const onAcceptanceActGenerated = async (attachment: IOrderAttachment) => {
    await fetchOrder();
    setOpenAttachment(attachment);
  };

  return (
    <Fragment>
      <PageContent className="h-100-flex">
        <div className="d-flex justify-content-between align-items-end">
          <div>
            {offer.status === 'PAYMENT_POSTPONED' &&
              !!offer?.paymentPostponedAt && (
                <div style={{ fontSize: 14 }}>
                  <strong
                    className="color-primary"
                    style={{ fontSize: 18, marginTop: -1 }}
                  >
                    !
                  </strong>{' '}
                  <strong className="text-uppercase">Заказ не оплачен</strong>{' '}
                  <span className="color-primary text-lowercase">
                    Срок оплаты до:{' '}
                    {moment(offer?.paymentPostponedAt).format('DD.MM.yyyy')}
                  </span>
                </div>
              )}

            {order.paymentDate && (
              <KeyValueItem
                keyText="Дата заказа"
                value={formatDate(
                  new Date(order.createdAt),
                  'dd.MM.yyyy HH:mm',
                )}
              />
            )}

            <KeyValueItem
              keyText="Покупатель"
              value={getUserName(order.customer)}
              href={generateInnerUrl(APP_PATHS.CUSTOMER(order.customerId), {
                text: getUserName(order.customer),
              })}
              hrefTarget="_blank"
            />
            <KeyValueItem
              keyText="Плательщик"
              value={
                !!order?.payerId
                  ? order?.payer?.name
                  : getUserName(order.customer)
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

            <KeyValueItem
              keyText="Адрес доставки"
              value={convertAddressToString(order.address)}
              onValueClick={() => setAddressModalVisible(true)}
            />

            <div className="d-flex align-items-center">
              <KeyValueItem
                keyText="Условие доставки"
                // value={
                //   offer.changedTransportCompany
                //     ? 'смена условий доставки'
                //     : offer.transportCompany
                //     ? offer.transportCompany.name
                //     : 'самовывоз'
                // }
                value={
                  offer.transportCompany
                    ? offer.transportCompany.name
                    : 'самовывоз'
                }
                // onValueClick={() => {
                //   setApprovedShippingChangedModal(true);
                // }}
              />
              {!!offer?.transportCompany && (
                <>
                  <KeyValueItem
                    keyText="Трек номер"
                    value={
                      offer?.trackNumber ?? (
                        <Input
                          value={trackNumber}
                          onChange={({ target: { value } }) =>
                            handlers.handleTrackNumberChange(value)
                          }
                          disabled={isHistory}
                          size="small"
                        />
                      )
                    }
                    valueClassName="d-inline-block text_14"
                    className="ml-10"
                  />
                  <KeyValueItem
                    keyText="Заказ отгружен"
                    value={
                      offer?.departureDate ? (
                        formatDate(new Date(offer.departureDate), 'dd.MM.yyyy')
                      ) : (
                        <ConfigProvider locale={antdLocale}>
                          <DatePickerUntyped
                            value={departureDate}
                            format="DD.MM.YYYY"
                            size="small"
                            onChange={departureDate =>
                              handlers.handleDepartureDateChange(departureDate)
                            }
                            disabled={isHistory}
                            disabledDate={disabledDate}
                          />
                        </ConfigProvider>
                      )
                    }
                    valueClassName="d-inline-block text_14"
                    className="ml-10"
                  />
                </>
              )}
            </div>
            <KeyValueItem
              keyText="Заказ получен покупателем"
              value={
                <Popconfirm
                  title="Подтвердите получение заказа"
                  okText="Подтвердить"
                  cancelText="Отмена"
                  onConfirm={() => handlers.updateReceivingDate(true)}
                  disabled={!!offer?.receivingDate || !!offer.transportCompany}
                >
                  <Checkbox
                    checked={!!offer?.receivingDate}
                    disabled={!!offer.transportCompany}
                  >
                    {offer?.receivingDate
                      ? formatDate(new Date(offer.receivingDate), 'dd.MM.yyy')
                      : '__.__.____'}
                  </Checkbox>
                </Popconfirm>
              }
              valueClassName="d-inline-block"
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
              offer={offer}
              withUploads
            />
          </div>

          <Button
            type="primary"
            onClick={() =>
              startChatWithUser({
                companionId: order.customerId,
                companionRole: 'customer',
                orderRequestId: order.id,
              })
            }
          >
            {'Чат с покупателем'} <MessageOutlined />
          </Button>
        </div>

        <Container
          className="d-flex justify-content-between bg-light-gray mt-10 mb-20"
          verticalPadding
        >
          <div className="d-flex">
            <span>{offer.organization.name}</span>
          </div>
          <div className="d-flex">
            <KeyValueItem
              keyText="Цены указаны"
              value={offer.organization.hasNds ? 'с НДС' : 'без НДС'}
              className="ml-15"
            />
            {!order?.commissionType && (
              <KeyValueItem
                keyText="Комиссия"
                value={`${offer.organization.priceBenefitPercent}%`}
                className="ml-15"
              />
            )}
            {order?.commissionType === 'acquiring' && (
              <KeyValueItem
                keyText="Комиссия эквайринг"
                value={`${offer.organization.priceBenefitPercentAcquiring}%`}
                className="ml-15"
              />
            )}
            {order?.commissionType === 'invoice' && (
              <KeyValueItem
                keyText="Комиссия по счёту"
                value={`${offer.organization.priceBenefitPercentInvoice}%`}
                className="ml-15"
              />
            )}
            {!order?.commissionType && (
              <KeyValueItem
                keyText="CASH"
                value={ORDER_CALCULATIONS.offerTotalCash(
                  offer.products,
                  offer.organization,
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
              content: 'Возврат/\nобмен',
              width: '7%',
            },
          ]}
          rows={offer.products.map((product, i) => ({
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
              { content: product.count },
              { content: product.unitPrice.roundFraction().separateBy(' ') },
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
                          product.refundExchangeRequest.status === 'AGREED'
                            ? product.refundExchangeRequest?.disputeResolution
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
          totalPaidSum={ORDER_CALCULATIONS.offerTotalPrice(offer.products)
            .roundFraction()
            .separateBy(' ')}
          quantityProducts={ORDER_CALCULATIONS.orderedProductsQuantity(
            offer.products,
          )}
        />
        {!order.commissionType &&
          !!offer?.organization?.priceBenefitPercent && (
            <Fragment>
              <OrderTableRows
                title="Комиссия"
                totalPaidSum={
                  ORDER_CALCULATIONS.offerCommission(
                    offer.organization.priceBenefitPercent,
                    offer.products,
                  )
                    .roundFraction()
                    .separateBy(' ') || 0
                }
              />
              <OrderTableRows
                title="За вычетом комиссии"
                totalPaidSum={ORDER_CALCULATIONS.offerTotalPriceMinusCommission(
                  offer.organization.priceBenefitPercent,
                  offer.products,
                )
                  .roundFraction()
                  .separateBy(' ')}
              />
            </Fragment>
          )}
        {order.commissionType === 'acquiring' && (
          <Fragment>
            <OrderTableRows
              title="Комиссия Эквайринг"
              totalPaidSum={
                ORDER_CALCULATIONS.offerCommission(
                  offer.organization.priceBenefitPercentAcquiring,
                  offer.products,
                )
                  .roundFraction()
                  .separateBy(' ') || 0
              }
            />
            <OrderTableRows
              title="За вычетом комиссии"
              totalPaidSum={ORDER_CALCULATIONS.offerTotalPriceMinusCommission(
                offer.organization.priceBenefitPercentAcquiring,
                offer.products,
              )
                .roundFraction()
                .separateBy(' ')}
            />
          </Fragment>
        )}
        {order.commissionType === 'invoice' && (
          <Fragment>
            <OrderTableRows
              title="Комиссия по счету"
              totalPaidSum={
                ORDER_CALCULATIONS.offerCommission(
                  offer.organization.priceBenefitPercentInvoice,
                  offer.products,
                )
                  .roundFraction()
                  .separateBy(' ') || 0
              }
            />
            <OrderTableRows
              title="За вычетом комиссии"
              totalPaidSum={ORDER_CALCULATIONS.offerTotalPriceMinusCommission(
                offer.organization.priceBenefitPercentInvoice,
                offer.products,
              )
                .roundFraction()
                .separateBy(' ')}
            />
          </Fragment>
        )}
      </PageContent>
      <Summary containerClassName="justify-content-end">
        {generateAcceptanceActAvailable && (
          <Button
            onClick={() => setGenerateAcceptanceActOpen(true)}
            className="gray ml-10"
          >
            Акт ПП
          </Button>
        )}

        <Button
          type="ghost"
          className="gray ml-10"
          icon={<DownloadOutlined style={{ fontSize: 24, color: 'white' }} />}
          onClick={() => setDownloadDocModalVisible(true)}
        />

        {(attachments?.length > 0 ||
          ['PAID', 'REWARD_PAID', 'COMPLETED'].includes(order.status)) && (
          <Button
            type="primary"
            className="color-white ml-10"
            onClick={() => setAttachmentsModalOpen(true)}
          >
            Вложения
          </Button>
        )}
        {allowUpdate && (
          <Button
            type="primary"
            className="color-white ml-10"
            onClick={handlers.handleSubmit}
          >
            Сохранить
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
          offer={offer}
          withUploads
        />
      )}
      <OrderAttachmentModal
        open={!!openAttachment}
        onClose={() => setOpenAttachment(null)}
        attachment={openAttachment}
      />

      <RefundExchangeRequestModal
        refundExchangeRequest={
          selectedRefundExchangeData?.refundExchangeRequest
        }
        refundExchangeHistory={
          selectedRefundExchangeData?.refundExchangeHistory
        }
      />
      <DownloadDocModal
        open={downloadDocModalVisible}
        onCancel={() => setDownloadDocModalVisible(false)}
        downloadPdf={() => downloadDoc('pdf')}
        downloadXlsx={() => downloadDoc('xlsx')}
        loading={downloadDocAwaiting}
      />
      <GenerateAcceptanceActModal
        open={generateAcceptanceActOpen}
        onClose={() => setGenerateAcceptanceActOpen(false)}
        orderId={order.id}
        offerId={offer.id}
        offerProducts={offer.products}
        commission={commission}
        commissionType={order.commissionType}
        onSuccess={onAcceptanceActGenerated}
      />
    </Fragment>
  );
};

export default OrderContentSeller;
