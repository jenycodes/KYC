const REQUIREMENTS = [
  {
    id: "id-doc",
    title: "Government-issued ID",
    detail: "Passport, national ID, or driving licence — front and back where applicable.",
    required: true,
  },
  {
    id: "address",
    title: "Proof of address",
    detail: "Utility bill, bank statement, or official letter dated within the last 90 days.",
    required: true,
  },
  {
    id: "liveness",
    title: "Liveness check",
    detail: "Selfie or video match against the ID portrait (coming soon).",
    required: false,
  },
  {
    id: "pep",
    title: "PEP / sanctions screening",
    detail: "Automated watchlist screening before final approval.",
    required: true,
  },
  {
    id: "retention",
    title: "Data retention policy",
    detail: "Documents stored for 5 years per AML regulations; access is audit-logged.",
    required: true,
  },
];

function CompliancePanel() {
  return (
    <div className="compliance">
      <div className="compliance__banner">
        <div className="compliance__banner-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path
              d="M12 2 21 5.4v6.7c0 5.4-3.7 8.9-9 9.9-5.3-1-9-4.5-9-9.9V5.4Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            />
          </svg>
        </div>
        <div>
          <p className="compliance__banner-title">AML / KYC compliance mode</p>
          <p className="compliance__banner-text">
            All reviewer actions are logged. Only approve cases when identity documents
            are clear, unexpired, and match the extracted fields.
          </p>
        </div>
      </div>

      <h3 className="panel-title">Verification requirements</h3>
      <ul className="compliance__list">
        {REQUIREMENTS.map((item) => (
          <li key={item.id} className="compliance__item">
            <div className="compliance__item-head">
              <span className="compliance__item-title">{item.title}</span>
              <span className={`compliance__badge${item.required ? "" : " compliance__badge--optional"}`}>
                {item.required ? "Required" : "Optional"}
              </span>
            </div>
            <p className="compliance__item-detail">{item.detail}</p>
          </li>
        ))}
      </ul>

      <div className="compliance__footer">
        <p>
          <strong>Regulatory reference:</strong> FATF Recommendation 10 — Customer Due Diligence.
          Escalate suspicious activity through your compliance officer.
        </p>
      </div>
    </div>
  );
}

export default CompliancePanel;
