import ComplaintListPage from 'sections/Users/pages/ComplaintList.page';
import AppRoute from 'components/routes/AppRoute';

const SellerListRoute = () => (
  <AppRoute authIsRequired={1} requiredUserRole={['manager', 'operator']}>
    <ComplaintListPage />
  </AppRoute>
);

export default SellerListRoute;
