import OrganizationSellerApplicationPage from 'sections/Organizations/pages/OrganizationSellerApplication.page';
import AppRoute from 'components/routes/AppRoute';

const OrganizationSellerApplicationRoute = () => (
  <AppRoute authIsRequired={1} requiredUserRole={['manager', 'operator']}>
    <OrganizationSellerApplicationPage />
  </AppRoute>
);

export default OrganizationSellerApplicationRoute;
