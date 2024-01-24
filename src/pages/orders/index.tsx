import AppRoute from 'components/routes/AppRoute';
import OrderListPage from 'sections/Orders/pages/OrderList.page';

const OrderListRoute = () => (
  <AppRoute
    authIsRequired={1}
    requiredUserRole={['customer', 'seller', 'manager', 'operator']}
  >
    <OrderListPage isHistory={false} />
  </AppRoute>
);

export default OrderListRoute;
