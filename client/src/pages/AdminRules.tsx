import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Plus,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  ToggleLeft,
  ToggleRight,
  Info,
  Layers,
  History,
  RefreshCw,
  Sparkles,
  Sliders,
  Cpu
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

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header HUD Banner */}
      <div className="cyber-card rounded-3xl border border-slate-800 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-2">
            <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            Deterministic Pre-Validation & Statutory Engine
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            GST Rule Engine Configuration
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage active validation constraints, threshold parameters, and inspect security audit trails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchRulesAndLogs}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-750 text-slate-300 hover:text-white hover:border-cyan-500/50 transition-colors"
            title="Refresh Rules"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-cyan-400" : ""}`} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl text-xs font-black shadow-glow-cyan transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Rule</span>
          </button>
        </div>
      </div>

      {/* Statutory Disclaimer Alert */}
      <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-300">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-amber-200">Compliance Architecture Notice:</h4>
          <p className="mt-0.5 leading-relaxed text-amber-300/80">
            The rules configured in this application represent pre-validation guidelines and standard
            GST schedules. They provide internal business checks and should not be construed as the
            complete exhaustive legal text of the official Goods and Services Tax Acts and Rules.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab("rules")}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "rules"
              ? "border-cyan-400 text-cyan-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Configured GST Rules ({rules.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "audit"
              ? "border-cyan-400 text-cyan-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <History className="w-4 h-4" />
          <span>System Audit Logs ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: RULES TABLE */}
      {activeTab === "rules" && (
        <div className="cyber-card rounded-3xl border border-slate-800 overflow-hidden animate-fadeIn">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-4 px-4">Rule ID</th>
                  <th className="py-4 px-4">Rule Name</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Severity</th>
                  <th className="py-4 px-4">Rule Description</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">{rule.ruleId}</td>
                    <td className="py-3.5 px-4 font-bold text-white">{rule.ruleName}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-850 border border-slate-750 text-slate-300">
                        {rule.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          rule.severity === "ERROR"
                            ? "bg-rose-950/80 text-rose-300 border-rose-500/40"
                            : rule.severity === "WARNING"
                            ? "bg-amber-950/80 text-amber-300 border-amber-500/40"
                            : "bg-blue-950/80 text-blue-300 border-blue-500/40"
                        }`}
                      >
                        {rule.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 max-w-sm leading-relaxed">
                      {rule.description}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleRule(rule)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${
                          rule.isEnabled
                            ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40 shadow-glow-emerald"
                            : "bg-slate-900 text-slate-400 border-slate-800"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${rule.isEnabled ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`} />
                        {rule.isEnabled ? "Enabled" : "Disabled"}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleOpenEdit(rule)}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Edit Rule"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT LOGS */}
      {activeTab === "audit" && (
        <div className="cyber-card rounded-3xl border border-slate-800 p-6 animate-fadeIn">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            Security & Audit Activity Trail
          </h3>

          <div className="divide-y divide-slate-800/60">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3.5 flex items-start justify-between gap-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 flex items-center justify-center font-bold text-xs mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{log.action}</span>
                      <span className="text-[10px] font-mono bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 px-2 py-0.5 rounded">
                        {log.entityType}
                      </span>
                    </div>
                    <p className="text-slate-300 mt-0.5">{log.details}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Triggered by: <span className="text-slate-300 font-medium">{log.user?.name || "System"}</span>
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-mono text-slate-400 shrink-0">
                  {new Date(log.createdAt).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Rule Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="2xl"
        title={editingRule ? "Edit GST Validation Rule" : "Create Custom GST Validation Rule"}
        subtitle="Configure deterministic rule parameters and compliance enforcement level."
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Rule ID <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                disabled={Boolean(editingRule)}
                value={formData.ruleId}
                onChange={(e) => setFormData({ ...formData, ruleId: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2 text-xs font-mono font-bold uppercase rounded-xl bg-slate-900 border border-slate-750 text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-hidden disabled:opacity-50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-slate-750 text-white focus:border-cyan-400 focus:outline-hidden font-semibold"
              >
                <option value="GST_COMPLIANCE">GST Compliance</option>
                <option value="TAX_CALCULATION">Tax Calculation</option>
                <option value="STRUCTURE">Structure & Mandatory</option>
                <option value="BUSINESS_LOGIC">Business Logic</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Rule Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Place of Supply State Alignment"
              value={formData.ruleName}
              onChange={(e) => setFormData({ ...formData, ruleName: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-slate-750 text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Severity</label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-slate-750 text-white focus:border-cyan-400 focus:outline-hidden font-bold"
              >
                <option value="ERROR">ERROR (Blocks Validation)</option>
                <option value="WARNING">WARNING (Flags Advisory)</option>
                <option value="INFO">INFO (Notice)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Status</label>
              <select
                value={formData.isEnabled ? "true" : "false"}
                onChange={(e) => setFormData({ ...formData, isEnabled: e.target.value === "true" })}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-slate-750 text-white focus:border-cyan-400 focus:outline-hidden font-semibold"
              >
                <option value="true">Enabled (Active in Validation)</option>
                <option value="false">Disabled (Bypass Rule)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Rule Description</label>
            <textarea
              rows={3}
              placeholder="Detailed description of statutory requirement and failure condition..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 text-xs rounded-xl bg-slate-900 border border-slate-750 text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-hidden"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl text-xs font-black shadow-glow-cyan transition-all"
            >
              {editingRule ? "Update Rule" : "Create Rule"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
