import AppRoute from 'components/routes/AppRoute';
import RefundListPage from 'sections/Refunds/RefundList.page';

const OrderListRoute = () => (
  <AppRoute
    authIsRequired={1}
    requiredUserRole={['customer', 'seller', 'manager', 'operator']}
  >
    <RefundListPage />
  </AppRoute>
);

export default OrderListRoute;
