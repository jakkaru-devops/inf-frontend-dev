import { FC, Fragment, useEffect, useState } from 'react';
import {
  BreadCrumbs,
  DeliveryAddressModal,
  Page,
  PageContent,
  PageTop,
  Pagination,
} from 'components/common';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { FiltersTop } from './elements/FiltersTop';
import { OfferItem } from './elements/OfferItem';
import { DownloadOutlined, SwapOutlined } from '@ant-design/icons';
import {
  IOrder,
  IOrderRequest,
  IRequestProduct,
} from 'sections/Orders/interfaces';
import formatDate from 'date-fns/format';
import { useHandlers } from './handlers';
import { Summary } from 'components/common';
import { Button } from 'antd';
import classNames from 'classnames';
import { useModalsState } from 'hooks/modal.hook';
import { IJuristicSubject } from 'sections/JuristicSubject/interfaces';
import { SelectedProductsList } from './elements/SelectedProductsList';
import { MessageOutlined } from '@ant-design/icons';
import { startChatWithUser } from 'components/complex/Messenger/utils/messenger.utils';
import { ITransportCompany } from 'sections/Shipping/interfaces';
import { APIRequest } from 'utils/api.utils';
import { generateUrl, openNotification } from 'utils/common.utils';
import { ISetState } from 'interfaces/common.interfaces';
import { IRegion } from 'components/common/SelectSettlementsModal/interfaces';
import SelectRegionModal from './elements/SelectRegionModal';
import DownloadDocModal from 'sections/Orders/components/DownloadDocModal';
import { downloadOrderDocService } from 'sections/Orders/services/downloadOrderDoc.service';
import { API_ENDPOINTS_V2 } from 'data/api.data';
import SelectPayerModal from 'sections/Orders/components/SelectPayerModal';
import OffersFiltersModal from './elements/FiltersModal';

interface IProps {
  orderRequest: IOrderRequest;
  offers: { rows: IOrder[]; count: number };
  selectedProducts: IRequestProduct[];
  regions: IRegion[];
  jurSubjects?: IJuristicSubject[];
  transportCompanies: ITransportCompany[];
  newItemsCount: number;
  setNewItemsCount: ISetState<number>;
}

const OffersPageContent: FC<IProps> = ({
  orderRequest,
  offers,
  selectedProducts,
  regions,
  jurSubjects,
  transportCompanies,
  newItemsCount,
  setNewItemsCount,
}) => {
  const {
    auth,
    router,
    dispatch,
    selectedView,
    offerList,
    setOfferList,
    totalPrice,
    allowAccept,
    allowDownloadSelectedList,
    downloadPdfAwaiting,
    orgBranch,
    selectRegionVisible,
    setSelectRegionVisible,
    selectedRegionIds,
    setSelectedRegionIds,
    setStateCounter,
    updateAwaiting,
    selectPayerModalOpen,
    setSelectPayerModalOpen,
    filtersModalOpen,
    setFiltersModalOpen,
    filterBy,
    filterProductId,
    handlers,
  } = useHandlers({
    orderRequest,
    offers,
    selectedProducts,
  });

  const { Modal: AttachmentsModal, openModal } = useModalsState();
  const [downloadDocModalVisible, setDownloadDocModalVisible] = useState(false);
  const [downloadDocAwaiting, setDownloadDocAwaiting] = useState(false);

  const manipulationAvailable = auth?.currentRole?.label === 'customer';

  const describedProducts = orderRequest.products.filter(
    ({ describedProduct }) => describedProduct,
  );
  const attachments = [
    ...orderRequest.attachments,
    ...describedProducts.flatMap(
      ({ describedProduct: { attachments } }) => attachments,
    ),
  ];

  useEffect(() => {
    if (router?.query?.showAttachments === '1') {
      openModal('attachments');
      router.push(generateUrl({ showAttachments: null }));
    }
  }, [router.query]);

  const downloadDoc = async (docType: 'pdf' | 'xlsx') =>
    await downloadOrderDocService({
      url: API_ENDPOINTS.ORDER_REQUEST_OFFERS_DOC(orderRequest.id),
      docType,
      awaiting: downloadDocAwaiting,
      setAwaiting: setDownloadDocAwaiting,
      params: {
        mode: selectedView || null,
      },
    });

  const downloadAnalytics = async () => {
    await downloadOrderDocService({
      url: API_ENDPOINTS_V2.orders.offersAnalyticsDocument(orderRequest.id),
      docType: 'xlsx',
      awaiting: downloadDocAwaiting,
      setAwaiting: setDownloadDocAwaiting,
      params: {
        mode: selectedView || null,
      },
    });
  };

  return (
    <Page className="offers-page">
      <BreadCrumbs
        list={[
          { link: APP_PATHS.ORDER_REQUEST_LIST, text: 'Запросы' },
          {
            link: APP_PATHS.ORDER_REQUEST(orderRequest.id),
            text: `${orderRequest.idOrder}`,
          },
          {
            link: APP_PATHS.ORDER_REQUEST_OFFER_LIST(orderRequest.id),
            text: 'Предложения',
          },
        ]}
      />
      <PageTop
        title={
          <div className="d-flex align-items-center">
            <h2>Запрос {orderRequest.idOrder}</h2>
            {newItemsCount > 0 && (
              <Button
                type="default"
                className="ml-20 mt-5"
                onClick={() => {
                  router.push(generateUrl({ page: 1 }));
                  setNewItemsCount(0);
                }}
              >
                <span>Показать новые предложения</span>
                <span className="ml-15">{newItemsCount}</span>
              </Button>
            )}
          </div>
        }
      />

      <FiltersTop
        className="mt-20"
        requestDate={formatDate(
          new Date(orderRequest.createdAt),
          'dd.MM.yyyy HH:mm',
        )}
        regions={regions}
        selectedRegionIds={selectedRegionIds}
        setSelectRegionVisible={setSelectRegionVisible}
        setFiltersModalOpen={setFiltersModalOpen}
      />

      <PageContent className="h-100-flex">
        {selectedView && (
          <div className="d-flex justify-content-end mb-35">
            <div className="d-inline-flex align-items-center">
              <span
                className={classNames('user-select-none', {
                  'color-primary text-underline': selectedView !== 'list',
                })}
                style={{
                  fontSize: '14px',
                  cursor: selectedView !== 'list' ? 'pointer' : 'text',
                }}
                onClick={() => handlers.handleSelectedViewToggle('list')}
              >
                список
              </span>
              <SwapOutlined className="ml-10 mr-10" />
              <span
                className={classNames('user-select-none', {
                  'color-primary text-underline': selectedView !== 'extended',
                })}
                style={{
                  fontSize: '14px',
                  cursor: selectedView !== 'extended' ? 'pointer' : 'text',
                }}
                onClick={() => handlers.handleSelectedViewToggle('extended')}
              >
                расширенный
              </span>
            </div>
          </div>
        )}
        {offerList.length > 0 ? (
          selectedView === 'list' ? (
            <SelectedProductsList
              products={selectedProducts as IRequestProduct[]}
              manipulationAvailable={manipulationAvailable}
              handlers={handlers}
            />
          ) : (
            offerList
              .filter(({ products }) =>
                selectedView
                  ? products.some(({ isSelected }) => isSelected)
                  : true,
              )
              .map((offer, i) => (
                <Fragment key={offer.id}>
                  <OfferItem
                    offer={offer}
                    setOffer={offerData => {
                      offerList[i] = { ...offerData };
                      setOfferList([...offerList]);
                      setStateCounter(prev => prev + 1);
                    }}
                    orderRequest={orderRequest}
                    selectedView={!!selectedView}
                    transportCompanies={transportCompanies}
                    manipulationAvailable={manipulationAvailable}
                    updateAwaiting={updateAwaiting}
                    filterProductId={filterProductId}
                    handlers={handlers}
                  />
                </Fragment>
              ))
          )
        ) : (
          <h2 className="null basket__title text_30">Еще нет предложений</h2>
        )}
      </PageContent>

      <Summary containerClassName="justify-content-between">
        <Pagination
          total={offers.count}
          pageSize={+router.query.pageSize || 10}
        />

        <div className="d-flex align-items-center">
          {manipulationAvailable ? (
            <>
              <span className="offers-page__summary__summary-price">
                Итого: {totalPrice.roundFraction().separateBy(' ')} ₽
              </span>

              <Button
                type="ghost"
                className={classNames([
                  'offers-page__summary__button-download',
                  'gray',
                  'ml-10',
                ])}
                onClick={() => setDownloadDocModalVisible(true)}
                disabled={offerList.length === 0}
                icon={
                  <DownloadOutlined style={{ fontSize: 24, color: 'white' }} />
                }
              />
            </>
          ) : (
            !!orderRequest?.payerId && (
              <Button
                type="primary"
                className={classNames(['color-white ml-10'])}
                onClick={() => handlers.handleOffersPayment()}
              >
                Сохранить
              </Button>
            )
          )}

          {attachments?.length > 0 && (
            <Button
              type="primary"
              className={classNames('color-white ml-10', {
                disabled: attachments?.length < 1,
              })}
              disabled={attachments?.length < 1}
              onClick={() => openModal('attachments')}
            >
              Вложения
            </Button>
          )}

          {manipulationAvailable ? (
            <>
              <Button
                type="primary"
                className={classNames('color-white gray ml-10', {
                  disabled: !selectedView && !allowDownloadSelectedList,
                })}
                onClick={() => handlers.handleSelectedViewToggle()}
                disabled={!selectedView && !allowDownloadSelectedList}
              >
                {selectedView
                  ? 'Вернуться к предложениям'
                  : 'Посмотреть выбранное'}
              </Button>

              <Button
                type="primary"
                className={classNames('color-white ml-10')}
                disabled={!allowAccept}
                onClick={async () => {
                  const res = await APIRequest({
                    method: 'get',
                    url: API_ENDPOINTS.OFFERS_RELEVANCE,
                    params: {
                      id: orderRequest.id,
                    },
                    requireAuth: true,
                  });
                  if (!res.isSucceed) return;
                  if (!res.data?.result) {
                    openNotification(
                      'Истек срок одного или нескольких выбранных предложений',
                    );
                    return;
                  }
                  setSelectPayerModalOpen(true);
                }}
              >
                Купить выбранное
              </Button>
            </>
          ) : (
            <Button
              type="primary"
              onClick={() =>
                startChatWithUser({
                  companionId: orderRequest.customerId,
                  companionRole: 'customer',
                  orderRequestId: orderRequest.id,
                })
              }
              className="ml-10"
            >
              {'Чат с покупателем'} <MessageOutlined />
            </Button>
          )}
        </div>
      </Summary>

      <DeliveryAddressModal
        address={!!orgBranch && orgBranch.address}
        setAddress={() => {}}
        open={!!orgBranch && !!orgBranch.address}
        onCancel={() => handlers.setOrgBranch(null)}
        allowControl={false}
        title={!!orgBranch ? `Поставщик ${orgBranch.orgName}` : null}
      />
      <SelectRegionModal
        open={selectRegionVisible}
        onCancel={() => setSelectRegionVisible(false)}
        regions={regions}
        selectedRegionIds={selectedRegionIds}
        setSelectedRegionIds={setSelectedRegionIds}
      />
      <DownloadDocModal
        open={downloadDocModalVisible}
        onCancel={() => setDownloadDocModalVisible(false)}
        downloadPdf={() => downloadDoc('pdf')}
        downloadXlsx={() => downloadDoc('xlsx')}
        loading={downloadDocAwaiting}
        downloadAnalytics={downloadAnalytics}
      />
      <AttachmentsModal attachmentList={attachments} />
      <SelectPayerModal
        open={selectPayerModalOpen}
        onClose={() => setSelectPayerModalOpen(false)}
        handleCardPayment={handlers.handleCardPayment}
        handleInvoicePayment={handlers.handleInvoicePayment}
      />
      <OffersFiltersModal
        open={filtersModalOpen}
        onClose={() => setFiltersModalOpen(false)}
        requestProducts={orderRequest.products}
        filterBy={filterBy}
        filterProductId={filterProductId}
      />
    </Page>
  );
};

export default OffersPageContent;
