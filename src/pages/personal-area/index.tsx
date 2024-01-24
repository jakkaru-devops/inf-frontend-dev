import AppRoute from 'components/routes/AppRoute';
import PersonalAreaPage from 'sections/PersonalArea/pages/PersonalArea.page';

const PersonalAreaRoute = () => (
  <AppRoute authIsRequired={1}>
    <PersonalAreaPage />
  </AppRoute>
);

export default PersonalAreaRoute;
