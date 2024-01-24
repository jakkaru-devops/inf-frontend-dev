import AppRoute from 'components/routes/AppRoute';
import OffersPage from 'sections/Offers/page/Offers.page';

const OrderRequestRoute = () => (
  <AppRoute
    authIsRequired={1}
    requiredUserRole={['customer', 'manager', 'operator']}
  >
    <OffersPage />
  </AppRoute>
);

export default OrderRequestRoute;
