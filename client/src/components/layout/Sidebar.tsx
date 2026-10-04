import React, { useState } from "react";
import {
  LayoutDashboard,
  Building2,
  Package,
  FilePlus2,
  FileText,
  AlertTriangle,
  FileBarChart2,
  ShieldCheck,
  LogOut,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Radio,
  Crown,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { Logo3D } from "../common/Logo3D";

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile
}) => {
  const { user, business, logout } = useAuth();
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

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
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden"
            onClick={onCloseMobile}
          />
        )}
      </AnimatePresence>

      {/* Floating Animated Collapsible Dock/Sidebar */}
      <motion.aside
        animate={{
          width: isCollapsed ? 76 : 280,
          x: 0
        }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        className={`fixed top-3 bottom-3 left-3 z-50 rounded-[28px] bg-[#0c0d14]/95 backdrop-blur-3xl text-zinc-300 flex flex-col border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.1)] transition-transform duration-300 lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0 w-[280px]" : "-translate-x-[150%] lg:translate-x-0"
        }`}
      >
        {/* Subtle Ambient Radial Glow inside the Dock */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#00E599]/15 via-[#00A878]/5 to-transparent rounded-t-[28px] pointer-events-none" />

        {/* Circular Morphing Toggle Pin Button on the Right Rim */}
        <motion.button
          onClick={onToggleCollapse}
          whileHover={{ scale: 1.18 }}
          whileTap={{ scale: 0.9 }}
          className="hidden lg:flex absolute -right-3.5 top-7 z-50 w-7 h-7 rounded-full bg-[#151722] hover:bg-[#1c1f2e] border border-[#00E599]/50 text-[#00E599] items-center justify-center shadow-[0_0_15px_rgba(0,229,153,0.35)] cursor-pointer"
          title={isCollapsed ? "Expand Sidebar (⌘B)" : "Collapse Sidebar (⌘B)"}
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          </motion.div>
        </motion.button>

        {/* Header: 3D Rotating Model Brand */}
        <div className="p-4 border-b border-white/5 flex items-center justify-center relative z-10 min-h-[72px]">
          <div
            className="flex items-center gap-3 cursor-pointer group w-full overflow-hidden"
            onClick={() => onSelectTab("dashboard")}
          >
            {/* Centered 3D Rotating Logo */}
            <div className="shrink-0 flex items-center justify-center mx-auto lg:mx-0">
              <Logo3D size="sm" />
            </div>

            {/* Expanded Brand Typography */}
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: "auto" }}
                  exit={{ opacity: 0, x: -10, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="min-w-0 flex-1 overflow-hidden"
                >
                  <div className="flex items-center gap-1.5">
                    <h1 className="font-black text-white text-sm tracking-tight uppercase group-hover:text-[#00E599] transition-colors truncate">
                      GST Sahayak
                    </h1>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E599] shadow-[0_0_8px_#00E599] shrink-0" />
                  </div>
                  <p className="text-[9px] text-[#00E599] font-mono font-bold uppercase tracking-wider truncate flex items-center gap-1">
                    <Radio className="w-2.5 h-2.5 animate-pulse" />
                    Protocol v2.4
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Dynamic Navigation Items */}
        <nav className="flex-1 px-2.5 py-4 space-y-1.5 overflow-y-auto custom-scrollbar relative z-10">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <div
                key={item.id}
                className="relative"
                onMouseEnter={() => setHoveredTab(item.id)}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    onSelectTab(item.id);
                    if (window.innerWidth < 1024) onCloseMobile();
                  }}
                  className={`w-full flex items-center rounded-2xl transition-all duration-200 group relative cursor-pointer ${
                    isCollapsed ? "justify-center p-3 h-12" : "gap-3 px-3.5 py-3"
                  } ${
                    isActive
                      ? "text-black font-black"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {/* Sliding Active Pill */}
                  {isActive && (
                    <motion.div
                      layoutId="active-floating-dock-pill"
                      className="absolute inset-0 bg-white rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.35),inset_0_1px_2px_rgba(255,255,255,0.9)]"
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                    />
                  )}

                  {/* Left Neon Accent on Active item */}
                  {isActive && (
                    <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#00E599] rounded-full shadow-[0_0_10px_#00E599] z-20" />
                  )}

                  {/* Icon */}
                  <div className="relative z-10 flex items-center justify-center shrink-0">
                    <Icon
                      className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                        isActive
                          ? "text-black stroke-[2.5]"
                          : item.highlight
                          ? "text-[#00E599]"
                          : "text-zinc-400 group-hover:text-white"
                      }`}
                    />
                  </div>

                  {/* Expanded Label and Shortcuts */}
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.18 }}
                        className="flex-1 flex items-center justify-between min-w-0 overflow-hidden relative z-10"
                      >
                        <span className="text-xs tracking-tight truncate text-left font-semibold">
                          {item.label}
                        </span>

                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          {item.badge && (
                            <span className="text-[8px] font-mono font-bold bg-[#00E599]/20 text-[#00E599] px-1.5 py-0.5 rounded-md border border-[#00E599]/30">
                              {item.badge}
                            </span>
                          )}
                          {item.highlight && !isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00E599] shadow-[0_0_8px_#00E599] animate-pulse" />
                          )}
                          <span className={`text-[9px] font-mono ${isActive ? "text-zinc-700" : "text-zinc-600"}`}>
                            {item.shortcut}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Collapsed Mode Hover Floating Tooltip */}
                {isCollapsed && hoveredTab === item.id && (
                  <motion.div
                    initial={{ opacity: 0, x: 8, scale: 0.95 }}
                    animate={{ opacity: 1, x: 16, scale: 1 }}
                    exit={{ opacity: 0, x: 8, scale: 0.95 }}
                    className="fixed left-20 z-50 px-3 py-1.5 rounded-xl bg-[#151722] text-white border border-white/15 shadow-2xl flex items-center gap-2 pointer-events-none whitespace-nowrap"
                  >
                    <span className="text-xs font-bold">{item.label}</span>
                    <span className="text-[9px] font-mono text-[#00E599] bg-white/5 px-1.5 py-0.5 rounded">
                      {item.shortcut}
                    </span>
                  </motion.div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Live Statutory ML Telemetry Widget (When Expanded) */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="px-3 pb-3 overflow-hidden relative z-10"
            >
              <div className="p-3 rounded-2xl bg-gradient-to-br from-[#121420] to-[#0c0e17] border border-white/10 text-xs shadow-inner">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-[#00E599]" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-white">
                      Compliance Tier
                    </span>
                  </div>
                  <span className="text-[8px] font-mono font-black text-[#00E599] bg-[#00E599]/15 px-1.5 py-0.5 rounded-full border border-[#00E599]/30 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" /> 99.8% ML
                  </span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="bg-gradient-to-r from-[#00A878] to-[#00E599] h-full w-[98%] rounded-full shadow-[0_0_8px_#00E599]" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User Account & Logout Footer */}
        <div className="p-3 border-t border-white/5 bg-[#080910]/90 rounded-b-[28px] flex items-center justify-between relative z-10 min-h-[64px]">
          <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
            {/* Avatar with online dot */}
            <div className="relative shrink-0 mx-auto lg:mx-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-zinc-800 to-zinc-700 border border-white/15 text-white flex items-center justify-center font-black text-xs shadow-inner">
                {user?.name ? user.name[0] : "S"}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#00E599] rounded-full border-2 border-[#0c0d14] shadow-[0_0_8px_#00E599]" />
            </div>

            {/* Expanded User Details */}
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: "auto" }}
                  exit={{ opacity: 0, x: -10, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="min-w-0 flex-1 overflow-hidden"
                >
                  <p className="text-xs font-black text-white truncate tracking-tight">
                    {user?.name || "Sunny Gupta"}
                  </p>
                  <p className="text-[9px] text-zinc-500 font-mono truncate">
                    {business?.gstin || "27AABCG1234F1Z5"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Logout Button */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={logout}
                title="Logout"
                className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
    </>
  );
};
