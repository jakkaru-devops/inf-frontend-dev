import CartPage from 'sections/Cart/pages/Cart.page';
import AppRoute from 'components/routes/AppRoute';

const CartRoute = () => (
  <AppRoute authIsRequired={0}>
    <CartPage />
  </AppRoute>
);

export default CartRoute;
