const PRIMARY_NAV = [
  {
    key: "overview",
    label: "Overview",
    icon: (
      <svg viewBox="0 0 20 20" width="16" height="16">
        <rect x="2.5" y="2.5" width="6" height="6" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <rect x="11.5" y="2.5" width="6" height="6" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <rect x="2.5" y="11.5" width="6" height="6" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <rect x="11.5" y="11.5" width="6" height="6" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
];

const QUEUE_NAV = [
  {
    key: "pending",
    label: "Pending",
    icon: (
      <svg viewBox="0 0 20 20" width="16" height="16">
        <circle cx="10" cy="10" r="7.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M10 6v4.3l3 1.9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: "approved",
    label: "Approved",
    icon: (
      <svg viewBox="0 0 20 20" width="16" height="16">
        <path d="M3.5 10.5 8 15l8.5-9.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: "rejected",
    label: "Rejected",
    icon: (
      <svg viewBox="0 0 20 20" width="16" height="16">
        <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
];

const AUDIT_NAV = {
  key: "audit",
  label: "Audit log",
  icon: (
    <svg viewBox="0 0 20 20" width="16" height="16">
      <path d="M6 3.5h8v13H6z" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 7h4M8 10h4M8 13h2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
};

const ADMIN_USERS_NAV = {
  key: "users",
  label: "Officers & users",
  icon: (
    <svg viewBox="0 0 20 20" width="16" height="16">
      <circle cx="7" cy="7" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M2.8 16c.6-3 2.2-4.6 4.2-4.6s3.6 1.6 4.2 4.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="14.5" cy="6.5" r="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12.3 16c.4-2.3 1.6-3.6 3-3.8" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
};

const SECONDARY_NAV = [
  {
    key: "compliance",
    label: "Compliance",
    icon: (
      <svg viewBox="0 0 20 20" width="16" height="16">
        <path
          d="M10 2.5 16.5 5v5c0 3.6-2.5 6-6.5 7-4-1-6.5-3.4-6.5-7V5Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path d="M7.5 10 9.5 12 13 8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

function NavButton({ section, activeSection, counts, onSelectSection }) {
  const count = counts[section.key];

  return (
    <button
      type="button"
      className={`dash__nav-item${activeSection === section.key ? " dash__nav-item--active" : ""}`}
      onClick={() => onSelectSection(section.key)}
    >
      <span className="dash__nav-icon" aria-hidden="true">
        {section.icon}
      </span>
      <span className="dash__nav-label">{section.label}</span>
      {count !== undefined ? (
        <span className="dash__nav-count">{count}</span>
      ) : null}
    </button>
  );
}

function Sidebar({
  role,
  counts,
  activeSection,
  onSelectSection,
  onNewVerification,
  onLogout,
  user,
}) {
  const isCustomer = role === "CUSTOMER";
  const governanceNav = role === "ADMIN" ? [AUDIT_NAV, ADMIN_USERS_NAV, ...SECONDARY_NAV] : SECONDARY_NAV;

  return (
    <aside className={`dash__sidebar${isCustomer ? " dash__sidebar--customer" : ""}`}>
      <div className="dash__brand">
        <div className="dash__mark">
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
        <div>
          <span className="dash__wordmark">Secure KYC</span>
          <span className="dash__tagline">{isCustomer ? "Customer portal" : "Reviewer portal"}</span>
        </div>
      </div>

      {isCustomer ? (
        <button type="button" className="dash__new-btn" onClick={onNewVerification}>
          <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true">
            <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          New verification
        </button>
      ) : null}

      <nav className="dash__nav" aria-label="Main navigation">
        {PRIMARY_NAV.map((section) => (
          <NavButton
            key={section.key}
            section={section}
            activeSection={activeSection}
            counts={counts}
            onSelectSection={onSelectSection}
          />
        ))}
      </nav>

      <p className="dash__nav-group">{isCustomer ? "My submissions" : "Case queues"}</p>
      <nav className="dash__nav" aria-label="Case queues">
        {QUEUE_NAV.map((section) => (
          <NavButton
            key={section.key}
            section={section}
            activeSection={activeSection}
            counts={counts}
            onSelectSection={onSelectSection}
          />
        ))}
      </nav>

      <p className="dash__nav-group">Governance</p>
      <nav className="dash__nav" aria-label="Governance">
        {governanceNav.map((section) => (
          <NavButton
            key={section.key}
            section={section}
            activeSection={activeSection}
            counts={counts}
            onSelectSection={onSelectSection}
          />
        ))}
      </nav>

      <div className="dash__sidebar-foot">
        {user ? (
          <div className="dash__profile">
            <span className="dash__profile-avatar">{user.avatar}</span>
            <div>
              <p className="dash__user">{user.name}</p>
              <p className="dash__user-email">{user.email}</p>
            </div>
          </div>
        ) : null}
        <button type="button" className="dash__logout-btn" onClick={onLogout}>
          Log out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
