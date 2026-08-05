import ScanIllustration from "./ScanIllustration.jsx";
import "./AuthLayout.css";

/**
 * Two-pane authentication shell shared by /login and /register.
 * The brand pane collapses to a slim header on narrow viewports.
 */
function AuthLayout({ eyebrow, title, subtitle, children, footer }) {
  return (
    <div className="auth">
      <aside className="auth__brand">
        <div className="auth__brand-top">
          <div className="auth__mark">
            <svg viewBox="0 0 24 24" width="18" height="18">
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
          <span className="auth__wordmark">Secure KYC</span>
        </div>

        <div className="auth__brand-body">
          <h1 className="auth__headline">
            Every identity,
            <br />
            checked and cleared.
          </h1>
          <p className="auth__sub">
            One verification hub for document capture, OCR extraction, and
            reviewer sign-off — built for compliance teams who move fast
            without cutting corners.
          </p>
          <ScanIllustration />
        </div>

        <p className="auth__brand-foot">
          Secured with 256-bit encryption &amp; role-based access
        </p>
      </aside>

      <main className="auth__panel">
        <div className="auth__form-wrap">
          <div className="auth__form-head">
            {eyebrow ? <span className="auth__eyebrow">{eyebrow}</span> : null}
            <h2 className="auth__title">{title}</h2>
            {subtitle ? <p className="auth__subtitle">{subtitle}</p> : null}
          </div>

          {children}

          {footer ? <div className="auth__footer">{footer}</div> : null}
        </div>
      </main>
    </div>
  );
}

export default AuthLayout;
