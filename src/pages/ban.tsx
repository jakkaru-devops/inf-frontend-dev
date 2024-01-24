import AppRoute from 'components/routes/AppRoute';
import UserBannedPage from 'sections/Users/pages/UserBanned.page';

const UserBannedRoute = () => (
  <AppRoute authIsRequired={1}>
    <UserBannedPage />
  </AppRoute>
);

export default UserBannedRoute;
