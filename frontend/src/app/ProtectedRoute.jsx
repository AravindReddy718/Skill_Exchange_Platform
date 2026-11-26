
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ allowedRoles, children }) {
  const { user, loading } = useAuth();

  // Wait until the saved login session is checked
  if (loading) {
    return <p>Loading...</p>;
  }

  // Redirect unauthenticated users
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Prevent users from accessing unauthorized sections
  if (!allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to={user.role === "admin" ? "/admin" : "/member"}
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;
