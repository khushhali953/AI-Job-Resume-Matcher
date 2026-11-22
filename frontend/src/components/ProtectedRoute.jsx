import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  const isAuthenticated = Boolean(token || user);

  if (!isAuthenticated) {
    // Redirect to login and save the location they tried to visit
    return <Navigate to="/login" state={{ from: location, message: "Please sign in to access this page" }} replace />;
  }

  return children;
}

export default ProtectedRoute;
