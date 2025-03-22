import { Route ,Routes} from 'react-router';
import TeacherProtected from '../Layouts/TeacherProtected';
import Teacher from '../pages/Teacher';
const TeacherRoutes = () => (
  <Routes element={<TeacherProtected />}>
    <Route path="dashboard" element={<Teacher />} />
  </Routes>
);

export default TeacherRoutes;