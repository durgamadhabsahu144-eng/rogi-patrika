import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router";
import { LanguageProvider } from "@/context/LanguageContext";
import { RequireAuth } from "@/components/RequireAuth";
import { Loader2 } from "lucide-react";

const Landing = lazy(() => import("./pages/Landing"));
const AuthPage = lazy(() => import("./pages/Auth"));
const DoctorDashboard = lazy(
  () => import("./pages/doctor/Dashboard")
);
const PatientDashboard = lazy(
  () => import("./pages/patient/Dashboard")
);
const AdminDashboard = lazy(
  () => import("./pages/admin/Dashboard")
);
const NotFound = lazy(() => import("./pages/NotFound"));
const Download = lazy(() => import("./pages/Download"));

function RouteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-sm font-medium">Loading...</span>
      </div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <LanguageProvider>
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/auth"
            element={<AuthPage redirectAfterAuth="/dashboard" />}
          />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DoctorDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/patient"
            element={
              <RequireAuth>
                <PatientDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <AdminDashboard />
              </RequireAuth>
            }
          />
          <Route path="/download" element={<Download />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </LanguageProvider>
  );
}
