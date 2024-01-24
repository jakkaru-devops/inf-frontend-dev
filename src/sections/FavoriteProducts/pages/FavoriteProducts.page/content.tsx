import { Button } from 'antd';
import {
  BreadCrumbs,
  Table,
  Page,
  PageContent,
  PageTop,
  Link,
  EmptyListMark,
} from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import { ITableCol, ITableRow } from 'components/common/Table/interfaces';
import { IFavoriteProduct } from 'sections/Catalog/interfaces/products.interfaces';
import useHandlers from './handlers';
import { IRowsWithCount, ISetState } from 'interfaces/common.interfaces';
import { generateInnerUrl } from 'utils/common.utils';
import { FC, Fragment } from 'react';
import { useLocale } from 'hooks/locale.hook';

interface IProps {
  favoriteProducts: IRowsWithCount<IFavoriteProduct[]>;
  setFavoriteProducts: ISetState<IRowsWithCount<IFavoriteProduct[]>>;
}

const FavoriteProductsPageContent: FC<IProps> = ({
  favoriteProducts,
  setFavoriteProducts,
}) => {
  const { locale } = useLocale();
  const {
    isInCart,
    isInFavorites,
    handleCartButtonClick,
    deleteFavoriteProduct,
  } = useHandlers({
    favoriteProducts,
    setFavoriteProducts,
  });

  return (
    <Page>
      <BreadCrumbs list={[{ link: APP_PATHS.FAVORITES, text: 'Избранное' }]} />
      <PageTop title="Избранное" />
      <PageContent>
        {!!favoriteProducts.rows.length ? (
          <Table
            cols={[
              { content: '', width: '10%' },
              {
                content: locale.catalog.productName,
                width: '35%',
              },
              {
                content: locale.catalog.productArticle,
                width: '20%',
              },
              {
                content: 'Поставщик',
                width: '20%',
              },
              { content: '', width: '10%' },
              { content: '', width: '5%' },
            ]}
            rows={favoriteProducts.rows.map(favoriteProduct => ({
              cols: [
                {
                  content: (
                    <Fragment>
                      {!!favoriteProduct.product.preview ? (
                        <img
                          src={favoriteProduct.product.preview}
                          style={{ height: 45 }}
                          alt=""
                        />
                      ) : (
                        <div className="d-flex justify-content-center align-items-center">
                          Без фото
                        </div>
                      )}
                    </Fragment>
                  ),
                },
                {
                  content: (
                    <div>
                      <Link
                        href={generateInnerUrl(
                          APP_PATHS.PRODUCT(favoriteProduct.product.id),
                          {
                            text: favoriteProduct.product.name,
                          },
                        )}
                        className="color-black"
                      >
                        {favoriteProduct.product.name}
                      </Link>
                    </div>
                  ),
                },
                { content: favoriteProduct.product.article },
                { content: favoriteProduct?.organization?.name || '-' },
                {
                  content: (
                    <Button
                      onClick={() =>
                        handleCartButtonClick({
                          product: favoriteProduct.product,
                          priceOfferId: favoriteProduct.priceOfferId,
                        })
                      }
                      shape="circle"
                      className="no-bg no-border"
                    >
                      <img
                        src={
                          !isInCart(favoriteProduct.product, {
                            priceOfferId: favoriteProduct.priceOfferId,
                          })
                            ? '/img/icons/cart-red.svg'
                            : '/img/icons/cart-red-filled.svg'
                        }
                        alt="basket"
                        className="header__basket svg"
                        title={
                          !isInCart(favoriteProduct.product, {
                            priceOfferId: favoriteProduct.priceOfferId,
                          })
                            ? locale.catalog.addToCart
                            : locale.catalog.removeFromCart
                        }
                      />
                    </Button>
                  ),
                },
                {
                  content: (
                    <button
                      className="tableInf__delete"
                      onClick={() =>
                        deleteFavoriteProduct({
                          product: favoriteProduct.product,
                          priceOfferId: favoriteProduct.priceOfferId,
                        })
                      }
                      title={locale.catalog.removeFromFavorites}
                    >
                      <img
                        src="/img/close.svg"
                        alt=""
                        className="svg tableInf__delteIcon"
                      />
                    </button>
                  ),
                },
              ],
            }))}
          />
        ) : (
          <EmptyListMark className="mt-5">
            {locale.common.noFavorites}
          </EmptyListMark>
        )}
      </PageContent>
    </Page>
  );
};

export default FavoriteProductsPageContent;
