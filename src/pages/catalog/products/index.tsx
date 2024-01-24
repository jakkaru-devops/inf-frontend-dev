import AppRoute from 'components/routes/AppRoute';
import ProductListPage from 'sections/Catalog/pages/ProductList.page';

const ProductListRoute = () => (
  <AppRoute authIsRequired={0}>
    <ProductListPage />
  </AppRoute>
);

export default ProductListRoute;
