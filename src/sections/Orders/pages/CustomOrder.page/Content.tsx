import { Button, Checkbox, ConfigProvider, DatePicker } from 'antd';
import antdLocale from 'antd/lib/locale/ru_RU';
import { FC } from 'react';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { convertAddressToString } from 'components/common/YandexMap/utils';
import {
  IAutoBrand,
  IAutoType,
  IProductGroup,
} from 'sections/Catalog/interfaces/categories.interfaces';
import {
  AddressIndication,
  BreadCrumbs,
  DeliveryAddressModal,
  FileUpload,
  KeyValueItem,
  Page,
  PageContent,
  PageTop,
  SelectSettlementsModal,
  Summary,
  InputNumber,
} from 'components/common';
import TextEditor from 'components/common/TextEditor/index';
import useHandlers from './handlers';
import { IUser } from 'sections/Users/interfaces';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { IFileItem } from 'interfaces/files.interfaces';
import SelectOrderRequestSeller from 'sections/Orders/components/SelectOrderRequestSeller';
import { getPlural } from 'utils/languages.utils';
import _ from 'lodash';
import {
  MAX_ORDER_REQUEST_ATTACHMENTS_COUNT,
  MAX_ORDER_REQUEST_COMMENT_LENGTH,
} from 'data/common.data';
import { stripString } from 'utils/common.utils';
import CategoriesSelectionModal from 'sections/Catalog/components/CategoriesSelectionModal';

interface IProps {
  autoTypes: IRowsWithCount<IAutoType[]>;
  autoBrands: IRowsWithCount<IAutoBrand[]>;
  productGroups: IRowsWithCount<IProductGroup[]>;
  sellers: IRowsWithCount<IUser[]>;
  uploadedFiles: IFileItem[];
}

const CustomOrderPageContent: FC<IProps> = ({
  autoTypes,
  autoBrands,
  productGroups,
  sellers,
  uploadedFiles: uploadedFilesInit,
}) => {
  const {
    auth,
    locale,
    router,
    deliveryAddress,
    selectedAutoTypeId,
    selectedAutoBrands,
    setSelectedAutoBrands,
    selectedGroupIds,
    setSelectedGroupIds,
    details,
    categorySelectionVisible,
    setCategorySelectionVisible,
    isDeliveryAddressModalVisible,
    setIsDeliveryAddressModalVisible,
    settlementsModalVisible,
    setSettlementsModalVisible,
    selectedSellerIds,
    setSelectedSellerIds,
    saveSelectedSellers,
    setSaveSelectedSellers,
    submitAwaiting,
    filesUploading,
    setFilesUploading,
    savedRegions,
    setSavedRegions,
    paymentDate,
    disabledPaymentDate,
    postponedPaymentEnabled,
    datePickerOpen,
    setDatePickerOpen,
    handlePaymentDateChange,
    handlePostponedPaymentEnabledChange,
    handlers,
    allowCreateOrder,
    createRequest,
  } = useHandlers({ autoTypes });
  const DatePickerUntyped = DatePicker as any;

  const savedRegionsCount = _.uniqBy(savedRegions, 'regionId').length;
  const selectedAutoBrandsData = selectedAutoBrands.map(item => ({
    autoType: autoTypes.rows?.find(el => el.id === item.autoTypeId),
    autoBrand: autoBrands.rows?.find(el => el.id === item.autoBrandId),
  }));
  const selectedProductGroupNames = productGroups.rows
    .filter(item => selectedGroupIds.includes(item.id))
    .map(item => item?.name);
  const allSelectedCategoriesNames = selectedAutoBrandsData
    .map(item => `${item?.autoBrand?.name} (${item?.autoType?.name})`)
    .concat(selectedProductGroupNames);

  return (
    <>
      <Page>
        <BreadCrumbs
          showPersonalAreaLink={false}
          list={[
            {
              link:
                APP_PATHS.CUSTOM_ORDER +
                (router.query?.search ? '?search=' + router.query.search : ''),
              text: router.query?.search
                ? 'Результат поиска'
                : locale.other.orderRequestByPhotoOrDescription,
            },
          ]}
        />
        <PageTop
          title={
            <h2 className="null text_38">
              {router.query?.search && (
                <>
                  Позиция «{router.query.search}» не нашлась <br />
                </>
              )}
              {locale.other.orderRequestByPhotoOrDescription}
            </h2>
          }
        />
        <PageContent className="h-100-flex">
          <CategoriesSelectionModal
            open={categorySelectionVisible}
            onClose={() => setCategorySelectionVisible(false)}
            onSave={() => setCategorySelectionVisible(false)}
            resetCategories={handlers.resetCategories}
            selectedAutoBrands={selectedAutoBrands}
            setSelectedAutoBrands={setSelectedAutoBrands}
            selectedGroupIds={selectedGroupIds}
            setSelectedGroupIds={setSelectedGroupIds}
            onAutoTypeClick={autoType => handlers.handleAutoTypeClick(autoType)}
            onAutoBrandClick={autoBrand =>
              handlers.handleAutoBrandClick(autoBrand)
            }
            onGroupClick={group => handlers.handleGroupClick(group)}
          />

          <DeliveryAddressModal
            address={deliveryAddress}
            setAddress={handlers.setDeliveryAddress}
            open={isDeliveryAddressModalVisible}
            onCancel={() => setIsDeliveryAddressModalVisible(false)}
            allowControl={true}
            title={locale.orders.deliveryAddress}
          />
          <SelectSettlementsModal
            open={settlementsModalVisible}
            onCancel={() => setSettlementsModalVisible(false)}
            regionsInit={savedRegions}
            onSubmit={setSavedRegions}
          />

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
          <KeyValueItem
            keyText="Категория товара"
            value={
              !!allSelectedCategoriesNames?.length
                ? allSelectedCategoriesNames.join(' / ')
                : 'Выбрать'
            }
            onValueClick={() => setCategorySelectionVisible(true)}
            className="mb-10"
          />

          <KeyValueItem
            keyText="Количество"
            value={
              <InputNumber
                value={details.quantity}
                onChange={quantity => handlers.handleQuantityChange(quantity)}
                min={0}
                precision={0}
                size="small"
                className="show-controls type-primary width-small text-center"
              />
            }
            className="mb-10"
          />

          <KeyValueItem
            keyText="Описание товара"
            value={
              <>
                <TextEditor
                  value={details.description}
                  name="description"
                  height="100px"
                  width="100%"
                  onChange={description =>
                    handlers.handleDescriptionChange(description)
                  }
                />
                {stripString(details.description)?.length >
                  MAX_ORDER_REQUEST_COMMENT_LENGTH && (
                  <div className="form-error">
                    Максимальная длина описания -{' '}
                    {MAX_ORDER_REQUEST_COMMENT_LENGTH} символов
                  </div>
                )}
              </>
            }
            valueClassName="mb-10"
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
              handlers.handleFilesUpload(uploadedFiles.map(({ id }) => id))
            }
            onDelete={(deletedFile, activeUploadings) => {
              handlers.handleFileDelete(deletedFile.id);
              setFilesUploading(activeUploadings.length > 0);
            }}
            maxFilesNumber={MAX_ORDER_REQUEST_ATTACHMENTS_COUNT}
          />

          <AddressIndication
            addressStr={convertAddressToString(deliveryAddress)}
            prefixText={locale.orders.deliveryAddress}
            onAddressClick={() => setIsDeliveryAddressModalVisible(true)}
            className="mt-15 mb-10"
          />

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
            className="mb-10"
            onValueClick={() => setSettlementsModalVisible(true)}
          />

          {auth?.isAuthenticated && !!sellers?.rows?.length && (
            <SelectOrderRequestSeller
              sellers={sellers}
              selectedSellersIds={selectedSellerIds}
              setSelectedSellerIds={setSelectedSellerIds}
              saveSelectedSellers={saveSelectedSellers}
              setSaveSelectedSellers={setSaveSelectedSellers}
            />
          )}
        </PageContent>
        <Summary containerClassName="justify-content-end">
          <Button
            type="primary"
            className="color-white gray mr-15"
            size="large"
            onClick={() => setIsDeliveryAddressModalVisible(true)}
          >
            Выбор пункта доставки
          </Button>

          <Button
            type="primary"
            className="color-white"
            size="large"
            disabled={!allowCreateOrder}
            onClick={createRequest}
            loading={submitAwaiting}
          >
            Отправить запрос
          </Button>
        </Summary>
      </Page>
    </>
  );
};

export default CustomOrderPageContent;
