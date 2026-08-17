import ScanIllustration from "../ScanIllustration.jsx";

function ProcessingStep() {
  return (
    <div className="processing">
      <h3 className="processing__title">Extracting data from your documents…</h3>
      <p className="processing__sub">
        Tesseract OCR is reading the government ID and address document. This
        usually takes a few seconds.
      </p>
      <div className="processing__card">
        <ScanIllustration />
      </div>
    </div>
  );
}

export default ProcessingStep;
