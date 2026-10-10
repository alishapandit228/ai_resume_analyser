import React from "react";

function colorFor(score) {
  if (score >= 75) return "#1C7C54";
  if (score >= 50) return "#B5720A";
  return "#B3261E";
}

export default function ScoreRing({ score, size = 110, label, sublabel }) {
  const stroke = 9;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(Math.max(score, 0), 100) / 100) * circumference;
  const color = colorFor(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="#E4E7EC" strokeWidth={stroke}
          />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth={stroke}
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-semibold text-ink">{Math.round(score)}</span>
          <span className="text-[11px] text-muted">/ 100</span>
        </div>
      </div>
      {label && <span className="text-sm font-medium text-ink">{label}</span>}
      {sublabel && <span className="text-xs text-muted text-center">{sublabel}</span>}
    </div>
  );
}
