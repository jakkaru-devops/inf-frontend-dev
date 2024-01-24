import CustomOrderPage from 'sections/Orders/pages/CustomOrder.page';
import AppRoute from 'components/routes/AppRoute';

const NewOrderRoute = () => (
  <AppRoute authIsRequired={0}>
    <CustomOrderPage />
  </AppRoute>
);

export default NewOrderRoute;
