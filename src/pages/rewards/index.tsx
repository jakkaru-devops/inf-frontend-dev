import AppRoute from 'components/routes/AppRoute';
import RewardListPage from 'sections/Rewards/pages/RewardList.page';

const RewardListRoute = () => (
  <AppRoute
    authIsRequired={1}
    requiredUserRole={['seller', 'manager', 'operator']}
  >
    <RewardListPage />
  </AppRoute>
);

export default RewardListRoute;
