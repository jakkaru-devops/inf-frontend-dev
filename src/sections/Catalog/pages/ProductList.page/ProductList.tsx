import { useRouter } from 'next/router';
import classNames from 'classnames';
import ProductItem from 'sections/Catalog/components/ProductItem';
import { ICatalogRouter } from 'sections/Catalog/interfaces/catalog.interfaces';
import { useContext } from 'react';
import { IFilterGroup, ProductListContext } from './context';
import { generateUrl } from 'utils/common.utils';
import { APP_PATHS } from 'data/paths.data';

const ProductList = () => {
  const router = useRouter() as ICatalogRouter;
  const { products, filterGroups } = useContext(ProductListContext);

  return (
    <ul
      className={classNames('catalog__products null', {
        'layout-row': router.query.layout === 'row',
      })}
    >
      {products.rows.map(product => {
        return (
          <ProductItem
            key={product.id}
            product={product}
            href={generateUrl(
              {
                history: []
                  .concat(router.query?.history || [])
                  .concat(
                    router.query?.search &&
                      JSON.stringify([
                        generateUrl(
                          {},
                          {
                            pathname: APP_PATHS.PRODUCT_LIST,
                            removeCurrentParams: true,
                          },
                        ),
                        router.query?.search,
                      ]),
                  )
                  .concat(
                    Object.values(filterGroups)
                      .filter(
                        group =>
                          !!router?.query?.[group.label] &&
                          !!group.list.find(
                            el => el.label === router?.query?.[group.label],
                          ),
                      )
                      .map(group =>
                        JSON.stringify([
                          generateUrl(
                            {},
                            {
                              pathname: APP_PATHS.PRODUCT_LIST,
                              removeCurrentParams: true,
                            },
                          ),
                          (
                            filterGroups?.[group.label] as IFilterGroup
                          ).list.find(
                            el => el.label === router?.query?.[group.label],
                          )?.name,
                        ]),
                      ),
                  )
                  .concat(
                    JSON.stringify([
                      APP_PATHS.PRODUCT(product.id),
                      product.name,
                    ]),
                  )
                  .filter(Boolean),
              },
              { pathname: APP_PATHS.PRODUCT(product.id) },
            )}
            layout={router.query.layout}
            queries={router?.query}
          />
        );
      })}
      {!products?.count && (
        <h3 className="text-center mt-15 w-100">Товары не найдены</h3>
      )}
    </ul>
  );
};

export default ProductList;
