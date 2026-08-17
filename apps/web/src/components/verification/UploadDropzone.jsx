import { useRef, useState } from "react";

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * A single document upload slot: click-to-browse or drag-and-drop,
 * with an image thumbnail (or generic file chip for PDFs) once a
 * file is attached.
 */
function UploadDropzone({ id, label, hint, file, previewUrl, onSelect, onRemove, required }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  function handleFiles(fileList) {
    const picked = fileList?.[0];
    if (picked) onSelect(picked);
  }

  return (
    <div className="field">
      <div className="upload-card__field-head">
        <label htmlFor={id} className="field__label">
          {label}
        </label>
        {required ? <span className="upload-card__req">Required</span> : null}
      </div>

      {file ? (
        <div className="dropzone__preview">
          {previewUrl ? (
            <img src={previewUrl} alt="" className="dropzone__thumb" />
          ) : (
            <div className="dropzone__thumb dropzone__thumb--file" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path
                  d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <path d="M14 3v5h5" fill="none" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </div>
          )}
          <div className="dropzone__meta">
            <span className="dropzone__filename">{file.name}</span>
            <span className="dropzone__filesize">{formatSize(file.size)}</span>
          </div>
          <button type="button" className="dropzone__remove" onClick={onRemove}>
            Remove
          </button>
        </div>
      ) : (
        <button
          type="button"
          className={`dropzone${dragging ? " dropzone--drag" : ""}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
        >
          <span className="dropzone__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                d="M12 15V4m0 0 4 4m-4-4-4 4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="dropzone__title">{hint}</span>
          <span className="dropzone__hint">JPG, PNG or PDF — up to 10 MB</span>
        </button>
      )}

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*,.pdf"
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}

export default UploadDropzone;
