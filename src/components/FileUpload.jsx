import React, { useCallback, useRef, useState } from "react";
import { UploadCloud, FileCheck2, X } from "lucide-react";

const ACCEPTED = [".pdf", ".docx"];
const MAX_MB = 5;

export default function FileUpload({ onFileSelected, selectedFile, onClear, error }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const validateAndSet = useCallback(
    (file) => {
      if (!file) return;
      const ext = "." + file.name.split(".").pop().toLowerCase();
      if (!ACCEPTED.includes(ext)) {
        onFileSelected(null, `Unsupported file type "${ext}". Please upload a PDF or DOCX.`);
        return;
      }
      if (file.size / (1024 * 1024) > MAX_MB) {
        onFileSelected(null, `File is larger than ${MAX_MB}MB. Please upload a smaller file.`);
        return;
      }
      onFileSelected(file, null);
    },
    [onFileSelected]
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    validateAndSet(e.dataTransfer.files?.[0]);
  };

  if (selectedFile) {
    return (
      <div className="card p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileCheck2 className="text-signal-good" size={22} />
          <div>
            <p className="text-sm font-medium text-ink">{selectedFile.name}</p>
            <p className="text-xs text-muted">{(selectedFile.size / 1024).toFixed(0)} KB</p>
          </div>
        </div>
        <button onClick={onClear} className="text-muted hover:text-ink p-1" aria-label="Remove file">
          <X size={18} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`card flex flex-col items-center justify-center gap-3 py-14 px-6 cursor-pointer border-2 border-dashed transition-colors ${
          dragOver ? "border-brand bg-brand-light" : "border-line"
        }`}
      >
        <UploadCloud size={32} className={dragOver ? "text-brand" : "text-muted"} />
        <div className="text-center">
          <p className="text-sm font-medium text-ink">Drag & drop your resume here</p>
          <p className="text-xs text-muted mt-1">or click to browse — PDF or DOCX, up to {MAX_MB}MB</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => validateAndSet(e.target.files?.[0])}
        />
      </div>
      {error && <p className="text-sm text-signal-bad mt-2">{error}</p>}
    </div>
  );
}
