const KEY = "securekyc_session_notice_v1";

const MESSAGES = {
  SESSION_SUPERSEDED: "You've been signed out because this account was signed in from another location.",
  SESSION_EXPIRED: "Your session has expired. Please log in again.",
};

export function setSessionNotice(reason, message) {
  sessionStorage.setItem(KEY, JSON.stringify({ reason, message: message || MESSAGES[reason] }));
}

/** Reads and clears the pending notice — call once, on the login page mounting. */
export function consumeSessionNotice() {
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;

  sessionStorage.removeItem(KEY);

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
