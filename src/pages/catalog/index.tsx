import AppRoute from 'components/routes/AppRoute';
import CatalogPage from 'sections/Catalog/pages/Catalog.page';

const CatalogRoute = () => (
  <AppRoute authIsRequired={0}>
    <CatalogPage />
  </AppRoute>
);

export default CatalogRoute;
