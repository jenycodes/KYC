"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "../../../components/AuthLayout.jsx";
import FormField from "../../../components/FormField.jsx";
import { isValidLoginEmail } from "../../../utils/validators.js";
import { forgotPassword } from "../../../utils/authApi.js";
import "../../../styles/forms.css";

const INITIAL = {
  email: "",
};

function ForgotPasswordPage() {
  const router = useRouter();
  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    setValues(INITIAL);
  }, []);

  function validate() {
    const next = {};

    if (!values.email.trim()) {
      next.email = "Enter the email associated with your account.";
    } else if (!isValidLoginEmail(values.email)) {
      next.email = "Use a valid email address.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validate()) return;

    setStatus("loading");
    setErrors((er) => ({ ...er, form: undefined }));

    try {
      await forgotPassword(values.email);
      setStatus("success");
    } catch (error) {
      setErrors((er) => ({
        ...er,
        form: error.message || "We couldn't send the reset instructions.",
      }));
      setStatus("error");
    }
  }

  return (
    <AuthLayout
      eyebrow="Account recovery"
      title="Forgot your password?"
      subtitle="Enter the email associated with your account and we will send the reset instructions to that address."
      footer={
        <>
          Remembered your password?{" "}
          <Link href="/login" className="form__link">
            Back to log in
          </Link>
        </>
      }
    >
      {status === "success" ? (
        <>
          <div className="alert alert--success" role="status">
            ✓ Password reset instructions have been sent to {values.email}. Open the email and click the reset
            link to continue &mdash; it expires in 15 minutes.
          </div>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => router.push("/login")}
          >
            Return to sign in
          </button>
        </>
      ) : (
        <form className="form" onSubmit={handleSubmit} noValidate>
          {status === "error" ? (
            <div className="alert alert--error" role="alert">
              {errors.form || "We couldn't prepare your reset request. Please try again."}
            </div>
          ) : null}

          <FormField
            id="email"
            label="Work email"
            type="email"
            autoComplete="email"
            placeholder=""
            value={values.email}
            onChange={(e) => {
              setValues((v) => ({ ...v, email: e.target.value }));
              if (errors.email) {
                setErrors((er) => ({ ...er, email: undefined }));
              }
            }}
            error={errors.email}
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
                Sending…
              </>
            ) : (
              "Send reset link"
            )}
          </button>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => router.push("/login")}
          >
            Return to sign in
          </button>
        </form>
      )}
    </AuthLayout>
  );
}

export default ForgotPasswordPage;
