import RegisterSellerCompletePage from 'sections/Auth/pages/RegisterSellerComplete.page';
import AppRoute from 'components/routes/AppRoute';

const RegisterSellerCompleteRoute = () => (
  <AppRoute authIsRequired={1} requiredUserRole="seller">
    <RegisterSellerCompletePage />
  </AppRoute>
);

export default RegisterSellerCompleteRoute;
