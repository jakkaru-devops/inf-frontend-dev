import { BreadCrumbs, Page, PageContent, PageTop } from 'components/common';
import {
  IProduct,
  IProductBranch,
  ISupplier,
} from 'sections/Catalog/interfaces/products.interfaces';
import { APP_PATHS } from 'data/paths.data';
import { useRouter } from 'next/router';
import { useLocale } from 'hooks/locale.hook';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { IAutoType } from 'sections/Catalog/interfaces/categories.interfaces';
import { FC } from 'react';
import ProductCard from 'sections/Catalog/components/ProductCard';
import { IOrderProductSelectingRouter } from 'components/complex/OrderProductSelecting/interfaces';

interface IProps {
  product: IProduct;
  branches: IProductBranch[];
  autoTypes: IRowsWithCount<IAutoType[]>;
  suppliersList: ISupplier[];
}

type ITablLabel =
  | 'prices'
  | 'recommendedProducts'
  | 'analogs'
  | 'applicabilities';

interface INextRouterExtended extends IOrderProductSelectingRouter {
  query: {
    productId: string;
    orderId?: string;
    orderRequestId?: string;
    tab?: ITablLabel;
    isSale?: string;
    history?: string[];
  };
}

const ProductPageContent: FC<IProps> = ({
  product,
  branches,
  autoTypes,
  suppliersList,
}) => {
  const router = useRouter() as INextRouterExtended;
  const { locale } = useLocale();

  if (!product) {
    return (
      <Page>
        <BreadCrumbs
          list={[
            {
              link: APP_PATHS.CATALOG,
              text: locale.catalog.catalog,
            },
            {
              link: APP_PATHS.PRODUCT(router.query.productId as string),
              text: 'Товар не найден',
            },
          ]}
          showPersonalAreaLink={false}
        />
        <PageContent>
          <PageTop title="Товар не найден" style={{ paddingBottom: 0 }} />
        </PageContent>
      </Page>
    );
  }

  const urlOrderSuffix = router.query.orderRequestId
    ? `?orderRequestId=${router.query.orderRequestId}`
    : '';

  return (
    <Page>
      <BreadCrumbs
        list={[
          {
            link: APP_PATHS.CATALOG + urlOrderSuffix,
            text: locale.catalog.catalog,
          },
          {
            link: APP_PATHS.PRODUCT(router.query.productId) + urlOrderSuffix,
            text: product.name,
          },
        ]}
        showPersonalAreaLink={false}
        autoTypes={autoTypes}
      />
      <PageTop title={product.name} style={{ paddingBottom: 0 }} />
      <ProductCard
        product={product}
        branches={branches}
        autoTypes={autoTypes}
        suppliersList={suppliersList}
      />
    </Page>
  );
};

export default ProductPageContent;
