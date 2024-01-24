import SellerListPage from 'sections/Users/pages/SellerList.page';
import AppRoute from 'components/routes/AppRoute';

const SellerListRoute = () => (
  <AppRoute authIsRequired={1} requiredUserRole={['manager', 'operator']}>
    <SellerListPage />
  </AppRoute>
);

export default SellerListRoute;
