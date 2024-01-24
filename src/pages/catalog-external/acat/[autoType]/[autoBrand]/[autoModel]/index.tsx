import AppRoute from 'components/routes/AppRoute';
import CatalogExternalAutoModelCommonPage from 'sections/CatalogExternal/pages/CatalogExternalAutoModelCommon.page';

const CatalogExternalAutoBrandRoute = () => {
  return (
    <AppRoute authIsRequired={0}>
      <CatalogExternalAutoModelCommonPage />
    </AppRoute>
  );
};

export default CatalogExternalAutoBrandRoute;
