import AppRoute from 'components/routes/AppRoute';
import ProductOfferListPage from 'sections/Catalog/pages/ProductOfferList.page';

const ProductOfferListRoute = () => (
  <AppRoute authIsRequired={1} requiredUserRole={['moderator', 'seller']}>
    <ProductOfferListPage />
  </AppRoute>
);

export default ProductOfferListRoute;
