import React from "react";
import { CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle } from "lucide-react";

interface RiskBadgeProps {
  level: string;
  score?: number;
  showScore?: boolean;
  size?: "sm" | "md" | "lg";
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  score,
  showScore = false,
  size = "md"
}) => {
  const norm = (level || "").toUpperCase();

  let bg = "bg-[#00e599]/10 text-[#00e599] border-[#00e599]/30 shadow-[0_0_15px_rgba(0,229,153,0.15)]";
  let dot = "bg-[#00e599] shadow-[0_0_8px_#00e599]";
  let icon = <CheckCircle2 className="w-3.5 h-3.5 text-[#00e599]" />;
  let label = "Compliant";

  if (norm === "POTENTIAL_RISK" || norm === "FAIL" || norm === "ANOMALY") {
    bg = "bg-[#ff2d78]/10 text-[#ff2d78] border-[#ff2d78]/30 shadow-[0_0_15px_rgba(255,45,120,0.15)]";
    dot = "bg-[#ff2d78] shadow-[0_0_8px_#ff2d78] animate-ping";
    icon = <AlertOctagon className="w-3.5 h-3.5 text-[#ff2d78]" />;
    label = "Potential Risk";
  } else if (norm === "WARNING" || norm === "WARN") {
    bg = "bg-amber-500/10 text-amber-300 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]";
    dot = "bg-amber-400 shadow-[0_0_8px_#f59e0b]";
    icon = <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
    label = "Warning";
  } else if (norm === "DRAFT") {
    bg = "bg-white/5 text-zinc-300 border-white/10";
    dot = "bg-zinc-400";
    icon = <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />;
    label = "Draft";
  }

  const sizeClass =
    size === "sm"
      ? "text-[9px] px-2.5 py-0.5"
      : size === "lg"
      ? "text-xs px-4 py-1.5 font-black"
      : "text-[10px] px-3 py-1 font-black";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border uppercase tracking-wider backdrop-blur-md transition-all font-mono ${bg} ${sizeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
      <span className="font-sans font-black tracking-tight text-white">{label}</span>
      {showScore !== undefined && score !== undefined && (
        <span className="font-black text-[9px] px-1.5 py-0.5 bg-black/60 rounded-full border border-white/10 text-white font-mono">
          {score}%
        </span>
      )}
    </span>
  );
};
