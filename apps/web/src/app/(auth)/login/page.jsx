"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "../../../components/AuthLayout.jsx";
import AlreadySignedIn from "../../../components/AlreadySignedIn.jsx";
import FormField from "../../../components/FormField.jsx";
import PasswordField from "../../../components/PasswordField.jsx";
import { isValidLoginEmail } from "../../../utils/validators.js";
import { homePathForRole, loginUser, useCurrentUser } from "../../../utils/caseStore.js";
import { loginWithPassword } from "../../../utils/authApi.js";
import { consumeSessionNotice } from "../../../utils/sessionNotice.js";
import "../../../styles/forms.css";

const INITIAL = {
  accountType: "CUSTOMER",
  email: "",
  password: "",
};

function LoginPage() {
  const router = useRouter();
  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [remember, setRemember] = useState(true);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [notice, setNotice] = useState(null);
  const alreadySignedInUser = useCurrentUser();

  useEffect(() => {
    setNotice(consumeSessionNotice());
  }, []);

  function update(field) {
    return (e) => {
      setValues((v) => ({
        ...v,
        [field]: e.target.value,
      }));

      if (errors[field]) {
        setErrors((er) => ({
          ...er,
          [field]: undefined,
        }));
      }
    };
  }

  function selectAccountType(accountType) {
    setValues((v) => ({ ...v, accountType }));
  }

  function validate() {
    const next = {};

    if (!values.email.trim()) {
      next.email = "Enter your work email.";
    } else if (!isValidLoginEmail(values.email)) {
      next.email = "Enter a valid email address.";
    }

    if (!values.password) {
      next.password = "Enter your password.";
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
      const data = await loginWithPassword({
        email: values.email,
        password: values.password,
        accountType: values.accountType,
      });

      const user = loginUser({
        email: data.email,
        fullName: data.fullName,
        role: data.role,
      });
      setStatus("success");
      router.replace(homePathForRole(user.role));
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
      eyebrow="Secure access"
      title="Log in to Secure KYC"
      subtitle="Enter your credentials to access your account."
      footer={
        <>
          New to Secure KYC?{" "}
          <Link href="/register" className="form__link">
            Create an account
          </Link>
        </>
      }
    >
      {status === "success" ? (
        <div className="alert alert--success" role="status">
          ✓ Signed in successfully. Redirecting to your dashboard…
        </div>
      ) : alreadySignedInUser ? (
        <AlreadySignedIn user={alreadySignedInUser} />
      ) : (
        <form className="form" onSubmit={handleSubmit} noValidate autoComplete="off">
          {notice && status !== "error" ? (
            <div className="alert alert--error" role="alert">
              {notice.message}
            </div>
          ) : null}

          <div className="field">
            <span className="field__label">Log in as</span>
            <div className="segmented" role="radiogroup" aria-label="Account type">
              {[["CUSTOMER", "Customer"], ["OFFICER", "KYC Officer"], ["ADMIN", "Admin"]].map(([type, label]) => (
                <button
                  key={type}
                  type="button"
                  role="radio"
                  aria-checked={values.accountType === type}
                  className={`segmented__option${values.accountType === type ? " segmented__option--active" : ""}`}
                  onClick={() => selectAccountType(type)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {status === "error" ? (
            <div className="alert alert--error" role="alert">
              {errors.form || "We couldn't sign you in. Please try again."}
            </div>
          ) : null}

          <FormField
            id="email"
            label="Work email"
            type="email"
            autoComplete="username"
            placeholder=""
            value={values.email}
            onChange={update("email")}
            error={errors.email}
            required
          />

          <PasswordField
            id="password"
            label="Password"
            autoComplete="off"
            placeholder=""
            value={values.password}
            onChange={update("password")}
            error={errors.password}
            showStrength={false}
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

            <Link href="/forgot-password" className="form__link">
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
