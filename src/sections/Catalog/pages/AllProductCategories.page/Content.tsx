import {
  BreadCrumbs,
  Page,
  PageContent,
  PageTop,
  Table,
} from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import { generateInnerUrl } from 'utils/common.utils';

const AllProductCategoriesPageContent = () => {
  return (
    <Page>
      <BreadCrumbs
        list={[
          { link: APP_PATHS.ALL_PRODUCT_CATEGORIES, text: 'Категории товаров' },
        ]}
      />
      <PageTop title="Категории товаров" />
      <PageContent>
        <Table
          cols={[
            {
              content: null,
              width: '100%',
            },
          ]}
          rows={[
            {
              cols: [
                {
                  content: 'Виды',
                  href: generateInnerUrl(APP_PATHS.AUTO_TYPE_LIST, {
                    text: 'Виды',
                  }),
                },
              ],
            },
            {
              cols: [
                {
                  content: 'Марки',
                  href: generateInnerUrl(APP_PATHS.AUTO_BRAND_LIST, {
                    text: 'Марки',
                  }),
                },
              ],
            },
            // {
            //   cols: [
            //     {
            //       content: 'Модели',
            //       href: generateInnerUrl(APP_PATHS.AUTO_MODEL_LIST, {
            //         text: 'Модели',
            //       }),
            //     },
            //   ],
            // },
            {
              cols: [
                {
                  content: 'Категории',
                  href: generateInnerUrl(APP_PATHS.PRODUCT_GROUP_LIST, {
                    text: 'Категории',
                  }),
                },
              ],
            },
            // {
            //   cols: [
            //     {
            //       content: 'Подкатегории',
            //       href: generateInnerUrl(APP_PATHS.PRODUCT_SUBGROUP_LIST, {
            //         text: 'Подкатегории',
            //       }),
            //     },
            //   ],
            // },
          ]}
          hideHead
        />
      </PageContent>
    </Page>
  );
};

export default AllProductCategoriesPageContent;
