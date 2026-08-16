import UploadDropzone from "./UploadDropzone.jsx";

function UploadStep({ files, previews, onSelect, onRemove, onContinue }) {
  const canContinue = files.idFront && files.address;

  return (
    <div>
      <div className="upload-card">
        <div className="upload-card__head">
          <h3 className="upload-card__title">Government-issued ID</h3>
          <span className="upload-card__req">Passport, driver's licence, or national ID</span>
        </div>
        <div className="upload-grid">
          <UploadDropzone
            id="upload-id-front"
            label="Front side"
            hint="Upload the front of the ID"
            required
            file={files.idFront}
            previewUrl={previews.idFront}
            onSelect={(f) => onSelect("idFront", f)}
            onRemove={() => onRemove("idFront")}
          />
          <UploadDropzone
            id="upload-id-back"
            label="Back side"
            hint="Upload the back (if applicable)"
            file={files.idBack}
            previewUrl={previews.idBack}
            onSelect={(f) => onSelect("idBack", f)}
            onRemove={() => onRemove("idBack")}
          />
        </div>
      </div>

      <div className="upload-card">
        <div className="upload-card__head">
          <h3 className="upload-card__title">Proof of address</h3>
          <span className="upload-card__req">Utility bill or bank statement, last 3 months</span>
        </div>
        <UploadDropzone
          id="upload-address"
          label="Address document"
          hint="Drag and drop or click to upload"
          required
          file={files.address}
          previewUrl={previews.address}
          onSelect={(f) => onSelect("address", f)}
          onRemove={() => onRemove("address")}
        />
      </div>

      <button
        type="button"
        className="btn btn--primary"
        disabled={!canContinue}
        onClick={onContinue}
      >
        Start verification
      </button>
    </div>
  );
}

export default UploadStep;
