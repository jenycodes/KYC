import { useEffect, useState } from "react";
import { activateUser, deactivateUser, listOfficers, listUsers } from "../../utils/applicationApi.js";

function AdminUsersPanel() {
  const [users, setUsers] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refresh() {
    try {
      const [userList, officerList] = await Promise.all([listUsers(), listOfficers()]);
      setUsers(userList);
      setOfficers(officerList);
    } catch (e) {
      setError(e.message || "Couldn't load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleToggleActive(user) {
    try {
      if (user.active) {
        await deactivateUser(user.id);
      } else {
        await activateUser(user.id);
      }
      await refresh();
    } catch (e) {
      setError(e.message || "Couldn't update this account.");
    }
  }

  if (loading) return <p className="dash__hint">Loading…</p>;

  return (
    <div className="admin-users">
      {error ? <div className="alert alert--error" role="alert">{error}</div> : null}

      <section className="overview__panel">
        <h3 className="panel-title">Officer workload</h3>
        {officers.length === 0 ? (
          <p className="panel-empty">No officers have registered yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Officer</th>
                <th>Reviewer ID</th>
                <th>Active cases</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {officers.map((o) => (
                <tr key={o.id}>
                  <td>
                    <div className="admin-table__name">{o.fullName}</div>
                    <div className="admin-table__email">{o.email}</div>
                  </td>
                  <td>{o.employeeId}</td>
                  <td>{o.activeCaseCount}</td>
                  <td>
                    <span className={`status-pill status-pill--${o.active ? "approved" : "rejected"}`}>
                      {o.active ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td>
                    <button type="button" className="btn--ghost btn--ghost-sm" onClick={() => handleToggleActive(o)}>
                      {o.active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="overview__panel">
        <h3 className="panel-title">All users</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="admin-table__name">{u.fullName}</div>
                  <div className="admin-table__email">{u.email}</div>
                </td>
                <td>
                  <span className={`role-pill role-pill--${u.role.toLowerCase()}`}>{u.role}</span>
                </td>
                <td>
                  <span className={`status-pill status-pill--${u.active ? "approved" : "rejected"}`}>
                    {u.active ? "Active" : "Deactivated"}
                  </span>
                </td>
                <td>
                  {u.role === "ADMIN" ? (
                    <span className="admin-table__locked">—</span>
                  ) : (
                    <button type="button" className="btn--ghost btn--ghost-sm" onClick={() => handleToggleActive(u)}>
                      {u.active ? "Deactivate" : "Activate"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default AdminUsersPanel;
