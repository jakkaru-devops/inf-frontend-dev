import AppRoute from 'components/routes/AppRoute';
import SaleProductListPage from 'sections/Sale/pages/SaleProductList.page';

const SaleProductListRoute = () => (
  <AppRoute authIsRequired={1} requiredUserRole={['customer', 'seller']}>
    <SaleProductListPage />
  </AppRoute>
);

export default SaleProductListRoute;
