import { Button, Checkbox, ConfigProvider, DatePicker } from 'antd';
import antdLocale from 'antd/lib/locale/ru_RU';
import classNames from 'classnames';
import { FC, Fragment } from 'react';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import {
  AddressIndication,
  DeliveryAddressModal,
  KeyValueItem,
  PageContent,
  SelectSettlementsModal,
  Table,
  TextEditor,
  Summary,
  FileUpload,
  Preloader,
  Link,
  InputNumber,
  TabGroup,
} from 'components/common';
import { IUser } from 'sections/Users/interfaces';
import { IFileItem } from 'interfaces/files.interfaces';
import { IRowsWithCount, ISetState } from 'interfaces/common.interfaces';
import { generateInnerUrl, stripString } from 'utils/common.utils';
import SelectOrderRequestSeller from 'sections/Orders/components/SelectOrderRequestSeller';
import { getPlural } from 'utils/languages.utils';
import _ from 'lodash';
import InfiniteScroll from 'react-infinite-scroller';
import {
  MAX_ORDER_REQUEST_ATTACHMENTS_COUNT,
  MAX_ORDER_REQUEST_COMMENT_LENGTH,
} from 'data/common.data';
import { ICartProduct } from 'sections/Cart/interfaces/interfaces';
import { useRequestTabHandlers } from './requestTabhandlers';

interface IProps {
  products?: IRowsWithCount<ICartProduct[]>;
  setProducts?: ISetState<IRowsWithCount<ICartProduct[]>>;
  sellers?: IRowsWithCount<IUser[]>;
  uploadedFiles?: IFileItem[];
}

const CartRequestTab: FC<IProps> = ({
  products,
  setProducts,
  sellers,
  uploadedFiles: uploadedFilesInit,
}) => {
  const {
    auth,
    addressStr,
    allowCreateOrder,
    cartProductsForRequest,
    changeCartProductQuantity,
    comment,
    submitAwaiting,
    orderRequestCreated,
    createRequest,
    deleteCartProduct,
    deliveryAddress,
    goToCatalog,
    handleCommentChange,
    handleSelectedSellersChange,
    handleFileDelete,
    handleFilesUpload,
    locale,
    savedRegions,
    setDeliveryAddress,
    setSavedRegions,
    settlementsModalVisible,
    setSettlementsModalVisible,
    selectedSellerIds,
    setSelectedSellerIds,
    saveSelectedSellers,
    setSaveSelectedSellers,
    deliveryAddressModalOpen,
    setDeliveryAddressModalOpen,
    setFilesUploading,
    fetchMore,
    paymentDate,
    disabledPaymentDate,
    postponedPaymentEnabled,
    datePickerOpen,
    setDatePickerOpen,
    handlePaymentDateChange,
    handlePostponedPaymentEnabledChange,
  } = useRequestTabHandlers({
    products,
    setProducts,
  });
  const DatePickerUntyped = DatePicker as any;
  const savedRegionsCount = _.uniqBy(savedRegions, 'regionId').length;

  return (
    <Fragment>
      <PageContent
        className="h-100-flex cart__page-content"
        containerProps={{ style: { paddingTop: 10 } }}
      >
        <TabGroup list={[]}>
          {cartProductsForRequest.length > 0 ? (
            <>
              <div className="d-flex justify-content-between align-items-end mb-10">
                <div>
                  {auth?.user?.postponedPaymentAllowed && (
                    <div className="d-flex">
                      <Checkbox
                        checked={postponedPaymentEnabled}
                        onChange={e =>
                          handlePostponedPaymentEnabledChange(e.target.checked)
                        }
                      >
                        Отсрочка до
                      </Checkbox>
                      <ConfigProvider locale={antdLocale}>
                        <DatePickerUntyped
                          style={{ marginTop: -3, marginBottom: 5 }}
                          value={paymentDate}
                          format="DD.MM.YYYY"
                          size="small"
                          onChange={date => handlePaymentDateChange(date)}
                          disabledDate={disabledPaymentDate}
                          open={datePickerOpen}
                          onOpenChange={open => setDatePickerOpen(open)}
                        />
                      </ConfigProvider>
                    </div>
                  )}
                  <AddressIndication
                    addressStr={addressStr}
                    prefixText={locale.orders.deliveryAddress}
                    onAddressClick={() => setDeliveryAddressModalOpen(true)}
                  />
                </div>
                <div className="d-flex flex-direction-column align-items-end">
                  <KeyValueItem
                    keyText="Выбрать регион поставщика"
                    value={
                      !!savedRegionsCount
                        ? `${savedRegionsCount} ${getPlural({
                            language: 'ru',
                            num: savedRegionsCount,
                            forms: locale.plurals.region,
                          })}`
                        : 'Все регионы'
                    }
                    valueClassName="text-underline"
                    onValueClick={() => setSettlementsModalVisible(true)}
                  />
                  {auth?.isAuthenticated && !!sellers?.rows?.length && (
                    <SelectOrderRequestSeller
                      sellers={sellers}
                      selectedSellersIds={selectedSellerIds}
                      setSelectedSellerIds={setSelectedSellerIds}
                      saveSelectedSellers={saveSelectedSellers}
                      setSaveSelectedSellers={setSaveSelectedSellers}
                      className="mt-5"
                    />
                  )}
                </div>
              </div>

              <InfiniteScroll
                pageStart={0}
                loadMore={fetchMore}
                hasMore={cartProductsForRequest.length > products.rows.length}
                loader={
                  <div key={0} className="mt-10">
                    <Preloader />
                  </div>
                }
                threshold={500}
                useWindow={true}
              >
                <Table
                  className="mt_30"
                  cols={[
                    { content: null, width: '10%' },
                    {
                      content: locale.catalog.productName,
                      width: '35%',
                    },
                    { content: 'Производитель', width: '15%' },
                    { content: locale.catalog.productArticle, width: '25%' },
                    { content: locale.common.amountShort, width: '15%' },
                  ]}
                  rowsLoading={products?.rows?.length === 0}
                  rows={products.rows.map((cartProduct, i) => ({
                    cols: [
                      {
                        content: (
                          <>
                            {!!cartProduct.product.preview ? (
                              <img
                                src={cartProduct.product.preview}
                                style={{ height: 45 }}
                                alt={cartProduct.product.name}
                              />
                            ) : (
                              <div className="d-flex justify-content-center align-items-center">
                                Без фото
                              </div>
                            )}
                          </>
                        ),
                      },
                      {
                        content: (
                          <div>
                            <Link
                              href={generateInnerUrl(
                                APP_PATHS.PRODUCT(cartProduct.product.id),
                                {
                                  text: cartProduct.product.name,
                                },
                              )}
                              target="_blank"
                              className="color-black"
                            >
                              {cartProduct.product.name}
                            </Link>
                          </div>
                        ),
                      },
                      { content: cartProduct?.product?.manufacturer || '-' },
                      { content: cartProduct?.product?.article },
                      {
                        content: (
                          <Fragment>
                            <InputNumber
                              value={cartProduct.quantity}
                              onChange={(value: number) =>
                                changeCartProductQuantity(cartProduct, i, value)
                              }
                              min={0}
                              precision={0}
                              size="small"
                              showControls
                              colorPrimary
                              widthSmall
                              textCenter
                            />
                            <button
                              className="tableInf__delete ml-10"
                              onClick={() => deleteCartProduct(cartProduct)}
                            >
                              <img
                                src="/img/close.svg"
                                alt="close"
                                className="svg tableInf__delteIcon"
                              />
                            </button>
                          </Fragment>
                        ),
                      },
                    ],
                  }))}
                />
              </InfiniteScroll>

              <KeyValueItem
                keyText="Комментарий"
                value={
                  <>
                    <TextEditor
                      value={comment}
                      name="comment"
                      height="100px"
                      width="100%"
                      onChange={comment => handleCommentChange(comment)}
                    />
                    {stripString(comment)?.length >
                      MAX_ORDER_REQUEST_COMMENT_LENGTH && (
                      <div className="form-error">
                        Максимальная длина комментария -{' '}
                        {MAX_ORDER_REQUEST_COMMENT_LENGTH} символов
                      </div>
                    )}
                  </>
                }
                valueClassName="text-normal"
                className="mt-20 mb-10"
                inline={false}
              />

              <FileUpload
                url={API_ENDPOINTS.FILE_UNKNOWN}
                onStartUpload={() => setFilesUploading(true)}
                initFiles={uploadedFilesInit}
                onFileUploaded={(uploadedFile, activeUploadings) =>
                  setFilesUploading(activeUploadings.length > 0)
                }
                onFinishUpload={uploadedFiles =>
                  handleFilesUpload(uploadedFiles.map(({ id }) => id))
                }
                onDelete={(deletedFile, activeUploadings) => {
                  handleFileDelete(deletedFile.id);
                  setFilesUploading(activeUploadings.length > 0);
                }}
                maxFilesNumber={MAX_ORDER_REQUEST_ATTACHMENTS_COUNT}
              />
            </>
          ) : (
            <div className="d-flex align-items-center">
              {!orderRequestCreated ? (
                <Fragment>
                  <h2 className="mb-0 mr-15">
                    Товары для запроса еще не добавлены
                  </h2>
                  <Button
                    className="cart__control-btn"
                    type="primary"
                    onClick={goToCatalog}
                  >
                    {locale.other.backToCatalog}
                  </Button>
                </Fragment>
              ) : (
                <Fragment>
                  <h2 className="mb-0 mr-15">
                    Запрос отправлен. Корзина очищена
                  </h2>
                  <Button
                    className="cart__control-btn"
                    type="primary"
                    onClick={goToCatalog}
                  >
                    {locale.other.backToCatalog}
                  </Button>
                </Fragment>
              )}
            </div>
          )}
        </TabGroup>
      </PageContent>

      {cartProductsForRequest.length > 0 && (
        <Summary containerClassName="justify-content-end">
          <Button className="cart__control-btn gray" onClick={goToCatalog}>
            {locale.other.backToCatalog}
          </Button>
          <Button
            className="cart__control-btn gray ml-10"
            onClick={() => setDeliveryAddressModalOpen(true)}
          >
            {locale.other.selectDeliveryPoint}
          </Button>
          <Button
            type="primary"
            className={classNames('cart__control-btn ml-10', {
              disabled: !allowCreateOrder,
            })}
            onClick={() => createRequest(deliveryAddress)}
            title={
              !allowCreateOrder ? locale.other.specifyShippingAddress : null
            }
            loading={submitAwaiting}
          >
            {locale.orders.sendRequest}
          </Button>
        </Summary>
      )}

      <DeliveryAddressModal
        address={deliveryAddress}
        setAddress={setDeliveryAddress}
        open={deliveryAddressModalOpen}
        onCancel={() => setDeliveryAddressModalOpen(false)}
        allowControl={true}
        title={locale.orders.deliveryAddress}
      />
      <SelectSettlementsModal
        open={settlementsModalVisible}
        onCancel={() => setSettlementsModalVisible(false)}
        regionsInit={savedRegions}
        onSubmit={setSavedRegions}
      />
    </Fragment>
  );
};

export default CartRequestTab;
