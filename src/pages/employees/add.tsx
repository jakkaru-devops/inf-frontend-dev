import AddEmployeePage from 'sections/Users/pages/AddEmployee.page';
import AppRoute from 'components/routes/AppRoute';

const AddEmployeeRoute = () => (
  <AppRoute authIsRequired={1} requiredUserRole="superadmin">
    <AddEmployeePage />
  </AppRoute>
);

export default AddEmployeeRoute;
