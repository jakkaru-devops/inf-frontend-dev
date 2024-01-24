import OrganizationListPage from 'sections/Organizations/pages/OrganizationList.page';
import AppRoute from 'components/routes/AppRoute';

const OrganizationListRoute = () => (
  <AppRoute authIsRequired={1} requiredUserRole={['manager', 'operator']}>
    <OrganizationListPage />
  </AppRoute>
);

export default OrganizationListRoute;
