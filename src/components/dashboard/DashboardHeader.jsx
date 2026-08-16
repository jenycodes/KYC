import NotificationBell from "./NotificationBell.jsx";

function DashboardHeader({ title, subtitle, user, search, onSearchChange }) {
  return (
    <header className="dash-header">
      <div className="dash-header__intro">
        <h1 className="dash-header__title">{title}</h1>
        {subtitle ? <p className="dash-header__subtitle">{subtitle}</p> : null}
      </div>

      <div className="dash-header__actions">
        {onSearchChange ? (
          <label className="dash-header__search">
            <span className="sr-only">Search cases</span>
            <svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true">
              <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <path d="M13 13l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              placeholder="Search by name or case ID…"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </label>
        ) : null}

        <NotificationBell />

        <div className="dash-header__user" title={user?.email}>
          <span className="dash-header__avatar">{user?.avatar}</span>
          <div className="dash-header__user-meta">
            <span className="dash-header__user-name">{user?.name}</span>
            <span className="dash-header__user-role">{user?.roleLabel}</span>
          </div>
          {user?.role ? (
            <span className={`role-pill role-pill--${user.role.toLowerCase()}`}>{user.role}</span>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
