import AppRoute from 'components/routes/AppRoute';
import ProductGroupPage from 'sections/Catalog/pages/ProductGroup.page';

const ProductGroupRoute = () => (
  <AppRoute authIsRequired={1} requiredUserRole="moderator">
    <ProductGroupPage />
  </AppRoute>
);

export default ProductGroupRoute;
