import { useId, useMemo, useState } from "react";

function scorePassword(password) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(score, 4);
}

const STRENGTH_META = [
  { label: "Very weak", color: "var(--red-600)" },
  { label: "Weak", color: "var(--red-600)" },
  { label: "Fair", color: "var(--blue-600)" },
  { label: "Good", color: "var(--blue-600)" },
  { label: "Strong", color: "var(--green-600)" },
];

function PasswordField({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  autoComplete = "new-password",
  placeholder,
  required = false,
  showStrength = false,
}) {
  const [visible, setVisible] = useState(false);
  const hintId = useId();
  const score = useMemo(() => scorePassword(value), [value]);
  const meta = STRENGTH_META[score];

  return (
    <div className="field">
      <label htmlFor={id} className="field__label">
        {label}
      </label>
      <div className="field__control">
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={
            [error ? `${id}-error` : null, showStrength ? hintId : null]
              .filter(Boolean)
              .join(" ") || undefined
          }
          className={`field__input${error ? " field__input--error" : ""}`}
        />
        <button
          type="button"
          className="field__toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <svg viewBox="0 0 20 20" width="18" height="18">
              <path
                d="M2.5 10.5S5.5 5 10 5s7.5 5.5 7.5 5.5-3 5.5-7.5 5.5S2.5 10.5 2.5 10.5Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <circle cx="10" cy="10.5" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.4" />
              <line x1="3.5" y1="17" x2="16.5" y2="4" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          ) : (
            <svg viewBox="0 0 20 20" width="18" height="18">
              <path
                d="M2.5 10.5S5.5 5 10 5s7.5 5.5 7.5 5.5-3 5.5-7.5 5.5S2.5 10.5 2.5 10.5Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <circle cx="10" cy="10.5" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          )}
        </button>
      </div>

      {showStrength && value ? (
        <div className="strength" id={hintId}>
          <div className="strength__bars">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="strength__bar"
                style={{
                  background: i < score ? meta.color : "var(--border)",
                }}
              />
            ))}
          </div>
          <span className="strength__label" style={{ color: meta.color }}>
            {meta.label}
          </span>
        </div>
      ) : null}

      {error ? (
        <p id={`${id}-error`} className="field__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default PasswordField;
