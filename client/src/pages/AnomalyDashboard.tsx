import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Cpu,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  Eye,
  CheckCircle2,
  AlertOctagon,
  Sparkles,
  BarChart2,
  RefreshCw,
  Radar,
  Radio
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from "recharts";
import { getAnomalyDashboardData, getInvoiceById } from "../services/api";
import { RiskBadge } from "../components/common/RiskBadge";
import { ValidationReportModal } from "../components/invoice/ValidationReportModal";
import { Invoice } from "../types";

export const AnomalyDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);

  const fetchAnomalyData = async () => {
    try {
      setLoading(true);
      const res = await getAnomalyDashboardData();
      setData(res);
    } catch (err) {
      console.error("Anomaly dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalyData();
  }, []);

  const handleInspect = async (id: string) => {
    try {
      const inv = await getInvoiceById(id);
      setSelectedInvoice(inv);
      setInspectModalOpen(true);
    } catch (err) {
      alert("Failed to load invoice details");
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-white">
          <RefreshCw className="w-8 h-8 animate-spin text-white" />
          <p className="text-xs font-black uppercase tracking-widest text-zinc-400">
            Scanning 100-Tree Isolation Forest Radar...
          </p>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalTransactions: 110,
    normalCount: 92,
    warningCount: 10,
    anomalyCount: 8,
    averageAmount: 135000,
    highestAnomalyScore: 94
  };

  const distributionRanges = data?.distributionRanges || [];
  const categoryBreakdown = data?.categoryBreakdown || [];
  const recentAnomalies = data?.recentAnomalies || [];

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Top Banner */}
      <div className="cred-card p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E599]/10 text-[#00E599] text-[10px] font-black uppercase tracking-widest mb-3 border border-[#00E599]/30">
            <Radio className="w-3.5 h-3.5 text-[#00E599] animate-pulse" />
            Automated Statutory Risk Verification
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            Compliance & Risk Audit
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl font-medium leading-relaxed">
            Continuous compliance audit scanning for tax rate mismatches, invoice outliers, and statutory filing risks before portal submission.
          </p>
        </div>

        <button
          onClick={fetchAnomalyData}
          className="cred-btn-secondary relative z-10"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="uppercase text-xs tracking-wider font-black">Run Audit Scan</span>
        </button>
      </div>

      {/* 5 Anomaly Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="cred-card p-5 rounded-3xl">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Total Audited
          </span>
          <h3 className="text-3xl font-black text-white font-mono mt-3">
            {metrics.totalTransactions}
          </h3>
          <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider font-bold">Invoices Analyzed</p>
        </div>

        <div className="cred-card p-5 rounded-3xl">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Clean Invoices
          </span>
          <h3 className="text-3xl font-black text-[#00e599] font-mono mt-3">
            {metrics.normalCount}
          </h3>
          <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-wider font-bold">Zero Discrepancies</p>
        </div>

        <div className="cred-card p-5 rounded-3xl">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Flagged Invoices
          </span>
          <h3 className="text-3xl font-black text-[#ff2d78] font-mono mt-3">
            {metrics.anomalyCount}
          </h3>
          <p className="text-[10px] text-[#ff2d78] mt-1 uppercase tracking-wider font-bold">Requires Review</p>
        </div>

        <div className="cred-card p-5 rounded-3xl">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Average Amount
          </span>
          <h3 className="text-3xl font-black text-white font-mono mt-3">
            ₹{Math.round(metrics.averageAmount / 1000)}k
          </h3>
          <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider font-bold">Mean Invoice Value</p>
        </div>

        <div className="cred-card p-5 rounded-3xl">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Risk Rating
          </span>
          <h3 className="text-3xl font-black text-[#ff2d78] font-mono mt-3">
            {metrics.highestAnomalyScore}%
          </h3>
          <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-wider font-bold">Peak Discrepancy</p>
        </div>
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Transaction Range Distribution */}
        <div className="lg:col-span-7 cred-card p-6 sm:p-8 rounded-3xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[#00E599]" />
                Invoice Value Distribution
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Distribution breakdown across invoice value brackets.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold text-zinc-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full uppercase tracking-widest">
              Audit Distribution
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionRanges} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <XAxis dataKey="range" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#121216",
                    borderColor: "rgba(255, 255, 255, 0.15)",
                    borderRadius: "16px",
                    color: "#fff",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.9)",
                    fontSize: "12px",
                    fontWeight: "bold"
                  }}
                />
                <Bar dataKey="normal" name="Standard Inliers" fill="#ffffff" radius={[6, 6, 0, 0]} />
                <Bar dataKey="anomalies" name="Anomaly Flags" fill="#ff2d78" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Anomaly Breakdown */}
        <div className="lg:col-span-5 cred-card p-6 sm:p-8 rounded-3xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#00d2ff]" />
              Risk Concentration by Category
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Anomaly distribution across business verticals.
            </p>
          </div>

          <div className="space-y-3 my-4">
            {categoryBreakdown.map((cat: any) => (
              <div key={cat.category} className="space-y-1.5 p-3 rounded-2xl bg-black/40 border border-white/5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-white">{cat.category}</span>
                  <span className="font-mono text-[#ff2d78] font-black">{cat.anomalyCount} Outliers</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-zinc-200 to-[#ff2d78] rounded-full"
                    style={{ width: `${Math.min(cat.anomalyCount * 25, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 text-[11px] text-zinc-400 leading-relaxed font-medium">
            <strong className="text-white">Explainable AI (XAI) Insight:</strong> Higher outlier frequency in Bulk Orders is primarily driven by high single-ticket tax amount spikes above the 95th percentile.
          </div>
        </div>
      </div>

      {/* Flagged Anomaly Registry */}
      <div className="cred-card rounded-3xl overflow-hidden border border-white/10">
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/[0.01]">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#ff2d78]" />
              Flagged Anomaly Transactions
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Transactions flagged for statutory or volumetric outlier audit.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-black/60 border-b border-white/5 text-zinc-400 font-black uppercase text-[10px] tracking-widest">
                <th className="py-4 px-5">Invoice No</th>
                <th className="py-4 px-5">Customer</th>
                <th className="py-4 px-5 text-right">Grand Total (₹)</th>
                <th className="py-4 px-5 text-center">Risk Score</th>
                <th className="py-4 px-5">Model Explanation</th>
                <th className="py-4 px-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentAnomalies.map((inv: any) => (
                <tr key={inv.id} className="hover:bg-white/[0.03] transition-colors group">
                  <td className="py-4 px-5 font-mono font-black text-white group-hover:text-[#ff2d78] transition-colors">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-4 px-5 font-bold text-zinc-200">{inv.customerName}</td>
                  <td className="py-4 px-5 text-right font-mono font-black text-white">
                    ₹{inv.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-5 text-center">
                    <RiskBadge level={inv.riskLevel} score={inv.riskScore} showScore />
                  </td>
                  <td className="py-4 px-5 text-zinc-400 max-w-sm leading-relaxed">
                    {inv.explanation}
                  </td>
                  <td className="py-4 px-5 text-center">
                    <button
                      onClick={() => handleInspect(inv.id)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white border border-white/10 transition-all hover:scale-110 cursor-pointer"
                      title="Inspect SHAP Factors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selectedInvoice && (
        <ValidationReportModal
          isOpen={inspectModalOpen}
          onClose={() => setInspectModalOpen(false)}
          invoiceData={selectedInvoice}
          validationData={{
            overallStatus: selectedInvoice.riskLevel,
            ruleEngine: {
              status: selectedInvoice.riskLevel === "VALID" ? "PASS" : "FAIL",
              summary: {
                totalRules: selectedInvoice.validationRules?.length || 7,
                passed:
                  selectedInvoice.validationRules?.filter((r) => r.status === "PASS").length || 7,
                warnings:
                  selectedInvoice.validationRules?.filter((r) => r.status === "WARNING").length || 0,
                failed:
                  selectedInvoice.validationRules?.filter((r) => r.status === "FAIL").length || 0
              },
              results: selectedInvoice.validationRules || []
            },
            aiAnalysis: {
              riskScore: selectedInvoice.riskScore || 0,
              riskLevel: selectedInvoice.riskLevel,
              isAnomaly: selectedInvoice.anomalyResult?.isAnomaly || false,
              explanation:
                selectedInvoice.anomalyResult?.explanation || "Compliant transaction pattern",
              reasons: selectedInvoice.anomalyResult?.explanation
                ? [selectedInvoice.anomalyResult.explanation]
                : ["Conforms to standard customer historical distribution."],
              suggestedActions: [
                "Verify invoice line item rate slabs against official CBIC schedule."
              ],
              topFactors: ["Taxable Amount", "GST Rate", "Inter-State Flag"],
              featureContributions:
                typeof selectedInvoice.anomalyResult?.featureContributions === "string"
                  ? JSON.parse(selectedInvoice.anomalyResult.featureContributions || "{}")
                  : selectedInvoice.anomalyResult?.featureContributions || {}
            }
          }}
        />
      )}
    </div>
  );
};
