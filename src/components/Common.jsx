import React from "react";
import { Loader2 } from "lucide-react";

export function Loader({ label = "Working on it..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted">
      <Loader2 className="animate-spin text-brand" size={28} />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center max-w-md mx-auto">
      {Icon && <Icon size={30} className="text-muted" />}
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      {action}
    </div>
  );
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="h-16 border-b border-line bg-white flex items-center justify-between px-8 sticky top-0 z-10">
      <div>
        <h1 className="font-display text-lg font-semibold text-ink leading-none">{title}</h1>
        {subtitle && <p className="text-xs text-muted mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">{children}</div>
    </div>
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="rounded-md border border-signal-bad/30 bg-red-50 text-signal-bad text-sm px-4 py-3">
      {message}
    </div>
  );
}

export function Pill({ children, tone = "neutral" }) {
  const tones = {
    neutral: "bg-paper text-muted border-line",
    good: "bg-green-50 text-signal-good border-green-200",
    bad: "bg-red-50 text-signal-bad border-red-200",
    brand: "bg-brand-light text-brand-dark border-brand/20",
  };
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${tones[tone]}`}>
      {children}
    </span>
  );
}
