import AppRoute from 'components/routes/AppRoute';
import AccountReviewSellerPage from 'sections/PersonalArea/pages/AccountReviewSeller.page';

const AccountReviewRoute = () => (
  <AppRoute authIsRequired={1} requiredUserRole="seller">
    <AccountReviewSellerPage />
  </AppRoute>
);

export default AccountReviewRoute;
