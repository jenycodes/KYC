import { useEffect, useState } from "react";
import CaseHeader from "../components/verification/CaseHeader.jsx";
import Stepper from "../components/verification/Stepper.jsx";
import UploadStep from "../components/verification/UploadStep.jsx";
import ProcessingStep from "../components/verification/ProcessingStep.jsx";
import ReviewStep from "../components/verification/ReviewStep.jsx";
import DecisionStep from "../components/verification/DecisionStep.jsx";
import "../styles/verification.css";

const CASE = {
  ref: "KYC-2026-04821",
  customerName: "Rohan Verma",
  startedLabel: "Started just now",
};

const EMPTY_FILES = { idFront: null, idBack: null, address: null };

// Stand-in for what the Tesseract OCR service on the backend would return.
const MOCK_FIELDS = [
  { key: "fullName", label: "Full name", value: "ROHAN VERMA", confidence: "high" },
  { key: "dob", label: "Date of birth", value: "14 Mar 1991", confidence: "high" },
  { key: "docNumber", label: "Document number", value: "P1849206", confidence: "high" },
  { key: "expiry", label: "Expiry date", value: "22 Nov 2029", confidence: "medium" },
  { key: "nationality", label: "Nationality", value: "Indian", confidence: "high" },
  {
    key: "address",
    label: "Address",
    value: "44 MG Road, Bengaluru, Karnataka 560001",
    confidence: "low",
  },
];

const CROSS_CHECKS = [
  { label: "Name matches registration", ok: true },
  { label: "Date of birth matches registration", ok: true },
  { label: "Document MRZ checksum", ok: true },
];

const OUTCOME_META = {
  approve: { status: "approved", heading: "Case approved" },
  reject: { status: "rejected", heading: "Case rejected" },
  info: { status: "info", heading: "More information requested" },
};

function VerificationPage() {
  const [step, setStep] = useState("upload");
  const [files, setFiles] = useState(EMPTY_FILES);
  const [previews, setPreviews] = useState(EMPTY_FILES);
  const [fields, setFields] = useState([]);
  const [outcome, setOutcome] = useState(null);

  // Build (and clean up) object URLs whenever the selected files change.
  useEffect(() => {
    const next = {};
    Object.entries(files).forEach(([key, file]) => {
      next[key] = file && file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
    });
    setPreviews(next);
    return () => {
      Object.values(next).forEach((url) => url && URL.revokeObjectURL(url));
    };
  }, [files]);

  function handleSelect(key, file) {
    setFiles((prev) => ({ ...prev, [key]: file }));
  }

  function handleRemove(key) {
    setFiles((prev) => ({ ...prev, [key]: null }));
  }

  function handleStartVerification() {
    setStep("processing");
    // TODO: replace with the real OCR call, e.g. POST /api/verification/{caseId}/extract
    setTimeout(() => {
      setFields(MOCK_FIELDS.map((f) => ({ ...f, acknowledged: false })));
      setStep("review");
    }, 2200);
  }

  function handleFieldChange(key, value) {
    setFields((prev) => prev.map((f) => (f.key === key ? { ...f, value } : f)));
  }

  function handleAcknowledge(key, acknowledged) {
    setFields((prev) => prev.map((f) => (f.key === key ? { ...f, acknowledged } : f)));
  }

  function handleFinalize(choice, notes) {
    // TODO: replace with POST /api/verification/{caseId}/decision { choice, notes }
    setOutcome({ choice, notes });
    setStep("done");
  }

  function handleReset() {
    setFiles(EMPTY_FILES);
    setFields([]);
    setOutcome(null);
    setStep("upload");
  }

  const status = outcome
    ? OUTCOME_META[outcome.choice].status
    : step === "decision"
    ? "pending"
    : "progress";

  return (
    <div className="verify-shell">
      <CaseHeader
        caseRef={CASE.ref}
        customerName={CASE.customerName}
        startedLabel={CASE.startedLabel}
        status={status}
      />

      <main className="verify-main">
        {step !== "done" ? <Stepper current={step} /> : null}

        {step === "upload" ? (
          <UploadStep
            files={files}
            previews={previews}
            onSelect={handleSelect}
            onRemove={handleRemove}
            onContinue={handleStartVerification}
          />
        ) : null}

        {step === "processing" ? <ProcessingStep /> : null}

        {step === "review" ? (
          <ReviewStep
            previews={previews}
            fields={fields}
            onFieldChange={handleFieldChange}
            onAcknowledge={handleAcknowledge}
            crossChecks={CROSS_CHECKS}
            onContinue={() => setStep("decision")}
          />
        ) : null}

        {step === "decision" ? <DecisionStep onFinalize={handleFinalize} /> : null}

        {step === "done" && outcome ? (
          <div className="outcome">
            <div className={`outcome__badge outcome__badge--${OUTCOME_META[outcome.choice].status}`}>
              {outcome.choice === "reject" ? (
                <svg viewBox="0 0 24 24" width="22" height="22">
                  <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="22" height="22">
                  <path
                    d="M4 12.5 9 17.5 20 6.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <h2 className="outcome__heading">{OUTCOME_META[outcome.choice].heading}</h2>
            <p className="outcome__ref">
              {CASE.ref} — {CASE.customerName}
            </p>
            <p className="outcome__notes">“{outcome.notes}”</p>
            <button type="button" className="btn btn--primary outcome__reset" onClick={handleReset}>
              Review another case
            </button>
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default VerificationPage;
