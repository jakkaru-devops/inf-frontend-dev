import AppRoute from 'components/routes/AppRoute';
import CatalogExternalLaximoCommonPage from 'sections/CatalogExternal/pages/CatalogExternalLaximoCommon.page';

const CatalogExternalCommonRoute = () => {
  return (
    <AppRoute authIsRequired={0}>
      <CatalogExternalLaximoCommonPage />
    </AppRoute>
  );
};

export default CatalogExternalCommonRoute;
