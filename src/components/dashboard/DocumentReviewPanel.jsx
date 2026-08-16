import { useState } from "react";

const DOC_TABS = [
  { key: "idFront", label: "ID — front" },
  { key: "idBack", label: "ID — back" },
  { key: "address", label: "Address" },
];

/**
 * Shared main-panel content for every status module: the uploaded
 * documents on one side, the extraction fields on the other. Fields arrive
 * pre-filled from the backend's OCR pass over the uploaded ID (see
 * CustomerDashboardPage's handleRunExtraction) — the caller is still
 * responsible for letting the customer review and correct them before
 * submitting. In readOnly mode (viewing an already-decided case) the inputs
 * are disabled and the save/continue actions are hidden.
 */
function DocumentReviewPanel({
  previews,
  fields,
  onFieldChange,
  onSavePending,
  onContinue,
  saveLabel = "Save & finish later",
  readOnly = false,
}) {
  const availableTabs = DOC_TABS.filter((t) => previews[t.key]);
  const [activeTab, setActiveTab] = useState(availableTabs[0]?.key ?? "idFront");

  return (
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
          <span className="review__doc-empty">No document uploaded</span>
        )}
      </div>

      <div className="review__fields">
        {fields.map((field, index) => {
          const isNewSection = field.section && field.section !== fields[index - 1]?.section;
          return (
            <div key={field.key}>
              {isNewSection ? <h4 className="review__section-title">{field.section}</h4> : null}
              <div className="review-field">
                <label className="field__label" htmlFor={`extract-${field.key}`}>
                  {field.label}
                </label>
                <input
                  id={`extract-${field.key}`}
                  className="field__input"
                  type={field.type === "date" ? "date" : "text"}
                  value={field.value}
                  placeholder={field.placeholder}
                  disabled={readOnly}
                  onChange={(e) => onFieldChange?.(field.key, e.target.value)}
                />
              </div>
            </div>
          );
        })}

        {!readOnly ? (
          <div className="review__actions">
            {onSavePending ? (
              <button type="button" className="btn--ghost" onClick={onSavePending}>
                {saveLabel}
              </button>
            ) : null}
            {onContinue ? (
              <button type="button" className="btn btn--primary" onClick={onContinue}>
                Continue to decision
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default DocumentReviewPanel;
