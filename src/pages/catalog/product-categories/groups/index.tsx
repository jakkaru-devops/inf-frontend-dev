import AppRoute from 'components/routes/AppRoute';
import ProductGroupListPage from 'sections/Catalog/pages/ProductGroupList.page';

const ProductGroupListRoute = () => (
  <AppRoute authIsRequired={1} requiredUserRole="moderator">
    <ProductGroupListPage />
  </AppRoute>
);

export default ProductGroupListRoute;
