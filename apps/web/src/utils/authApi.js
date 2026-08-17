import { getAuthToken, logoutUser } from "./caseStore.js";
import { setSessionNotice } from "./sessionNotice.js";

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8081/api/auth";
export const API_ROOT = API_BASE.replace(/\/auth\/?$/, "");

async function parseJsonResponse(res) {
  const text = await res.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

async function request(path, options = {}) {
  let res;

  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      ...options,
    });
  } catch {
    throw new Error("Unable to reach the server. Please check your connection and try again.");
  }

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || "Something went wrong. Please try again.");
  }

  return data;
}

/**
 * Like request(), but attaches the current session token and, on a 401,
 * clears the session and redirects to /login — the single place session
 * expiry is handled for every authenticated call in the app. `path` is
 * relative to the API root (e.g. "/auth/me", "/applications/mine").
 */

export async function apiFetch(path, options = {}) {
  const token = getAuthToken();
  const isFormData = options.body instanceof FormData;

  let res;
  try {
    res = await fetch(`${API_ROOT}${path}`, {
      ...options,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      credentials: "include",
    });
  } catch {
    throw new Error("Unable to reach the server. Please check your connection and try again.");
  }

  if (res.status === 401) {
    const data = await parseJsonResponse(res);
    setSessionNotice(data.reason || "SESSION_EXPIRED", data.error);
    logoutUser();
    window.location.href = "/login";
    throw new Error(data.error || "Your session has expired. Please log in again.");
  }

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || "Something went wrong. Please try again.");
  }

  return data;
}

/** Same session/401 handling as apiFetch, but returns a Blob for binary content (e.g. document previews). */
export async function apiFetchBlob(path) {
  const token = getAuthToken();

  let res;
  try {
    res = await fetch(`${API_ROOT}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: "include",
    });
  } catch {
    throw new Error("Unable to reach the server. Please check your connection and try again.");
  }

  if (res.status === 401) {
    const data = await parseJsonResponse(res);
    setSessionNotice(data.reason || "SESSION_EXPIRED", data.error);
    logoutUser();
    window.location.href = "/login";
    throw new Error("Your session has expired. Please log in again.");
  }

  if (!res.ok) {
    const data = await parseJsonResponse(res);
    throw new Error(data.error || "Something went wrong. Please try again.");
  }

  return res.blob();
}

export async function registerUser({ fullName, email, password, confirmPassword, accountType, employeeId }) {
  const data = await request("/register", {
    method: "POST",
    body: JSON.stringify({ fullName, email, password, confirmPassword, accountType, employeeId }),
  });

  return {
    email: data.email,
    fullName: data.fullName,
    role: data.role,
    token: data.token,
  };
}

export async function loginWithPassword({ email, password }) {
  const data = await request("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  return {
    email: data.email,
    fullName: data.fullName,
    role: data.role,
    token: data.token,
  };
}

export async function logout() {
  return apiFetch("/auth/logout", { method: "POST" });
}

export async function fetchCurrentSession() {
  const data = await apiFetch("/auth/me", { method: "GET" });

  return {
    email: data.email,
    fullName: data.fullName,
    role: data.role,
    token: data.token,
  };
}

export async function forgotPassword(email) {
  return request("/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword({ token, password, confirmPassword }) {
  return request("/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password, confirmPassword }),
  });
}
