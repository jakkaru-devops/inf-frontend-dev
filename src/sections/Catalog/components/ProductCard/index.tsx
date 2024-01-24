import { IRowsWithCount } from 'interfaces/common.interfaces';
import { FC, Fragment } from 'react';
import { IAutoType } from 'sections/Catalog/interfaces/categories.interfaces';
import {
  IProduct,
  IProductBranch,
  ISupplier,
} from 'sections/Catalog/interfaces/products.interfaces';
import useHandlers from './handlers';
import { PageContent, TabGroup } from 'components/common';
import classNames from 'classnames';
import { API_SERVER_URL } from 'config/env';
import { Button, Modal } from 'antd';
import {
  StarOutlined,
  StarFilled,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { generateInnerUrl, generateUrl, renderHtml } from 'utils/common.utils';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';
import { APP_PATHS } from 'data/paths.data';
import ProductPrices from '../ProductPrices';
import SuppliersList from '../SuppliersList';
import RecommendedProductList from '../RecommendedProductList';
import ProductAnalogs from '../ProductAnalogs';
import ProductApplicabilities from '../ProductApplicabilities';
import Head from 'next/head';

interface IProps {
  product: IProduct;
  branches: IProductBranch[];
  autoTypes: IRowsWithCount<IAutoType[]>;
  suppliersList: ISupplier[];
}

const ProductCard: FC<IProps> = ({
  product,
  branches,
  autoTypes,
  suppliersList,
}) => {
  const {
    auth,
    locale,
    router,
    urlOrderSuffix,
    quantity,
    preview,
    setPreview,
    tabPriceList,
    tabSuppliersList,
    tabList,
    analogProducts,
    setAnalogProducts,
    applicabilities,
    setApplicabilities,
    recommendedProducts,
    setRecommendedProducts,
    priceOfferGroups,
    setPriceOfferGroups,
    permissions,
    changeSlide,
    changeActivePhotoByIndex,
    handlePreviewCancel,
    currentImageUrl,
    imageUrl,
    isInOrderRequest,
    handleAddToOrderRequestButtonClick,
    schemaOrgContentProduct,
  } = useHandlers({
    product,
    suppliersList,
  });
  const activeTabLabel = tabList?.find(tab => tab.isActive)?.label;

  product.description = branches?.[0]?.description;

  return (
    <Fragment>
      <Head>
        <script
          id="app-ld-json"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schemaOrgContentProduct, null, '\t'),
          }}
        />
      </Head>

      <PageContent className="cardProduct" style={{ paddingTop: 0 }}>
        <span className="cardProduct__article">{product.article}</span>
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
          <div className="cardProduct__infs">
            {Object.values(permissions).filter(Boolean).length > 0 && (
              <div className="cardProduct__btnBlock">
                {permissions.addToOrderRequest && (
                  <Button
                    type="primary"
                    className="mr-10"
                    onClick={handleAddToOrderRequestButtonClick}
                  >
                    {!isInOrderRequest
                      ? 'Добавить в запрос'
                      : 'Удалить из запроса'}
                  </Button>
                )}
                {permissions.addToEditRequest &&
                  (!!router.query?.isSale ? (
                    <Button
                      type="primary"
                      className="product-item__button"
                      onClick={e => {
                        e.preventDefault();

                        router.push(
                          generateUrl(
                            {
                              history: DEFAULT_NAV_PATHS.ADD_SALE_PRODUCT,
                              sourceProductId: product.id,
                              isSale: null,
                            },
                            {
                              pathname: APP_PATHS.ADD_SALE_PRODUCT,
                              removeCurrentParams: true,
                            },
                          ),
                        );
                      }}
                    >
                      Добавить в распродажу
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      className="mr-10"
                      onClick={() =>
                        router.push(
                          generateInnerUrl(APP_PATHS.ADD_PRODUCT_OFFER, {
                            searchParams: {
                              sourceProductId: product.id,
                            },
                            text: 'Редактирование',
                          }),
                        )
                      }
                    >
                      Редактировать
                    </Button>
                  ))}
                {permissions.edit && (
                  <Button
                    type="primary"
                    className="mr-10"
                    onClick={() =>
                      router.push(
                        generateInnerUrl(APP_PATHS.EDIT_PRODUCT(product.id), {
                          text: 'Редактирование',
                        }),
                      )
                    }
                  >
                    Редактировать
                  </Button>
                )}
                {/* {permissions.addToFavorites && (
                  <Button
                    className={classNames(
                      'favorite cardProduct__favorite favorite_grey no-bg no-border color-primary',
                      {
                        active: isInFavorites(product, null),
                      },
                    )}
                    onClick={() => toggleProductIsInFavorites(product, null)}
                    shape="circle"
                    title={
                      !isInFavorites(product, null)
                        ? locale.catalog.addToFavorites
                        : locale.catalog.removeFromFavorites
                    }
                    style={{ fontSize: 26 }}
                  >
                    {!isInFavorites(product, null) ? (
                      <StarOutlined />
                    ) : (
                      <StarFilled />
                    )}
                  </Button>
                )} */}
              </div>
            )}
            <div className="cardProduct__desc">
              {!!product?.description?.length && (
                <div className="mb-20">
                  <div className="text_14 cardProduct__descTitle">
                    {locale.catalog.productDesc}
                  </div>
                  <div className="null text_14_normal cardProduct__text">
                    {renderHtml(product.description)}
                  </div>
                </div>
              )}
              {!!product?.manufacturer?.length && (
                <div className="mb-20">
                  <div className="text_14 cardProduct__descTitle">
                    Производитель
                  </div>
                  <div className="null text_14_normal cardProduct__text">
                    {product.manufacturer}
                  </div>
                </div>
              )}
              <div className="mb-20">
                <div className="text_14 cardProduct__descTitle">Габариты</div>
                <ul className="cardProduct__descList null">
                  <div className="cardProduct__descList__col">
                    <li className="cardProduct__descItem text-lowercase">
                      {locale.catalog.productWeight}:{' '}
                      {product.weight
                        ? `${product.weight} ${locale.common.kg}`
                        : '-'}
                    </li>
                    <li className="cardProduct__descItem text-lowercase">
                      {locale.catalog.productLength}:{' '}
                      {product.length
                        ? `${product.length} ${locale.common.mm}`
                        : '-'}
                    </li>
                    <li className="cardProduct__descItem text-lowercase">
                      {locale.catalog.productWidth}:{' '}
                      {product.width
                        ? `${product.width} ${locale.common.mm}`
                        : '-'}
                    </li>
                    <li className="cardProduct__descItem text-lowercase">
                      {locale.catalog.productHeight}:{' '}
                      {product.height
                        ? `${product.height} ${locale.common.mm}`
                        : '-'}
                    </li>
                  </div>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {(!auth.isAuthenticated || auth.currentRole.label === 'customer') && (
          <Fragment>
            {!!product.minPrice && (
              <TabGroup list={tabPriceList} scroll={false}>
                <ProductPrices
                  product={product}
                  priceOfferGroups={priceOfferGroups}
                  setPriceOfferGroups={setPriceOfferGroups}
                />
              </TabGroup>
            )}
            <TabGroup
              list={tabSuppliersList}
              className="mt-30 mb-30"
              scroll={false}
            >
              <SuppliersList suppliersList={suppliersList} product={product} />
            </TabGroup>
          </Fragment>
        )}

        {!!tabList?.length && (
          <TabGroup list={tabList} className="mb-20" scroll={false}>
            {activeTabLabel === 'recommendedProducts' && (
              <RecommendedProductList
                product={product}
                recommendedProducts={recommendedProducts}
                setRecommendedProducts={setRecommendedProducts}
              />
            )}
            {activeTabLabel === 'analogs' && (
              <ProductAnalogs
                productId={product.id}
                analogProducts={analogProducts}
                setAnalogProducts={setAnalogProducts}
                pagination="pages"
              />
            )}
            {activeTabLabel === 'applicabilities' && (
              <ProductApplicabilities
                productId={product.id}
                applicabilities={applicabilities}
                setApplicabilities={setApplicabilities}
                pagination="pages"
              />
            )}
          </TabGroup>
        )}
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
        {product.productFiles && product.productFiles.length && (
          <>
            <div
              className="change-slide prev"
              onClick={() => changeSlide('prev')}
            >
              <LeftOutlined />
            </div>
            <div
              className="change-slide next"
              onClick={() => changeSlide('next')}
            >
              <RightOutlined />
            </div>
          </>
        )}
      </Modal>
    </Fragment>
  );
};

export default ProductCard;
