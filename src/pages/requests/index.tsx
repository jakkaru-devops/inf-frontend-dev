import AppRoute from 'components/routes/AppRoute';
import OrderRequestListPage from 'sections/Orders/pages/OrderRequestList.page';

const OrderRequestListRoute = () => (
  <AppRoute
    authIsRequired={1}
    requiredUserRole={['customer', 'seller', 'manager', 'operator']}
  >
    <OrderRequestListPage />
  </AppRoute>
);

export default OrderRequestListRoute;
