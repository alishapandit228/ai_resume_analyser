import React, { useEffect, useState } from "react";
import { Trash2, ShieldCheck } from "lucide-react";
import { PageHeader } from "../components/Common.jsx";
import { listResumes, deleteResume } from "../api/client.js";
import { useApp } from "../context/AppContext.jsx";

export default function Settings() {
  const [resumes, setResumes] = useState([]);
  const { resume, setResume } = useApp();

  const refresh = () => listResumes().then(setResumes).catch(() => {});
  useEffect(() => { refresh(); }, []);

  const handleDelete = async (id) => {
    await deleteResume(id);
    if (resume?.id === id) setResume(null);
    refresh();
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your uploaded resumes and privacy preferences" />
      <div className="max-w-3xl mx-auto px-8 py-8 space-y-8">
        <div className="card p-6">
          <h3 className="font-display text-base font-semibold text-ink mb-4">Your resume versions</h3>
          {resumes.length === 0 ? (
            <p className="text-sm text-muted">No resumes uploaded yet.</p>
          ) : (
            <div className="divide-y divide-line">
              {resumes.map((r) => (
                <div key={r.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-ink">{r.label}</p>
                    <p className="text-xs text-muted">{r.original_filename} — uploaded {new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => handleDelete(r.id)} className="text-muted hover:text-signal-bad p-2" aria-label="Delete resume">
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={18} className="text-brand" />
            <h3 className="font-display text-base font-semibold text-ink">Privacy & data handling</h3>
          </div>
          <ul className="text-sm text-muted space-y-2 list-disc pl-5">
            <li>Files are validated for type (PDF/DOCX) and size before upload.</li>
            <li>Resume text is stored only to power your analyses — you can delete any resume at any time above.</li>
            <li>Deleting a resume also removes its file from disk and its saved analyses.</li>
            <li>All scores are AI-generated compatibility estimates, not hiring predictions — please review every suggestion yourself.</li>
            <li>API keys for optional LLM features are kept server-side and never exposed to the browser.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
