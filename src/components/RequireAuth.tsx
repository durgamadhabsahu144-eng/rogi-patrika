import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";

const roleRoutes: Record<string, string> = {
  doctor: "/dashboard",
  patient: "/patient",
  admin: "/admin",
};

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/auth?returnTo=${encodeURIComponent(returnTo)}`}
        replace
      />
    );
  }

  // Check if user has a role assigned
  const userRole = user?.role;
  if (!userRole) {
    // User is authenticated but hasn't selected a role yet
    return (
      <Navigate
        to="/auth"
        replace
      />
    );
  }

  // Check if user is trying to access a route for their role
  const currentPath = location.pathname;
  const allowedRoute = roleRoutes[userRole];
  if (allowedRoute && currentPath !== allowedRoute && !currentPath.startsWith(allowedRoute + "/")) {
    // User is trying to access a different role's dashboard
    return (
      <Navigate to={allowedRoute} replace />
    );
  }

  return children;
}
