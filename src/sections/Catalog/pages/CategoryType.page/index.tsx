import { Button } from 'antd';
import _orderBy from 'lodash/orderBy';
import {
  BreadCrumbs,
  Page,
  PageContent,
  PageTop,
  Table,
  Link,
} from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import {
  IProductCategory,
  IProductCategoryType,
} from 'sections/Catalog/interfaces/products.interfaces';
import { useLocale } from 'hooks/locale.hook';
import { FC } from 'react';

interface IProps {
  categoryType: IProductCategoryType;
  categoryList: IProductCategory[];
}

const ProductCategoryTypePage: FC<IProps> = ({
  categoryType,
  categoryList,
}) => {
  const { locale } = useLocale();

  return (
    <Page>
      <BreadCrumbs
        list={[
          {
            link: APP_PATHS.ALL_PRODUCT_CATEGORIES,
            text: locale.catalog.productCategories,
          },
          {
            link: APP_PATHS.PRODUCT_CATEGORY_TYPE(categoryType.id),
            text: categoryType.name,
          },
        ]}
      />
      <PageTop
        title={categoryType.name}
        colRight={
          <>
            <Link href={APP_PATHS.ADD_PRODUCT_CATEGORY(categoryType.id)}>
              <Button type="primary">Добавить категорию</Button>
            </Link>
          </>
        }
      />
      <PageContent>
        <Table
          cols={[
            { content: '№', width: '20%' },
            { content: locale.common.name, width: '50%' },
            { content: null, width: '30%' },
          ]}
          rows={categoryList.map(cat => ({
            cols: [
              {
                content: cat.idInt,
                href: APP_PATHS.PRODUCT_CATEGORY(categoryType.id, cat.id),
              },
              {
                content: cat.name,
                href: APP_PATHS.PRODUCT_CATEGORY(categoryType.id, cat.id),
              },
              {
                content: (
                  <>
                    <Link
                      href={APP_PATHS.PRODUCT_CATEGORY(categoryType.id, cat.id)}
                    >
                      <Button type="primary">
                        {locale.common.startEditing}
                      </Button>
                    </Link>
                  </>
                ),
              },
            ],
          }))}
        />
      </PageContent>
    </Page>
  );
};

export default ProductCategoryTypePage;
