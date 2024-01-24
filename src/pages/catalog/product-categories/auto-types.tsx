import AppRoute from 'components/routes/AppRoute';
import AutoTypeListPage from 'sections/Catalog/pages/AutoTypeList.page';

const AutoTypeListRoute = () => (
  <AppRoute authIsRequired={1} requiredUserRole="moderator">
    <AutoTypeListPage />
  </AppRoute>
);

export default AutoTypeListRoute;
