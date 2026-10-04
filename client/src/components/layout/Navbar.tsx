import React, { useState } from "react";
import {
  Menu,
  Search,
  Bell,
  Plus,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  X,
  Sparkles,
  Command,
  Zap,
  Activity
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface NavbarProps {
  onOpenMobileSidebar: () => void;
  onNavigateTab: (tab: string) => void;
  globalSearch: string;
  onSearchChange: (val: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMobileSidebar,
  onNavigateTab,
  globalSearch,
  onSearchChange
}) => {
  const { user, business } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: "1",
      title: "e-Way Bill Auto-Compliance",
      desc: "3 high-value transactions (> ₹50,000) generated today require e-Way generation.",
      type: "warning",
      time: "10m ago"
    },
    {
      id: "2",
      title: "Isolation Forest ML Calibrated",
      desc: "Model trained on latest quarterly turnover with 99.8% precision score.",
      type: "success",
      time: "1h ago"
    },
    {
      id: "3",
      title: "2026 CBIC HSN Schedules Live",
      desc: "Synchronized active statutory rates for IT Hardware & Electronics.",
      type: "info",
      time: "4h ago"
    }
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#0a0a0d]/80 backdrop-blur-2xl border-b border-white/5 px-4 sm:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Mobile Hamburger + Global Search */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <button
            onClick={onOpenMobileSidebar}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 lg:hidden border border-white/10"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="relative w-full group">
            <Search className="w-4 h-4 text-zinc-500 group-focus-within:text-white absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" />
            <input
              type="text"
              placeholder="Search by invoice number, customer name, GSTIN, HSN..."
              value={globalSearch}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-14 py-2.5 bg-[#121216] hover:bg-[#15151b] focus:bg-[#181820] text-xs text-white placeholder-zinc-500 rounded-2xl border border-white/10 focus:border-white/30 focus:outline-hidden transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] font-medium"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {globalSearch ? (
                <button
                  onClick={() => onSearchChange("")}
                  className="text-zinc-400 hover:text-white p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[9px] font-mono text-zinc-400 bg-white/5 rounded-md border border-white/10">
                  <Command className="w-2.5 h-2.5" /> K
                </kbd>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: CRED-styled CTA + Verified GSTIN + Notification Pill */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* CRED Signature Inverted Action Button */}
          <button
            onClick={() => onNavigateTab("create-invoice")}
            className="cred-btn-primary py-2.5 px-4.5 text-xs"
          >
            <Plus className="w-4 h-4 text-black stroke-[3]" />
            <span className="hidden sm:inline tracking-tight">Create Invoice</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-2xl bg-[#121216] text-zinc-300 hover:text-white hover:bg-[#181820] border border-white/10 transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#00e599] rounded-full ring-2 ring-[#0a0a0d] shadow-[0_0_8px_#00e599]"></span>
            </button>

            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-3 w-80 sm:w-96 cred-card rounded-3xl p-4 shadow-2xl z-50 animate-fadeIn">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#00e599]" />
                      Statutory Notifications
                    </h3>
                    <span className="text-[10px] font-mono text-zinc-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                      3 Active
                    </span>
                  </div>

                  <div className="divide-y divide-white/5 mt-2 max-h-72 overflow-y-auto custom-scrollbar">
                    {notifications.map((n) => (
                      <div key={n.id} className="py-3 hover:bg-white/[0.03] rounded-xl px-2 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-black text-white">{n.title}</p>
                          <span className="text-[10px] font-mono text-zinc-500 shrink-0">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Business Entity Badge */}
          <div className="hidden md:flex items-center gap-3 pl-3 border-l border-white/10">
            <div className="text-right">
              <p className="text-xs font-black text-white truncate max-w-[180px] tracking-tight">
                {business?.businessName || "Gupta Enterprise Infotech"}
              </p>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e599]" />
                <span className="text-[10px] font-mono font-bold text-zinc-400">
                  {business?.gstin || "27AABCG1234F1Z5"}
                </span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-b from-white/10 to-transparent border border-white/10 flex items-center justify-center text-white shadow-inner">
              <ShieldCheck className="w-4 h-4 text-[#00e599]" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
