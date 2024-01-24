import { APP_PATHS } from 'data/paths.data';
import { useLocale } from 'hooks/locale.hook';
import { useContext, useState } from 'react';
import { isUserRequestsBanned } from 'sections/Users/utils';
import { ProductListContext } from 'sections/Catalog/pages/ProductList.page/context';
import { useRouter } from 'next/router';
import { useAuth } from 'hooks/auth.hook';
import {
  BreadCrumbs,
  EmptyListMark,
  Page,
  PageContent,
} from 'components/common';
import SaleProductsFilters from 'sections/Sale/components/SaleProductsFilters';
import FiltersLeft from 'sections/Catalog/pages/ProductList.page/FiltersLeft';
import { RequestsBannedAlert } from 'sections/PersonalArea/components/RequestsBannedAlert';
import SaleProductListLayoutTile from 'sections/Sale/components/SaleProductListLayoutTile';
import SaleProductListLayoutRow from 'sections/Sale/components/SaleProductListLayoutRow';
import SaleProductListWrapper from './ProductListWrapper';

const SaleProductListPageContentCustomer = () => {
  const router = useRouter();
  const auth = useAuth();
  const { locale } = useLocale();
  const { products } = useContext(ProductListContext);
  const [savedRegions, setSavedRegions] = useState<string[]>(
    [].concat(router.query?.region).filter(Boolean),
  );
  const viewTile = router.query?.layout === 'tile';

  return (
    <Page>
      <BreadCrumbs
        list={[
          {
            link: APP_PATHS.SALE_PRODUCT_LIST,
            text: locale.common.productSale,
          },
        ]}
      />
      <SaleProductsFilters
        savedRegions={savedRegions}
        setSavedRegions={setSavedRegions}
      />
      <PageContent>
        <div className="catalog__content">
          <FiltersLeft mode="sale" className="product-sale__sidebar" />
          <SaleProductListWrapper products={products}>
            {viewTile ? (
              <SaleProductListLayoutTile products={products} />
            ) : (
              <SaleProductListLayoutRow products={products} />
            )}
          </SaleProductListWrapper>
          {isUserRequestsBanned(auth.user, auth.currentRole.id) && (
            <RequestsBannedAlert />
          )}
        </div>
      </PageContent>
    </Page>
  );
};

export default SaleProductListPageContentCustomer;
