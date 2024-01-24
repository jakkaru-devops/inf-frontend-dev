import {
  AddressIndication,
  BreadCrumbs,
  DeliveryAddressModal,
  FileUpload,
  KeyValueItem,
  Link,
  Page,
  PageContent,
  PageTop,
  SelectSettlementsModal,
  Summary,
  Table,
  TextEditor,
  InputNumber,
} from 'components/common';
import { Button } from 'antd';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { IOrderRequest } from 'sections/Orders/interfaces';
import { useHandlers } from './handlers';
import { IUser } from 'sections/Users/interfaces';
import classNames from 'classnames';
import { generateInnerUrl } from 'utils/common.utils';
import SelectOrderRequestSeller from 'sections/Orders/components/SelectOrderRequestSeller';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { FC } from 'react';

const OrderRepeatPageContent: FC<{
  order: IOrderRequest;
  sellers: IRowsWithCount<IUser[]>;
}> = ({ order, sellers }) => {
  const {
    router,
    addressStr,
    products,
    allowCreateOrder,
    changeProductCount,
    comment,
    createOrderRequest,
    deleteProduct,
    deliveryAddress,
    handleCommentChange,
    handleFileDelete,
    handleFilesUpload,
    locale,
    savedRegions,
    deliveryAddressVisible,
    setDeliveryAddressVisible,
    setDeliveryAddress,
    setSavedRegions,
    settlementsModalVisible,
    setSettlementsModalVisible,
    selectedSellerIds,
    setSelectedSellerIds,
    saveSelectedSellers,
    setSaveSelectedSellers,
  } = useHandlers({
    order,
  });

  return (
    <Page>
      <BreadCrumbs
        list={[
          (router.query.fromRefunds && {
            link: APP_PATHS.REFUND_LIST,
            text: 'Возврат/обмен',
          }) ||
            (['REWARD_PAID', 'COMPLETED'].includes(order.status) && {
              link: APP_PATHS.ORDER_HISTORY_LIST,
              text: 'История заказов',
            }) || {
              link: APP_PATHS.ORDER_LIST,
              text: 'Заказы',
            },
          {
            link: APP_PATHS.ORDER(order.id),
            text: `${order.idOrder}`,
          },
          {
            link: APP_PATHS.ORDER_REPEAT(order.id),
            text: 'Повторить запрос',
          },
        ]}
      />
      <PageTop title="Повторить запрос" />

      <PageContent
        className="h-100-flex"
        containerProps={{ style: { paddingTop: 10 } }}
      >
        <div className="d-flex justify-content-end mb-5">
          <KeyValueItem
            keyText="Выбрать регион поставщика"
            value={savedRegions.length || 'Все регионы'}
            valueClassName="text-underline"
            onValueClick={() => setSettlementsModalVisible(true)}
          />
        </div>
        <div className="d-flex justify-content-between">
          <AddressIndication
            addressStr={addressStr}
            prefixText={locale.orders.deliveryAddress}
            onAddressClick={() => setDeliveryAddressVisible(true)}
            className="mb-10"
          />

          <SelectOrderRequestSeller
            sellers={sellers}
            selectedSellersIds={selectedSellerIds}
            setSelectedSellerIds={value => setSelectedSellerIds(value)}
            saveSelectedSellers={saveSelectedSellers}
            setSaveSelectedSellers={setSaveSelectedSellers}
            className="mb-10"
          />
        </div>

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
          rowsLoading={products.length === 0}
          rows={products.map((product, i) => ({
            cols: [
              {
                content: (
                  <>
                    {!!product.product.preview ? (
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
              { content: product?.product?.article || product?.reserveArticle },
              {
                content: (
                  <>
                    <InputNumber
                      value={product.count}
                      onChange={(value: number) =>
                        changeProductCount(product, i, value)
                      }
                      min={0}
                      size="small"
                      className="show-controls type-primary width-small text-center"
                    />
                    {products.length > 1 && (
                      <button
                        className="tableInf__delete"
                        onClick={() => deleteProduct(i)}
                      >
                        <img
                          src="/img/close.svg"
                          alt="close"
                          className="svg tableInf__delteIcon"
                        />
                      </button>
                    )}
                  </>
                ),
              },
            ],
          }))}
        />

        <KeyValueItem
          keyText="Комментарий"
          value={
            <TextEditor
              value={comment}
              name="comment"
              height="100px"
              width="100%"
              onChange={comment => handleCommentChange(comment)}
            />
          }
          valueClassName="text-normal"
          className="mt-20 mb-10"
          inline={false}
        />

        <FileUpload
          url={API_ENDPOINTS.FILE_UNKNOWN}
          onFinishUpload={uploadedFiles =>
            handleFilesUpload(uploadedFiles.map(({ id }) => id))
          }
          onDelete={deletedFile => {
            handleFileDelete(deletedFile.id);
          }}
        />
      </PageContent>

      <Summary containerClassName="justify-content-end">
        <Link
          href={generateInnerUrl(APP_PATHS.ORDER(order.id), {
            text: order.idOrder,
          })}
        >
          <Button className="cart__control-btn gray" size="large">
            Отмена
          </Button>
        </Link>

        <Button
          className="cart__control-btn gray ml-10"
          size="large"
          onClick={() => setDeliveryAddressVisible(true)}
        >
          {locale.other.selectDeliveryPoint}
        </Button>
        <Button
          type="primary"
          className={classNames('cart__control-btn ml-10', {
            disabled: !allowCreateOrder,
          })}
          size="large"
          onClick={() => createOrderRequest(deliveryAddress)}
          title={!allowCreateOrder ? locale.other.specifyShippingAddress : null}
        >
          Отправить повторно
        </Button>
      </Summary>

      <DeliveryAddressModal
        address={deliveryAddress}
        setAddress={setDeliveryAddress}
        open={deliveryAddressVisible}
        onCancel={() => setDeliveryAddressVisible(false)}
        allowControl={true}
        title={locale.orders.deliveryAddress}
      />
      <SelectSettlementsModal
        open={settlementsModalVisible}
        onCancel={() => setSettlementsModalVisible(false)}
        regionsInit={[]}
        onSubmit={setSavedRegions}
      />
    </Page>
  );
};

export default OrderRepeatPageContent;
