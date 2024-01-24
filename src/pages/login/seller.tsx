import LoginByPhoneNumberPage from 'sections/Auth/pages/LoginByPhoneNumber.page';
import AppRoute from 'components/routes/AppRoute';

const RegisterSellerRoute = () => (
  <AppRoute authIsRequired={-1}>
    <LoginByPhoneNumberPage userRole="seller" />
  </AppRoute>
);

export default RegisterSellerRoute;
