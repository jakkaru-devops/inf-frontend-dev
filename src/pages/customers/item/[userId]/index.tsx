import AppRoute from 'components/routes/AppRoute';
import CustomerPage from 'sections/Users/pages/Customer.page';

const CustomerRoute = () => (
  <AppRoute
    authIsRequired={1}
    requiredUserRole={['seller', 'manager', 'operator']}
  >
    <CustomerPage />
  </AppRoute>
);

export default CustomerRoute;
