import ProductCategoryTypePage from 'sections/Catalog/pages/CategoryType.page';
import { getCustomServerSideProps } from 'utils/routeProps.utils';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import {
  IProductCategory,
  IProductCategoryType,
} from 'sections/Catalog/interfaces/products.interfaces';
import AppRoute from 'components/routes/AppRoute';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { FC } from 'react';

interface IProps {
  categoryType: IProductCategoryType;
  categoryList: IProductCategory[];
}

const ProductCategoryTypeRoute: FC<IProps> = ({
  categoryList,
  categoryType,
}) => {
  return (
    <AppRoute authIsRequired={1} requiredUserRole="moderator">
      <ProductCategoryTypePage
        categoryType={categoryType}
        categoryList={categoryList}
      />
    </AppRoute>
  );
};

export const getServerSideProps = getCustomServerSideProps({
  authIsRequired: 1,
  requiredUserRole: 'moderator',
  callback: async ({ ctx, cookies }) => {
    const categoryTypeRes = await APIRequest<IProductCategoryType>({
      method: 'get',
      url: API_ENDPOINTS.PRODUCT_CATEGORY_TYPE,
      params: {
        id: ctx.params.categoryTypeId,
      },
      serverCookies: cookies,
    });
    const categoryType = categoryTypeRes.data;

    const categoryListRes = await APIRequest<
      IRowsWithCount<IProductCategory[]>
    >({
      method: 'get',
      url: API_ENDPOINTS.PRODUCT_CATEGORY_LIST,
      params: {
        categoryTypeId: ctx.params.categoryTypeId,
      },
      serverCookies: cookies,
    });
    const categoryList = categoryListRes.data.rows;

    return {
      props: {
        categoryType,
        categoryList,
      },
    };
  },
});

export default ProductCategoryTypeRoute;
