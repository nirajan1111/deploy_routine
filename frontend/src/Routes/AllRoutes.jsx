import { Route, Routes } from 'react-router';
import Login from '../pages/Login';
import Register from '../pages/Register';
import AuthLayout from '../Layouts/AuthLayout';
import Landing from '../pages/Landing';
const CommonRoute = () => (
    <Routes element={<AuthLayout />}>
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="/*" element={<Landing />} />
    </Routes>
  

);

export default CommonRoute;