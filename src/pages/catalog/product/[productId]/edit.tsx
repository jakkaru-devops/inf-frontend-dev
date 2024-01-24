import EditProductPage from 'sections/Catalog/pages/EditProduct.page';
import AppRoute from 'components/routes/AppRoute';

const EditProductRoute = () => (
  <AppRoute authIsRequired={1} requiredUserRole="moderator">
    <EditProductPage />
  </AppRoute>
);

export default EditProductRoute;
