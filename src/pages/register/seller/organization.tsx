import RegisterSellerOrganizationPage from 'sections/Auth/pages/RegisterSellerOrganization.page';
import AppRoute from 'components/routes/AppRoute';

const RegisterSellerOrganizationRoute = () => (
  <AppRoute authIsRequired={1} requiredUserRole="seller">
    <RegisterSellerOrganizationPage />
  </AppRoute>
);

export default RegisterSellerOrganizationRoute;
