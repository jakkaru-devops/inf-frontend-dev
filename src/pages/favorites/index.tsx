import FavoriteProductsPage from 'sections/FavoriteProducts/pages/FavoriteProducts.page';
import AppRoute from 'components/routes/AppRoute';

const FavoriteProductsRoute = () => (
  <AppRoute authIsRequired={1} requiredUserRole="customer">
    <FavoriteProductsPage />
  </AppRoute>
);

export default FavoriteProductsRoute;
