import CustomerListPage from 'sections/Users/pages/CustomerList.page';
import AppRoute from 'components/routes/AppRoute';

const CustomerListRoute = () => (
  <AppRoute authIsRequired={1} requiredUserRole={['manager', 'operator']}>
    <CustomerListPage />
  </AppRoute>
);

export default CustomerListRoute;
