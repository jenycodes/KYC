"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "../../../components/AuthLayout.jsx";
import PasswordField from "../../../components/PasswordField.jsx";
import { isStrongEnough } from "../../../utils/validators.js";
import { resetPassword } from "../../../utils/authApi.js";
import "../../../styles/forms.css";

const INITIAL = {
  password: "",
  confirmPassword: "",
};

function ResetPasswordPage() {
  const router = useRouter();
  const query = useSearchParams();
  const token = useMemo(() => query.get("token") || "", [query]);
  const email = useMemo(() => query.get("email") || "", [query]);

  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    setValues(INITIAL);
    setErrors({});
    setStatus("idle");
  }, [query]);

  function update(field) {
    return (e) => {
      setValues((v) => ({
        ...v,
        [field]: e.target.value,
      }));

      if (errors[field]) {
        setErrors((er) => ({ ...er, [field]: undefined }));
      }
    };
  }

  function validate() {
    const next = {};

    if (!values.password) {
      next.password = "Create a new password.";
    } else if (!isStrongEnough(values.password)) {
      next.password =
        "Use at least 12 characters with upper/lowercase, a number, and a symbol.";
    }

    if (!values.confirmPassword) {
      next.confirmPassword = "Please confirm your new password.";
    } else if (values.confirmPassword !== values.password) {
      next.confirmPassword = "Passwords do not match.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validate()) return;

    if (!token) {
      setErrors((er) => ({
        ...er,
        form: "This reset link is invalid. Use the link sent to your email to continue.",
      }));
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrors((er) => ({ ...er, form: undefined }));

    try {
      await resetPassword({ token, password: values.password, confirmPassword: values.confirmPassword });
      setStatus("success");
      setTimeout(() => router.push("/login"), 1500);
    } catch (error) {
      setErrors((er) => ({
        ...er,
        form: error.message || "We could not reset your password. Please try again.",
      }));
      setStatus("error");
    }
  }

  return (
    <AuthLayout
      eyebrow="Account recovery"
      title="Set a new password"
      subtitle={
        email
          ? `Create a new password for ${email}.`
          : "Create a new password for your Secure KYC account."
      }
      footer={
        <>
          Need to try again?{" "}
          <Link href="/forgot-password" className="form__link">
            Back to reset email
          </Link>
        </>
      }
    >
      {status === "success" ? (
        <div className="alert alert--success" role="status">
          ✓ Your password has been updated successfully. Redirecting to sign in…
        </div>
      ) : !token ? (
        <div className="alert alert--error" role="alert">
          This reset link is missing or invalid. Please request a new one from the{" "}
          <Link href="/forgot-password" className="form__link">
            forgot password
          </Link>{" "}
          page.
        </div>
      ) : (
        <form className="form" onSubmit={handleSubmit} noValidate>
          {status === "error" ? (
            <div className="alert alert--error" role="alert">
              {errors.form || "We couldn't reset your password. Please try again."}
            </div>
          ) : null}

          <PasswordField
            id="password"
            label="New password"
            autoComplete="new-password"
            placeholder=""
            value={values.password}
            onChange={update("password")}
            error={errors.password}
            showStrength
            required
          />

          <PasswordField
            id="confirmPassword"
            label="Confirm new password"
            autoComplete="new-password"
            placeholder=""
            value={values.confirmPassword}
            onChange={update("confirmPassword")}
            error={errors.confirmPassword}
            required
          />

          <button
            type="submit"
            className="btn btn--primary"
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              <>
                <span className="btn__spinner" aria-hidden="true" />
                Updating password…
              </>
            ) : (
              "Reset password"
            )}
          </button>

          <div className="form__helper">
            <Link href="/login" className="form__link">
              Return to sign in
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordPage />
    </Suspense>
  );
}
