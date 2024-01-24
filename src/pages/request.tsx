import AppRoute from 'components/routes/AppRoute';
import RequestPage from 'sections/Request/pages';

const RequestRoute = () => (
  <AppRoute authIsRequired={0}>
    <RequestPage/>
  </AppRoute>
);

export default RequestRoute;
