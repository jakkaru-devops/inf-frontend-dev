import CreateOrganizationPage from 'sections/Organizations/pages/CreateOrganization.page';
import AppRoute from 'components/routes/AppRoute';

const CreateOrganizationRoute = () => (
  <AppRoute authIsRequired={1} requiredUserRole={['manager', 'operator']}>
    <CreateOrganizationPage />
  </AppRoute>
);

export default CreateOrganizationRoute;
