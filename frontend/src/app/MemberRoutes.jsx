
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

function MemberRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute allowedRoles={["member"]}>
            <h1>Member Dashboard</h1>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default MemberRoutes;
