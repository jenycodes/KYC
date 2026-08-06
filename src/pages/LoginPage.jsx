import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import FormField from "../components/FormField.jsx";
import PasswordField from "../components/PasswordField.jsx";
import { isValidEmail } from "../utils/validators.js";
import "../styles/forms.css";

const INITIAL = { email: "", password: "" };

function LoginPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [remember, setRemember] = useState(true);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error

  function update(field) {
    return (e) => {
      setValues((v) => ({ ...v, [field]: e.target.value }));
      if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }));
    };
  }

  function validate() {
    const next = {};
    if (!values.email.trim()) next.email = "Enter your work email.";
    else if (!isValidEmail(values.email)) next.email = "Enter a valid email address.";
    if (!values.password) next.password = "Enter your password.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setStatus("loading");
    // TODO: replace with POST /api/auth/login against the Spring Security / JWT backend.
    await new Promise((resolve) => setTimeout(resolve, 900));
    setStatus("success");
    setTimeout(() => navigate("/verify"), 900);
  }

  return (
    <AuthLayout
      eyebrow="Reviewer access"
      title="Log in to your verification console"
      subtitle="Enter your credentials to continue verifying customer identities."
      footer={
        <>
          New to Secure KYC? <Link to="/register" className="form__link">Create an account</Link>
        </>
      }
    >
      {status === "success" ? (
        <div className="alert alert--success" role="status">
          Signed in successfully. Redirecting to your dashboard…
        </div>
      ) : (
        <form className="form" onSubmit={handleSubmit} noValidate>
          {status === "error" ? (
            <div className="alert alert--error" role="alert">
              We couldn't verify those credentials. Please try again.
            </div>
          ) : null}

          <FormField
            id="email"
            label="Work email"
            type="email"
            autoComplete="email"
            placeholder="you@bank.com"
            value={values.email}
            onChange={update("email")}
            error={errors.email}
            required
          />

          <PasswordField
            id="password"
            label="Password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={values.password}
            onChange={update("password")}
            error={errors.password}
            required
          />

          <div className="form__between">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember this device
            </label>
            <a href="#reset" className="form__link">
              Forgot password?
            </a>
          </div>

          <button type="submit" className="btn btn--primary" disabled={status === "loading"}>
            {status === "loading" ? (
              <>
                <span className="btn__spinner" aria-hidden="true" />
                Signing in…
              </>
            ) : (
              "Log in"
            )}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}

export default LoginPage;
