import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Map, CheckCircle2, Circle } from "lucide-react";
import { PageHeader, EmptyState } from "../components/Common.jsx";
import { useApp } from "../context/AppContext.jsx";
import { updateRoadmapProgress } from "../api/client.js";

export default function Roadmap() {
  const { analysis } = useApp();
  const navigate = useNavigate();
  const [progress, setProgress] = useState({});

  if (!analysis) {
    return (
      <div>
        <PageHeader title="Learning Roadmap" />
        <EmptyState
          icon={Map}
          title="No roadmap yet"
          subtitle="Run a resume-job match first to generate a personalized roadmap."
          action={<button onClick={() => navigate("/job-matcher")} className="btn-primary mt-2">Go to Job Matcher</button>}
        />
      </div>
    );
  }

  const toggleWeek = async (week) => {
    const next = !progress[week];
    setProgress((p) => ({ ...p, [week]: next }));
    try {
      if (analysis.id && analysis.id !== "demo") {
        await updateRoadmapProgress(analysis.id, week, next);
      }
    } catch {
      // Non-critical — progress still reflects locally even if the save fails.
    }
  };

  const completedCount = Object.values(progress).filter(Boolean).length;
  const totalWeeks = analysis.roadmap.length;

  return (
    <div>
      <PageHeader title="Personalized Learning Roadmap" subtitle={`${completedCount} of ${totalWeeks} weeks completed`} />
      <div className="max-w-3xl mx-auto px-8 py-8">
        {totalWeeks === 0 ? (
          <p className="text-sm text-muted">No skill gaps to plan for — you're already well aligned with this role.</p>
        ) : (
          <div className="space-y-4">
            {analysis.roadmap.map((week) => {
              const done = !!progress[week.week];
              return (
                <div key={week.week} className={`card p-5 flex gap-4 ${done ? "opacity-70" : ""}`}>
                  <button onClick={() => toggleWeek(week.week)} className="mt-0.5 shrink-0">
                    {done ? <CheckCircle2 className="text-signal-good" size={22} /> : <Circle className="text-muted" size={22} />}
                  </button>
                  <div>
                    <p className="text-xs font-medium text-brand mb-1">Week {week.week}</p>
                    <h4 className={`font-medium text-ink mb-2 ${done ? "line-through" : ""}`}>{week.title}</h4>
                    <div className="flex flex-wrap gap-2">
                      {week.topics.map((t) => (
                        <span key={t} className="text-xs text-muted bg-paper border border-line rounded-full px-2.5 py-1">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
