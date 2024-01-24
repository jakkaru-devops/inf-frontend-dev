import SellerPage from 'sections/Users/pages/Seller.page';
import AppRoute from 'components/routes/AppRoute';
import { PagePreloader } from 'components/common';
import CustomerPage from 'sections/Users/pages/Customer.page';
import { useAuth } from 'hooks/auth.hook';

const UserSettingsInfoTabRoute = () => {
  const auth = useAuth();

  if (!auth.isLoaded) {
    return <PagePreloader />;
  }

  return (
    <AppRoute authIsRequired={1} requiredUserRole={['customer', 'seller']}>
      {auth?.currentRole?.label === 'customer' && <CustomerPage />}
      {auth?.currentRole?.label === 'seller' && <SellerPage />}
    </AppRoute>
  );
};

export default UserSettingsInfoTabRoute;
