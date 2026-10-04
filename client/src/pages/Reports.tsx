import React, { useState, useEffect } from "react";
import {
  FileBarChart2,
  Calendar,
  Download,
  Printer,
  TrendingUp,
  FileCheck,
  AlertTriangle,
  Receipt,
  Layers,
  ShieldAlert,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { getReportsSummary } from "../services/api";

export const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"invoices" | "gst" | "issues" | "anomalies">("invoices");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await getReportsSummary(fromDate, toDate);
      setData(res);
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [fromDate, toDate]);

  const handlePrint = () => {
    window.print();
  };

  const totals = data?.totals || {
    totalInvoices: 110,
    totalTaxable: 14850000,
    totalCgst: 980000,
    totalSgst: 980000,
    totalIgst: 713000,
    totalGst: 2673000,
    grandTotal: 17523000,
    validCount: 92,
    warningCount: 10,
    riskCount: 8,
    anomalyCount: 8
  };

  const slabDistribution = data?.slabDistribution || [];
  const validationIssues = data?.validationIssues || [];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="cyber-card p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Statutory GST & Anomaly Reports
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Audit-ready GST tax breakdown, rate slab schedules, and validation compliance logs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/25 border border-blue-400/30"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report / PDF</span>
          </button>
        </div>
      </div>

      {/* Date Filter & Tabs Toolbar */}
      <div className="cyber-card p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Tab Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          {[
            { id: "invoices", label: "Invoice Summary", icon: Receipt },
            { id: "gst", label: "GST Tax Breakdown", icon: Layers },
            { id: "issues", label: "Validation Issues Log", icon: FileCheck },
            { id: "anomalies", label: "Anomaly Summary", icon: ShieldAlert }
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-glow-cyan border border-cyan-400/40"
                    : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Date pickers */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-bold uppercase text-[10px]">From:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="py-1 px-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white focus:border-cyan-500"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-bold uppercase text-[10px]">To:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="py-1 px-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white focus:border-cyan-500"
            />
          </div>
          {(fromDate || toDate) && (
            <button
              onClick={() => {
                setFromDate("");
                setToDate("");
              }}
              className="text-xs text-cyan-400 font-semibold hover:underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: INVOICE SUMMARY */}
      {activeTab === "invoices" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="cyber-card p-5 rounded-2xl">
              <span className="text-[11px] font-bold uppercase text-slate-400">Total Taxable Value</span>
              <h3 className="text-2xl font-black text-white font-mono mt-2">
                ₹{totals.totalTaxable.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Across {totals.totalInvoices} invoices</p>
            </div>

            <div className="cyber-card p-5 rounded-2xl hover:border-emerald-500/40 transition-colors">
              <span className="text-[11px] font-bold uppercase text-slate-400">Total GST Assessed</span>
              <h3 className="text-2xl font-black text-emerald-400 font-mono mt-2">
                ₹{totals.totalGst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] text-emerald-300/80 mt-0.5">CGST + SGST + IGST</p>
            </div>

            <div className="cyber-card p-5 rounded-2xl hover:border-cyan-500/40 transition-colors">
              <span className="text-[11px] font-bold uppercase text-slate-400">Gross Invoice Turnover</span>
              <h3 className="text-2xl font-black text-cyan-300 font-mono mt-2">
                ₹{totals.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Net business revenue</p>
            </div>

            <div className="cyber-card p-5 rounded-2xl">
              <span className="text-[11px] font-bold uppercase text-slate-400">Compliance Rate</span>
              <h3 className="text-2xl font-black text-white font-mono mt-2">
                {Math.round((totals.validCount / (totals.totalInvoices || 1)) * 100)}%
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {totals.validCount} Valid / {totals.riskCount} Risks
              </p>
            </div>
          </div>

          {/* Detailed Invoice Breakdown List */}
          <div className="cyber-card rounded-3xl border border-slate-800 p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Audit Invoices Master Roll
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">Invoice No</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3 text-right">Taxable (₹)</th>
                    <th className="py-3 px-3 text-right">CGST (₹)</th>
                    <th className="py-3 px-3 text-right">SGST (₹)</th>
                    <th className="py-3 px-3 text-right">IGST (₹)</th>
                    <th className="py-3 px-3 text-right">Total (₹)</th>
                    <th className="py-3 px-3 text-center">Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data?.invoices?.slice(0, 15).map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-slate-800/50">
                      <td className="py-3 px-3 font-mono font-bold text-white">{inv.invoiceNumber}</td>
                      <td className="py-3 px-3 text-slate-300">
                        {new Date(inv.invoiceDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short"
                        })}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-200">{inv.customerName}</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-300">
                        {inv.taxableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-cyan-400">
                        {inv.cgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-cyan-400">
                        {inv.sgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-cyan-400">
                        {inv.igst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-black text-white">
                        {inv.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block font-bold text-[10px] px-2 py-0.5 rounded-full border ${
                            inv.riskLevel === "VALID"
                              ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/30"
                              : inv.riskLevel === "WARNING"
                              ? "bg-amber-950/80 text-amber-300 border-amber-500/30"
                              : "bg-rose-950/80 text-rose-300 border-rose-500/30"
                          }`}
                        >
                          {inv.riskLevel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GST TAX BREAKDOWN & RATE SLABS */}
      {activeTab === "gst" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Tax Components Tri-Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="cyber-card p-6 rounded-3xl border border-slate-800 text-center">
              <span className="text-xs uppercase font-bold text-slate-400">Central GST (CGST)</span>
              <h3 className="text-2xl font-black text-white font-mono mt-2">
                ₹{totals.totalCgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Intra-State Central Treasury Allocation</p>
            </div>

            <div className="cyber-card p-6 rounded-3xl border border-slate-800 text-center">
              <span className="text-xs uppercase font-bold text-slate-400">State GST (SGST)</span>
              <h3 className="text-2xl font-black text-white font-mono mt-2">
                ₹{totals.totalSgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Maharashtra State Revenue Share</p>
            </div>

            <div className="cyber-card p-6 rounded-3xl border border-slate-800 text-center">
              <span className="text-xs uppercase font-bold text-slate-400">Integrated GST (IGST)</span>
              <h3 className="text-2xl font-black text-cyan-300 font-mono mt-2">
                ₹{totals.totalIgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Inter-State Place of Supply Levies</p>
            </div>
          </div>

          {/* Rate Slab Distribution Table */}
          <div className="cyber-card rounded-3xl border border-slate-800 p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              GST Council Rate Slabs Turnover Summary
            </h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Rate Bracket</th>
                  <th className="py-3 px-4 text-right">Taxable Turnover (₹)</th>
                  <th className="py-3 px-4 text-right">Computed Tax (₹)</th>
                  <th className="py-3 px-4">Standard Classification Goods</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {slabDistribution.map((item: any) => {
                  const rateNum = Number(item.slab.replace("%", ""));
                  const tax = Math.round(item.taxableValue * (rateNum / 100));
                  return (
                    <tr key={item.slab} className="hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-bold text-sm text-cyan-300">{item.slab} Slab</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white">
                        ₹{item.taxableValue.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                        ₹{tax.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-xs">
                        {item.slab === "18%"
                          ? "IT Hardware (8471), Cloud Services (9983), Software Consulting"
                          : item.slab === "28%"
                          ? "Air Conditioners (8415), Luxury Commercial Hardware"
                          : item.slab === "12%"
                          ? "Stationery Journals & Registers (4820)"
                          : "Exempt / Basic Goods"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: VALIDATION ISSUES LOG */}
      {activeTab === "issues" && (
        <div className="cyber-card rounded-3xl border border-slate-800 p-6 animate-fadeIn">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
            Aggregated Rule Discrepancies & Violations
          </h3>

          {validationIssues.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="font-bold text-white">No active rule violations detected in this period.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {validationIssues.map((issue: any) => (
                <div
                  key={issue.ruleId}
                  className="p-4 rounded-2xl border border-slate-800 bg-slate-950/80 flex items-start justify-between gap-4 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{issue.ruleId}</span>
                        <span className="font-bold text-slate-200">{issue.ruleName}</span>
                        <span className="text-[10px] bg-amber-950/80 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/30">
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-slate-400 mt-1">{issue.exampleMessage}</p>
                    </div>
                  </div>

                  <span className="font-mono font-black text-sm bg-black/40 text-amber-300 px-3 py-1 rounded-xl border border-amber-500/30">
                    {issue.count} Flags
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ANOMALY SUMMARY */}
      {activeTab === "anomalies" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="cyber-card text-slate-200 p-6 rounded-3xl border border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-2">
              Explainable AI Anomaly Detection Summary
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Evaluation summary produced by the Scikit-learn Isolation Forest algorithm against {totals.totalInvoices} transactions.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Normal Inliers
                </span>
                <p className="text-2xl font-black text-emerald-400 font-mono mt-1">
                  {totals.validCount} Invoices
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Follow standard business distributions</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Outlier Risk Cases
                </span>
                <p className="text-2xl font-black text-rose-400 font-mono mt-1">
                  {totals.anomalyCount} Invoices
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Volumetric / High Ticket Outliers</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Model Algorithm
                </span>
                <p className="text-base font-bold text-cyan-300 font-mono mt-1">
                  Isolation Forest (100 Trees)
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Contamination Rate: 15%</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
