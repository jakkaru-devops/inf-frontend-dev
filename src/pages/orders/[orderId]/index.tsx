import AppRoute from 'components/routes/AppRoute';
import OrderPage from 'sections/Orders/pages/Order.page';

const OrderRoute = () => (
  <AppRoute
    authIsRequired={1}
    requiredUserRole={['customer', 'seller', 'manager', 'operator']}
  >
    <OrderPage />
  </AppRoute>
);

export default OrderRoute;
