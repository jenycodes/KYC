function StatCard({ label, value, hint, tone = "default" }) {
  return (
    <article className={`stat-card stat-card--${tone}`}>
      <p className="stat-card__label">{label}</p>
      <p className="stat-card__value">{value}</p>
      {hint ? <p className="stat-card__hint">{hint}</p> : null}
    </article>
  );
}

function DashboardStats({ stats }) {
  return (
    <div className="stat-grid">
      <StatCard label="Total cases" value={stats.total} hint="All verifications on file" />
      <StatCard label="Pending review" value={stats.pending} tone="pending" hint="Awaiting decision" />
      <StatCard label="Approved" value={stats.approved} tone="approved" hint="Passed identity checks" />
      <StatCard label="Rejected" value={stats.rejected} tone="rejected" hint="Failed or incomplete" />
      {stats.approvalRate !== null ? (
        <StatCard
          label="Approval rate"
          value={`${stats.approvalRate}%`}
          tone="rate"
          hint="Of decided cases"
        />
      ) : null}
    </div>
  );
}

export default DashboardStats;
