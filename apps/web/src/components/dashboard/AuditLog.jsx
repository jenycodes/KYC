const ACTION_LABELS = {
  created: "Case created",
  submitted: "Submitted by customer",
  resubmitted: "Resubmitted by customer",
  pending: "Marked as pending",
  approved: "Case approved",
  rejected: "Case rejected",
  "requested additional information": "Additional information requested",
  escalated: "Escalated for investigation",
  reassigned: "Reassigned to a different officer",
  uploaded: "Documents uploaded",
  logout: "Signed out",
};

function formatTime(ms) {
  return new Date(ms).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function AuditLog({ entries }) {
  if (entries.length === 0) {
    return (
      <div className="audit-log">
        <h3 className="panel-title">Audit trail</h3>
        <p className="panel-empty">No activity recorded yet. Actions will appear here as you work.</p>
      </div>
    );
  }

  return (
    <div className="audit-log">
      <h3 className="panel-title">Audit trail</h3>
      <ul className="audit-log__list">
        {entries.map((entry) => (
          <li key={entry.id} className="audit-log__item">
            <div className="audit-log__dot" aria-hidden="true" />
            <div className="audit-log__body">
              <p className="audit-log__action">
                {ACTION_LABELS[entry.action] || entry.action}
                {entry.caseId ? (
                  <span className="audit-log__case"> · {entry.caseId}</span>
                ) : null}
              </p>
              <p className="audit-log__meta">
                {entry.actor || "Reviewer"} · {formatTime(entry.at)}
              </p>
              {entry.detail ? <p className="audit-log__detail">{entry.detail}</p> : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AuditLog;
