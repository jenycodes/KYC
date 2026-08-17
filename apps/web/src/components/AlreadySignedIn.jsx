import { useNavigate } from "react-router-dom";
import { homePathForRole, logoutUser } from "../utils/caseStore.js";
import { logout as logoutOnServer } from "../utils/authApi.js";

function AlreadySignedIn({ user }) {
  const navigate = useNavigate();

  function handleContinue() {
    navigate(homePathForRole(user.role), { replace: true });
  }

  function handleSwitchAccount() {
    logoutOnServer().catch(() => {});
    logoutUser();
    navigate(0);
  }

  return (
    <div className="already-signed-in">
      <p className="already-signed-in__lead">
        You're already signed in as <strong>{user.name}</strong>
        {user.roleLabel ? ` (${user.roleLabel})` : ""} in another tab or session on this device.
      </p>
      <div className="already-signed-in__actions">
        <button type="button" className="btn btn--primary" onClick={handleContinue}>
          Continue to your dashboard
        </button>
        <button type="button" className="btn btn--secondary" onClick={handleSwitchAccount}>
          Log out &amp; use a different account
        </button>
      </div>
    </div>
  );
}

export default AlreadySignedIn;
