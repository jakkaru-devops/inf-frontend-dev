import { Button, Popconfirm } from 'antd';
import classNames from 'classnames';
import { FC, Fragment, SetStateAction, useEffect, useState } from 'react';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { APIRequest } from 'utils/api.utils';
import { convertAddressToString } from 'components/common/YandexMap/utils';
import { IOrderRequest } from 'sections/Orders/interfaces';
import {
  KeyValueItem,
  Table,
  SelectSettlementsModal,
  PageContent,
  Summary,
  Link,
} from 'components/common';
import formatDate from 'date-fns/format';
import {
  generateInnerUrl,
  generateUrl,
  openNotification,
  renderHtml,
} from 'utils/common.utils';
import { useRouter } from 'next/router';
import { IUser } from 'sections/Users/interfaces';
import { useLocale } from 'hooks/locale.hook';
import SelectOrderRequestSeller from 'sections/Orders/components/SelectOrderRequestSeller';
import { useNotifications } from 'hooks/notifications.hooks';
import DownloadDocModal from 'sections/Orders/components/DownloadDocModal';
import { DownloadOutlined } from '@ant-design/icons';
import { downloadOrderDocService } from 'sections/Orders/services/downloadOrderDoc.service';
import moment from 'moment';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';
import OrderAttachmentListExtendable from 'sections/Orders/components/OrderAttachmentListExtendable';
import OrderAttachmentListModal from 'sections/Orders/components/OrderAttachmentListModal';

interface IProps {
  orderRequest: IOrderRequest;
  setAddressModalVisible: (value: SetStateAction<boolean>) => void;
  sellers: IUser[];
}

const OrderRequestContentCustomer: FC<IProps> = ({
  orderRequest,
  setAddressModalVisible,
  sellers,
}) => {
  const router = useRouter();
  const { locale } = useLocale();
  const { fetchUnreadNotificationsCount } = useNotifications();

  const [savedRegions, setSavedRegions] = useState([]);
  const [show, setShow] = useState(false);
  const [downloadDocModalVisible, setDownloadDocModalVisible] = useState(false);
  const [downloadDocAwaiting, setDownloadDocAwaiting] = useState(false);
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

  const onCancel = () => {
    setShow(false);
  };

  useEffect(() => {
    APIRequest({
      method: 'get',
      url: API_ENDPOINTS.SELECTED_REGIONS,
      requireAuth: true,
      params: { orderRequestId: orderRequest.id },
    }).then(res => {
      if (!res.isSucceed) return;
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

  const deleteOrderRequest = async () => {
    const res = await APIRequest({
      method: 'delete',
      url: API_ENDPOINTS.ORDER_REQUEST,
      params: {
        id: orderRequest.id,
      },
      requireAuth: true,
    });
    if (!res.isSucceed) {
      openNotification(res.message);
    }
    openNotification(res.data.message);
    router.push(
      generateUrl(
        {
          history: DEFAULT_NAV_PATHS.ORDER_REQUEST_LIST,
        },
        { pathname: APP_PATHS.ORDER_REQUEST_LIST },
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

  return (
    <Fragment>
      <PageContent className="h-100-flex">
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

        {productsWithIds.length > 0 && (
          <>
            <KeyValueItem
              keyText="Адрес доставки"
              value={convertAddressToString(orderRequest.address)}
              onValueClick={() => setAddressModalVisible(true)}
            />
            {!!orderRequest?.comment && (
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
                  item => `${item?.autoBrand?.name} (${item?.autoType?.name})`,
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
        <SelectOrderRequestSeller
          sellers={{
            count: sellers.length,
            rows: sellers,
          }}
          selectedSellersIds={sellers.map(({ id }) => id)}
          setSelectedSellerIds={() => {}}
        />
        <OrderAttachmentListExtendable
          attachments={attachments}
          setAttachments={setAttachments}
          order={orderRequest}
          withUploads
        />

        {productsWithIds.length > 0 && (
          <Table
            className="mt-20 mb-10"
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

        <SelectSettlementsModal
          open={show}
          onCancel={onCancel}
          orderRequestId={orderRequest.id}
          regionsInit={[]}
          onSubmit={setSavedRegions}
        />
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
            className={classNames('color-white ml-10')}
            onClick={() => setAttachmentsModalOpen(true)}
          >
            Вложения
          </Button>
        )}
        <Popconfirm
          title={`Вы действительно хотите удалить Запрос ${orderRequest.idOrder}?`}
          okText="Удалить"
          cancelText="Отмена"
          onConfirm={deleteOrderRequest}
          placement="bottomRight"
        >
          <Button type="primary" className="color-white gray ml-10">
            Удалить запрос
          </Button>
        </Popconfirm>
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
            <Button type="primary" className="color-white">
              Предложения
            </Button>
          </Link>
        )}
      </Summary>

      {attachments && (
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

export default OrderRequestContentCustomer;
