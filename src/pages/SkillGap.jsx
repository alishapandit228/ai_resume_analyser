import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, Lightbulb, Puzzle } from "lucide-react";
import { EmptyState, PageHeader, Pill } from "../components/Common.jsx";
import { useApp } from "../context/AppContext.jsx";

export default function SkillGap() {
  const { analysis } = useApp();
  const navigate = useNavigate();

  if (!analysis) {
    return (
      <div>
        <PageHeader title="Skill Gap" />
        <EmptyState
          icon={Puzzle}
          title="No skill analysis yet"
          subtitle="Run a resume-job match to see which skills to build next."
          action={<button onClick={() => navigate("/job-matcher")} className="btn-primary mt-2">Go to Job Matcher</button>}
        />
      </div>
    );
  }

  const skillGaps = analysis.skill_gap ?? [];
  const highPriorityCount = skillGaps.filter((item) => item.importance === "High").length;

  return (
    <div>
      <PageHeader
        title="Skill Gap"
        subtitle={`${skillGaps.length} skills to develop${highPriorityCount ? ` · ${highPriorityCount} high priority` : ""}`}
      >
        <button onClick={() => navigate("/roadmap")} className="btn-secondary text-sm flex items-center gap-2">
          Learning roadmap <ArrowRight size={15} />
        </button>
      </PageHeader>

      {skillGaps.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="No skill gaps found"
          subtitle="Your resume covers the skills identified for this role."
          action={<button onClick={() => navigate("/job-matcher")} className="btn-secondary mt-2">Analyze another job</button>}
        />
      ) : (
        <div className="max-w-5xl mx-auto px-8 py-8 space-y-4">
          {skillGaps.map((item) => (
            <article key={item.skill} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-base font-semibold text-ink">{item.skill}</h2>
                  <p className="text-xs text-muted mt-1">Difficulty: {item.difficulty}</p>
                </div>
                <Pill tone={item.importance === "High" ? "bad" : "brand"}>
                  {item.importance} priority
                </Pill>
              </div>

              <p className="text-sm text-muted mt-4">{item.why_it_matters}</p>

              <div className="grid md:grid-cols-2 gap-5 mt-5">
                <section>
                  <h3 className="text-xs font-semibold uppercase text-muted flex items-center gap-2">
                    <BookOpen size={14} /> Recommended topics
                  </h3>
                  <ul className="mt-2 space-y-1.5 text-sm text-ink">
                    {(item.recommended_topics ?? []).map((topic) => (
                      <li key={topic} className="flex gap-2"><span className="text-brand">•</span>{topic}</li>
                    ))}
                  </ul>
                </section>
                <section className="border-l-2 border-brand/20 pl-4">
                  <h3 className="text-xs font-semibold uppercase text-muted flex items-center gap-2">
                    <Lightbulb size={14} /> Practice project
                  </h3>
                  <p className="text-sm text-ink mt-2">{item.suggested_project}</p>
                </section>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}