import AppRoute from 'components/routes/AppRoute';
import AddProductOfferPage from 'sections/Catalog/pages/AddProductOffer.page';

const AddProductOfferRoute = () => (
  <>
    <AppRoute authIsRequired={1} requiredUserRole={['moderator', 'seller']}>
      <AddProductOfferPage />
    </AppRoute>
  </>
);

export default AddProductOfferRoute;
