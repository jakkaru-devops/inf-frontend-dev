import AppRoute from 'components/routes/AppRoute';
import AutoBrandListPage from 'sections/Catalog/pages/AutoBrandList.page';

const AutoBrandListRoute = () => (
  <AppRoute authIsRequired={1} requiredUserRole="moderator">
    <AutoBrandListPage />
  </AppRoute>
);

export default AutoBrandListRoute;
