import AppRoute from 'components/routes/AppRoute';
import AdvertisePage from 'sections/Advertise/pages/Advertise.page';

const AdvertiseRoute = () => (
  <AppRoute authIsRequired={0}>
    <AdvertisePage />
  </AppRoute>
);

export default AdvertiseRoute;
