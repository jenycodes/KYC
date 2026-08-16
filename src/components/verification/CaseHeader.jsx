const STATUS_META = {
  progress: { label: "In progress", className: "status-pill--progress" },
  pending: { label: "Pending decision", className: "status-pill--progress" },
  approved: { label: "Approved", className: "status-pill--approved" },
  rejected: { label: "Rejected", className: "status-pill--rejected" },
  info: { label: "Info requested", className: "status-pill--progress" },
};

function CaseHeader({ caseRef, customerName, startedLabel, status }) {
  const meta = STATUS_META[status] ?? STATUS_META.progress;

  return (
    <header className="topbar">
      <div className="topbar__brand">
        <div className="topbar__mark">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path
              d="M12 2 21 5.4v6.7c0 5.4-3.7 8.9-9 9.9-5.3-1-9-4.5-9-9.9V5.4Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <path
              d="M8 12.3 10.7 15 16 9.4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="topbar__wordmark">Secure KYC</span>
      </div>

      <div className="topbar__case">
        <span className="topbar__case-ref">{caseRef}</span>
        <span className="topbar__case-dot" aria-hidden="true">
          •
        </span>
        <span>{customerName}</span>
        <span className="topbar__case-dot" aria-hidden="true">
          •
        </span>
        <span>{startedLabel}</span>
        <span className={`status-pill ${meta.className}`}>{meta.label}</span>
      </div>
    </header>
  );
}

export default CaseHeader;
