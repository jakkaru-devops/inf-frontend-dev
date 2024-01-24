import { BreadCrumbs, Page, PageTop } from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import { useLocale } from 'hooks/locale.hook';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { FC } from 'react';
import ProductCard from 'sections/Catalog/components/ProductCard';
import { IAutoType } from 'sections/Catalog/interfaces/categories.interfaces';
import {
  IProduct,
  IProductBranch,
  ISupplier,
} from 'sections/Catalog/interfaces/products.interfaces';
import { generateUrl } from 'utils/common.utils';

interface IProps {
  data: any;
  productData: {
    product: IProduct;
    branches: IProductBranch[];
    autoTypes: IRowsWithCount<IAutoType[]>;
    suppliersList: ISupplier[];
  };
}

const CatalogExternalProductPageContent: FC<IProps> = ({
  data,
  productData,
}) => {
  const { locale } = useLocale();
  const { product } = productData;

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
            link: generateUrl(
              {},
              {
                pathname: !!data?.modification
                  ? APP_PATHS.ACAT_MODIFICATIONS_PARTS_LIST(
                      data?.type?.id,
                      data?.mark?.id,
                      data?.model?.id,
                      data?.modification?.id,
                      String(data.group?.parentId) +
                        '--' +
                        String(data.group?.id),
                    )
                  : APP_PATHS.ACAT_PARTS_LIST(
                      data?.type?.id,
                      data?.mark?.id,
                      data?.model?.id,
                      String(data.group?.parentId) +
                        '--' +
                        String(data.group?.id),
                    ),
              },
            ),
            text: data?.group?.parent_full_name || data?.group?.name,
          },
          {
            link: window.location.href,
            text: product.name,
          },
        ].filter(Boolean)}
        showPersonalAreaLink={false}
        useHistory={false}
      />
      <PageTop title={product?.name} />
      <ProductCard {...productData} />
    </Page>
  );
};

export default CatalogExternalProductPageContent;
