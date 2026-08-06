import { useState } from "react";

const OPTIONS = [
  {
    key: "approve",
    label: "Approve",
    className: "decision-btn--approve",
    icon: (
      <svg viewBox="0 0 20 20" width="18" height="18">
        <path
          d="M3.5 10.5 8 15l8.5-9.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: "info",
    label: "Request more info",
    className: "decision-btn--info",
    icon: (
      <svg viewBox="0 0 20 20" width="18" height="18">
        <circle cx="10" cy="10" r="7.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M10 9v4.4M10 6.6v.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "reject",
    label: "Reject",
    className: "decision-btn--reject",
    icon: (
      <svg viewBox="0 0 20 20" width="18" height="18">
        <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
];

const CONFIRM_COPY = {
  approve: "Approve this case? The customer will be notified and access will be granted.",
  reject: "Reject this case? The customer will be notified and the application will be closed.",
  info: "Send a request for more information? The case will stay open pending a reply.",
};

function DecisionStep({ onFinalize }) {
  const [choice, setChoice] = useState(null);
  const [notes, setNotes] = useState("");
  const [confirming, setConfirming] = useState(false);

  const canSubmit = choice && notes.trim().length > 0;

  function selectChoice(key) {
    setChoice(key);
    setConfirming(false);
  }

  return (
    <div className="decision">
      <div className="decision__actions">
        {OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            className={`decision-btn ${opt.className}${choice === opt.key ? " selected" : ""}`}
            onClick={() => selectChoice(opt.key)}
          >
            {opt.icon}
            {opt.label}
          </button>
        ))}
      </div>

      <div className="field">
        <label className="field__label" htmlFor="decision-notes">
          Reviewer notes
        </label>
        <textarea
          id="decision-notes"
          className="field__input decision__notes"
          rows={4}
          placeholder="Record what you checked and why — this is added to the audit trail."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {confirming && choice ? (
        <div className="decision__confirm">
          <span>{CONFIRM_COPY[choice]}</span>
          <div className="decision__confirm-actions">
            <button type="button" className="btn--ghost" onClick={() => setConfirming(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => onFinalize(choice, notes)}
            >
              Confirm
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="btn btn--primary"
          disabled={!canSubmit}
          onClick={() => setConfirming(true)}
        >
          Submit decision
        </button>
      )}
    </div>
  );
}

export default DecisionStep;
