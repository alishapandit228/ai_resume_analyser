import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpDown, Briefcase } from "lucide-react";
import { PageHeader, ErrorBanner, EmptyState, Pill } from "../components/Common.jsx";
import { analyzeJob, listJobs, runMatch, runDemo } from "../api/client.js";
import { useApp } from "../context/AppContext.jsx";

export default function JobMatcher() {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [matching, setMatching] = useState(false);
  const [savedJobs, setSavedJobs] = useState([]);
  const [sortKey, setSortKey] = useState("match");
  const { resume, setJob, setAnalysis, setResume } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    listJobs().then(setSavedJobs).catch(() => {});
  }, []);

  const handleAnalyzeJob = async () => {
    if (!title || text.split(/\s+/).length < 15) {
      setError("Please enter a title and a job description of at least a few sentences.");
      return;
    }
    setAnalyzing(true);
    setError(null);
    try {
      const jobData = await analyzeJob({ title, company, text });
      setJob(jobData);
      setSavedJobs((prev) => [{ ...jobData, resume_id_hint: resume?.id }, ...prev]);
      if (resume) {
        setMatching(true);
        const result = await runMatch(resume.id, jobData.id);
        setAnalysis(result);
        navigate("/dashboard");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setAnalyzing(false);
      setMatching(false);
    }
  };

  const handleTryDemo = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const result = await runDemo();
      setAnalysis(result);
      setResume({ id: "demo", label: "Demo Resume" });
      setJob({ id: "demo", title: "Software Engineer (Full Stack)", company: "NimbusTech Solutions" });
      navigate("/dashboard");
    } catch (e) {
      setError(e.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div>
      <PageHeader title="Job Matcher" subtitle="Paste a job description to compare against your resume" />
      <div className="max-w-5xl mx-auto px-8 py-10 grid md:grid-cols-2 gap-10">
        <div className="space-y-4">
          <ErrorBanner message={error} />
          {!resume && (
            <div className="rounded-md border border-brand/20 bg-brand-light text-brand-dark text-sm px-4 py-3">
              No resume uploaded yet — you can still try the demo, or{" "}
              <button className="underline font-medium" onClick={() => navigate("/resume")}>
                upload your resume first
              </button>.
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-ink mb-1.5 block">Job title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Software Engineer"
                className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand" />
            </div>
            <div>
              <label className="text-sm font-medium text-ink mb-1.5 block">Company (optional)</label>
              <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company name"
                className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-ink mb-1.5 block">Job description</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={12}
              placeholder="Paste the full job description here..."
              className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand" />
          </div>
          <div className="flex gap-3">
            <button onClick={handleAnalyzeJob} disabled={analyzing || matching} className="btn-primary flex-1">
              {matching ? "Matching against your resume..." : analyzing ? "Analyzing job description..." : "Analyze & Match"}
            </button>
            <button onClick={handleTryDemo} disabled={analyzing} className="btn-secondary">
              Try Demo
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-base font-semibold text-ink">Your Job Matches</h3>
            <button
              onClick={() => setSortKey(sortKey === "match" ? "company" : "match")}
              className="text-xs text-muted flex items-center gap-1 hover:text-ink"
            >
              <ArrowUpDown size={13} /> Sort by {sortKey === "match" ? "company" : "match"}
            </button>
          </div>
          {savedJobs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No saved jobs yet"
              subtitle="Analyzed job descriptions will appear here so you can revisit and compare them."
            />
          ) : (
            <div className="card divide-y divide-line">
              {savedJobs
                .slice()
                .sort((a, b) => (sortKey === "company" ? (a.company || "").localeCompare(b.company || "") : 0))
                .map((j) => (
                  <div key={j.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-ink">{j.title}</p>
                      <p className="text-xs text-muted">{j.company || "—"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {j.parsed_data?.required_skills?.slice(0, 2).map((s) => (
                        <Pill key={s} tone="brand">{s}</Pill>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
