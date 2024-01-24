import {
  FC,
  Fragment,
  RefObject,
  WheelEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  PageTop,
  InputNumber,
  Page,
  PageContent,
  Link,
} from 'components/common';
import {
  ILaximoCartProductDTO,
  ILaximoCatalogInfo,
  ILaximoQuickListDetail,
  ILaximoQuickUnitsWithDetails,
} from '../../interfaces';
import { CatalogExternalBreadCrumbs } from '../../components/CatalogExternalBreadCrumbs';
import { Button, Modal } from 'antd';
import { useHandlers } from './handlers';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import _ from 'lodash';
import ScrollContainer from 'react-indiana-drag-scroll';
import ProductItem from 'sections/Catalog/components/ProductItem';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { IProduct } from 'sections/Catalog/interfaces/products.interfaces';
import {
  generateInnerUrl,
  generateUrl,
  openNotification,
} from 'utils/common.utils';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';
import { CustomRequestMiniIcon } from 'components/icons';
import { useAuth } from 'hooks/auth.hook';
import { isUserBanned, isUserRequestsBanned } from 'sections/Users/utils';
import LaximoGroupList from '../CatalogExternalLaximoCar.page/Groups/GroupList';

export interface CatalogExternalLaximoUnitContentProps {
  unit: {
    unitInfo: ILaximoQuickUnitsWithDetails;
    details: ILaximoQuickListDetail[];
    imageMap: {
      mapObjects: Array<{
        code: string;
        type: string;
        x1: number;
        x2: number;
        y1: number;
        y2: number;
      }>;
    };
  };
  catalog: ILaximoCatalogInfo;
  carInfo: any;
}

const CatalogExternalLaximoUnitContent: FC<
  CatalogExternalLaximoUnitContentProps
> = ({ unit, catalog, carInfo }) => {
  const { unitInfo, details, imageMap } = unit;
  const router = useRouter();
  const auth = useAuth();

  const catalogUrl =
    router.query.laximoType === 'cars' ? 'CARS_FOREIGN' : 'TRUCKS_FOREIGN';
  const getCatalogDto = (oem: string, name: string): ILaximoCartProductDTO => ({
    id: oem,
    name: name,
    article: oem,
    autoType: catalogUrl,
    autoBrand: catalog.brand,
    autoModel: carInfo.carInfo.name,
    group: unitInfo.name,
  });

  const {
    imageRef,
    imageWapperRef,
    products,
    handleProductQuantityChange,
    activeLabel,
    setActiveLabel,
    imageRatio,
    pageContentRef,
    rowsRef,
  } = useHandlers(getCatalogDto, details);
  const [preview, setPreview] = useState<boolean>();
  const [scale, setScale] = useState<number>(10);
  const ScrollContainerUntyped = ScrollContainer as any;
  const fieldRef: RefObject<HTMLDivElement> = useRef();

  const onScaleImageHandler = (e: WheelEvent<HTMLImageElement>) => {
    const delta = e.deltaY || e.detail;
    if (delta > 0) {
      setScale(scale - 0.1 < 1 ? 1 : scale - 0.1);
    } else {
      setScale(scale + 0.1);
    }
  };

  const typeName =
    router.query.laximoType == 'cars'
      ? 'Легковые (иномарки)'
      : 'Грузовые (иномарки)';

  const hleb = [
    { name: 'Каталог', url: '/catalog' },
    {
      name: typeName,
      url: catalogUrl,
    },
    {
      name: carInfo?.carInfo?.brand,
      url: `${router.query.catalogCode}?laximoType=${router.query.laximoType}`,
    },
    {
      name: carInfo?.carInfo?.name,
      url:
        `${router.query.catalogCode}/${router.query.vehicleId}?ssd=${router.query.ssd}&laximoType=${router.query.laximoType}&currentGroupId=${router.query?.currentGroupId}` +
        ((router.query?.expandedGroups as string[]) || [])
          .map(el => `&expandedGroups=${el}`)
          .join(''),
    },
    {
      name: unit.unitInfo.name,
      url:
        `${router.query.catalogCode}/${router.query.vehicleId}/${router.query.unitId}?laximoType=${router.query.laximoType}&ssd=${router.query.ssd}&currentGroupId=${router.query?.currentGroupId}` +
        ((router.query?.expandedGroups as string[]) || [])
          .map(el => `&expandedGroups=${el}`)
          .join(''),
    },
  ];

  const isBanned =
    auth.isAuthenticated &&
    (isUserRequestsBanned(auth.user, auth.currentRole.id) ||
      isUserBanned(auth.user, auth.currentRole.id));

  useEffect(() => {
    if (!fieldRef.current) return;

    handleControl();

    // left: 37, up: 38, right: 39, down: 40,
    // spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
    var keys = { 37: 1, 38: 1, 39: 1, 40: 1 };

    function preventDefault(e) {
      e.preventDefault();
    }

    function preventDefaultForScrollKeys(e) {
      if (keys[e.keyCode]) {
        preventDefault(e);
        return false;
      }
    }

    // modern Chrome requires { passive: false } when adding event
    var supportsPassive = false;
    try {
      window.addEventListener(
        'test',
        null,
        Object.defineProperty({}, 'passive', {
          get: function () {
            supportsPassive = true;
          },
        }),
      );
    } catch (e) {}

    var wheelOpt: any = supportsPassive ? { passive: false } : false;
    var wheelEvent =
      'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

    // call this to Disable
    function disableScroll() {
      window.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
      window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
      window.addEventListener('touchmove', preventDefault, wheelOpt); // mobile
      window.addEventListener('keydown', preventDefaultForScrollKeys, false);
    }

    // call this to Enable
    function enableScroll() {
      window.removeEventListener('DOMMouseScroll', preventDefault, false);
      window.removeEventListener(wheelEvent, preventDefault, wheelOpt);
      window.removeEventListener('touchmove', preventDefault, wheelOpt);
      window.removeEventListener('keydown', preventDefaultForScrollKeys, false);
    }

    const div = fieldRef.current;
    div.onmouseover = e => {
      disableScroll();
    };
    div.onmouseleave = e => {
      enableScroll();
    };
  }, []);

  const handleControl = () => {
    const field = fieldRef.current;
    const imageWrapper = imageWapperRef.current;

    let move = false;
    let startPos = {
      x: 0,
      y: 0,
    };
    let position = {
      x: 0,
      y: 0,
    };

    field.onmousedown = e => {
      // console.log(e);
      console.log('DOWN');
      move = true;
      startPos = {
        x: e.screenX,
        y: e.screenY,
      };
    };
    field.onmouseup = e => {
      console.log('UP');
      move = false;
      const dif = {
        x: e.screenX - startPos.x,
        y: e.screenY - startPos.y,
      };
      position = {
        x: position.x + dif.x,
        y: position.y + dif.y,
      };
    };
    field.onmouseleave = e => {
      console.log('LEAVE');
      move = false;
      const dif = {
        x: e.screenX - startPos.x,
        y: e.screenY - startPos.y,
      };
      position = {
        x: position.x + dif.x,
        y: position.y + dif.y,
      };
    };
    field.onmousemove = e => {
      if (!move) return;
      // console.log(e);
      // console.log('MOVE');
      const newPos = {
        x: e.screenX - startPos.x,
        y: e.screenY - startPos.y,
      };
      console.log(startPos);
      // console.log(position);

      imageWrapper.style.marginLeft = `${position.x + newPos.x}px`;
      imageWrapper.style.marginTop = `${position.y + newPos.y}px`;

      // scroller.style.transform = `scale(${scale / 10}) translate(${
      //   position.x + newPos.x
      // }px, ${position.y + newPos.y})`;

      // setPosition(prev => ({
      //   x: e.screenX - startPos.x,
      //   y: e.screenY - startPos.y,
      // }));
    };
  };

  const handleProductClick = async (product: ILaximoCartProductDTO) => {
    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.COPY_EXTERNAL_PRODUCT,
      data: {
        product,
      },
      requireAuth: true,
    });
    if (!res.isSucceed) return;
    const resultProduct: IProduct = res.data;

    router.push(
      generateInnerUrl(APP_PATHS.PRODUCT(resultProduct.id), {
        text: resultProduct.name,
      }),
    );
  };

  return (
    <Page>
      <CatalogExternalBreadCrumbs breadcrumbs={hleb} laximo />
      <PageTop title={`Узел ${unitInfo.code}: ${unitInfo.name}`} />

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
                <LaximoGroupList
                  groups={carInfo.quickList}
                  currentGroupId={null}
                  onGroupClick={() => {}}
                  preventRouting
                />
              </div>
            </div>
          </div>

          <div>
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: 500,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 15,
                  top: 15,
                  cursor: 'pointer',
                  zIndex: 1,
                }}
                onClick={() => setPreview(true)}
              >
                <img src="/img/icons/catalog-ext-lupa.svg" />
              </div>
              <div
                ref={fieldRef}
                onWheel={onScaleImageHandler}
                className={classNames(
                  [
                    'catalog-external__product-group__image-wrapper',
                    'user-select-none',
                  ],
                  {
                    'laximo-height-fixed': imageRatio.ratio !== 1,
                  },
                )}
                style={{
                  overflow: 'hidden',
                  width: '100%',
                  // height: '100%',
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
                          ref={imageRef}
                          alt={unitInfo.name}
                          src={unitInfo.largeimageurl.replace(
                            '%size%',
                            'source',
                          )}
                          style={{
                            height:
                              imageRatio.height / imageRatio.ratio || 'auto',
                          }}
                        />
                        <div className="labels-wrapper">
                          {imageMap &&
                            imageMap.mapObjects.map((label, i) => (
                              <div
                                key={i}
                                className={classNames(
                                  'catalog-external__product-group__image-laximo-label',
                                  {
                                    active:
                                      label.code ===
                                      activeLabel?.find(
                                        choseLabel =>
                                          choseLabel.code === label.code,
                                      )?.code,
                                  },
                                )}
                                style={{
                                  left: label.x1 / imageRatio.ratio,
                                  top: label.y1 / imageRatio.ratio,
                                  width: Math.ceil(
                                    label.x2 / imageRatio.ratio -
                                      label.x1 / imageRatio.ratio,
                                  ),
                                  height: Math.ceil(
                                    label.y2 / imageRatio.ratio -
                                      label.y1 / imageRatio.ratio,
                                  ),
                                  transform: 'none',
                                }}
                                onMouseEnter={() => {
                                  setActiveLabel(prevState => [
                                    ...prevState,
                                    { code: label.code, event: 'hover' },
                                  ]);
                                  if (!pageContentRef.current) return;
                                  const row =
                                    pageContentRef.current.querySelector(
                                      `.row-${label.code}`,
                                    );
                                  if (!row) return;
                                }}
                                onMouseLeave={() => {
                                  setActiveLabel(
                                    activeLabel?.filter(
                                      choseLabel =>
                                        !_.isEqual(choseLabel, {
                                          code: label.code,
                                          event: 'hover',
                                        }),
                                    ),
                                  );
                                }}
                                onClick={() => {
                                  setActiveLabel(prevState =>
                                    !prevState.find(
                                      choseLabel =>
                                        choseLabel.code === label.code &&
                                        choseLabel.event === 'onClick',
                                    )
                                      ? [
                                          ...prevState,
                                          {
                                            code: label.code,
                                            event: 'onClick',
                                          },
                                        ]
                                      : activeLabel.filter(
                                          choseLabel =>
                                            !_.isEqual(choseLabel, {
                                              code: label.code,
                                              event: 'onClick',
                                            }),
                                        ),
                                  );
                                  if (!pageContentRef.current) return;
                                  const detail = details.find(
                                    el => el.codeonimage === label.code,
                                  );
                                  const rowHighlighted =
                                    !!detail?.codeonimage &&
                                    !!activeLabel.find(
                                      el =>
                                        el.code === detail.codeonimage &&
                                        el.event === 'onClick',
                                    );

                                  const row =
                                    pageContentRef.current.querySelector(
                                      `.row-${label.code}`,
                                    );
                                  if (!row || rowHighlighted) return;

                                  const table =
                                    pageContentRef.current.querySelector(
                                      '.tableInf',
                                    );
                                  table.scrollTo({
                                    top: rowsRef.find(
                                      ({ id }) => id === label.code,
                                    ).ref.current.offsetTop,
                                    behavior: 'smooth',
                                  });
                                }}
                              />
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <ul style={{ display: 'flex', flexWrap: 'wrap', marginTop: 30 }}>
              {products.map((detail, i) => {
                const productIsSelected =
                  detail.codeonimage &&
                  detail.codeonimage ===
                    activeLabel?.find(
                      choseLabel => choseLabel.code === detail.codeonimage,
                    )?.code &&
                  !!activeLabel
                    .filter(
                      choseLabel => choseLabel.code === detail.codeonimage,
                    )
                    ?.map(filteredEvent => filteredEvent.event === 'onClick');
                const productLabel = detail.codeonimage;
                const productName =
                  (!!productLabel ? `[${productLabel}] ` : '') + detail.name;

                return (
                  <ProductItem
                    key={i}
                    product={{
                      id: detail.oem,
                      name: productName,
                      article: detail.oem,
                      status: null,
                      height: null,
                      weight: null,
                      length: null,
                      width: null,
                    }}
                    externalProductData={getCatalogDto(detail.oem, detail.name)}
                    isHighlighted={productIsSelected}
                    onClick={() =>
                      setActiveLabel([
                        { code: detail.codeonimage, event: 'onClick' },
                      ])
                    }
                    onDoubleClick={() =>
                      window.scrollTo({
                        top: 80,
                        behavior: 'smooth',
                      })
                    }
                    onLinkClick={() =>
                      handleProductClick(getCatalogDto(detail.oem, detail.name))
                    }
                  />
                );
              })}
            </ul>
          </div>
        </div>
      </PageContent>

      <Modal
        open={preview}
        title={unitInfo.name}
        footer={null}
        onCancel={() => setPreview(false)}
        centered
        width={700}
        wrapClassName="product-image-modal"
      >
        <ScrollContainerUntyped
          className={classNames(
            'catalog-external__product-group__image-wrapper',
            {
              'laximo-height-fixed': imageRatio.ratio !== 1,
            },
          )}
          hideScrollbars={false}
          style={{
            overflow: 'scroll',
          }}
        >
          <div
            onWheel={onScaleImageHandler}
            style={{
              transform: `scale(${scale / 10})`,
              transformOrigin: 'top left',
              minWidth: '100%',
            }}
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
                  ref={imageRef}
                  alt={unitInfo.name}
                  src={unitInfo.largeimageurl.replace('%size%', 'source')}
                />
                <div className="labels-wrapper">
                  {imageMap &&
                    imageMap.mapObjects.map((label, i) => (
                      <div
                        key={i}
                        className={classNames(
                          'catalog-external__product-group__image-laximo-label',
                          {
                            active:
                              label.code ===
                              activeLabel?.find(
                                choseLabel => choseLabel.code === label.code,
                              )?.code,
                          },
                        )}
                        style={{
                          left: label.x1 * imageRatio.scale,
                          top: label.y1 * imageRatio.scale,
                          width: Math.ceil(
                            label.x2 * imageRatio.scale -
                              label.x1 * imageRatio.scale,
                          ),
                          height: Math.ceil(
                            label.y2 * imageRatio.scale -
                              label.y1 * imageRatio.scale,
                          ),
                          transform: 'none',
                        }}
                        onMouseEnter={() => {
                          setActiveLabel(prevState => [
                            ...prevState,
                            { code: label.code, event: 'hover' },
                          ]);
                          if (!pageContentRef.current) return;
                          const row = pageContentRef.current.querySelector(
                            `.row-${label.code}`,
                          );
                          if (!row) return;
                        }}
                        onMouseLeave={() => {
                          setActiveLabel(
                            activeLabel?.filter(
                              choseLabel =>
                                !_.isEqual(choseLabel, {
                                  code: label.code,
                                  event: 'hover',
                                }),
                            ),
                          );
                        }}
                        onClick={() => {
                          setActiveLabel(prevState =>
                            !prevState.find(
                              choseLabel =>
                                choseLabel.code === label.code &&
                                choseLabel.event === 'onClick',
                            )
                              ? [
                                  ...prevState,
                                  {
                                    code: label.code,
                                    event: 'onClick',
                                  },
                                ]
                              : activeLabel.filter(
                                  choseLabel =>
                                    !_.isEqual(choseLabel, {
                                      code: label.code,
                                      event: 'onClick',
                                    }),
                                ),
                          );
                          if (!pageContentRef.current) return;
                          const row = pageContentRef.current.querySelector(
                            `.row-${label.code}`,
                          );
                          if (!row) return;
                          const table =
                            pageContentRef.current.querySelector('.tableInf');
                          table.scrollTo({
                            top: row.getBoundingClientRect().top - 200,
                            behavior: 'smooth',
                          });
                        }}
                      />
                    ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollContainerUntyped>
      </Modal>
    </Page>
  );
};

export default CatalogExternalLaximoUnitContent;

//TODO: need refactor
export const rowNameLaximoTable = (
  detail: ILaximoQuickListDetail,
  getProductDto: (oem: string, name: string) => ILaximoCartProductDTO,
  productIsSelected: boolean,
  handleProductQuantityChange: (
    quantity: number,
    productId: string | number,
  ) => void,
): JSX.Element => {
  const {
    handleCartButtonClick,
    handleFavoriteButtonClick,
    getProductIsInCart,
    permissions,
    getProductIsInFavorites,
    handleOrderRequestButton,
    getProductIsInOrderRequest,
    locale,
  } = useHandlers(getProductDto);

  return (
    <>
      <span>{detail.name}</span>
      {!!detail.oem && (
        <div className="d-flex align-items-center">
          {permissions.addToCart && (
            <Fragment>
              {!!handleProductQuantityChange && (
                <InputNumber
                  value={detail?.quantity}
                  onChange={value =>
                    handleProductQuantityChange(value, detail?.oem)
                  }
                  className={classNames(
                    'no-color show-controls width-small text-center mr-5',
                    {
                      'no-bg': !productIsSelected,
                    },
                  )}
                  style={{
                    maxWidth: 55,
                  }}
                  precision={0}
                  min={1}
                  size="small"
                />
              )}
              <Button
                shape="circle"
                className="no-bg no-border mr-5"
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCartButtonClick(
                    getProductDto(detail.oem, detail.name),
                    detail?.quantity,
                  );
                }}
              >
                <img
                  src={
                    !getProductIsInCart(getProductDto(detail.oem, detail.name))
                      ? productIsSelected
                        ? '/img/icons/cart-white.svg'
                        : '/img/icons/cart-black.svg'
                      : productIsSelected
                      ? '/img/icons/cart-red-filled-stroke.svg'
                      : '/img/icons/cart-red-filled.svg'
                  }
                  alt="cart"
                  title={
                    !getProductIsInCart(getProductDto(detail.oem, detail.name))
                      ? locale.catalog.addToCart
                      : locale.catalog.removeFromCart
                  }
                />
              </Button>
            </Fragment>
          )}
          {permissions.addToFavorites && (
            <Button
              shape="circle"
              className="no-bg no-border"
              style={{
                fontSize: 26,
              }}
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                handleFavoriteButtonClick(
                  getProductDto(detail.oem, detail.name),
                );
              }}
            >
              <img
                src={
                  !getProductIsInFavorites(
                    getProductDto(detail.oem, detail.name),
                  )
                    ? productIsSelected
                      ? '/img/icons/star-white.svg'
                      : '/img/icons/star-black.svg'
                    : productIsSelected
                    ? '/img/icons/star-red-filled-stroke.svg'
                    : '/img/icons/star-red-filled.svg'
                }
                alt="basket"
                className="header__basket svg"
                title={
                  !getProductIsInFavorites(
                    getProductDto(detail.oem, detail.name),
                  )
                    ? 'Добавить в избранные'
                    : 'Удалить из избранных'
                }
              />
            </Button>
          )}
          {permissions.addToOrderRequest && (
            <Button
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                handleOrderRequestButton(
                  getProductDto(detail.oem, detail.name),
                );
              }}
              size="small"
              type={
                !getProductIsInOrderRequest(
                  getProductDto(detail.oem, detail.name),
                )
                  ? 'default'
                  : 'primary'
              }
            >
              {!getProductIsInOrderRequest(
                getProductDto(detail.oem, detail.name),
              )
                ? 'Добавить в запрос'
                : 'Удалить из запроса'}
            </Button>
          )}
        </div>
      )}
    </>
  );
};
