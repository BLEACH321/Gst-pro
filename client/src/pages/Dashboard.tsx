import React, { useState, useEffect } from "react";
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  TrendingUp,
  DollarSign,
  Plus,
  Eye,
  Printer,
  Calendar,
  Sparkles,
  RefreshCw,
  Zap,
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers,
  Cpu,
  Crown,
  ChevronRight,
  Gauge
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { getDashboardData, getInvoiceById } from "../services/api";
import { RiskBadge } from "../components/common/RiskBadge";
import { ValidationReportModal } from "../components/invoice/ValidationReportModal";
import { InvoicePrintModal } from "../components/invoice/InvoicePrintModal";
import { Invoice } from "../types";

interface DashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateTab }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [agentInput, setAgentInput] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await getDashboardData();
      setData(res);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleInspect = async (invId: string) => {
    try {
      const fullInv = await getInvoiceById(invId);
      setSelectedInvoice(fullInv);
      setInspectModalOpen(true);
    } catch (err) {
      console.error("Failed to inspect invoice:", err);
    }
  };

  const handlePrintPreview = async (invId: string) => {
    try {
      const fullInv = await getInvoiceById(invId);
      setSelectedInvoice(fullInv);
      setPrintModalOpen(true);
    } catch (err) {
      console.error("Failed to load invoice for print:", err);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-white">
          <RefreshCw className="w-8 h-8 animate-spin text-white" />
          <p className="text-xs font-black uppercase tracking-widest text-zinc-400">
            Calibrating CRED Compliance Engine...
          </p>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {
    totalInvoices: 0,
    validated: 0,
    warnings: 0,
    riskFound: 0,
    anomaliesDetected: 0,
    totalTaxableAmount: 0,
    totalGst: 0
  };

  const complianceScore = kpis.totalInvoices > 0 ? Math.round((kpis.validated / kpis.totalInvoices) * 1000) : 0;

  const pieData = [
    { name: "Compliant / Valid", value: kpis.validated, color: "#00e599" },
    { name: "Warning Status", value: kpis.warnings, color: "#f59e0b" },
    { name: "Potential Risk", value: kpis.riskFound, color: "#ff2d78" }
  ];

  const monthlyData = data?.monthlyTrends || [];

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* 1. Agent-First Central Command Box */}
      <div className="cred-card p-6 sm:p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-[#0C182B] via-[#10213A] to-[#0C182B] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#00A878]/15 border border-[#00A878]/30 flex items-center justify-center text-[#00A878]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-tight">
                WHAT CAN I DO FOR YOU?
              </h2>
              <p className="text-[11px] text-zinc-400 font-medium">
                Type natural instructions or trigger tools across your authenticated GST workspace.
              </p>
            </div>
          </div>
          <span className="px-3 py-0.5 rounded-full bg-[#00A878]/10 text-[#00A878] border border-[#00A878]/30 font-mono text-[9px] font-black uppercase">
            ✓ Agent Ready
          </span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (agentInput.trim()) {
              onNavigateTab("agent");
            }
          }}
          className="flex items-center gap-2.5 pt-1"
        >
          <input
            type="text"
            value={agentInput}
            onChange={(e) => setAgentInput(e.target.value)}
            placeholder="Try: Create an invoice for Rahul Enterprises for 5 ASUS laptops at ₹75,000 each..."
            className="flex-1 px-4 py-3.5 bg-black/60 rounded-2xl border border-white/10 text-xs font-medium text-white placeholder-zinc-500 focus:border-[#00A878] focus:outline-hidden"
          />
          <button
            type="submit"
            className="cred-btn-emerald py-3.5 px-6 text-xs whitespace-nowrap"
          >
            <span>Ask Agent</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-mono text-zinc-400">
          <span className="text-zinc-500 font-bold uppercase">Quick Tools:</span>
          <button
            onClick={() => onNavigateTab("create-invoice")}
            className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/15 text-zinc-300 border border-white/5 transition-colors cursor-pointer"
          >
            + Create Draft Invoice
          </button>
          <button
            onClick={() => onNavigateTab("products")}
            className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/15 text-zinc-300 border border-white/5 transition-colors cursor-pointer"
          >
            + Add Product Catalogue
          </button>
          <button
            onClick={() => onNavigateTab("anomalies")}
            className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/15 text-zinc-300 border border-white/5 transition-colors cursor-pointer"
          >
            + Run Anomaly Scan
          </button>
        </div>
      </div>

      {/* CRED Hero Section: Score Meter + Tagline + Quick CTAs */}
      <div className="cred-card rounded-3xl p-6 sm:p-10 border border-white/10 relative overflow-hidden">
        {/* Background Ambient Lights */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00e599]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-[#a855f7]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left: Punchy CRED Headline */}
          <div className="max-w-xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-300">
              <Sparkles className="w-3.5 h-3.5 text-[#00e599]" />
              GST Sahayak Hybrid Intelligence Protocol
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tighter leading-tight uppercase">
              NOT JUST COMPLIANT. <br />
              <span className="text-gradient-cred-white">BULLETPROOF.</span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 font-medium leading-relaxed">
              Every invoice is pre-screened with 100-tree Isolation Forest ML and statutory rule engines before touching the government portal.
            </p>

            {/* Quick CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={() => onNavigateTab("create-invoice")}
                className="cred-btn-primary"
              >
                <Plus className="w-4 h-4 text-black stroke-[3]" />
                <span>Create Invoice</span>
              </button>

              <button
                onClick={() => onNavigateTab("anomalies")}
                className="cred-btn-secondary"
              >
                <Activity className="w-4 h-4 text-[#00e599]" />
                <span>Inspect Anomaly Radar</span>
              </button>

              <button
                onClick={fetchDashboard}
                title="Refresh Telemetry"
                className="p-3.5 rounded-2xl bg-zinc-900/90 text-zinc-400 hover:text-white border border-white/10 hover:border-white/20 transition-all cursor-pointer shadow-subtle"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right: CRED Signature Radial Compliance Score Gauge */}
          <div className="bg-[#101014] rounded-3xl p-6 sm:p-7 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_20px_40px_rgba(0,0,0,0.9)] flex flex-col items-center text-center relative shrink-0 min-w-[280px]">
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2">
              <Crown className="w-3.5 h-3.5 text-[#00e599]" />
              <span>GST Compliance Score</span>
            </div>

            {/* Circular Gauge Graphic */}
            <div className="relative w-40 h-40 flex items-center justify-center my-1">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                {/* Track */}
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  className="stroke-zinc-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Progress Arc */}
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  stroke="#00e599"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 48}
                  strokeDashoffset={2 * Math.PI * 48 * (1 - Math.min(complianceScore / 1000, 1))}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Score Value inside */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-white font-mono tracking-tighter">
                  {complianceScore}
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest text-[#00e599] font-mono">
                  / 1000 MAX
                </span>
              </div>
            </div>

            {/* Status Pill */}
            <div className="mt-1">
              <span className={`inline-block px-3 py-1 rounded-full ${kpis.totalInvoices > 0 ? "bg-[#00e599]/10 text-[#00e599] border-[#00e599]/30" : "bg-white/5 text-zinc-400 border-white/10"} text-[10px] font-black uppercase tracking-widest`}>
                {kpis.totalInvoices > 0 ? (complianceScore >= 800 ? "EXCELLENT TIER" : complianceScore >= 500 ? "GOOD TIER" : "NEEDS ATTENTION") : "INITIALIZING WORKSPACE"}
              </span>
              <p className="text-[10px] text-zinc-500 mt-1.5 font-medium">
                {kpis.totalInvoices > 0 ? "0 Active Penalties • 100% Tax Split Accuracy" : "0 Invoices • Pre-screen your first invoice to build score"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Core KPI Metrics (CRED-Styled Neumorphic Beveled Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Invoices */}
        <div className="cred-card p-5 rounded-3xl flex flex-col justify-between group cursor-default">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Invoices</span>
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-white font-mono tracking-tight">{kpis.totalInvoices}</h3>
            <p className="text-[10px] text-[#00e599] font-bold mt-1 uppercase tracking-wider flex items-center gap-1">
              <span>{kpis.totalInvoices > 0 ? "Active Compliance Cycle" : "New Account Cycle"}</span>
            </p>
          </div>
        </div>

        {/* Validated */}
        <div className="cred-card p-5 rounded-3xl flex flex-col justify-between group cursor-default">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Validated</span>
            <div className="w-8 h-8 rounded-xl bg-[#00e599]/10 border border-[#00e599]/30 text-[#00e599] flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-[#00e599] font-mono tracking-tight">{kpis.validated}</h3>
            <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-wider font-bold">
              {kpis.totalInvoices > 0 ? `${Math.round((kpis.validated / kpis.totalInvoices) * 100)}% Pass Rate` : "0% Pass Rate"}
            </p>
          </div>
        </div>

        {/* Risk Found */}
        <div className="cred-card p-5 rounded-3xl flex flex-col justify-between group cursor-default">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Risk Found</span>
            <div className="w-8 h-8 rounded-xl bg-[#ff2d78]/10 border border-[#ff2d78]/30 text-[#ff2d78] flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-[#ff2d78] font-mono tracking-tight">{kpis.riskFound}</h3>
            <p className="text-[10px] text-zinc-400 font-bold mt-1 uppercase tracking-wider">
              {kpis.riskFound > 0 ? "Action required" : "0 Critical Risks"}
            </p>
          </div>
        </div>

        {/* AI Anomalies */}
        <div className="cred-card p-5 rounded-3xl flex flex-col justify-between group cursor-default">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">AI Anomalies</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-amber-400 font-mono tracking-tight">{kpis.anomaliesDetected}</h3>
            <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-wider font-bold">ML Outliers</p>
          </div>
        </div>

        {/* Total Taxable */}
        <div className="cred-card p-5 rounded-3xl flex flex-col justify-between group cursor-default">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Taxable Vol</span>
            <div className="w-8 h-8 rounded-xl bg-[#00d2ff]/10 border border-[#00d2ff]/30 text-[#00d2ff] flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-white font-mono tracking-tight">
              ₹{(kpis.totalTaxableAmount / 100000).toFixed(1)}L
            </h3>
            <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-wider font-bold">Net Base Value</p>
          </div>
        </div>

        {/* Total GST */}
        <div className="cred-card p-5 rounded-3xl flex flex-col justify-between group cursor-default">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total GST</span>
            <div className="w-8 h-8 rounded-xl bg-[#a855f7]/10 border border-[#a855f7]/30 text-[#c084fc] flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-[#00d2ff] font-mono tracking-tight">
              ₹{(kpis.totalGst / 100000).toFixed(1)}L
            </h3>
            <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-wider font-bold">Assessed Tax</p>
          </div>
        </div>
      </div>

      {/* Analytics Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Invoice & Revenue Trend */}
        <div className="lg:col-span-8 cred-card p-6 sm:p-8 rounded-3xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#00e599]" />
                Turnover vs Statutory GST Collection
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Turnover vs tax collection across the operational fiscal period.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold text-zinc-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full uppercase tracking-widest">
              6-Month Audit Trend
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, ""]}
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
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "12px", color: "#a1a1aa" }} />
                <Bar dataKey="taxable" name="Taxable Value (₹)" fill="#ffffff" radius={[6, 6, 0, 0]} />
                <Bar dataKey="gst" name="GST Assessed (₹)" fill="#00e599" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Validation Risk Donut */}
        <div className="lg:col-span-4 cred-card p-6 sm:p-8 rounded-3xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00e599]" />
              Risk Classification
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Breakdown of invoices by rule and anomaly risk tier.
            </p>
          </div>

          <div className="h-48 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0c0c0e" strokeWidth={3} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#121216",
                    borderColor: "rgba(255, 255, 255, 0.15)",
                    borderRadius: "14px",
                    color: "#fff",
                    fontSize: "11px",
                    fontWeight: "bold"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 text-xs">
            {pieData.map((p) => (
              <div key={p.name} className="flex items-center justify-between p-2.5 rounded-2xl bg-black/40 border border-white/5">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="font-bold text-zinc-300">{p.name}</span>
                </div>
                <span className="font-mono font-black text-white">{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CRED Recent Pre-Validated Invoices Data Table */}
      <div className="cred-card rounded-3xl overflow-hidden border border-white/10">
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/[0.01]">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#00e599]" />
              Recent Pre-Validated Invoices
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Latest transactions evaluated by the hybrid GST rule & Explainable AI engine.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab("invoice-history")}
            className="text-xs font-black text-white hover:text-zinc-300 hover:underline flex items-center gap-1.5 uppercase tracking-wider"
          >
            <span>View All Invoices</span>
            <ArrowUpRight className="w-4 h-4 text-[#00e599]" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-black/60 border-b border-white/5 text-zinc-400 font-black uppercase text-[10px] tracking-widest">
                <th className="py-4 px-5">Invoice No</th>
                <th className="py-4 px-5">Date</th>
                <th className="py-4 px-5">Customer</th>
                <th className="py-4 px-5 text-right">Taxable (₹)</th>
                <th className="py-4 px-5 text-right">GST (₹)</th>
                <th className="py-4 px-5 text-right">Amount (₹)</th>
                <th className="py-4 px-5 text-center">Status</th>
                <th className="py-4 px-5 text-center">Risk Tier</th>
                <th className="py-4 px-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(!data?.recentInvoices || data.recentInvoices.length === 0) ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-black uppercase tracking-wider text-white">No Invoices Created Yet</p>
                      <p className="text-[11px] text-zinc-400 max-w-sm">
                        Create your first pre-validated GST invoice or ask the GSTSAHAYAK agent in the command bar above.
                      </p>
                      <button
                        onClick={() => onNavigateTab("create-invoice")}
                        className="cred-btn-primary py-2 px-4 text-xs mt-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create First Invoice</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                data.recentInvoices.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="py-4 px-5 font-mono font-black text-white group-hover:text-[#00e599] transition-colors">
                      {inv.invoiceNumber || "INV-NEW"}
                    </td>
                    <td className="py-4 px-5 text-zinc-400">
                      {inv.date ? new Date(inv.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      }) : "Today"}
                    </td>
                    <td className="py-4 px-5 font-bold text-zinc-200">{inv.customer || "Walk-in Customer"}</td>
                    <td className="py-4 px-5 text-right font-mono text-zinc-400">
                      ₹{Number(inv.taxable || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-5 text-right font-mono text-zinc-400">
                      ₹{Number(inv.gst || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-5 text-right font-mono font-black text-white">
                      ₹{Number(inv.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-5 text-center">
                      <span
                        className={`inline-block font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                          inv.validation === "VALIDATED" || inv.validation === "FINALIZED"
                            ? "bg-[#00e599]/10 text-[#00e599] border-[#00e599]/30"
                            : "bg-white/5 text-zinc-300 border-white/10"
                        }`}
                      >
                        {inv.validation || "DRAFT"}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <RiskBadge level={inv.risk || "VALID"} score={inv.riskScore || 0} showScore />
                    </td>
                    <td className="py-4 px-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleInspect(inv.id)}
                          title="Inspect Explainable AI & Rules"
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white border border-white/10 transition-all hover:scale-110 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handlePrintPreview(inv.id)}
                          title="Print / PDF Invoice"
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white border border-white/10 transition-all hover:scale-110 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {selectedInvoice && (
        <>
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
                    selectedInvoice.validationRules?.filter((r) => r.status === "WARNING").length ||
                    0,
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
                  "Verify invoice totals and customer purchase order before filing."
                ],
                topFactors: ["Total Invoice Amount", "GST Rate", "Quantity"],
                featureContributions:
                  typeof selectedInvoice.anomalyResult?.featureContributions === "string"
                    ? JSON.parse(selectedInvoice.anomalyResult.featureContributions || "{}")
                    : selectedInvoice.anomalyResult?.featureContributions || {}
              }
            }}
            onPrint={() => {
              setInspectModalOpen(false);
              setPrintModalOpen(true);
            }}
          />

          <InvoicePrintModal
            isOpen={printModalOpen}
            onClose={() => setPrintModalOpen(false)}
            invoice={selectedInvoice}
          />
        </>
      )}
    </div>
  );
};
