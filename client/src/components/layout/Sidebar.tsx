import React from "react";
import {
  LayoutDashboard,
  Building2,
  Package,
  FilePlus2,
  FileText,
  AlertTriangle,
  FileBarChart2,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  Zap,
  Crown,
  Sparkles,
  ChevronRight,
  Cpu,
  Radio,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { Logo3D } from "../common/Logo3D";

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose
}) => {
  const { user, business, logout } = useAuth();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, shortcut: "⌘1", badge: "Live" },
    { id: "agent", label: "AI Agent Workspace", icon: Sparkles, shortcut: "⌘2", highlight: true },
    { id: "create-invoice", label: "Create Invoice", icon: FilePlus2, shortcut: "⌘3" },
    { id: "invoice-history", label: "Invoice History", icon: FileText, shortcut: "⌘4" },
    { id: "products", label: "Product Catalog", icon: Package, shortcut: "⌘5" },
    { id: "business", label: "Business Profile", icon: Building2, shortcut: "⌘6" },
    { id: "anomalies", label: "Compliance & Risk", icon: AlertTriangle, shortcut: "⌘7", alert: true },
    { id: "reports", label: "Tax Reports", icon: FileBarChart2, shortcut: "⌘8" },
    { id: "rules", label: "Rule Governance", icon: ShieldCheck, shortcut: "⌘9" }
  ];

  return (
    <>
      {/* Immersive Glass Backdrop for Overlay mode */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-[#050914]/80 backdrop-blur-md z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Cybernetic Unique Sidebar Chassis */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-[#0a0a0f]/95 backdrop-blur-3xl text-zinc-300 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] border-r border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.08)] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Dynamic Holographic Scanline & Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-[#00E599]/10 via-[#00A878]/5 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-[#00E599]/40 via-transparent to-[#00E599]/20 pointer-events-none" />

        {/* 3D Brand Hub Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between relative z-10 bg-white/[0.02]">
          <div
            className="flex items-center gap-3.5 group cursor-pointer"
            onClick={() => onSelectTab("dashboard")}
          >
            {/* Interactive 3D Model Logo */}
            <Logo3D size="md" />

            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-black text-white text-sm tracking-tight uppercase group-hover:text-[#00E599] transition-colors">
                  GST Sahayak
                </h1>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E599] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E599]"></span>
                </span>
              </div>
              <p className="text-[9px] text-[#00E599] font-mono font-bold uppercase tracking-widest flex items-center gap-1 mt-0.5">
                <Radio className="w-2.5 h-2.5 animate-pulse" />
                Statutory Engine v2.4
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Modules */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar relative z-10">
          <div className="px-3 pb-2.5 text-[9px] font-black uppercase tracking-widest text-zinc-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3 h-3 text-[#00E599]" />
              Workspace Modules
            </span>
            <span className="text-zinc-600 font-mono text-[9px] bg-white/5 px-2 py-0.5 rounded-full">
              {navItems.length} APPS
            </span>
          </div>

          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: index * 0.025 }}
              >
                <button
                  onClick={() => {
                    onSelectTab(item.id);
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group relative cursor-pointer ${
                    isActive
                      ? "text-black font-black"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {/* Sliding Active Pill */}
                  {isActive && (
                    <motion.div
                      layoutId="active-sidebar-pill-v2"
                      className="absolute inset-0 bg-gradient-to-r from-white via-white to-zinc-100 rounded-xl shadow-[0_0_25px_rgba(255,255,255,0.3),inset_0_1px_1px_rgba(255,255,255,1)]"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    />
                  )}

                  {/* Left Neon Accent Bar for Active Item */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-[#00E599] rounded-r-full shadow-[0_0_10px_#00E599] z-20" />
                  )}

                  {/* Icon with gradient badge */}
                  <div
                    className={`relative z-10 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                      isActive
                        ? "bg-black/10 text-black"
                        : item.highlight
                        ? "bg-[#00E599]/10 text-[#00E599] group-hover:bg-[#00E599]/20"
                        : "bg-white/5 text-zinc-400 group-hover:text-white group-hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                  </div>

                  {/* Label */}
                  <span className="flex-1 text-left tracking-tight relative z-10 truncate">
                    {item.label}
                  </span>

                  {/* Badges / Shortcuts */}
                  <div className="relative z-10 flex items-center gap-1.5">
                    {item.badge && (
                      <span className="text-[8px] font-mono font-bold bg-[#00E599]/20 text-[#00E599] px-1.5 py-0.5 rounded-md border border-[#00E599]/30">
                        {item.badge}
                      </span>
                    )}
                    {item.highlight && !isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00E599] shadow-[0_0_8px_#00E599] animate-pulse" />
                    )}
                    {isActive ? (
                      <span className="text-[9px] font-mono text-zinc-600 bg-black/10 px-1.5 py-0.5 rounded">
                        {item.shortcut}
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.shortcut}
                      </span>
                    )}
                  </div>
                </button>
              </motion.div>
            );
          })}
        </nav>

        {/* Live Telemetry & Compliance Tier Card */}
        <div className="p-3 mx-3 mb-2 rounded-2xl bg-gradient-to-br from-[#12121c] to-[#0d0d14] border border-white/10 relative overflow-hidden shadow-xl">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-[#00E599]/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-[#00E599]" />
              <span className="text-[10px] font-black uppercase tracking-wider text-white">
                Statutory Health
              </span>
            </div>
            <span className="text-[8px] font-mono font-black text-[#00E599] bg-[#00E599]/15 px-2 py-0.5 rounded-full border border-[#00E599]/30 flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5" /> 99.8% ML
            </span>
          </div>
          <div className="space-y-1.5 text-[10px] text-zinc-400 font-mono">
            <div className="flex justify-between">
              <span>Section 16(2) Pre-Check</span>
              <span className="text-[#00E599]">Active</span>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-[#00A878] to-[#00E599] h-full w-[98%] rounded-full shadow-[0_0_8px_#00E599]" />
            </div>
          </div>
        </div>

        {/* User Profile Bar */}
        <div className="p-3 border-t border-white/10 bg-[#08080c]/80 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-zinc-800 to-zinc-700 border border-white/15 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-inner">
                {user?.name ? user.name[0] : "S"}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#00E599] rounded-full border-2 border-[#0a0a0f] shadow-[0_0_8px_#00E599]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-white truncate tracking-tight">
                {user?.name || "Sunny Gupta"}
              </p>
              <p className="text-[9px] text-zinc-500 font-mono truncate">
                {business?.gstin || "27AABCG1234F1Z5"}
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={logout}
            title="Logout"
            className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </motion.button>
        </div>
      </aside>
    </>
  );
};
