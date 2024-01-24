import {
  Button,
  Checkbox,
  ConfigProvider,
  DatePicker,
  Popconfirm,
  Select,
} from 'antd';
import antdLocale from 'antd/lib/locale/ru_RU';
import { MessageOutlined, DownloadOutlined } from '@ant-design/icons';
import { ISetState } from 'interfaces/common.interfaces';
import moment from 'moment';
import { FC, Fragment } from 'react';
import { IOrderRequest } from 'sections/Orders/interfaces';
import { IOrganization } from 'sections/Organizations/interfaces';
import { useHandlers } from './handlers';
import { formatPrice, generateInnerUrl, renderHtml } from 'utils/common.utils';
import {
  Container,
  KeyValueItem,
  PageContent,
  Summary,
} from 'components/common';
import formatDate from 'date-fns/format';
import { getUserName } from 'sections/Users/utils';
import { APP_PATHS } from 'data/paths.data';
import OrderAttachmentListExtendable from 'sections/Orders/components/OrderAttachmentListExtendable';
import { startChatWithUser } from 'components/complex/Messenger/utils/messenger.utils';
import { convertAddressToString } from 'components/common/YandexMap/utils';
import OrderAttachmentListModal from 'sections/Orders/components/OrderAttachmentListModal';
import classNames from 'classnames';
import DownloadDocModal from 'sections/Orders/components/DownloadDocModal';
import OrderRequestTableRows from '../OrderRequestTableRows';
import {
  calculateCommission,
  calculateLessCommission,
  calculateQuantityAvailable,
  calculateQuantityProducts,
  calculateTotal,
  calculateTotalCash,
  calculateTotalPaid,
} from 'sections/Orders/utils';
import NewOfferProductModal from './NewOfferProductModal';
import RequestSellerTable from './Table';

interface IProps {
  orderRequest: IOrderRequest;
  setOrderRequest: (value: IOrderRequest) => void;
  organizations: IOrganization[];
  setAddressModalVisible: ISetState<boolean>;
}

const OrderRequestContentSeller: FC<IProps> = ({
  orderRequest,
  setOrderRequest,
  organizations,
  setAddressModalVisible,
}) => {
  const {
    router,
    dispatch,
    offerProductSelection,
    setOfferProductSelection,
    offer,
    productsWithIds,
    describedProducts,
    products,
    productsRefs,
    paymentDate,
    postponedPaymentEnabled,
    attachments,
    attachmentsModalOpen,
    setAttachmentsModalOpen,
    selectedOrganization,
    disabledPaymentDate,
    downloadDocModalVisible,
    setDownloadDocModalVisible,
    downloadDocAwaiting,
    allowCreateOffer,
    updateAllowed,
    activeProductIndex,
    setActiveProductIndex,
    submitAwaiting,
    isEditingMode,

    handlePaymentDateChange,
    handlePostponedPaymentEnabledChange,
    selectOrganization,
    enableEditingMode,
    disableEditingMode,
    completeEditing,
    handleProductUpdate,
    handleNewProductValueChange,
    addOfferProduct,
    deleteOfferProduct,
    startManualProductEditing,
    submitCreateOffer,
    updateOffer,
    deleteOffer,
    downloadDoc,
  } = useHandlers({
    orderRequest,
    setOrderRequest,
    organizations,
  });

  return (
    <Fragment>
      <PageContent className="h-100-flex">
        <div className="d-flex justify-content-between">
          <div>
            {!!orderRequest?.paymentPostponedAt && (
              <div
                className="d-flex align-items-center"
                style={{ fontSize: 14 }}
              >
                <span>
                  <strong
                    className="color-primary"
                    style={{ fontSize: 18, marginTop: -1 }}
                  >
                    !
                  </strong>{' '}
                  Покупатель просит отсрочку до{' '}
                  <strong>
                    {moment(orderRequest?.paymentPostponedAt).format(
                      'DD.MM.yyyy',
                    )}
                  </strong>
                  : согласовать?
                </span>
                <span className="mr-3" style={{ marginLeft: 8 }}>
                  Да
                </span>
                <Checkbox
                  checked={postponedPaymentEnabled === true}
                  onChange={() => handlePostponedPaymentEnabledChange(true)}
                />
                <span className="mr-3" style={{ marginLeft: 8 }}>
                  Нет
                </span>
                <Checkbox
                  checked={postponedPaymentEnabled === false}
                  onChange={() => handlePostponedPaymentEnabledChange(false)}
                />
                <span className="mr-5" style={{ marginLeft: 8 }}>
                  Изменить дату отсрочки
                </span>
                <ConfigProvider locale={antdLocale}>
                  <DatePicker
                    style={{ marginBottom: 1 }}
                    value={paymentDate}
                    format="DD.MM.YYYY"
                    size="small"
                    onChange={date => handlePaymentDateChange(date)}
                    disabledDate={disabledPaymentDate}
                    disabled={!postponedPaymentEnabled}
                    clearIcon={false}
                  />
                </ConfigProvider>
              </div>
            )}
            {!orderRequest?.paymentPostponedAt &&
              !!offer?.paymentPostponedAt && (
                <div>
                  <strong
                    className="color-primary"
                    style={{ fontSize: 18, marginTop: -1 }}
                  >
                    !
                  </strong>{' '}
                  <span>
                    Данному покупателю согласована отсрочка до{' '}
                    {moment(offer?.paymentPostponedAt).format('DD.MM.yyyy')}
                    {!!offer?.paymentPostponeMaxSum &&
                      ` до ${formatPrice(offer.paymentPostponeMaxSum)} руб.`}
                    {!!offer?.paymentPostponeCustomerOrganization &&
                      ` для ${offer.paymentPostponeCustomerOrganization.name}`}
                  </span>
                </div>
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
                },
              )}
            />

            {!!productsWithIds?.length && (
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

            {!!describedProducts?.length &&
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

            <OrderAttachmentListExtendable
              attachments={attachments}
              order={orderRequest}
              withUploads
            />
          </div>
          <div className="d-flex align-items-end">
            <Button
              type="primary"
              size="large"
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
            {!!organizations?.length ? (
              <>
                <span>Выбрать организацию</span>
                <Select
                  size="small"
                  style={{
                    width: 200,
                  }}
                  className="ml-10"
                  value={selectedOrganization?.id || null}
                  defaultValue={offer?.organization?.id}
                  onChange={organizationId =>
                    selectOrganization(organizationId)
                  }
                >
                  {organizations.map(org => (
                    <Select.Option key={org.id} value={org.id}>
                      {org.name}
                    </Select.Option>
                  ))}
                </Select>
              </>
            ) : (
              <span>Нет доступных организаций</span>
            )}
          </div>
          <div className="d-flex align-items-center">
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
                !!selectedOrganization?.priceBenefitPercentAcquiring &&
                selectedOrganization?.priceBenefitPercentInvoice
                  ? `Эквайринг ${selectedOrganization?.priceBenefitPercentAcquiring}% По счёту ${selectedOrganization.priceBenefitPercentInvoice}%`
                  : `${selectedOrganization?.priceBenefitPercent}%`
              }
            />
          </div>
        </Container>

        <RequestSellerTable
          products={products}
          updateAllowed={updateAllowed}
          isEditingMode={isEditingMode}
          productsRefs={productsRefs}
          selectedOrganization={selectedOrganization}
          handleProductUpdate={handleProductUpdate}
          deleteOfferProduct={deleteOfferProduct}
          handleNewProductValueChange={handleNewProductValueChange}
          setActiveProductIndex={setActiveProductIndex}
        />

        <OrderRequestTableRows
          title="Итого"
          totalPaidSum={calculateTotal(products)}
          quantityProducts={calculateQuantityProducts(products)}
          quantityAvailable={calculateQuantityAvailable(products)}
          cash={calculateTotalCash(products as any, selectedOrganization)}
          changeAllowed={updateAllowed}
          addOfferProduct={addOfferProduct}
        />
        {!!selectedOrganization?.priceBenefitPercent && (
          <Fragment>
            <OrderRequestTableRows
              title="Комиссия"
              totalPaidSum={calculateCommission(
                selectedOrganization.priceBenefitPercent,
                products,
              )}
            />
            <OrderRequestTableRows
              title="За вычетом комиссии"
              totalPaidSum={calculateLessCommission(
                selectedOrganization.priceBenefitPercent,
                products,
              )}
            />
          </Fragment>
        )}
        {!!selectedOrganization?.priceBenefitPercentAcquiring &&
          !!selectedOrganization?.priceBenefitPercentInvoice && (
            <Fragment>
              <OrderRequestTableRows
                title="Комиссия Эквайринг"
                totalPaidSum={calculateCommission(
                  selectedOrganization.priceBenefitPercentAcquiring,
                  products,
                )}
              />
              <OrderRequestTableRows
                title="За вычетом комиссии"
                totalPaidSum={calculateLessCommission(
                  selectedOrganization.priceBenefitPercentAcquiring,
                  products,
                )}
              />
              <OrderRequestTableRows
                title="Комиссия по счету"
                totalPaidSum={calculateCommission(
                  selectedOrganization.priceBenefitPercentInvoice,
                  products,
                )}
              />
              <OrderRequestTableRows
                title="За вычетом комиссии"
                totalPaidSum={calculateLessCommission(
                  selectedOrganization.priceBenefitPercentInvoice,
                  products,
                )}
              />
            </Fragment>
          )}

        {!!orderRequest?.orders?.[0]?.paidSum && (
          <OrderRequestTableRows
            title="Оплачено"
            totalPaidSum={calculateTotalPaid(orderRequest)}
          />
        )}
        <div className="pb-20"></div>
      </PageContent>
      <Summary containerClassName="justify-content-end">
        {!isEditingMode ? (
          <Fragment>
            <Button
              type="ghost"
              className="gray ml-10"
              icon={
                <DownloadOutlined style={{ fontSize: 24, color: 'white' }} />
              }
              onClick={() => setDownloadDocModalVisible(true)}
            />

            {!offer && !!productsWithIds?.length && (
              <Button
                type="primary"
                className="color-white ml-10 gray"
                onClick={() => enableEditingMode()}
              >
                Редактировать
              </Button>
            )}

            {!!attachments?.length && (
              <Button
                type="primary"
                className="color-white ml-10"
                onClick={() => setAttachmentsModalOpen(true)}
              >
                Вложения
              </Button>
            )}

            {!!offer ? (
              <Popconfirm
                title="Подтвердите удаление предложения"
                okText="Удалить"
                cancelText="Отмена"
                onConfirm={deleteOffer}
              >
                <Button type="primary" className="color-white ml-10 gray">
                  Удалить
                </Button>
              </Popconfirm>
            ) : (
              <Button
                type="primary"
                className={classNames('ml-10 color-white', {
                  disabled: !allowCreateOffer,
                })}
                disabled={!allowCreateOffer}
                onClick={submitCreateOffer}
                title={!allowCreateOffer ? 'Введите все данные' : null}
                loading={submitAwaiting}
              >
                Отправить предложение
              </Button>
            )}

            {(offer?.isRequestedToUpdateOffer ||
              (orderRequest.paidSum &&
                orderRequest.paidSum < orderRequest.totalPrice)) && (
              <Button
                type="primary"
                className="color-white ml-10"
                onClick={updateOffer}
                disabled={!allowCreateOffer}
              >
                Обновить
              </Button>
            )}
          </Fragment>
        ) : (
          <Fragment>
            <Button
              type="primary"
              className="color-white ml-10 gray"
              onClick={() => disableEditingMode()}
            >
              Отмена
            </Button>
            <Button
              type="primary"
              className="color-white ml-10 gray"
              onClick={() => completeEditing()}
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

      <NewOfferProductModal
        open={activeProductIndex !== null}
        onClose={() => setActiveProductIndex(null)}
        redirectToExternalCatalog={() => {
          dispatch(
            setOfferProductSelection({
              ...offerProductSelection,
              orderRequestId: orderRequest.id,
              orderRequest,
              activeProductIndex,
              describedProduct: describedProducts?.[0]?.describedProduct,
              products: (offerProductSelection.products || []).map(
                (product, i) =>
                  i === activeProductIndex &&
                  product.orderRequestId !== orderRequest.id
                    ? {
                        orderRequestId: orderRequest.id,
                        quantity: describedProducts?.[0]?.quantity,
                      }
                    : product,
              ),
            }),
          );
          router.push(
            generateInnerUrl(APP_PATHS.CATALOG_EXTERNAL, {
              searchParams: {
                orderRequestId: orderRequest.id,
              },
              removeCurrentParams: true,
            }),
          );
        }}
        redirectToCatalog={() => {
          dispatch(
            setOfferProductSelection({
              ...offerProductSelection,
              orderRequestId: orderRequest.id,
              orderRequest,
              activeProductIndex,
              describedProduct: describedProducts?.[0]?.describedProduct,
            }),
          );
          router.push(
            generateInnerUrl(APP_PATHS.CATALOG, {
              searchParams: {
                orderRequestId: orderRequest.id,
              },
            }),
          );
        }}
        startEnterManually={startManualProductEditing}
      />
    </Fragment>
  );
};

export default OrderRequestContentSeller;
