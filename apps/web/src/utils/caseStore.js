import { useEffect, useState } from "react";

// In-memory only — deliberately not persisted (no localStorage/sessionStorage).
// The real session lives in an httpOnly cookie this code can never read;
// this is just non-secret display info (name/role/avatar) for the UI,
// re-hydrated from GET /api/auth/me on every fresh page load by
// components/AuthBootstrap.jsx. It does not survive a full reload on its
// own — that's the point.
let currentUser = null;

const ROLE_LABELS = {
  ADMIN: "Admin",
  OFFICER: "KYC Officer",
  CUSTOMER: "Customer",
};

function notifyAuthChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("securekyc-auth-change"));
  }
}

export function getCurrentUser() {
  return currentUser;
}

export function loginUser({ email, fullName = "", role }) {
  const normalizedEmail = String(email || "").trim();
  if (!normalizedEmail) {
    throw new Error("Sign-in response did not include an email address.");
  }
  if (!role) {
    throw new Error("Sign-in response did not include an account role.");
  }

  const name = fullName || normalizedEmail.split("@")[0].replace(".", " ");

  currentUser = {
    name,
    email: normalizedEmail,
    role,
    roleLabel: ROLE_LABELS[role] || role,
    avatar: name.slice(0, 2).toUpperCase(),
  };

  notifyAuthChange();
  return currentUser;
}

export function logoutUser() {
  currentUser = null;

  // One-time cleanup of the pre-httpOnly-cookie design's localStorage keys,
  // for anyone with a stale cached session from before this change.
  if (typeof window !== "undefined") {
    localStorage.removeItem("securekyc_user_v1");
    localStorage.removeItem("securekyc_token_v1");
  }

  notifyAuthChange();
}

/**
 * Best-effort, client-visible hint only — the real session lives in an
 * httpOnly cookie this code can never read. Used purely to decide whether to
 * show the "already signed in" nudge on /login and /register; actual route
 * protection happens in middleware (proxy.js) and on the backend, not here.
 */
export function isAuthenticated() {
  return Boolean(currentUser);
}

/**
 * React hook version of getCurrentUser() — re-renders the calling component
 * whenever the in-memory session changes (login, logout, or the initial
 * bootstrap hydration from the cookie). Plain getCurrentUser() is fine for
 * one-shot checks inside effects/handlers, but anything that needs to
 * reflect the bootstrap's async result should use this instead.
 */
export function useCurrentUser() {
  const [user, setUser] = useState(currentUser);

  useEffect(() => {
    function handleChange() {
      setUser(currentUser);
    }
    window.addEventListener("securekyc-auth-change", handleChange);
    return () => window.removeEventListener("securekyc-auth-change", handleChange);
  }, []);

  return user;
}

export function homePathForRole(role) {
  if (role === "ADMIN" || role === "OFFICER") return "/reviewer";
  return "/customer";
}
