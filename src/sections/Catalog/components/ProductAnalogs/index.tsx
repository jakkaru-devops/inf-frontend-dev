import { Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { Link, Pagination, Preloader, Table } from 'components/common';
import { IProduct } from 'sections/Catalog/interfaces/products.interfaces';
import { useLocale } from 'hooks/locale.hook';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { ITableCol, ITableRow } from 'components/common/Table/interfaces';
import { useProductHandlers } from 'hooks/productHandlers.hook';
import { generateInnerUrl } from 'utils/common.utils';
import InfiniteScroll from 'react-infinite-scroller';
import { ISetState, IRowsWithCount } from 'interfaces/common.interfaces';
import { APIRequest } from 'utils/api.utils';
import { FC, Fragment, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from 'hooks/auth.hook';

interface IProps {
  productId: IProduct['id'];
  analogProducts: IRowsWithCount<IProduct[]>;
  setAnalogProducts: ISetState<IProps['analogProducts']>;
  useWindowScroll?: boolean;
  pagination: 'scroll' | 'pages';
  editProps?: {
    disabled: boolean;
    addedItems: string[];
    deleteAnalog: (index: number) => void;
  };
}

export const ANALOGS_PAGE_SIZE = 10;

const ProductAnalogs: FC<IProps> = ({
  productId,
  analogProducts,
  setAnalogProducts,
  useWindowScroll = true,
  pagination,
  editProps,
}) => {
  const auth = useAuth();
  const { locale } = useLocale();
  const router = useRouter();
  const {
    isInCart,
    toggleProductIsInCart,
    isInFavorites,
    toggleProductIsInFavorites,
  } = useProductHandlers();
  const [isLoading, setIsLoading] = useState(false);
  const hasMore = analogProducts.count > analogProducts.rows.length;

  useEffect(() => {
    if (pagination !== 'scroll') return;
    if (!!analogProducts.count && !hasMore) return;
    fetchMore(0);
  }, []);

  useEffect(() => {
    if (pagination !== 'pages') return;
    const fetchData = async () => {
      setIsLoading(true);
      const res = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.PRODUCT_ANALOGS(productId),
        params: {
          pageSize: ANALOGS_PAGE_SIZE,
          page: router?.query?.analogsPage || 1,
        },
      });
      setIsLoading(false);
      if (!res.isSucceed) return;
      const resData: IRowsWithCount<IProduct[]> = res.data;
      setAnalogProducts({
        count: resData.count,
        rows: resData.rows,
      });
    };
    fetchData();
  }, [router?.query?.analogsPage]);

  const fetchMore = async (page: number) => {
    const res = await APIRequest({
      method: 'get',
      url: API_ENDPOINTS.PRODUCT_ANALOGS(productId),
      params: {
        pageSize: ANALOGS_PAGE_SIZE,
        page: page + 1,
      },
    });
    if (!res.isSucceed) return;
    const resData: IRowsWithCount<IProduct[]> = res.data;
    console.log(resData);
    setAnalogProducts(prev => ({
      count: !prev?.count
        ? resData.count + (editProps?.addedItems?.length || 0)
        : prev?.count,
      rows: [...prev.rows, ...resData.rows],
    }));
  };

  let cols: ITableCol[] = [];
  let rows: ITableRow[] = [];

  if (!editProps) {
    cols = [
      { content: null, width: '10%' },
      { content: 'Производитель', width: '15%' },
      { content: locale.catalog.productArticle, width: '25%' },
      {
        content: locale.catalog.productName,
        width: '40%',
      },
      { content: null, width: '10%' },
    ];
    rows = analogProducts.rows.map(analogProduct => ({
      cols: [
        {
          content: (
            <>
              {!!analogProduct.preview ? (
                <img
                  src={analogProduct.preview}
                  style={{ height: 45 }}
                  alt={analogProduct.name}
                />
              ) : (
                <div className="d-flex justify-content-center align-items-center">
                  Без фото
                </div>
              )}
            </>
          ),
        },
        { content: analogProduct?.manufacturer || '-' },
        { content: analogProduct?.article },
        {
          content: (
            <div>
              <Link
                href={generateInnerUrl(APP_PATHS.PRODUCT(analogProduct.id), {
                  text: analogProduct.name,
                })}
                className="color-black"
              >
                {analogProduct.name}
              </Link>
            </div>
          ),
        },
        {
          content: (
            <div className="d-flex align-items-center">
              <Button
                onClick={() =>
                  toggleProductIsInCart({ product: analogProduct }, null)
                }
                shape="circle"
                className="no-bg no-border"
              >
                <img
                  src={
                    !isInCart(analogProduct, null)
                      ? '/img/icons/cart-black.svg'
                      : '/img/icons/cart-red-filled.svg'
                  }
                  alt="basket"
                  className="header__basket svg"
                  title={
                    !isInCart(analogProduct, null)
                      ? locale.catalog.addToCart
                      : locale.catalog.removeFromCart
                  }
                />
              </Button>
              {auth.isAuthenticated &&
                auth?.currentRole?.label === 'customer' && (
                  <Button
                    onClick={() =>
                      toggleProductIsInFavorites(analogProduct, null)
                    }
                    shape="circle"
                    className="no-bg no-border ml-5"
                    style={{
                      fontSize: 26,
                    }}
                  >
                    <img
                      src={
                        !isInFavorites(analogProduct, null)
                          ? '/img/icons/star-black.svg'
                          : '/img/icons/star-red-filled.svg'
                      }
                      alt="basket"
                      className="header__basket svg"
                      title={
                        !isInFavorites(analogProduct, null)
                          ? 'Добавить в избранные'
                          : 'Удалить из избранных'
                      }
                    />
                  </Button>
                )}
            </div>
          ),
        },
      ],
    }));
  } else {
    const { disabled, deleteAnalog } = editProps;
    cols = [
      { content: null, width: '10%' },
      { content: 'Производитель', width: '15%' },
      { content: locale.catalog.productArticle, width: '25%' },
      {
        content: locale.catalog.productName,
        width: '50%',
      },
    ];
    rows = analogProducts.rows.map((analogProduct, i) => ({
      cols: [
        {
          content: (
            <div style={{ position: 'relative' }}>
              {!!analogProduct.preview ? (
                <img
                  src={analogProduct.preview}
                  style={{ height: 45 }}
                  alt={analogProduct.name}
                />
              ) : (
                <div className="d-flex justify-content-center align-items-center">
                  Без фото
                </div>
              )}
              {!disabled && (
                <span
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '100%',
                    marginRight: 10,
                    transform: 'translateY(-50%)',
                    cursor: 'pointer',
                    color: '#aaa',
                  }}
                  onClick={() => deleteAnalog(i)}
                >
                  <CloseOutlined />
                </span>
              )}
            </div>
          ),
        },
        { content: analogProduct?.manufacturer || '-' },
        { content: analogProduct?.article },
        {
          content: (
            <div>
              <Link
                href={generateInnerUrl(APP_PATHS.PRODUCT(analogProduct?.id), {
                  text: analogProduct?.name,
                })}
                target="_blank"
                className="color-black"
              >
                {analogProduct.name}
              </Link>
            </div>
          ),
        },
      ],
    }));
  }

  return (
    <Fragment>
      {pagination === 'scroll' && (
        <InfiniteScroll
          pageStart={0}
          loadMore={fetchMore}
          hasMore={analogProducts.count > analogProducts.rows.length}
          loader={
            <div key={0} className="mt-10">
              <Preloader />
            </div>
          }
          threshold={500}
          useWindow={useWindowScroll}
        >
          <Table cols={cols} rows={rows} />
        </InfiniteScroll>
      )}
      {pagination === 'pages' && (
        <div>
          <Table cols={cols} rows={!isLoading ? rows : []} className="mb-10" />
          {isLoading && (
            <div className="mb-10">
              <Preloader />
            </div>
          )}
          <Pagination
            total={analogProducts.count}
            pageSize={ANALOGS_PAGE_SIZE}
            pagePropName="analogsPage"
            wrapClassName="mt-10"
            wrapStyle={{ justifyContent: 'left' }}
          />
        </div>
      )}
    </Fragment>
  );
};

export default ProductAnalogs;
