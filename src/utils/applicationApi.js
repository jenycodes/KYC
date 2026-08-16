import { apiFetch, apiFetchBlob } from "./authApi.js";

// ---------- Customer: applications ----------

export function createDraft(fields) {
  return apiFetch("/applications", { method: "POST", body: JSON.stringify(fields) });
}

export function updateDraft(id, fields) {
  return apiFetch(`/applications/${id}`, { method: "PUT", body: JSON.stringify(fields) });
}

export function submitApplication(id) {
  return apiFetch(`/applications/${id}/submit`, { method: "POST" });
}

export function resubmitApplication(id) {
  return apiFetch(`/applications/${id}/resubmit`, { method: "POST" });
}

export function listMyApplications() {
  return apiFetch("/applications/mine", { method: "GET" });
}

export function getApplication(id) {
  return apiFetch(`/applications/${id}`, { method: "GET" });
}

export function uploadDocument(applicationId, documentType, file) {
  const formData = new FormData();
  formData.append("documentType", documentType);
  formData.append("file", file);
  return apiFetch(`/applications/${applicationId}/documents`, { method: "POST", body: formData });
}

export async function fetchDocumentPreviewUrl(applicationId, documentId) {
  const blob = await apiFetchBlob(`/applications/${applicationId}/documents/${documentId}/content`);
  return URL.createObjectURL(blob);
}

// ---------- Officer/Admin: review ----------

export function listAssignedApplications() {
  return apiFetch("/applications/assigned", { method: "GET" });
}

export function recordVerificationCheck(applicationId, checkType, status, remarks) {
  return apiFetch(`/applications/${applicationId}/verification-checks`, {
    method: "POST",
    body: JSON.stringify({ checkType, status, remarks }),
  });
}

export function decideApplication(applicationId, decision, notes) {
  return apiFetch(`/applications/${applicationId}/decision`, {
    method: "POST",
    body: JSON.stringify({ decision, notes }),
  });
}

// ---------- Admin ----------

export function listOfficers() {
  return apiFetch("/admin/officers", { method: "GET" });
}

export function listUsers() {
  return apiFetch("/admin/users", { method: "GET" });
}

export function activateUser(userId) {
  return apiFetch(`/admin/users/${userId}/activate`, { method: "POST" });
}

export function deactivateUser(userId) {
  return apiFetch(`/admin/users/${userId}/deactivate`, { method: "POST" });
}

export function listAllApplications() {
  return apiFetch("/admin/applications", { method: "GET" });
}

export function reassignApplication(applicationId, officerId) {
  return apiFetch(`/admin/applications/${applicationId}/reassign`, {
    method: "POST",
    body: JSON.stringify({ officerId }),
  });
}

export function fetchAdminStats() {
  return apiFetch("/admin/stats", { method: "GET" });
}

export function fetchAuditLog() {
  return apiFetch("/admin/audit-log", { method: "GET" });
}

// ---------- Notifications ----------

export function listNotifications() {
  return apiFetch("/notifications", { method: "GET" });
}

export function markNotificationRead(id) {
  return apiFetch(`/notifications/${id}/read`, { method: "POST" });
}

export function markAllNotificationsRead() {
  return apiFetch("/notifications/read-all", { method: "POST" });
}
