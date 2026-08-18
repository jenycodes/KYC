"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/dashboard/Sidebar.jsx";
import DashboardHeader from "../../../components/dashboard/DashboardHeader.jsx";
import DashboardOverview from "../../../components/dashboard/DashboardOverview.jsx";
import DashboardStats from "../../../components/dashboard/DashboardStats.jsx";
import CaseList from "../../../components/dashboard/CaseList.jsx";
import CompliancePanel from "../../../components/dashboard/CompliancePanel.jsx";
import ProcessingIndicator from "../../../components/dashboard/ProcessingIndicator.jsx";
import DocumentReviewPanel from "../../../components/dashboard/DocumentReviewPanel.jsx";
import UploadStep from "../../../components/verification/UploadStep.jsx";
import { logout as logoutOnServer } from "../../../utils/authApi.js";
import { logoutUser, useCurrentUser } from "../../../utils/caseStore.js";
import {
  createDraft,
  fetchDocumentPreviewUrl,
  getApplication,
  listMyApplications,
  resubmitApplication,
  submitApplication,
  updateDraft,
  uploadDocument,
} from "../../../utils/applicationApi.js";
import { ALL_FIELD_DEFS, fieldsFromApplication, fieldsToRequestBody } from "../../../utils/applicationFields.js";
import "../../../styles/forms.css";
import "../../../styles/verification.css";
import "../../../styles/dashboard.css";

const EMPTY_FILES = { idFront: null, idBack: null, address: null };
const SLOT_TO_DOCUMENT_TYPE = { idFront: "GOVERNMENT_ID", idBack: "SUPPORTING", address: "ADDRESS_PROOF" };

const VIEW_TITLES = {
  overview: { title: "Overview", subtitle: "Your verification status at a glance." },
  pending: { title: "Pending review", subtitle: "Your submissions awaiting a decision." },
  approved: { title: "Approved", subtitle: "Your verifications that passed review." },
  rejected: { title: "Rejected", subtitle: "Submissions that did not pass verification." },
  compliance: { title: "Compliance", subtitle: "What we check, and why we ask for it." },
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

function emptyFields() {
  return ALL_FIELD_DEFS.map((def) => ({ ...def, value: "" }));
}

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

function CustomerDashboardPage() {
  const router = useRouter();
  const user = useCurrentUser();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeSection, setActiveSection] = useState("overview");
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("list");

  const [draftId, setDraftId] = useState(null); // the application currently being worked on
  const [editingId, setEditingId] = useState(null); // non-null only when correcting a prior submission
  const [activeFiles, setActiveFiles] = useState(EMPTY_FILES);
  const [activePreviews, setActivePreviews] = useState(EMPTY_FILES);
  const [activeFields, setActiveFields] = useState(emptyFields);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [viewingAppId, setViewingAppId] = useState(null);
  const [viewingDetail, setViewingDetail] = useState(null);
  const [viewingPreviews, setViewingPreviews] = useState({});

  async function refresh() {
    try {
      const data = await listMyApplications();
      setApplications(data);
      setLoadError("");
    } catch (error) {
      // apiFetch already handles session-expiry redirects — this catches
      // everything else (the backend being unreachable, a 5xx, etc.) so the
      // user sees why their data isn't loading instead of a silent blank list.
      setLoadError(error.message || "Couldn't load your applications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const next = {};
    Object.entries(activeFiles).forEach(([key, file]) => {
      next[key] = file && file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
    });
    setActivePreviews(next);
    return () => {
      Object.values(next).forEach((url) => url && URL.revokeObjectURL(url));
    };
  }, [activeFiles]);

  function resetActiveFlow() {
    setActiveFiles(EMPTY_FILES);
    setActiveFields(emptyFields());
    setDraftId(null);
    setEditingId(null);
    setSubmitError("");
  }

  function startNewVerification() {
    resetActiveFlow();
    setMode("upload");
    setViewingAppId(null);
  }

  function selectSection(section) {
    setActiveSection(section);
    setViewingAppId(null);
    setMode("list");
    setSearch("");
  }

  function handleSelectUpload(key, file) {
    setActiveFiles((prev) => ({ ...prev, [key]: file }));
  }

  function handleRemoveUpload(key) {
    setActiveFiles((prev) => ({ ...prev, [key]: null }));
  }

  async function handleRunExtraction() {
    setMode("processing");
    setSubmitError("");

    try {
      const application = draftId
        ? await updateDraft(draftId, fieldsToRequestBody(activeFields))
        : await createDraft(fieldsToRequestBody(activeFields));
      setDraftId(application.id);

      let extracted = {};
      const uploads = Object.entries(activeFiles).filter(([, file]) => file);
      for (const [slot, file] of uploads) {
        const result = await uploadDocument(application.id, SLOT_TO_DOCUMENT_TYPE[slot], file);
        if (result.extractedFields) {
          extracted = { ...extracted, ...result.extractedFields };
        }
      }

      if (Object.keys(extracted).length > 0) {
        setActiveFields((prev) => prev.map((f) => (
          extracted[f.key] ? { ...f, value: extracted[f.key] } : f
        )));
      }

      setMode("review");
    } catch (error) {
      setSubmitError(error.message || "We couldn't process your documents. Please try again.");
      setMode("upload");
    }
  }

  function handleFieldChange(key, value) {
    setActiveFields((prev) => prev.map((f) => (f.key === key ? { ...f, value } : f)));
  }

  async function handleSubmitForReview() {
    if (!draftId) {
      setSubmitError("Please upload your documents before submitting.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      await updateDraft(draftId, fieldsToRequestBody(activeFields));

      if (editingId) {
        await resubmitApplication(draftId);
      } else {
        await submitApplication(draftId);
      }

      await refresh();
      resetActiveFlow();
      setActiveSection("pending");
      setMode("list");
    } catch (error) {
      setSubmitError(error.message || "We couldn't submit your application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleOpenCase(caseId) {
    const appId = Number(caseId.replace("KYC-", ""));
    setViewingAppId(appId);
    setMode("detail");
    setViewingDetail(null);
    setViewingPreviews({});

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
    } catch {
      // leave the panel showing a "couldn't load" state via viewingDetail staying null
    }
  }

  function handleBackToList() {
    setViewingAppId(null);
    setViewingDetail(null);
    setMode("list");
  }

  function handleStartCorrection() {
    if (!viewingDetail) return;
    setDraftId(viewingDetail.id);
    setEditingId(viewingDetail.id);
    setActiveFields(fieldsFromApplication(viewingDetail));
    setActiveFiles(EMPTY_FILES);
    setSubmitError("");
    setMode("review");
  }

  function handleLogout() {
    logoutOnServer().catch(() => {});
    logoutUser();
    router.replace("/login");
  }

  const cases = useMemo(() => applications.map(toCaseShape), [applications]);

  const stats = useMemo(() => {
    const pending = cases.filter((c) => STATUS_TO_SECTION[c.rawStatus] === "pending").length;
    const approved = cases.filter((c) => c.rawStatus === "APPROVED").length;
    const rejected = cases.filter((c) => c.rawStatus === "REJECTED").length;
    return { total: cases.length, pending, approved, rejected, approvalRate: null };
  }, [cases]);

  const counts = { pending: stats.pending, approved: stats.approved, rejected: stats.rejected };

  const sectionCases = useMemo(() => {
    const filtered = cases.filter((c) => STATUS_TO_SECTION[c.rawStatus] === activeSection);
    return filterCases(filtered, search);
  }, [cases, activeSection, search]);

  const recentCases = useMemo(
    () => [...cases].sort((a, b) => b.savedAt - a.savedAt).slice(0, 5),
    [cases]
  );

  const canContinueUpload = activeFiles.idFront && activeFiles.address;
  const viewMeta = VIEW_TITLES[activeSection] || VIEW_TITLES.overview;
  const showSearch = ["pending", "approved", "rejected"].includes(activeSection) && mode === "list";
  const needsCorrection = viewingDetail?.status === "ADDITIONAL_INFO_REQUIRED";

  return (
    <div className="dash">
      <Sidebar
        role="CUSTOMER"
        counts={counts}
        activeSection={activeSection}
        onSelectSection={selectSection}
        onNewVerification={startNewVerification}
        onLogout={handleLogout}
        user={user}
      />

      <div className="dash__content">
        <DashboardHeader
          title={mode === "detail" && viewingDetail
            ? viewingDetail.fullName || "Submission detail"
            : mode !== "list"
              ? (editingId ? "Update your submission" : "New verification")
              : viewMeta.title}
          subtitle={
            mode === "detail" && viewingDetail
              ? `KYC-${viewingDetail.id}`
              : mode !== "list"
                ? "Upload your documents, confirm the details, then submit for review."
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
              role="CUSTOMER"
              user={user}
              stats={stats}
              recentCases={recentCases}
              onOpenCase={handleOpenCase}
              onNewVerification={startNewVerification}
              onGoToSection={selectSection}
            />
          ) : null}

          {!loading && !loadError && mode === "list" && ["pending", "approved", "rejected"].includes(activeSection) ? (
            <>
              <DashboardStats stats={stats} />
              <CaseList
                role="CUSTOMER"
                section={activeSection}
                cases={sectionCases}
                onOpenCase={handleOpenCase}
                onNewVerification={startNewVerification}
              />
            </>
          ) : null}

          {mode === "list" && activeSection === "compliance" ? <CompliancePanel /> : null}

          {mode === "upload" ? (
            <div className="dash__panel">
              <div className="dash__panel-head">
                <h2 className="dash__panel-title">New verification</h2>
                <button type="button" className="btn--ghost" onClick={() => setMode("list")}>
                  Cancel
                </button>
              </div>
              {submitError ? (
                <div className="alert alert--error" role="alert">{submitError}</div>
              ) : null}
              <UploadStep
                files={activeFiles}
                previews={activePreviews}
                onSelect={handleSelectUpload}
                onRemove={handleRemoveUpload}
                onContinue={handleRunExtraction}
              />
              {!canContinueUpload ? (
                <p className="dash__hint">Upload your ID front and a proof of address to continue.</p>
              ) : null}
            </div>
          ) : null}

          {mode === "processing" ? (
            <div className="dash__panel">
              <ProcessingIndicator />
            </div>
          ) : null}

          {mode === "review" ? (
            <div className="dash__panel">
              <div className="dash__panel-head">
                <h2 className="dash__panel-title">Confirm your details</h2>
              </div>
              <p className="dash__hint">
                We've pre-filled what OCR could read from your documents — please check every
                field carefully and correct anything that isn't right before submitting.
              </p>
              {submitError ? (
                <div className="alert alert--error" role="alert">{submitError}</div>
              ) : null}
              <DocumentReviewPanel
                previews={activePreviews}
                fields={activeFields}
                onFieldChange={handleFieldChange}
                onSavePending={submitting ? undefined : handleSubmitForReview}
                saveLabel={submitting ? "Submitting…" : editingId ? "Resubmit" : "Submit for review"}
              />
            </div>
          ) : null}

          {mode === "detail" ? (
            <div className="dash__panel">
              <div className="dash__panel-head">
                <div>
                  <h2 className="dash__panel-title">
                    {viewingDetail?.fullName || "Untitled submission"}
                  </h2>
                  <span className="dash__panel-sub">KYC-{viewingAppId}</span>
                </div>
                <button type="button" className="btn--ghost" onClick={handleBackToList}>
                  Back to list
                </button>
              </div>

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
                  </div>

                  {needsCorrection ? (
                    <div className="dash__notes">
                      <p className="dash__notes-title">Additional information requested</p>
                      <p>{viewingDetail.correctionReason}</p>
                      <button type="button" className="btn btn--primary dash__notes-action" onClick={handleStartCorrection}>
                        Update &amp; resubmit
                      </button>
                    </div>
                  ) : null}

                  <DocumentReviewPanel
                    previews={viewingPreviews}
                    fields={fieldsFromApplication(viewingDetail)}
                    readOnly
                  />
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
export default CustomerDashboardPage;
