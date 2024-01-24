import AppRoute from 'components/routes/AppRoute';
import DownloadAppPage from 'sections/Advertise/pages/DownloadApp.page';

const DownloadAppRoute = () => (
  <AppRoute authIsRequired={0}>
    <DownloadAppPage />
  </AppRoute>
);

export default DownloadAppRoute;
