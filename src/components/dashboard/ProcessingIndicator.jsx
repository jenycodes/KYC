function ProcessingIndicator() {
  return (
    <div className="processing-inline">
      <span className="processing-inline__spinner" aria-hidden="true" />
      <h3 className="processing-inline__title">Reading your documents…</h3>
      <p className="processing-inline__sub">
        Running OCR to extract your details automatically. This will only take a moment.
      </p>
    </div>
  );
}

export default ProcessingIndicator;
