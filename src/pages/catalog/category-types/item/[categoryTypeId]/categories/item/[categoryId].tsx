import ProductCategoryPage from 'sections/Catalog/pages/Category.page';
import { getCustomServerSideProps } from 'utils/routeProps.utils';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import {
  IProductCategory,
  IProductCategoryType,
} from 'sections/Catalog/interfaces/products.interfaces';
import AppRoute from 'components/routes/AppRoute';
import { FC } from 'react';

interface IProps {
  categoryType: IProductCategoryType;
  categoryTypeList: IProductCategoryType[];
  category: IProductCategory;
}

const ProductCategoryTypeRoute: FC<IProps> = ({
  categoryType,
  categoryTypeList,
  category,
}) => {
  return (
    <AppRoute authIsRequired={1} requiredUserRole="moderator">
      <ProductCategoryPage
        categoryType={categoryType}
        categoryTypeList={categoryTypeList}
        category={category}
      />
    </AppRoute>
  );
};

export const getServerSideProps = getCustomServerSideProps({
  authIsRequired: 1,
  requiredUserRole: 'moderator',
  callback: async ({ ctx, cookies }) => {
    const categoryTypeRes = await APIRequest({
      method: 'get',
      url: API_ENDPOINTS.PRODUCT_CATEGORY_TYPE,
      params: {
        id: ctx.params.categoryTypeId,
      },
      serverCookies: cookies,
    });
    const categoryType: IProductCategoryType = categoryTypeRes.data;

    const categoryTypeListRes = await APIRequest({
      method: 'get',
      url: API_ENDPOINTS.PRODUCT_CATEGORY_TYPE_LIST,
      params: {
        nestingLevel: [
          categoryType?.nestingLevel - 1,
          categoryType?.nestingLevel + 1,
        ],
        include: ['categories'],
      },
      serverCookies: cookies,
    });
    const categoryTypeList: IProductCategoryType[] =
      categoryTypeListRes.data.rows;

    const categoryRes = await APIRequest({
      method: 'get',
      url: API_ENDPOINTS.PRODUCT_CATEGORY,
      params: {
        id: ctx.params.categoryId,
      },
      serverCookies: cookies,
    });
    const category: IProductCategory = categoryRes.data;

    return {
      props: {
        categoryType,
        categoryTypeList,
        category,
      },
    };
  },
});

export default ProductCategoryTypeRoute;
