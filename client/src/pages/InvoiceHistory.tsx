import React, { useState, useEffect } from "react";
import {
  FileText,
  Search,
  Filter,
  Eye,
  Printer,
  Trash2,
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  Calendar,
  Download,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { getInvoices, getInvoiceById, finalizeInvoice, deleteInvoice } from "../services/api";
import { Invoice } from "../types";
import { RiskBadge } from "../components/common/RiskBadge";
import { ValidationReportModal } from "../components/invoice/ValidationReportModal";
import { InvoicePrintModal } from "../components/invoice/InvoicePrintModal";

export const InvoiceHistory: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);

  const fetchInvoicesList = async () => {
    try {
      setLoading(true);
      const data = await getInvoices({
        search,
        riskLevel: riskFilter,
        status: statusFilter
      });
      setInvoices(data);
    } catch (err) {
      console.error("Failed to load invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoicesList();
  }, [riskFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInvoicesList();
  };

  const handleInspect = async (id: string) => {
    try {
      const inv = await getInvoiceById(id);
      setSelectedInvoice(inv);
      setInspectModalOpen(true);
    } catch (err) {
      alert("Failed to load invoice details");
    }
  };

  const handlePrint = async (id: string) => {
    try {
      const inv = await getInvoiceById(id);
      setSelectedInvoice(inv);
      setPrintModalOpen(true);
    } catch (err) {
      alert("Failed to load invoice print preview");
    }
  };

  const handleFinalize = async (id: string) => {
    try {
      await finalizeInvoice(id);
      fetchInvoicesList();
    } catch (err) {
      alert("Failed to finalize invoice");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this invoice record?")) {
      try {
        await deleteInvoice(id);
        fetchInvoicesList();
      } catch (err) {
        alert("Failed to delete invoice");
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="cyber-card p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Invoice History & Repository</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Searchable log of generated invoices, compliance statuses, and Explainable AI risk scores.
          </p>
        </div>

        <button
          onClick={fetchInvoicesList}
          className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-cyan-300 transition-all flex items-center gap-1.5 text-xs font-bold shadow-md"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="cyber-card p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by invoice number, customer name or GSTIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-hidden"
          />
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Risk Level Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Risk Tier:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="py-1.5 px-3 rounded-xl border border-slate-700 bg-slate-900 font-semibold text-white text-xs focus:border-cyan-500"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="VALID">🟢 Compliant</option>
              <option value="WARNING">🟠 Warning</option>
              <option value="POTENTIAL_RISK">🔴 Potential Risk</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-3 rounded-xl border border-slate-700 bg-slate-900 font-semibold text-white text-xs focus:border-cyan-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="VALIDATED">Validated</option>
              <option value="FINALIZED">Finalized</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="cyber-card rounded-3xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-4 px-4">Invoice No</th>
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-4">Customer</th>
                <th className="py-4 px-4 text-right">Taxable (₹)</th>
                <th className="py-4 px-4 text-right">GST (₹)</th>
                <th className="py-4 px-4 text-right">Grand Total (₹)</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-4 text-center">Risk Assessment</th>
                <th className="py-4 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/50 transition-colors group">
                  <td className="py-3.5 px-4 font-mono font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    {new Date(inv.invoiceDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                    })}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-200">{inv.customerName}</p>
                    <p className="text-[10px] font-mono text-cyan-400">{inv.customerGstin || "B2C"}</p>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                    ₹{inv.taxableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                    ₹{inv.totalGst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-white">
                    ₹{inv.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block font-bold text-[10px] px-2.5 py-1 rounded-full border ${
                        inv.status === "FINALIZED"
                          ? "bg-blue-950/80 text-cyan-300 border-cyan-500/40"
                          : inv.status === "VALIDATED"
                          ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/30"
                          : "bg-slate-900 text-slate-300 border-slate-700"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <RiskBadge level={inv.riskLevel} score={inv.riskScore} showScore />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleInspect(inv.id)}
                        title="Explainable AI & Rule Audit"
                        className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-cyan-300 border border-blue-500/30 transition-all hover:scale-110"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handlePrint(inv.id)}
                        title="Print / PDF Invoice"
                        className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all hover:scale-110"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      {inv.status !== "FINALIZED" && (
                        <button
                          onClick={() => handleFinalize(inv.id)}
                          title="Finalize Invoice"
                          className="p-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-400 border border-emerald-500/40 transition-all hover:scale-110"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(inv.id)}
                        title="Delete Invoice"
                        className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-900/50 transition-all hover:scale-110"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
                  : ["Financial metrics align with customer historical baseline."],
                suggestedActions: [
                  "Verify invoice items and confirm customer authorization."
                ],
                topFactors: ["Total Invoice Amount", "GST Rate", "Total Quantity"],
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
