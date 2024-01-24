import {
  BreadCrumbs,
  Page,
  PageContent,
  PageTop,
  Table,
} from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import { IProductCategoryType } from 'sections/Catalog/interfaces/products.interfaces';
import { useLocale } from 'hooks/locale.hook';
import { FC } from 'react';

interface IProps {
  categoryTypeList: IProductCategoryType[];
}

const ProductCategoryTypeListPage: FC<IProps> = ({ categoryTypeList }) => {
  const { locale } = useLocale();

  return (
    <Page className="category-type-list">
      <BreadCrumbs
        list={[
          {
            link: APP_PATHS.ALL_PRODUCT_CATEGORIES,
            text: locale.catalog.productCategories,
          },
        ]}
      />
      <PageTop title={locale.pages.category.title} />
      <PageContent>
        <Table
          cols={[
            { content: '№', width: '15%' },
            { content: locale.common.name, width: '85%' },
          ]}
          rows={categoryTypeList.map(catType => ({
            cols: [
              {
                content: catType.idInt,
                href: APP_PATHS.PRODUCT_CATEGORY_TYPE(catType.id),
              },
              {
                content: catType.name,
                href: APP_PATHS.PRODUCT_CATEGORY_TYPE(catType.id),
              },
            ],
          }))}
        />
      </PageContent>
    </Page>
  );
};

export default ProductCategoryTypeListPage;
