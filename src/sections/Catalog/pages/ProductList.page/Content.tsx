import {
  BreadCrumbs,
  Container,
  Page,
  PageContent,
  Pagination,
  Preloader,
} from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import FiltersLeft from './FiltersLeft';
import FiltersTop from './FiltersTop';
import ProductList from './ProductList';
import { useContext } from 'react';
import {
  CATALOG_FILTERS,
  getCatalogFilterLinkParams,
  IFilterGroup,
  ProductListContext,
} from './context';
import { useRouter } from 'next/router';
import { generateInnerUrl, generateUrl } from 'utils/common.utils';

const ProductListPageContent = () => {
  const { products, filterGroups, isLoading } = useContext(ProductListContext);
  const router = useRouter();

  return (
    <Page>
      <BreadCrumbs
        list={[
          {
            link: generateInnerUrl(APP_PATHS.CATALOG, {
              removeCurrentParams: true,
            }),
            text: 'Запчасти',
          },
          ...Object.values(CATALOG_FILTERS)
            .filter(
              group =>
                !!router?.query?.[group.label] &&
                !!filterGroups?.[group.label] &&
                !!(filterGroups?.[group.label] as IFilterGroup).list.find(
                  el => el.label === router?.query?.[group.label],
                ),
            )
            .map(group => ({
              link: generateUrl(
                {
                  ...getCatalogFilterLinkParams(group.label, router),
                },
                { pathname: APP_PATHS.PRODUCT_LIST },
              ),
              text: (filterGroups?.[group.label] as IFilterGroup).list.find(
                el => el.label === router?.query?.[group.label],
              )?.name,
            })),
          router.query?.search && {
            link: generateUrl({}, { pathname: APP_PATHS.PRODUCT_LIST }),
            text: router.query?.search as string,
          },
        ].filter(Boolean)}
        showPersonalAreaLink={false}
        useHistory={false}
        size="small"
      />
      <FiltersTop showExternalCatalog />
      <PageContent
        className="catalog"
        containerProps={{ size: 'fluid', style: { paddingBottom: 10 } }}
      >
        <Container size="middle" className="catalog__content">
          <FiltersLeft />
          {isLoading ? (
            <div className="mt-70 w-100">
              <Preloader />
            </div>
          ) : (
            <ProductList />
          )}
        </Container>
        <Container className="mt-20 d-flex justify-content-start">
          <Pagination
            total={products.count}
            pageSize={
              router.query.pageSize ? Number(router.query.pageSize) : 36
            }
            showSizeChanger={false}
          />
        </Container>
      </PageContent>
    </Page>
  );
};

export default ProductListPageContent;
