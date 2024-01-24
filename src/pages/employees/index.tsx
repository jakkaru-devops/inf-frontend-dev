import EmployeeListPage from 'sections/Users/pages/EmployeeList.page';
import AppRoute from 'components/routes/AppRoute';

const EmployeeListRoute = () => {
  return (
    <AppRoute authIsRequired={1} requiredUserRole="superadmin">
      <EmployeeListPage />
    </AppRoute>
  );
};

export default EmployeeListRoute;
