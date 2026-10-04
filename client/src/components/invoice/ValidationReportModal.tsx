import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { RiskBadge } from "../common/RiskBadge";
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  HelpCircle,
  TrendingUp,
  Cpu,
  FileCheck,
  ArrowRight,
  Printer,
  Edit3,
  Sparkles,
  ShieldAlert,
  ShieldCheck
} from "lucide-react";
import { ValidationRuleResult } from "../../types";

interface ValidationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceData?: any;
  validationData?: {
    overallStatus: "VALID" | "WARNING" | "POTENTIAL_RISK";
    ruleEngine?: {
      status: string;
      summary: {
        totalRules: number;
        passed: number;
        warnings: number;
        failed: number;
      };
      results: ValidationRuleResult[];
    };
    aiAnalysis?: {
      riskScore: number;
      riskLevel: "VALID" | "WARNING" | "POTENTIAL_RISK";
      isAnomaly: boolean;
      explanation: string;
      reasons: string[];
      suggestedActions: string[];
      topFactors: string[];
      featureContributions?: Record<string, number>;
    };
  };
  onFinalize?: () => void;
  onEdit?: () => void;
  onPrint?: () => void;
}

export const ValidationReportModal: React.FC<ValidationReportModalProps> = ({
  isOpen,
  onClose,
  invoiceData,
  validationData,
  onFinalize,
  onEdit,
  onPrint
}) => {
  const [humanVerified, setHumanVerified] = useState(false);
  const [activeTab, setActiveTab] = useState<"hybrid" | "rules" | "xai">("hybrid");

  if (!validationData) return null;

  const { overallStatus, ruleEngine, aiAnalysis } = validationData;
  const isRisky = overallStatus === "POTENTIAL_RISK";
  const isWarning = overallStatus === "WARNING";

  // Parse feature attributions if available
  let featureContribs: Record<string, number> = {};
  if (aiAnalysis?.featureContributions) {
    if (typeof aiAnalysis.featureContributions === "string") {
      try {
        featureContribs = JSON.parse(aiAnalysis.featureContributions);
      } catch (e) {}
    } else {
      featureContribs = aiAnalysis.featureContributions;
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="5xl"
      title="Hybrid GST Pre-Validation & Explainable AI Audit"
      subtitle={`Invoice ${invoiceData?.invoiceNumber || "Draft"} • ₹${(
        invoiceData?.grandTotal || 0
      ).toLocaleString("en-IN")}`}
    >
      <div className="space-y-6">
        {/* Top Verdict Banner */}
        <div
          className={`p-5 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
            isRisky
              ? "bg-rose-950/40 border-rose-500/40 text-rose-200 shadow-glow-rose"
              : isWarning
              ? "bg-amber-950/40 border-amber-500/40 text-amber-200"
              : "bg-emerald-950/40 border-emerald-500/40 text-emerald-200 shadow-glow-emerald"
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                isRisky
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-600/50"
                  : isWarning
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-500/50"
                  : "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50"
              }`}
            >
              {isRisky ? (
                <AlertOctagon className="w-7 h-7" />
              ) : isWarning ? (
                <AlertTriangle className="w-7 h-7" />
              ) : (
                <CheckCircle2 className="w-7 h-7" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-black text-white">
                  {isRisky
                    ? "POTENTIAL RISK DETECTED — REQUIRES VERIFICATION"
                    : isWarning
                    ? "WARNING — NON-STANDARD TRANSACTION PATTERN"
                    : "INVOICE VALIDATED SUCCESSFULLY — STATUTORY COMPLIANT"}
                </h3>
                <RiskBadge level={overallStatus} size="sm" />
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {isRisky
                  ? "The hybrid engine detected compliance discrepancies and/or severe statistical anomaly deviations against historical transaction baselines."
                  : isWarning
                  ? "The invoice complies with standard GST rules but exhibits moderate rate or volume deviations."
                  : "All deterministic statutory rules passed and the Isolation Forest ML model confirmed normal transaction behavior."}
              </p>
            </div>
          </div>

          {/* AI Risk Score Pill */}
          <div className="bg-slate-900/90 px-4 py-2.5 rounded-2xl border border-slate-750 text-center shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-mono">
              AI Risk Index
            </span>
            <span
              className={`text-2xl font-black font-mono ${
                isRisky ? "text-rose-400" : isWarning ? "text-amber-400" : "text-emerald-400"
              }`}
            >
              {aiAnalysis?.riskScore || 0}%
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 gap-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab("hybrid")}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "hybrid"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Hybrid Overview & Summary</span>
          </button>
          <button
            onClick={() => setActiveTab("rules")}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "rules"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Deterministic GST Rules ({ruleEngine?.results?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab("xai")}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "xai"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Explainable AI (XAI) & SHAP Factors</span>
          </button>
        </div>

        {/* TAB 1: HYBRID OVERVIEW */}
        {activeTab === "hybrid" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Quick Rule Checkmarks */}
            <div className="lg:col-span-6 bg-slate-900/60 rounded-3xl p-5 border border-slate-800">
              <h4 className="text-xs font-bold uppercase text-white tracking-wider mb-3 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-cyan-400" />
                Deterministic GST Verification Checklist
              </h4>
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {ruleEngine?.results?.map((r) => (
                  <div
                    key={r.ruleId}
                    className="flex items-start justify-between bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80 text-xs"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      {r.status === "PASS" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      ) : r.status === "WARNING" ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                      ) : (
                        <AlertOctagon className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <p className="font-bold text-white">{r.ruleName}</p>
                        <p className="text-[11px] text-slate-400 truncate max-w-sm">
                          {r.message}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${
                        r.status === "PASS"
                          ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
                          : r.status === "WARNING"
                          ? "bg-amber-950/80 text-amber-300 border-amber-500/40"
                          : "bg-rose-950/80 text-rose-300 border-rose-500/40"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Explainable AI Summary Box */}
            <div className="lg:col-span-6 bg-slate-950/80 rounded-3xl p-5 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      Explainable AI Findings
                    </h4>
                  </div>
                  <span className="text-[11px] text-cyan-400 font-mono bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-500/30">
                    Model: Isolation Forest
                  </span>
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                      Why was this flagged?
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {aiAnalysis?.reasons?.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-cyan-400 font-bold">•</span>
                          <span className="leading-relaxed">{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                      Recommended Actions
                    </span>
                    <ul className="space-y-1.5 text-xs text-amber-300">
                      {aiAnalysis?.suggestedActions?.map((act, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <ArrowRight className="w-3.5 h-3.5 mt-0.5 text-amber-400 shrink-0" />
                          <span className="leading-relaxed">{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Confidence: 94.8%</span>
                <span className="text-cyan-300">Hybrid AI Governance</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DETAILED RULES */}
        {activeTab === "rules" && (
          <div className="cyber-card rounded-3xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Rule ID</th>
                  <th className="py-3.5 px-4">Rule Name</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Severity</th>
                  <th className="py-3.5 px-4">Diagnostic Message</th>
                  <th className="py-3.5 px-4">Suggested Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {ruleEngine?.results?.map((r) => (
                  <tr key={r.ruleId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-300">{r.ruleId}</td>
                    <td className="py-3 px-4 font-bold text-white">{r.ruleName}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block font-bold text-[10px] px-2.5 py-0.5 rounded-full border ${
                          r.status === "PASS"
                            ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
                            : r.status === "WARNING"
                            ? "bg-amber-950/80 text-amber-300 border-amber-500/40"
                            : "bg-rose-950/80 text-rose-300 border-rose-500/40"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{r.severity}</td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs">{r.message}</td>
                    <td className="py-3 px-4 text-slate-400 italic max-w-xs">
                      {r.suggestedAction || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: EXPLAINABLE AI & SHAP ATTRIBUTION */}
        {activeTab === "xai" && (
          <div className="space-y-6">
            <div className="cyber-card rounded-3xl p-5 border border-slate-800">
              <h4 className="text-xs font-bold uppercase text-white tracking-wider mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                SHAP-Inspired Feature Contribution Breakdown
              </h4>
              <p className="text-xs text-slate-400 mb-4">
                Relative influence of each transaction factor on the anomaly classification score.
              </p>

              <div className="space-y-3.5">
                {Object.entries(featureContribs).map(([feat, weight]) => (
                  <div key={feat} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                      <span>{feat}</span>
                      <span className="font-mono text-cyan-300 font-bold">{weight}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          weight > 30
                            ? "bg-gradient-to-r from-rose-500 to-amber-500 shadow-glow-rose"
                            : weight > 15
                            ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                            : "bg-gradient-to-r from-blue-500 to-cyan-400"
                        }`}
                        style={{ width: `${Math.min(weight, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-xs text-blue-200 leading-relaxed">
              <strong className="text-cyan-300">Human-in-the-Loop AI Disclaimer:</strong> The AI model evaluates numerical
              deviations against historical distributions. An anomaly flag indicates a statistical
              outlier requiring business sign-off and does not imply fraudulent intent.
            </div>
          </div>
        )}

        {/* Bottom Verification & Actions */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={humanVerified}
              onChange={(e) => setHumanVerified(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-400 focus:ring-cyan-400"
            />
            <span>I have verified the invoice line items, tax slab rates and customer details.</span>
          </label>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex-1 sm:flex-none px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Invoice
              </button>
            )}

            {onPrint && (
              <button
                onClick={onPrint}
                className="flex-1 sm:flex-none px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Preview
              </button>
            )}

            {onFinalize && (
              <button
                onClick={onFinalize}
                disabled={isRisky && !humanVerified}
                className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-black text-white transition-all flex items-center justify-center gap-1.5 shadow-md ${
                  isRisky && !humanVerified
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                    : "bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-glow-emerald"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Finalize & Save Invoice
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
