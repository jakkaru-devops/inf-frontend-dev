import SellerPage from 'sections/Users/pages/Seller.page';
import AppRoute from 'components/routes/AppRoute';

const SellerRoute = () => (
  <AppRoute
    authIsRequired={1}
    requiredUserRole={['customer', 'manager', 'operator']}
  >
    <SellerPage />
  </AppRoute>
);

export default SellerRoute;
