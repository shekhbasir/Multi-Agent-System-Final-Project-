import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function FullScreenLoader() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#05070d]">
      <div className="h-10 w-10 rounded-full border-2 border-white/10 border-t-blue-500 animate-spin" />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <FullScreenLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default ProtectedRoute;
