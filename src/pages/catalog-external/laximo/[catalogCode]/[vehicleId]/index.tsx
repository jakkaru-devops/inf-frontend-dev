import AppRoute from 'components/routes/AppRoute';
import CatalogExternalLaximoCarPage from 'sections/CatalogExternal/pages/CatalogExternalLaximoCar.page';

const CatalogExternalLaximoVehicle = () => {
  return (
    <AppRoute authIsRequired={0}>
      <CatalogExternalLaximoCarPage />
    </AppRoute>
  );
};

export default CatalogExternalLaximoVehicle;
