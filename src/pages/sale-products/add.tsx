import AppRoute from 'components/routes/AppRoute';
import AddProductSalePage from 'sections/Sale/pages/AddSaleProduct.page';

const AddSaleProductRoute = () => (
  <AppRoute authIsRequired={1} requiredUserRole="seller">
    <AddProductSalePage />
  </AppRoute>
);

export default AddSaleProductRoute;
