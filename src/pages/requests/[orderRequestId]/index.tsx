import OrderRequestPage from 'sections/Orders/pages/OrderRequest.page';
import AppRoute from 'components/routes/AppRoute';

const OrderRequestRoute = () => (
  <AppRoute
    authIsRequired={1}
    requiredUserRole={['customer', 'seller', 'manager', 'operator']}
  >
    <OrderRequestPage />
  </AppRoute>
);

export default OrderRequestRoute;
