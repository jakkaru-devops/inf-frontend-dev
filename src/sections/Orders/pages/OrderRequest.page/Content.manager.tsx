import { FC, Fragment, SetStateAction, useEffect, useState } from 'react';
import {
  KeyValueItem,
  PageContent,
  Table,
  Summary,
  Link,
} from 'components/common';
import { MessageOutlined, LoadingOutlined } from '@ant-design/icons';
import { IOrderRequest } from 'sections/Orders/interfaces';
import { convertAddressToString } from 'components/common/YandexMap/utils';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { Button, Checkbox, Popconfirm, Spin } from 'antd';
import { useRouter } from 'next/router';
import { APIRequest } from 'utils/api.utils';
import formatDate from 'date-fns/format';
import classNames from 'classnames';
import { startChatWithUser } from 'components/complex/Messenger/utils/messenger.utils';
import { IUser } from 'sections/Users/interfaces';
import { getUserName } from 'sections/Users/utils';
import {
  generateInnerUrl,
  generateUrl,
  openNotification,
  renderHtml,
} from 'utils/common.utils';
import { useLocale } from 'hooks/locale.hook';
import { useNotifications } from 'hooks/notifications.hooks';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';
import DownloadDocModal from 'sections/Orders/components/DownloadDocModal';
import { DownloadOutlined } from '@ant-design/icons';
import { downloadOrderDocService } from 'sections/Orders/services/downloadOrderDoc.service';
import moment from 'moment';
import { useAuth } from 'hooks/auth.hook';
import OrderAttachmentListExtendable from 'sections/Orders/components/OrderAttachmentListExtendable';
import OrderAttachmentListModal from 'sections/Orders/components/OrderAttachmentListModal';
import { API_ENDPOINTS_V2 } from 'data/api.data';

interface IProps {
  orderRequest: IOrderRequest;
  setOrderRequest: (value: IOrderRequest) => void;
  setAddressModalVisible: (value: SetStateAction<boolean>) => void;
  sellers: IUser[];
}

const OrderRequestContentManager: FC<IProps> = ({
  orderRequest,
  setOrderRequest,
  setAddressModalVisible,
  sellers,
}) => {
  const auth = useAuth();
  const router = useRouter();
  const { locale } = useLocale();
  const { fetchUnreadNotificationsCount } = useNotifications();

  const [savedRegions, setSavedRegions] = useState([]);
  const [downloadDocModalVisible, setDownloadDocModalVisible] = useState(false);
  const [downloadDocAwaiting, setDownloadDocAwaiting] = useState(false);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentPostponeSubmitting, setPaymentPostponeSubmitting] =
    useState(false);
  const [attachmentsModalOpen, setAttachmentsModalOpen] = useState(false);

  const productsWithIds = orderRequest.products.filter(
    ({ productId }) => productId,
  );
  const describedProducts = orderRequest.products.filter(
    ({ describedProduct }) => describedProduct,
  );
  const [attachments, setAttachments] = useState([
    ...orderRequest.attachments,
    ...describedProducts.flatMap(
      ({ describedProduct: { attachments } }) => attachments,
    ),
  ]);

  useEffect(() => {
    APIRequest({
      method: 'get',
      url: API_ENDPOINTS.SELECTED_REGIONS,
      requireAuth: true,
      params: { orderRequestId: orderRequest.id },
    }).then(res => {
      if (!res.isSucceed) return;
      console.log('res.data', res.data);
      setSavedRegions(res.data);
    });
  }, []);

  useEffect(() => {
    const notifications = orderRequest?.unreadNotifications.filter(
      el => !el?.orderId,
    );
    if (!notifications.length) return;

    const notificationIds = notifications.map(({ id }) => id);
    APIRequest({
      method: 'post',
      url: API_ENDPOINTS.NOTIFICATION_UNREAD,
      data: {
        notificationIds,
      },
      requireAuth: true,
    }).then(async res => {
      if (!res.isSucceed) return;
      await fetchUnreadNotificationsCount(notificationIds);
    });
  }, [orderRequest?.id]);

  const handlePayment = async () => {
    if (paymentSubmitting) return;

    setPaymentSubmitting(true);
    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.PAY_ORDER_REQUEST,
      params: { id: orderRequest.id },
      requireAuth: true,
    });
    setPaymentSubmitting(false);

    if (!res.isSucceed) return;

    router.push(
      generateUrl(
        {
          history: DEFAULT_NAV_PATHS.ORDER(
            orderRequest.id,
            orderRequest.idOrder,
          ),
        },
        {
          pathname: APP_PATHS.ORDER(orderRequest.id),
        },
      ),
    );
  };

  const handlePaymentPostponeAccepted = async () => {
    if (paymentPostponeSubmitting) return;

    setPaymentPostponeSubmitting(true);
    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.ACCEPT_ORDER_REQUEST_PAYMENT_POSTPONE,
      params: { id: orderRequest.id },
      requireAuth: true,
    });
    setPaymentPostponeSubmitting(false);

    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }

    router.push(
      generateUrl(
        {
          history: DEFAULT_NAV_PATHS.ORDER(
            orderRequest.id,
            orderRequest.idOrder,
          ),
        },
        {
          pathname: APP_PATHS.ORDER(orderRequest.id),
        },
      ),
    );
  };

  const downloadDoc = async (docType: 'pdf' | 'xlsx') =>
    await downloadOrderDocService({
      url: API_ENDPOINTS.ORDER_REQUEST_DOC(orderRequest.id),
      docType,
      awaiting: downloadDocAwaiting,
      setAwaiting: setDownloadDocAwaiting,
    });

  const toggleDeletionStatus = async (reqId: string) => {
    const res = await APIRequest({
      method: 'patch',
      url: API_ENDPOINTS_V2.orders.deletionStatus(reqId),
    });
    if (!res.isSucceed) return;

    router.push(
      generateUrl(
        {
          history: DEFAULT_NAV_PATHS.ORDER_REQUEST_LIST,
        },
        { pathname: APP_PATHS.ORDER_REQUEST_LIST },
      ),
    );
  };

  return (
    <Fragment>
      <PageContent className="h-100-flex">
        <div className="d-flex justify-content-between">
          <div>
            {!!orderRequest?.paymentPostponedAt && (
              <KeyValueItem
                keyText="Отсрочка до"
                value={moment(orderRequest?.paymentPostponedAt).format(
                  'DD.MM.yyyy',
                )}
              />
            )}
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
                  searchParams: {
                    page: null,
                  },
                },
              )}
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
              describedProducts.map(product => {
                const allSelectedCategoriesNames =
                  product?.describedProduct?.autoBrandsData
                    .map(
                      item =>
                        `${item?.autoBrand?.name} (${item?.autoType?.name})`,
                    )
                    .concat(product?.describedProduct?.autoBrand?.name)
                    .concat(
                      product?.describedProduct?.productGroups?.map(
                        item => item?.name,
                      ),
                    )
                    .concat(product?.describedProduct?.productGroup?.name)
                    .filter(Boolean);

                return (
                  <Fragment key={product.id}>
                    <KeyValueItem
                      keyText="Категория товара"
                      value={allSelectedCategoriesNames.join(' / ')}
                    />
                    <KeyValueItem
                      keyText="Количество"
                      value={product.quantity || '-'}
                    />
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
                );
              })}

            <KeyValueItem
              keyText="Регион поставщика"
              value={
                savedRegions?.map(el => el?.fias?.name_with_type).join(', ') ||
                'Все регионы'
              }
            />
            <KeyValueItem
              keyText="Выбранный продавец"
              value={
                !sellers.length
                  ? 'Продавец не выбран'
                  : sellers.map(seller => getUserName(seller, 'lf')).join(', ')
              }
              valueClassName="text-normal"
            />
            <OrderAttachmentListExtendable
              attachments={attachments}
              setAttachments={setAttachments}
              order={orderRequest}
              withUploads
            />
          </div>
          <div>
            {auth.currentRole.label === 'operator' && (
              <Fragment>
                {orderRequest.status === 'APPROVED' && orderRequest.payerId && (
                  <div
                    className="user-select-none"
                    style={{ position: 'relative' }}
                  >
                    <Checkbox
                      onChange={({ target }) =>
                        target.checked && handlePayment()
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
                {!!orderRequest?.paymentPostponedAt &&
                  !!orderRequest.orders.length &&
                  orderRequest.orders.every(
                    offer => !!offer?.paymentPostponedAt,
                  ) && (
                    <div
                      className="user-select-none"
                      style={{ position: 'relative' }}
                    >
                      <Checkbox
                        onChange={({ target }) =>
                          target.checked && handlePaymentPostponeAccepted()
                        }
                        className="ml-10 mb-5"
                      >
                        Отсрочка
                      </Checkbox>
                      {paymentPostponeSubmitting && (
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
              </Fragment>
            )}
          </div>
        </div>

        {productsWithIds.length > 0 && (
          <Table
            className="mt-20"
            cols={[
              { content: null, width: '10%' },
              { content: 'Наименование', width: '40%' },
              { content: 'Производитель', width: '20%' },
              { content: 'Артикул', width: '20%' },
              { content: 'Кол-во', width: '10%' },
            ]}
            rows={productsWithIds.map(product => ({
              cols: [
                {
                  content: (
                    <>
                      {!!product?.product?.preview ? (
                        <img
                          src={product.product.preview}
                          style={{ height: 45 }}
                          alt={product.product.name}
                        />
                      ) : (
                        <div className="d-flex justify-content-center align-items-center">
                          Без фото
                        </div>
                      )}
                    </>
                  ),
                  href:
                    !!product?.product &&
                    generateInnerUrl(APP_PATHS.PRODUCT(product.productId), {
                      text: product.product.name,
                    }),
                },
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
                  content: product?.product?.article || product?.reserveArticle,
                },
                { content: product.quantity },
              ],
            }))}
          />
        )}
      </PageContent>
      <Summary containerClassName="justify-content-end">
        {auth.currentRole.label === 'manager' &&
          (!orderRequest.managerDeletedAt ? (
            <Popconfirm
              title={`Вы действительно хотите удалить Запрос ${orderRequest.idOrder}?`}
              okText="Удалить"
              cancelText="Отмена"
              onConfirm={() => toggleDeletionStatus(orderRequest.id)}
              placement="bottomRight"
            >
              <Button type="ghost" className="color-white gray">
                Удалить запрос
              </Button>
            </Popconfirm>
          ) : (
            <Popconfirm
              title={`Вы действительно хотите восстановить Запрос ${orderRequest.idOrder}?`}
              okText="Востанновить"
              cancelText="Отмена"
              onConfirm={() => toggleDeletionStatus(orderRequest.id)}
              placement="bottomRight"
            >
              <Button type="ghost" className="color-white gray">
                Восстановить запрос
              </Button>
            </Popconfirm>
          ))}

        <Button
          type="ghost"
          className="gray ml-10"
          icon={<DownloadOutlined style={{ fontSize: 24, color: 'white' }} />}
          onClick={() => setDownloadDocModalVisible(true)}
        />

        {attachments?.length > 0 && (
          <Button
            type="primary"
            className={classNames('color-white ml-10')}
            onClick={() => setAttachmentsModalOpen(true)}
          >
            Вложения
          </Button>
        )}
        {orderRequest.orders.length > 0 && (
          <Link
            href={generateInnerUrl(
              APP_PATHS.ORDER_REQUEST_OFFER_LIST(orderRequest.id),
              {
                text: locale.navigation.offers,
                searchParams: {
                  page: null,
                },
              },
            )}
            className="ml-10"
          >
            <Button type="primary" className="color-white gray">
              Предложения
            </Button>
          </Link>
        )}
        <Button
          type="primary"
          className="ml-10"
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
      </Summary>

      {!!attachments?.length && (
        <OrderAttachmentListModal
          open={attachmentsModalOpen}
          onClose={() => setAttachmentsModalOpen(false)}
          attachments={attachments}
          setAttachments={setAttachments}
          order={orderRequest}
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

export default OrderRequestContentManager;
