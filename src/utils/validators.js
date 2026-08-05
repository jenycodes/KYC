const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value) {
  return EMAIL_RE.test(value.trim());
}

export function isStrongEnough(password) {
  return password.length >= 8;
}
