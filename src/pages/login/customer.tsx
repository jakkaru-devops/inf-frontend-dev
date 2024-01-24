import LoginByPhoneNumberPage from 'sections/Auth/pages/LoginByPhoneNumber.page';
import AppRoute from 'components/routes/AppRoute';

const RegisterCustomerRoute = () => (
  <AppRoute authIsRequired={-1}>
    <LoginByPhoneNumberPage userRole="customer" />
  </AppRoute>
);

export default RegisterCustomerRoute;
