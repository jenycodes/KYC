import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import AlreadySignedIn from "../components/AlreadySignedIn.jsx";
import FormField from "../components/FormField.jsx";
import PasswordField from "../components/PasswordField.jsx";
import { isStrongEnough, isValidEmail, isValidFullName } from "../utils/validators.js";
import { getCurrentUser, homePathForRole, isAuthenticated, loginUser } from "../utils/caseStore.js";
import { registerUser } from "../utils/authApi.js";
import "../styles/forms.css";

const INITIAL = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  agree: false,
};

function RegisterPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const alreadySignedInUser = isAuthenticated() ? getCurrentUser() : null;

  function update(field, isCheckbox = false) {
    return (e) => {
      const val = isCheckbox ? e.target.checked : e.target.value;

      setValues((v) => ({
        ...v,
        [field]: val,
      }));

      if (errors[field]) {
        setErrors((er) => ({
          ...er,
          [field]: undefined,
        }));
      }
    };
  }

  function validate() {
    const next = {};

    if (!values.fullName.trim()) {
      next.fullName = "Enter your full name.";
    } else if (!isValidFullName(values.fullName)) {
      next.fullName =
        "Use letters and spaces only, with each name at least 2 letters.";
    }

    if (!values.email.trim()) {
      next.email = "Enter your work email.";
    } else if (!isValidEmail(values.email)) {
      next.email =
        "Use a valid email ending in gmail.com, outlook.com, or yahoo.com.";
    }

    if (!values.password) {
      next.password = "Create a password.";
    } else if (!isStrongEnough(values.password)) {
      next.password =
        "Use at least 12 characters with upper/lowercase, a number, and a symbol.";
    }

    if (values.confirmPassword !== values.password) {
      next.confirmPassword = "Passwords do not match.";
    }

    if (!values.agree) {
      next.agree = "You must accept the terms of compliance access.";
    }

    setErrors(next);

    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validate()) return;

    setStatus("loading");

    setErrors((er) => ({
      ...er,
      form: undefined,
    }));

    try {
      const data = await registerUser({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });

      const user = loginUser({
        email: data.email,
        fullName: data.fullName,
        role: data.role,
        token: data.token,
      });
      setStatus("success");
      navigate(homePathForRole(user.role), { replace: true });
    } catch (error) {
      setErrors((er) => ({
        ...er,
        form: error.message || "Unable to connect to the server.",
      }));

      setStatus("error");
    }
  }

  return (
    <AuthLayout
      eyebrow="Account setup"
      title="Create your Secure KYC account"
      subtitle="Register your credentials to get started."
      footer={
        <>
          Already registered?{" "}
          <Link to="/login" className="form__link">
            Log in
          </Link>
        </>
      }
    >
      {status === "success" ? (
        <div className="alert alert--success" role="status">
          ✓ Account created successfully! Signing you in…
        </div>
      ) : alreadySignedInUser ? (
        <AlreadySignedIn user={alreadySignedInUser} />
      ) : (
        <form className="form" onSubmit={handleSubmit} noValidate>
          {status === "error" ? (
            <div className="alert alert--error" role="alert">
              {errors.form || "Registration failed. Please try again."}
              {errors.form?.toLowerCase().includes("already registered") ? (
                <>
                  {" "}
                  <Link to="/login" className="form__link">
                    Log in instead
                  </Link>
                </>
              ) : null}
            </div>
          ) : null}

          <FormField
            id="fullName"
            label="Full name"
            placeholder=""
            value={values.fullName}
            onChange={update("fullName")}
            error={errors.fullName}
            required
          />

          <FormField
            id="email"
            label="Work email"
            type="email"
            placeholder=""
            value={values.email}
            onChange={update("email")}
            error={errors.email}
            required
          />

          <PasswordField
            id="password"
            label="Password"
            placeholder=""
            value={values.password}
            onChange={update("password")}
            error={errors.password}
            showStrength
            required
          />

          <PasswordField
            id="confirmPassword"
            label="Confirm password"
            placeholder=""
            value={values.confirmPassword}
            onChange={update("confirmPassword")}
            error={errors.confirmPassword}
            required
          />

          <div className="field">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={values.agree}
                onChange={update("agree", true)}
              />
              I agree to compliance audit tracking & security terms
            </label>

            {errors.agree ? (
              <span className="field__error">{errors.agree}</span>
            ) : null}
          </div>

          <div className="field">
            <Link to="/forgot-password" className="form__link form__link--inline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="btn btn--primary"
            disabled={status === "loading"}
          >
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
