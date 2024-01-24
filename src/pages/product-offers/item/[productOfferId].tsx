import AppRoute from 'components/routes/AppRoute';
import ProductOfferPage from 'sections/Catalog/pages/ProductOffer.page';

const ProductOfferRoute = () => (
  <AppRoute authIsRequired={1} requiredUserRole={['moderator', 'seller']}>
    <ProductOfferPage />
  </AppRoute>
);

export default ProductOfferRoute;
