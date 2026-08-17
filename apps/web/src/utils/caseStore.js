import { isTokenExpired } from "./session.js";

const STORAGE_KEY_USER = "securekyc_user_v1";
const STORAGE_KEY_TOKEN = "securekyc_token_v1";

const ROLE_LABELS = {
  ADMIN: "Admin",
  OFFICER: "KYC Officer",
  CUSTOMER: "Customer",
};

export function getCurrentUser() {
  const raw = localStorage.getItem(STORAGE_KEY_USER);
  if (!raw) {
    return null;
  }

  try {
    const user = JSON.parse(raw);
    return user?.email ? user : null;
  } catch {
    return null;
  }
}

export function getAuthToken() {
  return localStorage.getItem(STORAGE_KEY_TOKEN);
}

function notifyAuthChange() {
  window.dispatchEvent(new Event("securekyc-auth-change"));
}

export function loginUser({ email, fullName = "", role, token = "" }) {
  const normalizedEmail = String(email || "").trim();
  if (!normalizedEmail) {
    throw new Error("Sign-in response did not include an email address.");
  }
  if (!role) {
    throw new Error("Sign-in response did not include an account role.");
  }
  if (!token) {
    throw new Error("Sign-in response did not include a session token.");
  }

  const name = fullName || normalizedEmail.split("@")[0].replace(".", " ");

  const user = {
    name,
    email: normalizedEmail,
    role,
    roleLabel: ROLE_LABELS[role] || role,
    avatar: name.slice(0, 2).toUpperCase(),
  };

  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  localStorage.setItem(STORAGE_KEY_TOKEN, token);
  notifyAuthChange();
  return user;
}

export function logoutUser() {
  localStorage.removeItem(STORAGE_KEY_USER);
  localStorage.removeItem(STORAGE_KEY_TOKEN);
  notifyAuthChange();
}

export function isAuthenticated() {
  const token = getAuthToken();
  return Boolean(getCurrentUser()) && Boolean(token) && !isTokenExpired(token);
}

export function homePathForRole(role) {
  if (role === "ADMIN" || role === "OFFICER") return "/reviewer";
  return "/customer";
}
