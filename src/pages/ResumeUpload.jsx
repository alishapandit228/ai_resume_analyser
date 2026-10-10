import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { PageHeader, ErrorBanner } from "../components/Common.jsx";
import FileUpload from "../components/FileUpload.jsx";
import { uploadResume } from "../api/client.js";
import { useApp } from "../context/AppContext.jsx";

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [label, setLabel] = useState("My Resume");
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { setResume, resume } = useApp();
  const navigate = useNavigate();

  const handleFileSelected = (f, err) => {
    setError(err);
    if (f) setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const data = await uploadResume(file, label);
      setResume(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Resume" subtitle="Upload a PDF or DOCX resume to begin" />
      <div className="max-w-2xl mx-auto px-8 py-10 space-y-6">
        <ErrorBanner message={error} />

        {resume ? (
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="text-signal-good" size={22} />
              <p className="font-medium text-ink">Resume successfully uploaded</p>
            </div>
            <p className="text-sm text-muted mb-1"><span className="font-medium text-ink">{resume.label}</span> — {resume.original_filename}</p>
            <p className="text-xs text-muted mb-5">
              Found {resume.parsed_data.flat_skills.length} skill(s), {resume.parsed_data.projects?.length || 0} project(s),
              {" "}{resume.parsed_data.experience?.length || 0} experience entr{resume.parsed_data.experience?.length === 1 ? "y" : "ies"}.
            </p>
            <div className="flex gap-3">
              <button onClick={() => navigate("/job-matcher")} className="btn-primary">
                Paste a job description →
              </button>
              <button onClick={() => { setResume(null); setFile(null); }} className="btn-secondary">
                Replace resume
              </button>
            </div>
          </div>
        ) : (
          <>
            <div>
              <label className="text-sm font-medium text-ink mb-1.5 block">Resume label</label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Software Engineer Resume"
                className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              />
            </div>
            <FileUpload
              onFileSelected={handleFileSelected}
              selectedFile={file}
              onClear={() => setFile(null)}
              error={null}
            />
            <button onClick={handleUpload} disabled={!file || uploading} className="btn-primary w-full">
              {uploading ? "Analyzing resume..." : "Upload & Extract"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
