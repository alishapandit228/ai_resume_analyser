import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from "recharts";
import { ThumbsUp, AlertTriangle, Wand2, Sparkles } from "lucide-react";
import { PageHeader, EmptyState, Pill } from "../components/Common.jsx";
import { Loader } from "../components/Common.jsx";
import ScoreRing from "../components/ScoreRing.jsx";
import MetricCard from "../components/MetricCard.jsx";
import { useApp } from "../context/AppContext.jsx";
import { runDemo } from "../api/client.js";

export default function Dashboard() {
  const { analysis, setAnalysis, resume, job } = useApp();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [loadingDemo, setLoadingDemo] = React.useState(false);

  useEffect(() => {
    if (!analysis && params.get("demo") === "1") {
      setLoadingDemo(true);
      runDemo().then(setAnalysis).finally(() => setLoadingDemo(false));
    }
  }, [params, analysis, setAnalysis]);

  if (loadingDemo) return <Loader label="Running demo analysis..." />;

  if (!analysis) {
    return (
      <div>
        <PageHeader title="Dashboard" />
        <EmptyState
          icon={Sparkles}
          title="No analysis yet"
          subtitle="Upload a resume and match it against a job description to see your dashboard."
          action={
            <div className="flex gap-3 mt-2">
              <button onClick={() => navigate("/resume")} className="btn-primary">Upload Resume</button>
              <button onClick={() => runDemo().then(setAnalysis)} className="btn-secondary">Try Demo</button>
            </div>
          }
        />
      </div>
    );
  }

  const radarData = [
    { metric: "Skills", value: analysis.skills_match },
    { metric: "Experience", value: analysis.experience_match },
    { metric: "Education", value: analysis.education_match },
    { metric: "Projects", value: analysis.project_match },
    { metric: "Keywords", value: analysis.keyword_match },
  ];

  const skillBarData = [
    ...analysis.matched_skills.slice(0, 6).map((s) => ({ skill: s, status: "Have", value: 100 })),
    ...analysis.missing_skills.slice(0, 6).map((s) => ({ skill: s, status: "Missing", value: 100 })),
  ];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle={job ? `${job.title}${job.company ? " · " + job.company : ""}` : undefined}>
        <button onClick={() => navigate("/job-matcher")} className="btn-secondary text-sm">Analyze another job</button>
      </PageHeader>

      <div className="max-w-6xl mx-auto px-8 py-8 space-y-8">
        <div className="card p-6 flex flex-col md:flex-row items-center gap-8">
          <ScoreRing score={analysis.overall_score} size={130} label="Overall Score" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1 w-full">
            <MetricCard label="ATS Compatibility" value={analysis.ats_score} />
            <MetricCard label="Skills Match" value={analysis.skills_match} />
            <MetricCard label="Experience" value={analysis.experience_match} />
            <MetricCard label="Projects" value={analysis.project_match} />
            <MetricCard label="Education" value={analysis.education_match} />
            <MetricCard label="Keywords" value={analysis.keyword_match} />
          </div>
        </div>
        <p className="text-xs text-muted -mt-4">{analysis.disclaimer}</p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="font-display text-base font-semibold text-ink mb-4">Skill Visualization</h3>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData} outerRadius={90}>
                <PolarGrid stroke="#E4E7EC" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fill: "#6B7280" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: "#6B7280" }} />
                <Radar dataKey="value" stroke="#2451B8" fill="#2451B8" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-6">
            <h3 className="font-display text-base font-semibold text-ink mb-4">Matched vs. Missing Skills</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={skillBarData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" horizontal={false} />
                <XAxis type="number" hide domain={[0, 100]} />
                <YAxis dataKey="skill" type="category" width={90} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {skillBarData.map((entry, i) => (
                    <Cell key={i} fill={entry.status === "Have" ? "#1C7C54" : "#B3261E"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2 text-xs text-muted">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-signal-good inline-block" /> You have</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-signal-bad inline-block" /> Missing</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-3">
              <ThumbsUp size={17} className="text-signal-good" />
              <h3 className="font-display text-base font-semibold text-ink">What You're Doing Well</h3>
            </div>
            <ul className="space-y-2 text-sm text-muted">
              {analysis.strengths.map((s, i) => <li key={i} className="flex gap-2"><span className="text-signal-good">•</span>{s}</li>)}
            </ul>
          </div>
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={17} className="text-signal-warn" />
              <h3 className="font-display text-base font-semibold text-ink">What Needs Improvement</h3>
            </div>
            <ul className="space-y-2 text-sm text-muted">
              {analysis.weaknesses.map((w, i) => <li key={i} className="flex gap-2"><span className="text-signal-warn">•</span>{w}</li>)}
            </ul>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Wand2 size={17} className="text-brand" />
            <h3 className="font-display text-base font-semibold text-ink">Recommended Changes</h3>
          </div>
          <div className="space-y-3 mb-4">
            {analysis.recommendations.map((r, i) => (
              <div key={i} className="text-sm">
                <span className="font-medium text-ink">{r.title}: </span>
                <span className="text-muted">{r.detail}</span>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            {analysis.ats_detail.ats_recommendations?.slice(0, 4).map((rec, i) => (
              <div key={i} className="flex gap-2 text-sm text-muted">
                <Pill tone="brand">ATS</Pill><span>{rec}</span>
              </div>
            ))}
          </div>
          <button onClick={() => navigate("/skill-gap")} className="btn-secondary text-sm mt-5">
            View full skill gap →
          </button>
        </div>
      </div>
    </div>
  );
}
