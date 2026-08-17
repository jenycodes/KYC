const EMAIL_RE = /^(?!.*\.\.)[a-z0-9](?:[a-z0-9._%+-]{0,62}[a-z0-9])?@(gmail|outlook|yahoo)\.com$/i;
const GENERAL_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COMMON_PASSWORDS = new Set([
  "password",
  "password123",
  "password123!",
  "welcome",
  "welcome123",
  "letmein",
  "letmein123",
  "admin",
  "admin123",
  "secret",
  "123456",
  "12345678",
  "abc123",
  "password",
]);

export function isValidEmail(value) {
  return EMAIL_RE.test(value.trim());
}

// Deliberately permissive: used on the login page, where any account that
// could have been registered or seeded (including internal/admin addresses
// on a company domain) must be allowed to attempt sign-in.
export function isValidLoginEmail(value) {
  return GENERAL_EMAIL_RE.test(value.trim());
}

export function isStrongEnough(password) {
  if (!password) return false;
  const normalized = password.trim().toLowerCase();
  if (COMMON_PASSWORDS.has(normalized)) return false;
  if (password.length < 12) return false;
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) return false;
  if (!/\d/.test(password)) return false;
  if (!/[^A-Za-z0-9]/.test(password)) return false;
  return true;
}

export function isValidFullName(value) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(trimmed)) return false;
  return trimmed.split(" ").every((part) => part.length >= 2);
}

export function isValidReviewerId(value) {
  return /^[A-Z]{2,4}-\d{3,6}$/.test(value.trim());
}
