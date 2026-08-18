"use client";

import { useEffect } from "react";
import { API_ROOT } from "../utils/authApi.js";
import { loginUser, logoutUser } from "../utils/caseStore.js";

/**
 * Runs once per full page load to re-hydrate the in-memory user/display info
 * (see caseStore.js) from the httpOnly session cookie, since nothing about
 * the user's identity persists in the browser across reloads on its own —
 * only the cookie does. Deliberately calls the endpoint directly rather than
 * through apiFetch()/fetchCurrentSession(): a 401 here just means "not
 * signed in", not a session-expiry event, so it shouldn't trigger apiFetch's
 * session-expired notice + redirect-to-login side effects.
 */
export default function AuthBootstrap() {
  useEffect(() => {
    fetch(`${API_ROOT}/auth/me`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          loginUser({ email: data.email, fullName: data.fullName, role: data.role });
        } else {
          logoutUser();
        }
      })
      .catch(() => {});
  }, []);

  return null;
}
