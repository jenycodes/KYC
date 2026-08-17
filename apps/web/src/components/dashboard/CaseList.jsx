const SECTION_COPY = {
  REVIEWER: {
    pending: {
      heading: "Pending review",
      description: "Submissions waiting for review or a final decision.",
      empty: "No pending submissions right now. New customer submissions will appear here.",
    },
    approved: {
      heading: "Approved cases",
      description: "Identity checks that passed document and field validation.",
      empty: "No approved cases yet. Approved cases will appear here after you sign off.",
    },
    rejected: {
      heading: "Rejected cases",
      description: "Applications that failed verification or need resubmission.",
      empty: "No rejected cases yet.",
    },
  },
  CUSTOMER: {
    pending: {
      heading: "Pending review",
      description: "Your submissions awaiting a decision from our KYC team.",
      empty: "You don't have any submissions awaiting review.",
    },
    approved: {
      heading: "Approved",
      description: "Your identity verifications that passed review.",
      empty: "No approved submissions yet.",
    },
    rejected: {
      heading: "Rejected",
      description: "Submissions that didn't pass verification.",
      empty: "No rejected submissions.",
    },
  },
};

function formatTimestamp(ms) {
  return new Date(ms).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function docSummary(previews) {
  const count = ["idFront", "idBack", "address"].filter((k) => previews?.[k]).length;
  return count ? `${count} document${count > 1 ? "s" : ""}` : "No files";
}

function CaseList({ role, section, cases, onOpenCase, onNewVerification }) {
  const isCustomer = role === "CUSTOMER";
  const copy = (isCustomer ? SECTION_COPY.CUSTOMER : SECTION_COPY.REVIEWER)[section];

  return (
    <div className="case-list">
      <div className="case-list__head">
        <div>
          <h2 className="case-list__title">{copy.heading}</h2>
          <p className="case-list__desc">{copy.description}</p>
        </div>
        <span className="case-list__count">{cases.length}</span>
      </div>

      {cases.length === 0 ? (
        <div className="case-list__empty">
          <p>{copy.empty}</p>
          {isCustomer ? (
            <button type="button" className="btn btn--primary case-list__empty-btn" onClick={onNewVerification}>
              Start a new verification
            </button>
          ) : null}
        </div>
      ) : (
        <ul className="case-list__items">
          {cases.map((item) => (
            <li key={item.id}>
              <button type="button" className="case-card" onClick={() => onOpenCase(item.id)}>
                <div className="case-card__main">
                  <span className="case-card__name">
                    {item.fields.fullName?.trim() || "Untitled case"}
                  </span>
                  <span className="case-card__meta">
                    {item.id} · {docSummary(item.previews)} · Saved {formatTimestamp(item.savedAt)}
                  </span>
                  {item.fields.nationality || item.fields.docNumber ? (
                    <span className="case-card__tags">
                      {item.fields.nationality ? (
                        <span className="case-card__tag">{item.fields.nationality}</span>
                      ) : null}
                      {item.fields.docNumber ? (
                        <span className="case-card__tag case-card__tag--mono">{item.fields.docNumber}</span>
                      ) : null}
                    </span>
                  ) : null}
                </div>
                <span className={`status-pill status-pill--${item.status === "pending" ? "progress" : item.status}`}>
                  {item.status}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CaseList;
