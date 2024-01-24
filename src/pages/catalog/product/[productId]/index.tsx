import ProductPage from 'sections/Catalog/pages/Product.page';
import AppRoute from 'components/routes/AppRoute';

const ProductRoute = () => (
  <AppRoute authIsRequired={0}>
    <ProductPage />
  </AppRoute>
);

export default ProductRoute;
