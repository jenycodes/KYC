const STEPS = [
  { key: "upload", label: "Upload documents" },
  { key: "processing", label: "Extracting data" },
  { key: "review", label: "Review & verify" },
  { key: "decision", label: "Decision" },
];

function Stepper({ current }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);

  return (
    <ol className="stepper">
      {STEPS.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <li className="stepper__step" key={step.key}>
            <span
              className={`stepper__circle${done ? " stepper__circle--done" : ""}${
                active ? " stepper__circle--active" : ""
              }`}
            >
              {done ? (
                <svg viewBox="0 0 16 16" width="10" height="10">
                  <path
                    d="M3 8.5 6.2 11.5 13 4.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                i + 1
              )}
            </span>
            <span className={`stepper__label${active ? " stepper__label--active" : ""}`}>
              {step.label}
            </span>
            {i < STEPS.length - 1 ? (
              <span className={`stepper__line${done ? " stepper__line--done" : ""}`} />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

export default Stepper;
