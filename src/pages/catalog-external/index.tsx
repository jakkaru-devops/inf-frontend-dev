import AppRoute from 'components/routes/AppRoute';
import CatalogExternalCommonPage from 'sections/CatalogExternal/pages/CatalogExternalCommon.page';

const CatalogExternalRoute = () => (
  <AppRoute authIsRequired={0}>
    <CatalogExternalCommonPage />
  </AppRoute>
);

export default CatalogExternalRoute;
