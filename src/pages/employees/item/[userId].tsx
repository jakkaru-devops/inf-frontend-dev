import EmployeePage from 'sections/Users/pages/Employee.page';
import AppRoute from 'components/routes/AppRoute';

const EmployeeRoute = () => {
  return (
    <AppRoute authIsRequired={1} requiredUserRole="superadmin">
      <EmployeePage />
    </AppRoute>
  );
};

export default EmployeeRoute;
