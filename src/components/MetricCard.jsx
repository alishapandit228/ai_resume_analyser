import React from "react";

function colorFor(score) {
  if (score >= 75) return "#1C7C54";
  if (score >= 50) return "#B5720A";
  return "#B3261E";
}

export default function MetricCard({ label, value }) {
  const color = colorFor(value);
  return (
    <div className="card p-4">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-sm font-medium text-muted">{label}</span>
        <span className="font-display text-xl font-semibold" style={{ color }}>
          {Math.round(value)}%
        </span>
      </div>
      <div className="progress-track h-2 w-full">
        <div
          className="progress-fill"
          style={{ width: `${Math.min(value, 100)}%`, background: color }}
        />
      </div>
    </div>
  );
}
