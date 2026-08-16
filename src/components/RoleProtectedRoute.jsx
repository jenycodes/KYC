import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getCurrentUser, homePathForRole, isAuthenticated, logoutUser } from "../utils/caseStore.js";
import { fetchCurrentSession } from "../utils/authApi.js";
import { setSessionNotice } from "../utils/sessionNotice.js";

function RoleProtectedRoute({ allowedRoles, children }) {
  const location = useLocation();
  const authenticated = isAuthenticated();

  useEffect(() => {
    if (!authenticated) return;

    // Confirm with the server the session is still valid (not just "a token
    // exists locally") — catches revoked/superseded sessions. A 401 here is
    // already fully handled inside apiFetch (notice + logout + redirect);
    // any other failure (e.g. a transient network error) is left alone so a
    // brief connectivity blip doesn't force an otherwise-valid user out.
    fetchCurrentSession().catch(() => {});
  }, [authenticated, location.pathname]);

  if (!authenticated) {
    setSessionNotice("SESSION_EXPIRED");
    logoutUser();
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const user = getCurrentUser();

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={homePathForRole(user?.role)} replace />;
  }

  return children;
}

export default RoleProtectedRoute;
