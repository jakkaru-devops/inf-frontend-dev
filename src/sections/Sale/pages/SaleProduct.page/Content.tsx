import { Button, Modal } from 'antd';
import classNames from 'classnames';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import {
  BreadCrumbs,
  ConfirmModal,
  DeliveryAddressModal,
  KeyValueItem,
  Link,
  Page,
  PageContent,
  PageTop,
  RateString,
} from 'components/common';
import { MessageOutlined } from '@ant-design/icons';
import { startChatWithUser } from 'components/complex/Messenger/utils/messenger.utils';
import { APP_PATHS } from 'data/paths.data';
import htmr from 'htmr';
import { FC, useEffect } from 'react';
import {
  generateInnerUrl,
  generateUrl,
  openNotification,
} from 'utils/common.utils';
import { convertAddressToString } from 'components/common/YandexMap/utils';
import React from 'react';
import { ISaleProduct } from 'sections/Sale/interfaces/sale.interfaces';
import { useHandlers } from './handlers';
import formatDate from 'date-fns/format';
import QuantityCounter from 'sections/Sale/components/QuantityCounter';
import { API_SERVER_URL } from 'config/env';
import { useProductHandlers } from 'hooks/productHandlers.hook';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';

interface IProps {
  product: ISaleProduct;
}

const SaleProductPageContent: FC<IProps> = ({ product }) => {
  const {
    sellerName,
    sale,
    categories,
    deletionSubmitting,
    preview,
    setPreview,
    handlePreviewCancel,
    orgBranch,
    setOrgBranch,
    auth,
    locale,
    count,
    setCount,
    deletionModalVisible,
    setDeletionModalVisible,
    router,
    handleDelete,
    imageGalleryRef,
    disabledUp,
    disabledDown,
    images,
    currentImageUrl,
    imageUrl,
    changeActivePhotoByIndex,
    changeSlide,
    changeSlideByKeyboard,
  } = useHandlers({
    product,
  });
  const { toggleProductIsInCart, isInCart } = useProductHandlers();

  useEffect(() => {
    document.addEventListener('keydown', changeSlideByKeyboard, false);
    return () => {
      document.removeEventListener('keydown', changeSlideByKeyboard, false);
    };
  }, [preview]);

  console.log('categories', categories);

  return (
    <Page className="personal-area-page">
      <BreadCrumbs
        list={[
          {
            link: APP_PATHS.SALE_PRODUCT_LIST,
            text: locale.common.productSale,
          },
        ]}
      />
      <PageTop title={product?.name} />
      <PageContent className="cardProduct" style={{ paddingTop: 0 }}>
        <span className="text-right color-default">
          {`Опубликовано:
          ${formatDate(new Date(), 'dd.MM.yy')}`}
        </span>
        <span className="cardProduct__article text_16">{product?.article}</span>
        <div className="cardProduct__content">
          <div className="cardProduct__product">
            {product.productFiles.length ? (
              <div className="cardProduct__productPhoto">
                <div className="cardProduct__btns">
                  {product.productFiles.map((productFile, i) => (
                    <div
                      key={productFile.id}
                      className={classNames(`cardProduct__btn`, {
                        active: i === preview.activePhotoIndex,
                      })}
                      onClick={() => changeActivePhotoByIndex(i)}
                    >
                      <img
                        src={`${API_SERVER_URL}/files/${productFile?.file?.path}`}
                        alt=""
                        className="cardProduct__btnPhoto"
                      />
                    </div>
                  ))}
                </div>
                <div className="cardProduct__photos">
                  <div
                    className="cardProduct__photo active"
                    onClick={() => {
                      setPreview({
                        ...preview,
                        previewVisible: true,
                        previewImage: imageUrl,
                      });
                    }}
                  >
                    <img
                      src={imageUrl}
                      alt=""
                      className="cardProduct__photoImg"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="cardProduct__productPhoto">
                <div className="cardProduct__productPhoto__no-photo">
                  <img src="/img/icons/no-photo.svg" alt="" />
                </div>
              </div>
            )}
          </div>

          <div className="cardProduct__infs saleCardProduct-info">
            <div className="saleCardProduct-info__price">
              <h2 className="saleCardProduct-info__newPrice">
                {sale?.price
                  .toFixed(2)
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
                  .replace(/\./g, ',')}{' '}
                ₽
              </h2>
              <h2 className="saleCardProduct-info__previousPrice previousPrice">
                {!!sale?.previousPrice &&
                  `${sale?.previousPrice
                    .toFixed(2)
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
                    .replace(/\./g, ',')} ₽`}
              </h2>
            </div>
            <div className="saleCardProduct-info__sellerInf d-flex">
              <KeyValueItem
                keyText="Поставщик"
                value={
                  <span className="d-flex">
                    <span>{sale.organization?.name}</span>

                    <KeyValueItem
                      keyText="Осталось"
                      value={`${sale?.amount} шт.` || 0}
                      keyClassName="text-normal"
                      className="ml-10"
                    />
                  </span>
                }
              />
              {auth.currentRole.label === 'customer' && (
                <>
                  <KeyValueItem
                    keyText="Продавец"
                    value={
                      <span className="d-flex">
                        <Link
                          href={generateInnerUrl(
                            APP_PATHS.SELLER(sale?.userId),
                            {
                              text: sellerName,
                            },
                          )}
                          className="mr-10 text-underline"
                        >
                          {sellerName}
                        </Link>
                        <Link
                          href={generateInnerUrl(
                            APP_PATHS.SELLER_REVIEWS(sale?.organizationId),
                            {
                              text: sale.organization?.name,
                            },
                          )}
                        >
                          <RateString
                            color={'#FFB800'}
                            emptyColor={'#c4c4c4'}
                            rate={(sale?.user?.ratingValue || 0).gaussRound(1)}
                            max={5}
                            size={20}
                          />
                        </Link>

                        <KeyValueItem
                          keyText="Отзывы"
                          value={sale?.user?.reviewsNumber || 0}
                          keyClassName="text-normal"
                          className="ml-10"
                        />
                        <KeyValueItem
                          keyText="Продаж"
                          value={sale?.user?.salesNumber || 0}
                          keyClassName="text-normal"
                          className="ml-10"
                        />
                      </span>
                    }
                  />
                  <KeyValueItem
                    keyText="Адрес поставщика"
                    value={convertAddressToString(sale?.supplierAddress)}
                    onValueClick={() =>
                      setOrgBranch({
                        address: sale?.supplierAddress,
                        orgName: sale.organization?.name,
                      })
                    }
                  />

                  <div className="sale-product-item__button-wrapper mt-10">
                    <QuantityCounter
                      count={count}
                      setCount={setCount}
                      className="sale-product-item__counter"
                      disabledUp={disabledUp}
                      disabledDown={disabledDown}
                    />
                    <Button
                      type="primary"
                      className={classNames('sale-product-item__button', {
                        disabled: !sale.amount,
                      })}
                      onClick={() => {
                        if (
                          !isInCart(product, {
                            priceOfferId: sale.priceOfferId,
                          })
                        ) {
                          if (!sale.amount) {
                            openNotification('Товара нет в наличии');
                            return;
                          }
                          toggleProductIsInCart(
                            { product, quantity: count },
                            { priceOfferId: sale.priceOfferId },
                          );
                        } else {
                          router.push(
                            generateUrl(
                              { history: DEFAULT_NAV_PATHS.CART },
                              {
                                pathname: APP_PATHS.CART,
                                removeCurrentParams: true,
                              },
                            ),
                          );
                        }
                      }}
                    >
                      {!isInCart(product, {
                        priceOfferId: sale.priceOfferId,
                      })
                        ? 'Добавить в корзину'
                        : 'Перейти в корзину'}
                    </Button>
                    <Button
                      type="primary"
                      className="button-white"
                      onClick={() =>
                        startChatWithUser({
                          companionId: sale.userId,
                          companionRole: 'seller',
                          orderRequestId: product.id,
                        })
                      }
                    >
                      {'Чат с продавцом'} <MessageOutlined />
                    </Button>
                  </div>
                </>
              )}
              {auth.currentRole.label === 'seller' && (
                <div className="d-flex mt-20 edit-wrapper">
                  <Button
                    onClick={e => {
                      e.preventDefault();
                      setDeletionModalVisible(true);
                    }}
                    className=" mr-10 button-white"
                  >
                    Удалить
                  </Button>
                  <Button
                    type="primary"
                    className="mr-10 button-white"
                    onClick={e => {
                      e.preventDefault();
                      router.push(
                        generateUrl(
                          {
                            history: []
                              .concat(router.query.history as string[])
                              .concat([
                                JSON.stringify([
                                  APP_PATHS.EDIT_SALE_PRODUCT(product.sale.id),
                                  'Редактирование',
                                ]),
                              ]),
                          },
                          {
                            pathname: APP_PATHS.EDIT_SALE_PRODUCT(
                              product.sale.id,
                            ),
                          },
                        ),
                      );
                    }}
                  >
                    Редактировать
                  </Button>

                  <ConfirmModal
                    open={deletionModalVisible}
                    onClose={() => setDeletionModalVisible(false)}
                    title="Вы уверены что хотите удалить товар?"
                    onConfirm={handleDelete}
                    submitAwaiting={deletionSubmitting}
                  />
                </div>
              )}
              <div className="cardProduct__desc mt-20">
                <ul className="cardProduct__descList text_14_normal">
                  <div className="cardProduct__descList__col mr-50 text_14_normal ">
                    <li className="cardProduct__descItem text_14_normal ">
                      {locale.catalog.type}
                    </li>
                    <li className="cardProduct__descItem text_14_normal">
                      {locale.catalog.brand}
                    </li>
                    <li className="cardProduct__descItem text_14_normal">
                      {locale.catalog.model}
                    </li>
                    <li className="cardProduct__descItem text_14_normal">
                      {locale.catalog.category}
                    </li>
                    <li className="cardProduct__descItem text_14_normal">
                      {locale.catalog.subcategory}
                    </li>
                    <li className="cardProduct__descItem text_14_normal">
                      Бренд
                    </li>
                  </div>
                  <div className="cartProduct__descList__col ">
                    <li className="cardProduct__descItem text_14_normal">
                      {categories?.autoType?.name || 'Сопутствующие товары'}
                    </li>
                    <li className="cardProduct__descItem text_14_normal">
                      {categories?.autoBrand?.name || '-'}
                    </li>
                    <li className="cardProduct__descItem text_14_normal">
                      {categories?.autoModels?.length > 0
                        ? categories.autoModels
                            ?.map(autoModel => autoModel.name)
                            .join(', ')
                        : '-'}
                    </li>
                    <li className="cardProduct__descItem text_14_normal">
                      {categories?.group?.name || '-'}
                    </li>
                    <li className="cardProduct__descItem text_14_normal">
                      {categories?.subgroup?.name || '-'}
                    </li>
                    <li className="cardProduct__descItem text_14_normal">
                      {product?.manufacturer || '-'}
                    </li>
                  </div>
                </ul>
                {!!product?.description?.length && (
                  <div className="mt-20">
                    <span className="text_14">
                      {locale.catalog.productDesc}
                    </span>
                    <div className="null text_14_normal cardProduct__text">
                      {htmr(product.description)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </PageContent>
      <Modal
        open={preview.previewVisible}
        title={`Изображение ${preview.currentPhotoIndex + 1}`}
        footer={null}
        onCancel={handlePreviewCancel}
        centered
        width={700}
        wrapClassName="product-image-modal"
      >
        <img
          alt="example"
          style={{ maxWidth: 900, width: '100%' }}
          src={currentImageUrl}
        />
        {product?.productFiles && product?.productFiles.length && (
          <>
            <div
              className="change-slide prev"
              onClick={e => changeSlide(e, 'left-arrow')}
            >
              <LeftOutlined />
            </div>
            <div
              className="change-slide next"
              onClick={e => changeSlide(e, 'right-arrow')}
            >
              <RightOutlined />
            </div>
          </>
        )}
      </Modal>
      <DeliveryAddressModal
        address={!!orgBranch && orgBranch.address}
        setAddress={() => {}}
        open={!!orgBranch && !!orgBranch.address}
        onCancel={() => setOrgBranch(null)}
        allowControl={false}
        title={!!orgBranch ? `Поставщик ${orgBranch.orgName}` : null}
      />
    </Page>
  );
};

export default SaleProductPageContent;
