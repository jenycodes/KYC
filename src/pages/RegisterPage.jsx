import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import FormField from "../components/FormField.jsx";
import PasswordField from "../components/PasswordField.jsx";
import { isValidEmail, isStrongEnough } from "../utils/validators.js";
import "../styles/forms.css";

const INITIAL = {
  fullName: "",
  email: "",
  employeeId: "",
  password: "",
  confirmPassword: "",
};

function RegisterPage() {
  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | loading | success

  function update(field) {
    return (e) => {
      setValues((v) => ({ ...v, [field]: e.target.value }));
      if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }));
    };
  }

  function validate() {
    const next = {};
    if (!values.fullName.trim()) next.fullName = "Enter your full name.";

    if (!values.email.trim()) next.email = "Enter your work email.";
    else if (!isValidEmail(values.email)) next.email = "Enter a valid email address.";

    if (!values.employeeId.trim()) next.employeeId = "Enter your employee ID.";

    if (!values.password) next.password = "Choose a password.";
    else if (!isStrongEnough(values.password))
      next.password = "Use at least 8 characters.";

    if (!values.confirmPassword) next.confirmPassword = "Confirm your password.";
    else if (values.confirmPassword !== values.password)
      next.confirmPassword = "Passwords don't match.";

    if (!agreed) next.agreed = "You must accept the access policy to continue.";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setStatus("loading");
    // TODO: replace with POST /api/auth/register against the Spring Security / JWT backend.
    await new Promise((resolve) => setTimeout(resolve, 900));
    setStatus("success");
  }

  return (
    <AuthLayout
      eyebrow="Team onboarding"
      title="Create your account"
      subtitle="Register with your organization email to request reviewer access."
      footer={
        <>
          Already have an account? <Link to="/login" className="form__link">Log in</Link>
        </>
      }
    >
      {status === "success" ? (
        <div className="alert alert--success" role="status">
          Account request submitted. Check your inbox to verify your email
          and finish setting up access.
        </div>
      ) : (
        <form className="form" onSubmit={handleSubmit} noValidate>
          <FormField
            id="fullName"
            label="Full name"
            autoComplete="name"
            placeholder="Anjali Rao"
            value={values.fullName}
            onChange={update("fullName")}
            error={errors.fullName}
            required
          />

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

          <FormField
            id="employeeId"
            label="Employee ID"
            autoComplete="off"
            placeholder="EMP-00482"
            value={values.employeeId}
            onChange={update("employeeId")}
            error={errors.employeeId}
            required
          />

          <PasswordField
            id="password"
            label="Password"
            placeholder="At least 8 characters"
            value={values.password}
            onChange={update("password")}
            error={errors.password}
            showStrength
            required
          />

          <PasswordField
            id="confirmPassword"
            label="Confirm password"
            placeholder="Re-enter your password"
            value={values.confirmPassword}
            onChange={update("confirmPassword")}
            error={errors.confirmPassword}
            required
          />

          <div className="field">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => {
                  setAgreed(e.target.checked);
                  if (errors.agreed) setErrors((er) => ({ ...er, agreed: undefined }));
                }}
              />
              I agree to the data access &amp; confidentiality policy
            </label>
            {errors.agreed ? (
              <p className="field__error" role="alert">
                {errors.agreed}
              </p>
            ) : null}
          </div>

          <button type="submit" className="btn btn--primary" disabled={status === "loading"}>
            {status === "loading" ? (
              <>
                <span className="btn__spinner" aria-hidden="true" />
                Creating account…
              </>
            ) : (
              "Create account"
            )}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}

export default RegisterPage;
