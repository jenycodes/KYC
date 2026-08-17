import { useState } from "react";

const CONFIDENCE_LABEL = { high: "High", medium: "Medium", low: "Low" };

const DOC_TABS = [
  { key: "idFront", label: "ID — front" },
  { key: "idBack", label: "ID — back" },
  { key: "address", label: "Address" },
];

function ReviewStep({ previews, fields, onFieldChange, onAcknowledge, crossChecks, onContinue }) {
  const availableTabs = DOC_TABS.filter((t) => previews[t.key]);
  const [activeTab, setActiveTab] = useState(availableTabs[0]?.key ?? "idFront");

  const hasLowConfidence = fields.some((f) => f.confidence === "low" && !f.acknowledged);

  return (
    <div>
      <div className="review">
        <div className="review__doc">
          {availableTabs.length > 1 ? (
            <div className="review__doc-tabs">
              {availableTabs.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  className={`review__doc-tab${activeTab === t.key ? " review__doc-tab--active" : ""}`}
                  onClick={() => setActiveTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          ) : null}
          {previews[activeTab] ? (
            <img src={previews[activeTab]} alt="Uploaded document" />
          ) : (
            <span className="review__doc-empty">No preview available</span>
          )}
        </div>

        <div className="review__fields">
          {fields.map((field) => (
            <div className="review-field" key={field.key}>
              <div className="review-field__head">
                <label className="field__label" htmlFor={`field-${field.key}`}>
                  {field.label}
                </label>
                <span className={`confidence confidence--${field.confidence}`}>
                  {CONFIDENCE_LABEL[field.confidence]} confidence
                </span>
              </div>
              <input
                id={`field-${field.key}`}
                className={`field__input${field.confidence === "low" ? " field__input--error" : ""}`}
                value={field.value}
                onChange={(e) => onFieldChange(field.key, e.target.value)}
              />
              {field.confidence === "low" ? (
                <>
                  <p className="field__error">
                    OCR wasn't confident here, please confirm this value against the document.
                  </p>
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={Boolean(field.acknowledged)}
                      onChange={(e) => onAcknowledge(field.key, e.target.checked)}
                    />
                    I've checked this against the document
                  </label>
                </>
              ) : null}
            </div>
          ))}

          <div className="crosscheck">
            <p className="crosscheck__title">Cross-check against registration</p>
            {crossChecks.map((row) => (
              <div className="crosscheck__row" key={row.label}>
                <span>{row.label}</span>
                <span
                  className={`crosscheck__status crosscheck__status--${row.ok ? "ok" : "warn"}`}
                >
                  {row.ok ? (
                    <svg viewBox="0 0 16 16" width="12" height="12">
                      <path
                        d="M3 8.5 6.2 11.5 13 4.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 16 16" width="12" height="12">
                      <path
                        d="M4 4l8 8m0-8-8 8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                  {row.ok ? "Match" : "Mismatch"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        className="btn btn--primary review__continue"
        disabled={hasLowConfidence}
        onClick={onContinue}
      >
        {hasLowConfidence ? "Confirm flagged fields to continue" : "Continue to decision"}
      </button>
    </div>
  );
}

export default ReviewStep;
