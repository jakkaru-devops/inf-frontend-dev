import OrganizationPage from 'sections/Organizations/pages/Organization.page';
import AppRoute from 'components/routes/AppRoute';

const OrganizationRoute = () => (
  <AppRoute authIsRequired={1} requiredUserRole={['manager', 'operator']}>
    <OrganizationPage />
  </AppRoute>
);

export default OrganizationRoute;
