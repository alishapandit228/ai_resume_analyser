import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Compass, UploadCloud, ScanSearch, Map, Sparkles, ShieldCheck, ChevronDown,
} from "lucide-react";

const FEATURES = [
  { icon: ScanSearch, title: "ATS compatibility check", body: "Keyword coverage, formatting flags and content-quality signals scored the way applicant tracking systems read them." },
  { icon: Sparkles, title: "Skill gap breakdown", body: "See exactly which required and preferred skills you're missing, and why each one matters for the role." },
  { icon: Map, title: "Personalized roadmap", body: "A week-by-week learning plan built from your specific gaps, not a generic course list." },
  { icon: ShieldCheck, title: "Nothing invented", body: "Every extracted fact comes straight from your resume. Suggestions are flagged as suggestions, not truths." },
];

const STEPS = [
  { n: "1", title: "Upload your resume", body: "PDF or DOCX. We extract your skills, education, experience and projects." },
  { n: "2", title: "Paste a job description", body: "We parse required vs. preferred skills, experience and education requirements." },
  { n: "3", title: "Get your roadmap", body: "A match score, an ATS report, a skill gap list, and a plan to close it." },
];

const FAQS = [
  { q: "Does this guarantee I'll get the job?", a: "No. The match score is an AI-generated compatibility estimate meant to guide your preparation — not a prediction of hiring outcomes." },
  { q: "Will it make up things I didn't write?", a: "No. Extraction only pulls what's actually in your resume. Recommendations are clearly separated from extracted facts." },
  { q: "Can I analyze the same resume against multiple jobs?", a: "Yes — save multiple job descriptions and multiple resume versions, and compare them in your Job Matcher dashboard." },
  { q: "Is my resume stored securely?", a: "Files are validated for type and size, and you can delete any uploaded resume and its analyses at any time from Settings." },
];

export default function Landing() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = React.useState(null);

  return (
    <div className="bg-paper">
      <header className="border-b border-line bg-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass size={20} className="text-brand" />
            <span className="font-display text-lg font-semibold text-ink">Resolve</span>
          </div>
          <button onClick={() => navigate("/dashboard")} className="btn-secondary text-sm">
            Open App
          </button>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-[1.1]">
            Turn your resume into your career roadmap
          </h1>
          <p className="mt-5 text-base text-muted max-w-md leading-relaxed">
            Analyze your resume, match it with real job requirements, discover missing skills,
            and improve your chances of getting noticed.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => navigate("/resume")} className="btn-primary">
              Analyze My Resume
            </button>
            <button onClick={() => navigate("/dashboard?demo=1")} className="btn-secondary">
              Try Demo
            </button>
          </div>
        </div>
        <div className="card p-6">
          <p className="text-xs font-medium text-muted mb-4">Resume analysis preview</p>
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 rounded-full border-8 border-brand-light flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-8 border-brand" style={{ clipPath: "inset(0 0 25% 0)" }} />
              <span className="font-display text-xl font-semibold">82</span>
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-ink">Overall Match: 82/100</p>
              <p className="text-xs text-muted">Software Engineer · NimbusTech Solutions</p>
            </div>
          </div>
          <div className="space-y-3">
            {[["Skills Match", 85], ["Experience Match", 75], ["Keyword Match", 78]].map(([label, val]) => (
              <div key={label}>
                <div className="flex justify-between text-xs text-muted mb-1">
                  <span>{label}</span><span>{val}%</span>
                </div>
                <div className="progress-track h-1.5"><div className="progress-fill bg-brand" style={{ width: `${val}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-line">
        <h2 className="font-display text-2xl font-semibold text-ink mb-10">How it works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((s) => (
            <div key={s.n} className="flex gap-4">
              <span className="font-display text-2xl font-semibold text-brand shrink-0">{s.n}</span>
              <div>
                <h3 className="font-medium text-ink mb-1">{s.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-line">
        <h2 className="font-display text-2xl font-semibold text-ink mb-10">Key features</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="card p-6 flex gap-4">
              <Icon size={22} className="text-brand shrink-0 mt-1" />
              <div>
                <h3 className="font-medium text-ink mb-1">{title}</h3>
                <p className="text-sm text-muted leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-line">
        <div className="card p-6 flex items-center gap-4 mb-12">
          <UploadCloud className="text-brand shrink-0" size={22} />
          <p className="text-sm text-muted">
            <span className="font-medium text-ink">Skill gap, made concrete.</span> Every missing
            skill comes with why it matters, what to study, and a project to prove you learned it.
          </p>
        </div>

        <h2 className="font-display text-2xl font-semibold text-ink mb-6">Frequently asked</h2>
        <div className="divide-y divide-line border-t border-b border-line">
          {FAQS.map((f, i) => (
            <div key={f.q}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between py-4 text-left"
              >
                <span className="font-medium text-ink text-sm">{f.q}</span>
                <ChevronDown size={16} className={`text-muted transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
              </button>
              {openFaq === i && <p className="text-sm text-muted pb-4 max-w-2xl">{f.a}</p>}
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-line bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between text-xs text-muted">
          <span>Resolve · AI Resume Analyzer</span>
          <span>AI analysis is an estimate — always review suggestions yourself.</span>
        </div>
      </footer>
    </div>
  );
}
