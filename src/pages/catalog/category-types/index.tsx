import ProductCategoryTypeListPage from 'sections/Catalog/pages/CategoryTypeList.page';
import { getCustomServerSideProps } from 'utils/routeProps.utils';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import { IProductCategoryType } from 'sections/Catalog/interfaces/products.interfaces';
import AppRoute from 'components/routes/AppRoute';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { FC } from 'react';

interface IProps {
  categoryTypeList: IProductCategoryType[];
}

const ProductCategoryTypeListRoute: FC<IProps> = ({ categoryTypeList }) => {
  return (
    <AppRoute authIsRequired={1} requiredUserRole="moderator">
      <ProductCategoryTypeListPage categoryTypeList={categoryTypeList} />
    </AppRoute>
  );
};

export const getServerSideProps = getCustomServerSideProps({
  authIsRequired: 1,
  requiredUserRole: 'moderator',
  callback: async ({ cookies }) => {
    const categoryTypeListRes = await APIRequest<
      IRowsWithCount<IProductCategoryType[]>
    >({
      method: 'get',
      url: API_ENDPOINTS.PRODUCT_CATEGORY_TYPE_LIST,
      serverCookies: cookies,
    });
    const categoryTypeList = categoryTypeListRes.data.rows;

    return {
      props: {
        categoryTypeList,
      },
    };
  },
});

export default ProductCategoryTypeListRoute;
