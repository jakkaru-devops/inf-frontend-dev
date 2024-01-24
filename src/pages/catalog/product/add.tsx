import AddProductPage from 'sections/Catalog/pages/AddProduct.page';
import AppRoute from 'components/routes/AppRoute';

const AddProductRoute = () => (
  <AppRoute authIsRequired={1} requiredUserRole="moderator">
    <AddProductPage />
  </AppRoute>
);

export default AddProductRoute;
