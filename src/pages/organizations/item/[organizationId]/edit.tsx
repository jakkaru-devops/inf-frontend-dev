import EditOrganizationPage from 'sections/Organizations/pages/EditOrganization.page';
import AppRoute from 'components/routes/AppRoute';

const EditOrganizationRoute = () => (
  <AppRoute authIsRequired={1} requiredUserRole={['manager', 'operator']}>
    <EditOrganizationPage />
  </AppRoute>
);

export default EditOrganizationRoute;
