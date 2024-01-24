import AppRoute from 'components/routes/AppRoute';
import OrganizationUpdateApplicationPage from 'sections/Organizations/pages/OrganizationUpdateApplication.page';

const OrganizationUpdateApplicationRoute = () => (
  <AppRoute authIsRequired={1} requiredUserRole={['manager', 'operator']}>
    <OrganizationUpdateApplicationPage />
  </AppRoute>
);

export default OrganizationUpdateApplicationRoute;
