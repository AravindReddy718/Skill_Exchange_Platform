
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

function AdminRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <h1>Admin Dashboard</h1>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AdminRoutes;
