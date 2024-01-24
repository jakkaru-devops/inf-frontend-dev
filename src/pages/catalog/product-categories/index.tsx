import AppRoute from 'components/routes/AppRoute';
import AllProductCategoriesPage from 'sections/Catalog/pages/AllProductCategories.page';

const AllProductCategoriesRoute = () => (
  <AppRoute authIsRequired={1} requiredUserRole="moderator">
    <AllProductCategoriesPage />
  </AppRoute>
);

export default AllProductCategoriesRoute;
