import AuthProtectedRoutes from "./AuthProtected";
import TeacherRoutes from "./TeacherRoute";
import NonAuthRoute from "./allRoutes";
import { Route, Routes } from "react-router";

const RouteSet = () => {
    return (
        <Routes>
            <Route path="t/*" element={<TeacherRoutes />} />
            <Route path="s/*" element={<AuthProtectedRoutes />} />
            <Route path="/*" element={<NonAuthRoute />} />
        </Routes>
    );
}
export default RouteSet;