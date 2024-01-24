import AppRoute from 'components/routes/AppRoute';
import MetricsPage from 'sections/Metrics/pages/Metrics.page';

const MetricsRoute = () => (
  <AppRoute authIsRequired={1} requiredUserRole={['manager', 'operator']}>
    <MetricsPage />
  </AppRoute>
);

export default MetricsRoute;
