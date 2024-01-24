import Error404Page from 'sections/Errors/pages/Error404.page';
import AppRoute from 'components/routes/AppRoute';

const Error404Route = () => (
  <AppRoute authIsRequired={0}>
    <Error404Page />
  </AppRoute>
);

export default Error404Route;
