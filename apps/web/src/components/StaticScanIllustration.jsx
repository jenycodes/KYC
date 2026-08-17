import "./ScanIllustration.css";

const CHECKS = [
  "Full name",
  "Date of birth",
  "Government ID",
  "Proof of address",
];

/**
 * Static non-animated brand document card for internal console sidebar.
 */
function StaticScanIllustration() {
  return (
    <div className="scan" aria-hidden="true" style={{ opacity: 0.9 }}>
      <div className="scan__card">
        <div className="scan__row">
          <div className="scan__photo">
            <svg viewBox="0 0 24 24" width="22" height="22">
              <circle cx="12" cy="8.5" r="3.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <path
                d="M4.8 19c1.2-3.4 4-5.1 7.2-5.1s6 1.7 7.2 5.1"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="scan__lines">
            <span className="scan__line scan__line--w70" />
            <span className="scan__line scan__line--w45" />
            <span className="scan__line scan__line--w55" />
          </div>
        </div>

        <div className="scan__mrz">
          <span>SECUREKYC&lt;&lt;ACCESS&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</span>
          <span>0042871639KYC9911048F3108117&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;12</span>
        </div>
      </div>

      <ul className="scan__checklist">
        {CHECKS.map((label) => (
          <li key={label} style={{ color: "var(--paper-0)" }}>
            <span
              className="scan__tick"
              style={{
                background: "var(--green-600)",
                borderColor: "var(--green-600)",
                color: "var(--paper-0)",
              }}
            >
              <svg viewBox="0 0 16 16" width="10" height="10">
                <path
                  d="M3 8.5 6.2 11.5 13 4.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default StaticScanIllustration;
