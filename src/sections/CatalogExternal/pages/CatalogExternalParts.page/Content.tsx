import { BreadCrumbs, Page, PageContent, PageTop } from 'components/common';
import { Button } from 'antd';
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  FullscreenOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import {
  IAcatProduct,
  IAcatProductGroup,
  IAcatProductGroupPageProps,
} from 'sections/CatalogExternal/interfaces';
import classNames from 'classnames';
import { useHandlers } from './handlers';
import { FC, useState } from 'react';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import {
  generateInnerUrl,
  generateUrl,
  openNotification,
} from 'utils/common.utils';
import ProductItem from 'sections/Catalog/components/ProductItem';
import { APIRequest } from 'utils/api.utils';
import { IProduct } from 'sections/Catalog/interfaces/products.interfaces';
import Link from 'next/link';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';
import { useAuth } from 'hooks/auth.hook';
import { isUserBanned, isUserRequestsBanned } from 'sections/Users/utils';
import { CustomRequestMiniIcon } from 'components/icons';
import ExternalCatalogAcatGroupList from '../CatalogExternalGroupList.page/GroupList';

interface IProps {
  data: IAcatProductGroupPageProps;
  groups: IAcatProductGroup[];
}

export function toBase64(arr) {
  return btoa(arr.reduce((data, byte) => data + String.fromCharCode(byte), ''));
}

const CatalogExternalPartsPageContent: FC<IProps> = ({ data, groups }) => {
  const auth = useAuth();
  const {
    router,
    imageRef,
    pageContentRef,
    locale,
    mark,
    model,
    group,
    labels,
    activeLabel,
    setActiveLabel,
    imageRatio,
    permissions,
    products,
    wrapperRef,
    scale,
    setScale,
    fullscreenButtonRef,
    fieldRef,
    imageWapperRef,
    onScaleImageHandler,
    getProductData,
  } = useHandlers({ data });
  const imageUrl = `data:image/png;base64,${toBase64(data?.imageBuffer?.data)}`;
  const [labelsVisible, setLabelsVisible] = useState(true);

  const isBanned =
    auth.isAuthenticated &&
    (isUserRequestsBanned(auth.user, auth.currentRole.id) ||
      isUserBanned(auth.user, auth.currentRole.id));

  const handleProductClick = async (product: IAcatProduct) => {
    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.COPY_EXTERNAL_PRODUCT,
      data: {
        product: getProductData(product),
      },
      requireAuth: true,
    });
    if (!res.isSucceed) return;
    const resultProduct: IProduct = res.data;

    router.push(
      !!data?.modification
        ? APP_PATHS.ACAT_MODIFICATIONS_PRODUCT(
            data?.type?.id,
            data?.mark?.id,
            data?.model?.id,
            data?.modification?.id,
            String(group?.parentId) + '--' + String(group?.id),
            resultProduct.id,
          )
        : APP_PATHS.ACAT_PRODUCT(
            data?.type?.id,
            data?.mark?.id,
            data?.model?.id,
            String(group?.parentId) + '--' + String(group?.id),
            resultProduct.id,
          ),
    );
    // router.push(
    //   generateInnerUrl(!!data?.modification ? APP_PATHS.ACAT_MODIFICATIONS_PRODUCT(resultProduct.id), {
    //     text: resultProduct.name,
    //   }) : ,
    // );
  };

  return (
    <Page>
      <BreadCrumbs
        list={[
          {
            link: generateUrl(
              { expandedGroups: null },
              { pathname: APP_PATHS.CATALOG_EXTERNAL },
            ),
            text: locale.pages.catalogExternal.title,
          },
          {
            link: generateUrl(
              { autoType: data?.type?.id, expandedGroups: null },
              { pathname: APP_PATHS.CATALOG_EXTERNAL },
            ),
            text: data?.type?.name,
          },
          {
            link: generateUrl(
              { expandedGroups: null },
              {
                pathname: APP_PATHS.ACAT_MODEL_LIST(
                  data?.type?.id,
                  data?.mark?.id,
                ),
              },
            ),
            text: data?.mark?.name,
          },
          {
            link: generateUrl(
              {},
              {
                pathname: APP_PATHS.ACAT_GROUP_LIST(
                  data?.type?.id,
                  data?.mark?.id,
                  data?.model?.id,
                ),
              },
            ),
            text: data?.model?.name,
          },
          !!data?.modification && {
            link: generateUrl(
              {},
              {
                pathname: APP_PATHS.ACAT_MODIFICATION_GROUP_LIST(
                  data?.type?.id,
                  data?.mark?.id,
                  data?.model?.id,
                  data?.modification?.id,
                ),
              },
            ),
            text: data?.modification?.name,
          },
          {
            link: window.location.href,
            text: data?.group?.parent_full_name || data?.group?.name,
          },
        ].filter(Boolean)}
        showPersonalAreaLink={false}
        useHistory={false}
      />
      <PageTop title={group?.name} />
      <PageContent>
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ minWidth: 230 }}>
            <div>
              <Link
                href={generateUrl(
                  {
                    history: DEFAULT_NAV_PATHS.CUSTOM_ORDER,
                  },
                  {
                    pathname: APP_PATHS.CUSTOM_ORDER,
                    removeCurrentParams: true,
                  },
                )}
                onClick={e => {
                  if (isBanned) {
                    e.preventDefault();
                    openNotification('Вам запрещенно это действие');
                  }
                }}
                className="main-header__custom-request"
              >
                <Button className="w-100">
                  <CustomRequestMiniIcon />
                  Поиск по фото/описанию
                </Button>
              </Link>

              <div
                style={{ background: '#eee', borderRadius: 10 }}
                className="mt-10 pr-5"
              >
                <ExternalCatalogAcatGroupList {...data} groups={groups} />
              </div>
            </div>
          </div>
          <div ref={pageContentRef} style={{ flex: 1 }}>
            <div
              className="image-control"
              ref={wrapperRef}
              style={{ width: 840 }}
            >
              <div className="image-control__controls-wrapper">
                <Button
                  size="small"
                  shape="circle"
                  className="no-bg no-border color-primary"
                  onClick={() => setLabelsVisible(prev => !prev)}
                >
                  {labelsVisible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                </Button>
                <Button
                  size="small"
                  type="primary"
                  onClick={() => setScale(prev => prev + 0.2)}
                >
                  +
                </Button>
                <Button
                  size="small"
                  type="primary"
                  onClick={() => setScale(prev => prev - 0.2)}
                >
                  -
                </Button>
                <Button size="small" type="primary" ref={fullscreenButtonRef}>
                  <FullscreenOutlined />
                </Button>
                <Button
                  size="small"
                  shape="circle"
                  className="no-bg no-border color-primary"
                >
                  <InfoCircleOutlined />
                </Button>
              </div>
              <div
                ref={fieldRef}
                onWheel={onScaleImageHandler}
                className={classNames(
                  [
                    'scroll-container',
                    'image-control__scroll-container',
                    'catalog-external__product-group__image-wrapper',
                    'user-select-none',
                  ],
                  {
                    'height-fixed': imageRatio.ratio !== 1,
                  },
                )}
                style={{
                  overflow: 'hidden',
                  width: '100%',
                }}
              >
                <div
                  style={{
                    margin: 'auto',
                    transform: `scale(${scale / 10})`,
                    transformOrigin: 'center center',
                    minWidth: '100%',
                    position: 'relative',
                    height: 500,
                  }}
                >
                  <div
                    ref={imageWapperRef}
                    // style={{ position: 'absolute', left: 0, top: 0 }}
                  >
                    <div
                      className="catalog-external__product-group__image-img"
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                      }}
                    >
                      <div className="image-wrapper">
                        <img
                          src={imageUrl}
                          ref={imageRef}
                          style={{
                            height:
                              imageRatio.height / imageRatio.ratio || 'auto',
                          }}
                        />
                        <div className="labels-wrapper">
                          {labelsVisible &&
                            labels.map((label, i) => (
                              <div
                                key={i}
                                className={classNames(
                                  'catalog-external__product-group__image-label',
                                  {
                                    active: label.id === activeLabel,
                                  },
                                )}
                                style={{
                                  left:
                                    label.coordinate.top.x / imageRatio.ratio,
                                  top:
                                    label.coordinate.top.y / imageRatio.ratio,
                                  transform:
                                    typeof label?.coordinate?.bottom?.y ===
                                      'number' &&
                                    typeof label?.coordinate?.top?.y ===
                                      'number' &&
                                    `scale(${
                                      (label.coordinate.bottom.y -
                                        label.coordinate.top.y) /
                                      17.6
                                    })`,
                                }}
                                onClick={() => {
                                  setActiveLabel(label.id);
                                  if (!pageContentRef.current) return;
                                  const row =
                                    pageContentRef.current.querySelector(
                                      `.row-${label.id}`,
                                    );
                                  if (!row) return;
                                  window.scrollTo({
                                    top: row.getBoundingClientRect().top - 200,
                                    behavior: 'smooth',
                                  });
                                }}
                              >
                                {label.id}
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <ul style={{ display: 'flex', flexWrap: 'wrap' }}>
              {products.map((product, i) => {
                const productIsSelected =
                  product?.labelId && product?.labelId === activeLabel;
                const productLabel = labels?.find(
                  el => el.id === product?.labelId,
                )?.id;
                const productName =
                  (!!productLabel ? `[${productLabel}] ` : '') + product.name;

                return (
                  <ProductItem
                    key={i}
                    product={{
                      id: product.number,
                      name: productName,
                      article: product.number,
                      status: null,
                      height: null,
                      weight: null,
                      length: null,
                      width: null,
                    }}
                    externalProductData={getProductData(product)}
                    isHighlighted={productIsSelected}
                    onClick={() => setActiveLabel(product?.labelId)}
                    onDoubleClick={() =>
                      window.scrollTo({
                        top: 80,
                        behavior: 'smooth',
                      })
                    }
                    onLinkClick={() => handleProductClick(product)}
                  />
                );
              })}
            </ul>
          </div>
        </div>
      </PageContent>
    </Page>
  );
};

export default CatalogExternalPartsPageContent;
