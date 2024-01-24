import AppRoute from 'components/routes/AppRoute';
import CatalogExternalLaximoUnitPage from 'sections/CatalogExternal/pages/CatalogExternalLaximoUnit.page';

const CatalogExternalLaximoUnitRoute = () => {
  return (
    <AppRoute authIsRequired={0}>
      <CatalogExternalLaximoUnitPage />
    </AppRoute>
  );
};

export default CatalogExternalLaximoUnitRoute;
