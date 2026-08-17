"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentUser, homePathForRole, isAuthenticated, logoutUser } from "../utils/caseStore.js";
import { fetchCurrentSession } from "../utils/authApi.js";
import { setSessionNotice } from "../utils/sessionNotice.js";

function RoleProtectedRoute({ allowedRoles, children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      setSessionNotice("SESSION_EXPIRED");
      logoutUser();
      router.replace("/login");
      return;
    }

    const user = getCurrentUser();

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
      router.replace(homePathForRole(user?.role));
      return;
    }

    setReady(true);

    // Confirm with the server the session is still valid (not just "a token
    // exists locally") — catches revoked/superseded sessions. A 401 here is
    // already fully handled inside apiFetch (notice + logout + redirect);
    // any other failure (e.g. a transient network error) is left alone so a
    // brief connectivity blip doesn't force an otherwise-valid user out.
    fetchCurrentSession().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!ready) return null;

  return children;
}

export default RoleProtectedRoute;
