import AppRoute from 'components/routes/AppRoute';
import CatalogExternalAutoModelListPage from 'sections/CatalogExternal/pages/CatalogExternalAutoModelList.page';

const CatalogExternalAutoModelListRoute = () => {
  return (
    <AppRoute authIsRequired={0}>
      <CatalogExternalAutoModelListPage />
    </AppRoute>
  );
};

export default CatalogExternalAutoModelListRoute;
