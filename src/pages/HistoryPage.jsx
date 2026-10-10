import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { History as HistoryIcon } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from "recharts";
import { PageHeader, EmptyState, Pill, Loader } from "../components/Common.jsx";
import { getHistory, getAnalysis } from "../api/client.js";
import { useApp } from "../context/AppContext.jsx";

export default function HistoryPage() {
  const [items, setItems] = useState(null);
  const { setAnalysis } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    getHistory().then(setItems).catch(() => setItems([]));
  }, []);

  const openAnalysis = async (id) => {
    const full = await getAnalysis(id);
    setAnalysis(full);
    navigate("/dashboard");
  };

  if (items === null) return <Loader label="Loading analysis history..." />;

  if (items.length === 0) {
    return (
      <div>
        <PageHeader title="Analysis History" />
        <EmptyState
          icon={HistoryIcon}
          title="No analyses yet"
          subtitle="Every resume-job match you run will show up here, so you can track progress over time."
          action={<button onClick={() => navigate("/job-matcher")} className="btn-primary mt-2">Run your first match</button>}
        />
      </div>
    );
  }

  const chartData = items
    .slice()
    .reverse()
    .map((it, i) => ({ index: i + 1, score: it.overall_score, label: it.job_title }));

  return (
    <div>
      <PageHeader title="Analysis History" subtitle={`${items.length} analysis run(s)`} />
      <div className="max-w-5xl mx-auto px-8 py-8 space-y-8">
        <div className="card p-6">
          <h3 className="font-display text-base font-semibold text-ink mb-4">Score progress over time</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" />
              <XAxis dataKey="index" tick={{ fontSize: 11 }} label={{ value: "Analysis #", position: "insideBottom", offset: -2, fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#2451B8" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card divide-y divide-line">
          {items.map((it) => (
            <button
              key={it.id}
              onClick={() => openAnalysis(it.id)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-paper"
            >
              <div>
                <p className="text-sm font-medium text-ink">{it.job_title}{it.company ? ` · ${it.company}` : ""}</p>
                <p className="text-xs text-muted">{it.resume_label} — {new Date(it.created_at).toLocaleDateString()}</p>
              </div>
              <Pill tone={it.overall_score >= 75 ? "good" : it.overall_score >= 50 ? "brand" : "bad"}>
                {it.overall_score}/100
              </Pill>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
