import React from 'react';
import { Routes, Route } from 'react-router';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/common/Navbar';
import Departments from './components/settings/Departments';
import Courses from './components/settings/Courses';
import Rooms from './components/settings/Rooms';
import Batches from './components/settings/Batches';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import store from './store';
import theme from './theme';
import RoutinePage from './pages/RoutinePage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import RoutineList from './components/routine/RoutineList';
import CreateRoutine from './components/routine/CreateRoutine';
import ViewRoutine from './components/routine/ViewRoutine';
import RoomPage from "./pages/RoomPage"
import TeacherRoutinePage from './pages/TeacherRoutinePage';
import Dashboard from './pages/Dashboard';


function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div>
          <Navbar />
          <Routes>
            <Route path="/settings/departments" element={<Departments />} />
            <Route path="/settings/courses" element={<Courses />} />
            <Route path="/settings/rooms" element={<Rooms />} />
            <Route path="/settings/batches" element={<Batches />} />
            <Route path="/" element={<RoutinePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/routines" element={<RoutineList />} />
            <Route path='/routines/:type' element={<RoomPage/>}/>
            <Route path="/routines/create/new" element={<CreateRoutine />} />
            <Route path="/routines/:type/:id" element={<ViewRoutine />} />
            <Route path="/my-routine" element={<TeacherRoutinePage />} />
            <Route path ="/dashboard" element={<Dashboard />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
