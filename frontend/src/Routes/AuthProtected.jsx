import { Routes,Route } from 'react-router';
import AuthProtected from '../Layouts/AuthProtected';
import Student from '../pages/Student';
import AuthLayout from '../Layouts/AuthLayout';
const AuthProtectedRoutes = () => (
  <Routes element={<AuthLayout />}>
      <Route path="student" element={<Student />} />
  </Routes>
);

export default AuthProtectedRoutes;