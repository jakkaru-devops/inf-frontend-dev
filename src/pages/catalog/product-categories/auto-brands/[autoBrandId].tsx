import AppRoute from 'components/routes/AppRoute';
import AutoBrandPage from 'sections/Catalog/pages/AutoBrand.page';

const AutoBrandRoute = () => (
  <AppRoute authIsRequired={1} requiredUserRole="moderator">
    <AutoBrandPage />
  </AppRoute>
);

export default AutoBrandRoute;
