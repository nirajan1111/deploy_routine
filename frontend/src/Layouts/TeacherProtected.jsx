import { Outlet } from "react-router";

export default function TeacherProtected() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Outlet />
    </div>
  );
}
