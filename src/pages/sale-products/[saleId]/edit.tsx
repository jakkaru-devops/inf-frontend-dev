import AppRoute from 'components/routes/AppRoute';
import EditSaleProductPage from 'sections/Sale/pages/EditSaleProduct.page';

const EditSaleProductRoute = () => (
  <AppRoute authIsRequired={1} requiredUserRole="seller">
    <EditSaleProductPage />
  </AppRoute>
);

export default EditSaleProductRoute;
