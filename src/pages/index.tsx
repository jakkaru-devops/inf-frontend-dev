import HomePage from 'sections/Home/pages/Home.page';
import AppRoute from 'components/routes/AppRoute';

const HomeRoute = () => (
  <AppRoute authIsRequired={0}>
    <HomePage />
  </AppRoute>
);

export default HomeRoute;
