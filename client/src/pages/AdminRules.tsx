import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Plus,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Info,
  Layers,
  History,
  RefreshCw,
  Sparkles,
  Sliders,
  Cpu,
  Check,
  X,
  Lock,
  ArrowUpRight
} from "lucide-react";
import { getRules, createRule, updateRule, getAuditLogs } from "../services/api";
import { Rule } from "../types";
import { Modal } from "../components/common/Modal";

export const AdminRules: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"rules" | "audit">("rules");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [formData, setFormData] = useState({
    ruleId: "",
    ruleName: "",
    description: "",
    category: "GST_COMPLIANCE",
    severity: "ERROR" as "ERROR" | "WARNING" | "INFO",
    isEnabled: true,
    conditionType: "CUSTOM"
  });

  const fetchRulesAndLogs = async () => {
    try {
      setLoading(true);
      const [rData, aData] = await Promise.all([getRules(), getAuditLogs()]);
      setRules(rData);
      setAuditLogs(aData);
    } catch (err) {
      console.error("Failed to load rules:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRulesAndLogs();
  }, []);

  const handleToggleRule = async (rule: Rule) => {
    try {
      const updated = await updateRule(rule.id, { isEnabled: !rule.isEnabled });
      setRules((prev) => prev.map((r) => (r.id === rule.id ? updated : r)));
    } catch (err) {
      alert("Failed to update rule status");
    }
  };

  const handleOpenAdd = () => {
    setEditingRule(null);
    setFormData({
      ruleId: `RULE-GST-0${rules.length + 1}`,
      ruleName: "",
      description: "",
      category: "GST_COMPLIANCE",
      severity: "ERROR",
      isEnabled: true,
      conditionType: "CUSTOM"
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (rule: Rule) => {
    setEditingRule(rule);
    setFormData({
      ruleId: rule.ruleId,
      ruleName: rule.ruleName,
      description: rule.description,
      category: rule.category,
      severity: rule.severity,
      isEnabled: rule.isEnabled,
      conditionType: rule.conditionType
    });
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRule) {
        await updateRule(editingRule.id, formData);
      } else {
        await createRule(formData);
      }
      setModalOpen(false);
      fetchRulesAndLogs();
    } catch (err: any) {
      alert(err.message || "Failed to save validation rule");
    }
  };

  const categoryLabels: Record<string, { label: string; color: string }> = {
    GST_COMPLIANCE: { label: "Statutory Law", color: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" },
    TAX_CALCULATION: { label: "Tax Schedules", color: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20" },
    STRUCTURE: { label: "Invoice Schema", color: "bg-purple-500/10 text-purple-300 border-purple-500/20" },
    BUSINESS_LOGIC: { label: "Fiscal Controls", color: "bg-amber-500/10 text-amber-300 border-amber-500/20" }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 font-sans">
      {/* Header HUD Banner with High-End Typography */}
      <div className="cred-card rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden">
        {/* Subtle Ambient Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00A878] via-[#00E599] to-cyan-400" />

        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E599]/10 border border-[#00E599]/30 text-[#00E599] text-[11px] font-mono font-semibold tracking-wide">
            <Cpu className="w-3.5 h-3.5 text-[#00E599] animate-pulse" />
            <span>CENTRAL STATUTORY DIRECTORY • CBIC 2026 EDITION</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white">
            GST Validation & Statutory Rules
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
            Deterministic pre-validation constraints enforcing Section 16(2), Section 31 tax invoice particulars,
            mathematical precision, and real-time e-Way / e-Invoice compliance.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={fetchRulesAndLogs}
            disabled={loading}
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer shadow-subtle"
            title="Reload Statutory Rules"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#00E599]" : ""}`} />
          </button>

          <button
            onClick={handleOpenAdd}
            className="cred-btn-emerald py-3 px-5 text-xs font-bold font-sans cursor-pointer shadow-[0_0_25px_rgba(0,229,153,0.35)]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Custom Rule</span>
          </button>
        </div>
      </div>

      {/* Statutory Practitioner Notice */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#141208]/90 border border-amber-500/25 flex items-start gap-3.5 text-xs shadow-subtle">
        <div className="p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <h4 className="font-semibold text-amber-200 tracking-tight">
            Statutory Legal Framework Notice
          </h4>
          <p className="leading-relaxed text-amber-300/80 font-normal text-[11px]">
            Rules execute deterministically in memory prior to invoice persistence. All logic aligns with the
            Central Goods and Services Tax (CGST) Act, 2017 and Notification No. 13/2020-Central Tax (e-Invoicing provisions).
          </p>
        </div>
      </div>

      {/* Modern Pill Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab("rules")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "rules"
              ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.25)]"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Active Rules Catalog</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
            activeTab === "rules" ? "bg-black/15 text-black" : "bg-white/10 text-zinc-300"
          }`}>
            {rules.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "audit"
              ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.25)]"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>System Audit Trail</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
            activeTab === "audit" ? "bg-black/15 text-black" : "bg-white/10 text-zinc-300"
          }`}>
            {auditLogs.length}
          </span>
        </button>
      </div>

      {/* TAB 1: RULES DIRECTORY */}
      {activeTab === "rules" && (
        <div className="cred-card rounded-3xl overflow-hidden shadow-2xl animate-fadeIn">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0b101c]/90 border-b border-white/10 text-zinc-400 font-mono text-[10px] uppercase tracking-wider">
                  <th className="py-4 px-5">Rule Code</th>
                  <th className="py-4 px-5">Statutory Constraint</th>
                  <th className="py-4 px-5">Category</th>
                  <th className="py-4 px-5">Severity Level</th>
                  <th className="py-4 px-5">Legal & Mathematical Description</th>
                  <th className="py-4 px-5 text-center">Status</th>
                  <th className="py-4 px-5 text-center">Manage</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {rules.map((rule) => {
                  const cat = categoryLabels[rule.category] || {
                    label: rule.category,
                    color: "bg-white/5 text-zinc-300 border-white/10"
                  };

                  return (
                    <tr
                      key={rule.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Rule ID in Crisp Monospace */}
                      <td className="py-4 px-5 font-mono text-xs font-bold text-[#00E599]">
                        <span className="bg-[#00E599]/10 px-2.5 py-1 rounded-lg border border-[#00E599]/25 shadow-xs">
                          {rule.ruleId}
                        </span>
                      </td>

                      {/* Rule Name */}
                      <td className="py-4 px-5">
                        <p className="font-bold text-white text-xs tracking-tight group-hover:text-[#00E599] transition-colors">
                          {rule.ruleName}
                        </p>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">
                          {rule.conditionType || "STATUTORY"}
                        </span>
                      </td>

                      {/* Category Badge */}
                      <td className="py-4 px-5">
                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${cat.color}`}>
                          {cat.label}
                        </span>
                      </td>

                      {/* Severity Pill */}
                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                            rule.severity === "ERROR"
                              ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
                              : rule.severity === "WARNING"
                              ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                              : "bg-blue-500/10 text-blue-300 border-blue-500/30"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              rule.severity === "ERROR"
                                ? "bg-rose-400"
                                : rule.severity === "WARNING"
                                ? "bg-amber-400"
                                : "bg-blue-400"
                            }`}
                          />
                          {rule.severity === "ERROR" ? "Blocking Error" : rule.severity === "WARNING" ? "Statutory Warning" : "Advisory"}
                        </span>
                      </td>

                      {/* Rule Description */}
                      <td className="py-4 px-5 text-zinc-300 text-[11px] leading-relaxed max-w-sm">
                        {rule.description}
                      </td>

                      {/* Status Toggle Button */}
                      <td className="py-4 px-5 text-center">
                        <button
                          onClick={() => handleToggleRule(rule)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold font-mono transition-all cursor-pointer border ${
                            rule.isEnabled
                              ? "bg-[#00E599]/15 text-[#00E599] border-[#00E599]/40 shadow-[0_0_12px_rgba(0,229,153,0.25)]"
                              : "bg-zinc-800/80 text-zinc-400 border-zinc-700"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              rule.isEnabled ? "bg-[#00E599] animate-pulse" : "bg-zinc-500"
                            }`}
                          />
                          {rule.isEnabled ? "Active" : "Disabled"}
                        </button>
                      </td>

                      {/* Edit Button */}
                      <td className="py-4 px-5 text-center">
                        <button
                          onClick={() => handleOpenEdit(rule)}
                          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition-all cursor-pointer"
                          title="Configure Parameters"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT TRAIL */}
      {activeTab === "audit" && (
        <div className="cred-card rounded-3xl overflow-hidden shadow-2xl animate-fadeIn">
          <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Statutory Engine Audit Journal
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Cryptographically verifiable record of configuration changes and schema modifications.
              </p>
            </div>
            <span className="text-[10px] font-mono text-[#00E599] bg-[#00E599]/10 px-2.5 py-1 rounded-full border border-[#00E599]/25">
              IMMUTABLE JOURNAL
            </span>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0b101c]/90 border-b border-white/10 text-zinc-400 font-mono text-[10px] uppercase tracking-wider">
                  <th className="py-3.5 px-5">Timestamp</th>
                  <th className="py-3.5 px-5">Action Type</th>
                  <th className="py-3.5 px-5">Target Entity</th>
                  <th className="py-3.5 px-5">Actor</th>
                  <th className="py-3.5 px-5">Modifications & Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-500">
                      No audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02]">
                      <td className="py-3.5 px-5 text-zinc-400">
                        {new Date(log.timestamp).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short"
                        })}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-cyan-300 font-bold">{log.entityType}</td>
                      <td className="py-3.5 px-5 text-zinc-300 font-sans">{log.user?.name || "System Automated"}</td>
                      <td className="py-3.5 px-5 text-zinc-400 font-sans text-xs">{log.details}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit / Add Rule Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingRule ? "Edit Statutory Rule Parameter" : "Register Custom GST Rule"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 font-sans">
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              Rule Identifier (Code)
            </label>
            <input
              type="text"
              required
              value={formData.ruleId}
              onChange={(e) => setFormData({ ...formData, ruleId: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#121420] text-xs text-white rounded-xl border border-white/15 focus:border-[#00E599] font-mono focus:outline-hidden"
              placeholder="RULE-GST-011"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              Rule Statutory Name
            </label>
            <input
              type="text"
              required
              value={formData.ruleName}
              onChange={(e) => setFormData({ ...formData, ruleName: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#121420] text-xs text-white rounded-xl border border-white/15 focus:border-[#00E599] focus:outline-hidden"
              placeholder="e.g. Reverse Charge Mechanism (RCM) Eligibility"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#121420] text-xs text-white rounded-xl border border-white/15 focus:border-[#00E599] focus:outline-hidden"
              >
                <option value="GST_COMPLIANCE">Statutory Law</option>
                <option value="TAX_CALCULATION">Tax Schedules</option>
                <option value="STRUCTURE">Invoice Schema</option>
                <option value="BUSINESS_LOGIC">Fiscal Controls</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                Severity Level
              </label>
              <select
                value={formData.severity}
                onChange={(e) =>
                  setFormData({ ...formData, severity: e.target.value as any })
                }
                className="w-full px-3.5 py-2.5 bg-[#121420] text-xs text-white rounded-xl border border-white/15 focus:border-[#00E599] focus:outline-hidden"
              >
                <option value="ERROR">Blocking Error (Disallows Invoice)</option>
                <option value="WARNING">Statutory Warning (Requires Review)</option>
                <option value="INFO">Advisory Notice</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              Legal & Calculation Description
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#121420] text-xs text-white rounded-xl border border-white/15 focus:border-[#00E599] focus:outline-hidden"
              placeholder="Describe the statutory condition, formula, or law section being validated..."
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isEnabled"
              checked={formData.isEnabled}
              onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
              className="w-4 h-4 rounded-md accent-[#00E599]"
            />
            <label htmlFor="isEnabled" className="text-xs font-bold text-zinc-200">
              Enable this rule immediately for pre-validation
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cred-btn-emerald py-2.5 px-5 text-xs font-bold cursor-pointer"
            >
              {editingRule ? "Save Rule Configuration" : "Deploy Rule"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
