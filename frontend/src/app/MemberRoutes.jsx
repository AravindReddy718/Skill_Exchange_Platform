
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import ProfilePage from "../features/member/profile/ProfilePage";
import DiscoveryPage from "../features/member/discovery/DiscoveryPage";
import ExchangesPage from "../features/member/exchanges/ExchangesPage";

function MemberRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/member/profile" replace />}
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={["member"]}>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/discovery"
        element={
          <ProtectedRoute allowedRoles={["member"]}>
            <DiscoveryPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/exchanges"
        element={
          <ProtectedRoute allowedRoles={["member"]}>
            <ExchangesPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default MemberRoutes;
