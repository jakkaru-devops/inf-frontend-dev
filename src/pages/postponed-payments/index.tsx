import AppRoute from 'components/routes/AppRoute';
import PostponedPaymentListPage from 'sections/Orders/pages/PostponedPaymentList.page';

const PostponedPaymentListRoute = () => (
  <AppRoute authIsRequired={1} requiredUserRole={['customer', 'seller']}>
    <PostponedPaymentListPage />
  </AppRoute>
);

export default PostponedPaymentListRoute;
