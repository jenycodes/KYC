"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/dashboard/Sidebar.jsx";
import DashboardHeader from "../../../components/dashboard/DashboardHeader.jsx";
import DashboardOverview from "../../../components/dashboard/DashboardOverview.jsx";
import DashboardStats from "../../../components/dashboard/DashboardStats.jsx";
import CaseList from "../../../components/dashboard/CaseList.jsx";
import AuditLog from "../../../components/dashboard/AuditLog.jsx";
import CompliancePanel from "../../../components/dashboard/CompliancePanel.jsx";
import DocumentReviewPanel from "../../../components/dashboard/DocumentReviewPanel.jsx";
import VerificationChecklist from "../../../components/dashboard/VerificationChecklist.jsx";
import AdminUsersPanel from "../../../components/dashboard/AdminUsersPanel.jsx";
import DecisionStep from "../../../components/verification/DecisionStep.jsx";
import { logout as logoutOnServer } from "../../../utils/authApi.js";
import { logoutUser, useCurrentUser } from "../../../utils/caseStore.js";
import {
  decideApplication,
  fetchAdminStats,
  fetchAuditLog,
  fetchDocumentPreviewUrl,
  getApplication,
  listAllApplications,
  listAssignedApplications,
  listOfficers,
  reassignApplication,
  recordVerificationCheck,
} from "../../../utils/applicationApi.js";
import { fieldsFromApplication } from "../../../utils/applicationFields.js";
import "../../../styles/forms.css";
import "../../../styles/verification.css";
import "../../../styles/dashboard.css";

const SLOT_TO_DOCUMENT_TYPE = { idFront: "GOVERNMENT_ID", idBack: "SUPPORTING", address: "ADDRESS_PROOF" };

const VIEW_TITLES = {
  overview: { title: "Overview", subtitle: "Your KYC reviewer workspace at a glance." },
  pending: { title: "Pending review", subtitle: "Submissions waiting for review or a final decision." },
  approved: { title: "Approved", subtitle: "Successfully verified identities." },
  rejected: { title: "Rejected", subtitle: "Cases that did not pass verification." },
  audit: { title: "Audit log", subtitle: "Immutable record of reviewer actions." },
  users: { title: "Officers & users", subtitle: "Manage accounts and review officer workload." },
  compliance: { title: "Compliance", subtitle: "KYC requirements and regulatory guidance." },
};

const STATUS_TO_SECTION = {
  DRAFT: "pending",
  SUBMITTED: "pending",
  UNDER_REVIEW: "pending",
  ADDITIONAL_INFO_REQUIRED: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  ESCALATED: "pending",
};

const DECISION_TO_BACKEND = { approve: "APPROVE", reject: "REJECT", info: "REQUEST_INFO", escalate: "ESCALATE" };

function toCaseShape(app) {
  return {
    id: `KYC-${app.id}`,
    appId: app.id,
    fields: { fullName: app.fullName, docNumber: app.idNumber },
    previews: {},
    status: app.status === "APPROVED" ? "approved" : app.status === "REJECTED" ? "rejected" : "pending",
    rawStatus: app.status,
    notes: app.correctionReason || "",
    savedAt: new Date(app.submittedAt || app.createdAt).getTime(),
  };
}

function filterCases(cases, query) {
  const q = query.trim().toLowerCase();
  if (!q) return cases;
  return cases.filter((item) => {
    const name = item.fields.fullName?.toLowerCase() || "";
    return name.includes(q) || item.id.toLowerCase().includes(q);
  });
}

function ReviewerDashboardPage() {
  const router = useRouter();
  const user = useCurrentUser();
  const isAdmin = user?.role === "ADMIN";

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [auditEntries, setAuditEntries] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [activeSection, setActiveSection] = useState("overview");
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("list");

  const [viewingAppId, setViewingAppId] = useState(null);
  const [viewingDetail, setViewingDetail] = useState(null);
  const [viewingPreviews, setViewingPreviews] = useState({});
  const [actionError, setActionError] = useState("");
  const [loadError, setLoadError] = useState("");

  async function refresh() {
    try {
      const data = isAdmin ? await listAllApplications() : await listAssignedApplications();
      setApplications(data);
      setLoadError("");
    } catch (error) {
      // apiFetch already handles session-expiry redirects — this catches
      // everything else so the user sees why their queue isn't loading.
      setLoadError(error.message || "Couldn't load applications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    if (isAdmin) {
      fetchAuditLog().then(setAuditEntries).catch(() => {});
      listOfficers().then(setOfficers).catch(() => {});
      fetchAdminStats().then(setAdminStats).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectSection(section) {
    if ((section === "audit" || section === "users") && !isAdmin) return;
    setActiveSection(section);
    setViewingAppId(null);
    setMode("list");
    setSearch("");
  }

  async function loadDetail(appId) {
    setViewingDetail(null);
    setViewingPreviews({});
    setActionError("");
    try {
      const detail = await getApplication(appId);
      setViewingDetail(detail);

      const previews = {};
      for (const doc of detail.documents || []) {
        const slot = Object.entries(SLOT_TO_DOCUMENT_TYPE).find(([, type]) => type === doc.documentType)?.[0];
        if (slot && doc.contentType?.startsWith("image/")) {
          previews[slot] = await fetchDocumentPreviewUrl(appId, doc.id);
        }
      }
      setViewingPreviews(previews);
    } catch (e) {
      setActionError(e.message || "Couldn't load this application.");
    }
  }

  function handleOpenCase(caseId) {
    const appId = Number(caseId.replace("KYC-", ""));
    setViewingAppId(appId);
    setMode("detail");
    loadDetail(appId);
  }

  function handleBackToList() {
    setViewingAppId(null);
    setViewingDetail(null);
    setMode("list");
  }

  async function handleRecordCheck(checkType, status, remarks) {
    if (!viewingAppId) return;
    try {
      await recordVerificationCheck(viewingAppId, checkType, status, remarks);
      await loadDetail(viewingAppId);
    } catch (e) {
      setActionError(e.message || "Couldn't record that check.");
    }
  }

  async function handleFinalizeDecision(choice, notes) {
    if (!viewingAppId) return;
    try {
      await decideApplication(viewingAppId, DECISION_TO_BACKEND[choice], notes);
      await refresh();
      if (isAdmin) {
        fetchAuditLog().then(setAuditEntries).catch(() => {});
        fetchAdminStats().then(setAdminStats).catch(() => {});
      }
      setActiveSection(choice === "approve" ? "approved" : choice === "reject" ? "rejected" : "pending");
      setViewingAppId(null);
      setMode("list");
    } catch (e) {
      setActionError(e.message || "Couldn't record that decision.");
    }
  }

  async function handleReassign(officerId) {
    if (!viewingAppId || !officerId) return;
    try {
      await reassignApplication(viewingAppId, Number(officerId));
      await loadDetail(viewingAppId);
      await refresh();
    } catch (e) {
      setActionError(e.message || "Couldn't reassign this application.");
    }
  }

  function handleLogout() {
    logoutOnServer().catch(() => {});
    logoutUser();
    router.replace("/login");
  }

  const cases = useMemo(() => applications.map(toCaseShape), [applications]);

  const listStats = useMemo(() => {
    const pending = cases.filter((c) => STATUS_TO_SECTION[c.rawStatus] === "pending").length;
    const approved = cases.filter((c) => c.rawStatus === "APPROVED").length;
    const rejected = cases.filter((c) => c.rawStatus === "REJECTED").length;
    const total = cases.length;
    const decided = approved + rejected;
    return { total, pending, approved, rejected, approvalRate: decided ? Math.round((approved / decided) * 100) : null };
  }, [cases]);

  const stats = useMemo(() => {
    if (!isAdmin || !adminStats) return listStats;
    const pending = adminStats.submitted + adminStats.underReview + adminStats.additionalInfoRequired + adminStats.escalated;
    const decided = adminStats.approved + adminStats.rejected;
    return {
      total: adminStats.totalApplications,
      pending,
      approved: adminStats.approved,
      rejected: adminStats.rejected,
      approvalRate: decided ? Math.round((adminStats.approved / decided) * 100) : null,
    };
  }, [adminStats, isAdmin, listStats]);

  const counts = { pending: stats.pending, approved: stats.approved, rejected: stats.rejected };

  const sectionCases = useMemo(() => {
    const filtered = cases.filter((c) => STATUS_TO_SECTION[c.rawStatus] === activeSection);
    return filterCases(filtered, search);
  }, [cases, activeSection, search]);

  const recentCases = useMemo(
    () => [...cases].sort((a, b) => b.savedAt - a.savedAt).slice(0, 5),
    [cases]
  );

  const viewMeta = VIEW_TITLES[activeSection] || VIEW_TITLES.overview;
  const showSearch = ["pending", "approved", "rejected"].includes(activeSection) && mode === "list";
  const canDecide = viewingDetail?.status === "UNDER_REVIEW";

  return (
    <div className="dash">
      <Sidebar
        role={user?.role}
        counts={counts}
        activeSection={activeSection}
        onSelectSection={selectSection}
        onLogout={handleLogout}
        user={user}
      />

      <div className="dash__content">
        <DashboardHeader
          title={mode === "detail" && viewingDetail
            ? viewingDetail.fullName || "Case detail"
            : viewMeta.title}
          subtitle={
            mode === "detail" && viewingDetail
              ? `KYC-${viewingDetail.id}`
              : viewMeta.subtitle
          }
          user={user}
          search={showSearch ? search : ""}
          onSearchChange={showSearch ? setSearch : undefined}
        />

        <main className="dash__main">
          {loading && mode === "list" ? <p className="dash__hint">Loading…</p> : null}

          {!loading && loadError && mode === "list" ? (
            <div className="alert alert--error load-error" role="alert">
              <span>{loadError}</span>
              <button type="button" className="btn--ghost btn--ghost-sm" onClick={() => { setLoading(true); refresh(); }}>
                Retry
              </button>
            </div>
          ) : null}

          {!loading && !loadError && mode === "list" && activeSection === "overview" ? (
            <DashboardOverview
              role={user?.role}
              user={user}
              stats={stats}
              recentCases={recentCases}
              onOpenCase={handleOpenCase}
              onGoToSection={selectSection}
            />
          ) : null}

          {!loading && !loadError && mode === "list" && ["pending", "approved", "rejected"].includes(activeSection) ? (
            <>
              <DashboardStats stats={stats} />
              <CaseList
                role={user?.role}
                section={activeSection}
                cases={sectionCases}
                onOpenCase={handleOpenCase}
              />
            </>
          ) : null}

          {mode === "list" && activeSection === "audit" && isAdmin ? (
            <AuditLog
              entries={auditEntries.map((e) => ({
                id: e.id,
                action: e.action,
                detail: e.detail,
                caseId: e.applicationId ? `KYC-${e.applicationId}` : "",
                actor: e.actorName,
                at: new Date(e.createdAt).getTime(),
              }))}
            />
          ) : null}

          {mode === "list" && activeSection === "users" && isAdmin ? <AdminUsersPanel /> : null}

          {mode === "list" && activeSection === "compliance" ? <CompliancePanel /> : null}

          {mode === "detail" ? (
            <div className="dash__panel">
              <div className="dash__panel-head">
                <div>
                  <h2 className="dash__panel-title">{viewingDetail?.fullName || "Untitled case"}</h2>
                  <span className="dash__panel-sub">KYC-{viewingAppId}</span>
                </div>
                <button type="button" className="btn--ghost" onClick={handleBackToList}>
                  Back to list
                </button>
              </div>

              {actionError ? <div className="alert alert--error" role="alert">{actionError}</div> : null}

              {!viewingDetail ? (
                <p className="dash__hint">Loading…</p>
              ) : (
                <>
                  <div className="case-detail-meta">
                    <span className={`status-pill status-pill--${viewingDetail.status === "APPROVED" ? "approved" : viewingDetail.status === "REJECTED" ? "rejected" : "progress"}`}>
                      {viewingDetail.status.replaceAll("_", " ")}
                    </span>
                    <span className="case-detail-meta__time">
                      {viewingDetail.submittedAt ? `Submitted ${new Date(viewingDetail.submittedAt).toLocaleString()}` : "Not yet submitted"}
                    </span>
                    <span className="case-detail-meta__time">
                      Assigned to {viewingDetail.assignedOfficerName || "unassigned"}
                    </span>
                  </div>

                  {isAdmin && officers.length > 0 ? (
                    <div className="field reassign-field">
                      <label className="field__label" htmlFor="reassign-select">Reassign to</label>
                      <select
                        id="reassign-select"
                        className="field__input"
                        defaultValue=""
                        onChange={(e) => handleReassign(e.target.value)}
                      >
                        <option value="" disabled>Choose an officer…</option>
                        {officers.map((o) => (
                          <option key={o.id} value={o.id}>{o.fullName} ({o.activeCaseCount} active)</option>
                        ))}
                      </select>
                    </div>
                  ) : null}

                  <DocumentReviewPanel
                    previews={viewingPreviews}
                    fields={fieldsFromApplication(viewingDetail)}
                    readOnly
                  />

                  {viewingDetail.correctionReason ? (
                    <div className="dash__notes">
                      <p className="dash__notes-title">Correction requested</p>
                      <p>{viewingDetail.correctionReason}</p>
                    </div>
                  ) : null}

                  <div className="dash__panel dash__panel--stacked">
                    <div className="dash__panel-head">
                      <h2 className="dash__panel-title">Verification checklist</h2>
                    </div>
                    <VerificationChecklist
                      checks={viewingDetail.verificationChecks}
                      onRecord={handleRecordCheck}
                      readOnly={!canDecide}
                    />
                  </div>

                  {canDecide ? (
                    <div className="dash__panel dash__panel--stacked">
                      <div className="dash__panel-head">
                        <h2 className="dash__panel-title">Decision</h2>
                      </div>
                      <DecisionStep onFinalize={handleFinalizeDecision} />
                    </div>
                  ) : null}
                </>
              )}
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}

// Role gating happens in middleware.js, before this page ever renders —
// no client-side guard needed here.
export default ReviewerDashboardPage;
