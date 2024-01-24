import AppRoute from 'components/routes/AppRoute';
import SaleProductPage from 'sections/Sale/pages/SaleProduct.page';

const SaleProductRoute = () => (
  <AppRoute authIsRequired={1} requiredUserRole={['customer', 'seller']}>
    <SaleProductPage />
  </AppRoute>
);

export default SaleProductRoute;
