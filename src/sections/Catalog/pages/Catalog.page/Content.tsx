import { BreadCrumbs, Page, PageContent, PageTop } from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import { useLocale } from 'hooks/locale.hook';
import { useRouter } from 'next/router';
import { FC } from 'react';
import CategoriesSelection from 'sections/Catalog/components/CategoriesSelection';
import { IProductCategoriesBasic } from 'sections/Catalog/interfaces/categories.interfaces';
import { generateUrl } from 'utils/common.utils';

interface IProps {
  categories: IProductCategoriesBasic;
}

const CatalogPageContent: FC<IProps> = ({ categories }) => {
  const { locale } = useLocale();
  const router = useRouter();

  return (
    <Page className="catalog-filters__page">
      <BreadCrumbs
        list={[{ link: APP_PATHS.CATALOG, text: locale.catalog.catalog }]}
        showPersonalAreaLink={false}
      />
      <PageTop title={locale.catalog.catalog} />
      <PageContent style={{ marginTop: 30 }}>
        <CategoriesSelection
          initialData={categories}
          defaultValues={{
            autoTypeId: router.query?.autoType as string,
          }}
          generateAutoTypeHref={autoTypeId =>
            generateUrl({ search: null, autoType: autoTypeId })
          }
          generateAutoBrandHref={(autoBrandId, selectedAutoTypeId) =>
            generateUrl(
              {
                search: null,
                autoType: selectedAutoTypeId,
                autoBrand: autoBrandId,
              },
              { pathname: APP_PATHS.PRODUCT_LIST },
            )
          }
          generateGroupHref={groupId =>
            generateUrl(
              {
                search: null,
                autoType: null,
                autoBrand: null,
                autoModel: null,
                group: groupId,
                subgroup: null,
              },
              {
                pathname: APP_PATHS.PRODUCT_LIST,
              },
            )
          }
        />
      </PageContent>
    </Page>
  );
};

export default CatalogPageContent;
