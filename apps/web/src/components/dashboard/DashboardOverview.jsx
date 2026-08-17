function formatTimestamp(ms) {
  return new Date(ms).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function docSummary(previews) {
  const docs = [];
  if (previews?.idFront) docs.push("ID front");
  if (previews?.idBack) docs.push("ID back");
  if (previews?.address) docs.push("Address proof");
  return docs.length ? docs.join(", ") : "No documents";
}

const COPY = {
  CUSTOMER: {
    eyebrow: "Your KYC workspace",
    lead: "Upload your identity documents and track the status of your verification in one place.",
    statLabel: "Your submissions",
    statHint: "Total submitted",
    checklistTitle: "Verification checklist",
    tipTitle: "Tip",
    tip: "Upload a clear photo of your ID and a proof of address. Review the extracted details before submitting for approval.",
    recentTitle: "Your recent submissions",
    emptyRecent: "No submissions yet.",
  },
  REVIEWER: {
    eyebrow: "Reviewer workspace",
    lead: "Review submitted documents, verify extracted details, and record compliance decisions from one place.",
    statLabel: "Queue depth",
    statHint: "Cases waiting for you",
    checklistTitle: "Reviewer checklist",
    tipTitle: "Tip",
    tip: "Open a pending case, confirm the submitted details against the documents, then approve, reject, or request more information.",
    recentTitle: "Recent cases",
    emptyRecent: "No verifications yet.",
  },
};

function DashboardOverview({ role, user, stats, recentCases, onOpenCase, onNewVerification, onGoToSection }) {
  const isCustomer = role === "CUSTOMER";
  const copy = isCustomer ? COPY.CUSTOMER : COPY.REVIEWER;

  return (
    <div className="overview">
      <section className="overview__welcome">
        <p className="overview__eyebrow">{copy.eyebrow}</p>
        <h2 className="overview__heading">Welcome back, {user?.name?.split(" ")[0] || "there"}</h2>
        <p className="overview__lead">{copy.lead}</p>
        <div className="overview__actions">
          {isCustomer ? (
            <button type="button" className="btn btn--primary" onClick={onNewVerification}>
              Start new verification
            </button>
          ) : null}
          {stats.pending > 0 ? (
            <button
              type="button"
              className={isCustomer ? "btn btn--secondary" : "btn btn--primary"}
              onClick={() => onGoToSection("pending")}
            >
              {isCustomer ? `${stats.pending} awaiting review` : `Review ${stats.pending} pending`}
            </button>
          ) : null}
        </div>
      </section>

      <section className="overview__stats" aria-label="Case statistics">
        <div className="stat-grid stat-grid--overview">
          <article className="stat-card stat-card--default">
            <p className="stat-card__label">{copy.statLabel}</p>
            <p className="stat-card__value">{stats.pending}</p>
            <p className="stat-card__hint">{copy.statHint}</p>
          </article>
          <article className="stat-card stat-card--approved">
            <p className="stat-card__label">Approved</p>
            <p className="stat-card__value">{stats.approved}</p>
            <p className="stat-card__hint">Passed verification</p>
          </article>
          <article className="stat-card stat-card--rate">
            <p className="stat-card__label">Total processed</p>
            <p className="stat-card__value">{stats.total}</p>
            <p className="stat-card__hint">Lifetime on this device</p>
          </article>
        </div>
      </section>

      <div className="overview__grid">
        <section className="overview__panel">
          <div className="overview__panel-head">
            <h3 className="panel-title">{copy.recentTitle}</h3>
            {stats.total > 0 ? (
              <button type="button" className="btn--ghost btn--ghost-sm" onClick={() => onGoToSection("pending")}>
                View all
              </button>
            ) : null}
          </div>

          {recentCases.length === 0 ? (
            <div className="panel-empty panel-empty--compact">
              <p>{copy.emptyRecent}</p>
              {isCustomer ? (
                <button type="button" className="form__link" onClick={onNewVerification}>
                  Upload your first documents →
                </button>
              ) : null}
            </div>
          ) : (
            <ul className="overview__recent">
              {recentCases.map((item) => (
                <li key={item.id}>
                  <button type="button" className="overview__recent-item" onClick={() => onOpenCase(item.id)}>
                    <span className="overview__recent-name">
                      {item.fields.fullName?.trim() || "Untitled case"}
                    </span>
                    <span className="overview__recent-meta">
                      {item.id} · {docSummary(item.previews)}
                    </span>
                    <span className={`status-pill status-pill--${item.status === "pending" ? "progress" : item.status}`}>
                      {item.status}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="overview__panel">
          <h3 className="panel-title">{copy.checklistTitle}</h3>
          <ul className="checklist">
            <li className="checklist__item checklist__item--done">
              <span className="checklist__icon" aria-hidden="true">✓</span>
              Account authenticated
            </li>
            <li className="checklist__item checklist__item--done">
              <span className="checklist__icon" aria-hidden="true">✓</span>
              Secure session active
            </li>
            <li className={`checklist__item${stats.total > 0 ? " checklist__item--done" : ""}`}>
              <span className="checklist__icon" aria-hidden="true">{stats.total > 0 ? "✓" : "○"}</span>
              {isCustomer ? "Document submitted" : "At least one case on file"}
            </li>
            <li className={`checklist__item${stats.pending === 0 && stats.total > 0 ? " checklist__item--done" : ""}`}>
              <span className="checklist__icon" aria-hidden="true">
                {stats.pending === 0 && stats.total > 0 ? "✓" : "○"}
              </span>
              {isCustomer ? "No verification pending" : "Queue cleared"}
            </li>
          </ul>

          <div className="overview__tip">
            <p className="overview__tip-title">{copy.tipTitle}</p>
            <p>{copy.tip}</p>
          </div>
        </section>
      </div>

      <p className="overview__updated">
        Last refreshed {formatTimestamp(Date.now())}
      </p>
    </div>
  );
}

export default DashboardOverview;
