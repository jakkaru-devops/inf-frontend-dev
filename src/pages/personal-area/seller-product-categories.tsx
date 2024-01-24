import AppRoute from 'components/routes/AppRoute';
import SellerProductCategoriesPage from 'sections/PersonalArea/pages/SellerProductCategories.page';

const SellerProductCategoriesRoute = () => (
  <AppRoute authIsRequired={1}>
    <SellerProductCategoriesPage />
  </AppRoute>
);

export default SellerProductCategoriesRoute;
