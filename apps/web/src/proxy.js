import { NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "session_token";

const ROLE_GATED_PATHS = {
  "/reviewer": ["ADMIN", "OFFICER"],
  "/customer": ["CUSTOMER"],
};

/**
 * Cheap, unverified peek at the JWT's "role" claim — enough to route to the
 * right place. This is not the security boundary: every real API call is
 * still fully verified (signature + session id) by JwtAuthenticationFilter
 * on the backend. A forged/expired token here just means a wrong-looking
 * redirect, not an authorization bypass, since any actual data request will
 * fail with a 401 that the frontend already handles.
 */
function decodeRole(token) {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded))?.role || null;
  } catch {
    return null;
  }
}

function homePathForRole(role) {
  return role === "ADMIN" || role === "OFFICER" ? "/reviewer" : "/customer";
}

export function proxy(request) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const { pathname } = request.nextUrl;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const role = decodeRole(token);

  if (pathname === "/dashboard" || pathname === "/home") {
    return NextResponse.redirect(new URL(homePathForRole(role), request.url));
  }

  const allowedRoles = ROLE_GATED_PATHS[pathname];
  if (allowedRoles && !allowedRoles.includes(role)) {
    return NextResponse.redirect(new URL(homePathForRole(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/reviewer", "/customer", "/dashboard", "/home"],
};
