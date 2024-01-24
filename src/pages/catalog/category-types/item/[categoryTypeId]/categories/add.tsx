import { API_ENDPOINTS } from 'data/paths.data';
import { APIRequest } from 'utils/api.utils';
import { getCustomServerSideProps } from 'utils/routeProps.utils';
import AddProductCategoryPage from 'sections/Catalog/pages/AddCategory.page';
import { IProductCategoryType } from 'sections/Catalog/interfaces/products.interfaces';
import AppRoute from 'components/routes/AppRoute';
import { FC } from 'react';

interface IProps {
  categoryType: IProductCategoryType;
}

const AddProductCategoryRoute: FC<IProps> = ({ categoryType }) => {
  return (
    <AppRoute authIsRequired={1} requiredUserRole="moderator">
      <AddProductCategoryPage categoryType={categoryType} />
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

    return {
      props: {
        categoryType,
      },
    };
  },
});

export default AddProductCategoryRoute;
