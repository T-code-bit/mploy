import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "job_seeker" | "employer" | "admin";
}

const isProfileComplete = (profile: any): boolean => {
  if (!profile) return false;
  const { full_name, phone, address, bio } = profile;
  return !!(full_name?.trim() && phone?.trim() && address?.trim() && bio?.trim());
};

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, userRole, profile, loading } = useAuth();
  const location = useLocation();

  if (loading || (user && !profile)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Admins bypass all profile and role checks
  if (userRole === "admin") {
    return <>{children}</>;
  }

  // Force profile completion before accessing any protected page (except /profile itself)
  if (location.pathname !== "/profile" && !isProfileComplete(profile)) {
    return <Navigate to="/profile" replace />;
  }

  // Employers can access all sections (including job seeker routes)
  if (requiredRole && userRole !== requiredRole && userRole !== "employer") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
