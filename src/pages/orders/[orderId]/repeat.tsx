import AppRoute from 'components/routes/AppRoute';
import OrderRepeatPage from 'sections/Orders/pages/OrderRepeat.page';

const OrderRepeatRoute = () => (
  <AppRoute authIsRequired={1} requiredUserRole="customer">
    <OrderRepeatPage />
  </AppRoute>
);

export default OrderRepeatRoute;
