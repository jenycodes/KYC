import { useState } from "react";

const GROUPS = [
  {
    title: "Identity verification",
    checks: [
      { type: "NAME", label: "Name" },
      { type: "DATE_OF_BIRTH", label: "Date of birth" },
      { type: "ID_NUMBER", label: "Identification number" },
      { type: "PHOTOGRAPH", label: "Photograph" },
      { type: "DOCUMENT_VALIDITY", label: "Document validity" },
    ],
  },
  {
    title: "Address verification",
    checks: [{ type: "ADDRESS", label: "Submitted address" }],
  },
  {
    title: "Document verification",
    checks: [
      { type: "DOCUMENT_TYPE", label: "Document type" },
      { type: "DOCUMENT_COMPLETENESS", label: "Document completeness" },
    ],
  },
];

const STATUS_OPTIONS = [
  { value: "VERIFIED", label: "Verify" },
  { value: "FAILED", label: "Fail" },
  { value: "REQUIRES_CLARIFICATION", label: "Clarify" },
];

function statusLabel(status) {
  switch (status) {
    case "VERIFIED": return "Verified";
    case "FAILED": return "Failed";
    case "REQUIRES_CLARIFICATION": return "Needs clarification";
    default: return "Pending";
  }
}

function CheckRow({ checkType, label, existing, onRecord, readOnly }) {
  const [remarks, setRemarks] = useState(existing?.remarks || "");
  const status = existing?.status || "PENDING";

  return (
    <div className="verify-row">
      <div className="verify-row__head">
        <span className="verify-row__label">{label}</span>
        <span className={`status-pill status-pill--${status === "VERIFIED" ? "approved" : status === "FAILED" ? "rejected" : "progress"}`}>
          {statusLabel(status)}
        </span>
      </div>

      {!readOnly ? (
        <div className="verify-row__actions">
          <input
            className="field__input verify-row__remarks"
            placeholder="Remarks (optional)"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className="btn--ghost verify-row__btn"
              onClick={() => onRecord(checkType, opt.value, remarks)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      ) : existing?.remarks ? (
        <p className="verify-row__remarks-readonly">{existing.remarks}</p>
      ) : null}
    </div>
  );
}

function VerificationChecklist({ checks, onRecord, readOnly = false }) {
  const byType = Object.fromEntries((checks || []).map((c) => [c.checkType, c]));

  return (
    <div className="verify-checklist">
      {GROUPS.map((group) => (
        <div className="verify-group" key={group.title}>
          <h4 className="verify-group__title">{group.title}</h4>
          {group.checks.map((c) => (
            <CheckRow
              key={c.type}
              checkType={c.type}
              label={c.label}
              existing={byType[c.type]}
              onRecord={onRecord}
              readOnly={readOnly}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default VerificationChecklist;
