import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import ReviewerDashboardPage from "./pages/ReviewerDashboardPage.jsx";
import CustomerDashboardPage from "./pages/CustomerDashboardPage.jsx";
import RoleProtectedRoute from "./components/RoleProtectedRoute.jsx";
import { getCurrentUser, homePathForRole, isAuthenticated } from "./utils/caseStore.js";

function DashboardRedirect() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={homePathForRole(getCurrentUser()?.role)} replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/reviewer"
        element={
          <RoleProtectedRoute allowedRoles={["ADMIN", "OFFICER"]}>
            <ReviewerDashboardPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/customer"
        element={
          <RoleProtectedRoute allowedRoles={["CUSTOMER"]}>
            <CustomerDashboardPage />
          </RoleProtectedRoute>
        }
      />
      <Route path="/dashboard" element={<DashboardRedirect />} />
      <Route path="/home" element={<DashboardRedirect />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
