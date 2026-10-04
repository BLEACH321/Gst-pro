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
  CheckCircle2,
  Zap
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
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-40 lg:hidden"
            onClick={onCloseMobile}
          />
        )}
      </AnimatePresence>

      {/* Floating Compact Cyber Island Block */}
      <motion.aside
        layout
        animate={{
          width: isCollapsed ? 68 : 280,
          scale: 1,
          opacity: 1
        }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        className={`fixed top-3 left-3 z-50 rounded-[26px] bg-[#0c0d16]/95 backdrop-blur-2xl text-zinc-300 flex flex-col border border-white/15 shadow-[0_15px_50px_rgba(0,0,0,0.9),0_0_20px_rgba(0,229,153,0.12),inset_0_1px_1px_rgba(255,255,255,0.18)] max-h-[calc(100vh-1.5rem)] overflow-hidden transition-transform duration-300 select-none ${
          isMobileOpen ? "translate-x-0 w-[280px] bottom-3" : "-translate-x-[150%] lg:translate-x-0"
        } ${isCollapsed ? "h-auto" : "bottom-3"}`}
      >
        {/* Dynamic Holographic Neon Rim Light */}
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-[#00E599]/20 via-[#00A878]/5 to-transparent pointer-events-none rounded-t-[26px]" />
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#00E599] to-transparent pointer-events-none opacity-60" />

        {/* Top Header: 3D Rotating Interactive Brand Block */}
        <div className="p-3 border-b border-white/10 flex items-center justify-between relative z-10 bg-white/[0.02]">
          <div
            className="flex items-center gap-3 cursor-pointer group w-full overflow-hidden"
            onClick={() => {
              if (isCollapsed) {
                onToggleCollapse();
              } else {
                onSelectTab("dashboard");
              }
            }}
            title={isCollapsed ? "Expand Navigation Block" : "Go to Dashboard"}
          >
            {/* Centered 3D Rotating Logo */}
            <div className="shrink-0 flex items-center justify-center mx-auto lg:mx-0 p-0.5">
              <Logo3D size="sm" />
            </div>

            {/* Expanded Brand Typography */}
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -8, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: "auto" }}
                  exit={{ opacity: 0, x: -8, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="min-w-0 flex-1 flex items-center justify-between overflow-hidden"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h1 className="font-black text-white text-xs tracking-tight uppercase group-hover:text-[#00E599] transition-colors truncate">
                        GST SAHAYAK
                      </h1>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00E599] shadow-[0_0_8px_#00E599] shrink-0" />
                    </div>
                    <p className="text-[8px] text-[#00E599] font-mono font-bold uppercase tracking-wider truncate flex items-center gap-1">
                      <Radio className="w-2 h-2 animate-pulse" />
                      Statutory Node
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleCollapse();
                    }}
                    className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0 ml-2"
                    title="Collapse (⌘B)"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Middle: Stack of Compact Animated Navigation Nodes */}
        <nav
          className={`px-2 py-2.5 space-y-1 relative z-10 custom-scrollbar ${
            isCollapsed ? "overflow-visible" : "flex-1 overflow-y-auto"
          }`}
        >
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
                  whileHover={{ scale: isCollapsed ? 1.08 : 1.02, x: isCollapsed ? 2 : 0 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => {
                    onSelectTab(item.id);
                    if (window.innerWidth < 1024) onCloseMobile();
                  }}
                  className={`w-full flex items-center rounded-xl transition-all duration-200 group relative cursor-pointer ${
                    isCollapsed ? "justify-center p-2.5 h-10 w-full" : "gap-3 px-3 py-2.5"
                  } ${
                    isActive
                      ? "text-black font-black"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  {/* Glowing Liquid Active Background Pill */}
                  {isActive && (
                    <motion.div
                      layoutId="active-island-block-pill"
                      className="absolute inset-0 bg-white rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.4),0_0_10px_rgba(0,229,153,0.3)]"
                      transition={{ type: "spring", stiffness: 500, damping: 32 }}
                    />
                  )}

                  {/* Left Neon Laser Pip */}
                  {isActive && (
                    <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-4 bg-[#00E599] rounded-r-full shadow-[0_0_8px_#00E599] z-20" />
                  )}

                  {/* Icon */}
                  <div className="relative z-10 flex items-center justify-center shrink-0">
                    <Icon
                      className={`w-4 h-4 transition-all duration-200 ${
                        isActive
                          ? "text-black stroke-[2.8] scale-105"
                          : item.highlight
                          ? "text-[#00E599] group-hover:scale-110 drop-shadow-[0_0_6px_rgba(0,229,153,0.6)]"
                          : "text-zinc-400 group-hover:text-white group-hover:scale-110"
                      }`}
                    />
                  </div>

                  {/* Expanded Text Labels */}
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        transition={{ duration: 0.18 }}
                        className="flex-1 flex items-center justify-between min-w-0 overflow-hidden relative z-10"
                      >
                        <span className="text-xs tracking-tight truncate text-left font-bold">
                          {item.label}
                        </span>

                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          {item.badge && (
                            <span className="text-[8px] font-mono font-black bg-[#00E599]/20 text-[#00E599] px-1.5 py-0.5 rounded-md border border-[#00E599]/30">
                              {item.badge}
                            </span>
                          )}
                          {item.highlight && !isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00E599] shadow-[0_0_8px_#00E599] animate-pulse" />
                          )}
                          <span className={`text-[9px] font-mono ${isActive ? "text-zinc-800 font-bold" : "text-zinc-500"}`}>
                            {item.shortcut}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Collapsed Mode Cyber Floating Tooltip */}
                {isCollapsed && hoveredTab === item.id && (
                  <motion.div
                    initial={{ opacity: 0, x: 6, scale: 0.92 }}
                    animate={{ opacity: 1, x: 14, scale: 1 }}
                    exit={{ opacity: 0, x: 6, scale: 0.92 }}
                    transition={{ type: "spring", stiffness: 450, damping: 25 }}
                    className="fixed left-20 z-50 px-3 py-1.5 rounded-xl bg-[#141624] text-white border border-[#00E599]/30 shadow-[0_10px_30px_rgba(0,0,0,0.9),0_0_15px_rgba(0,229,153,0.2)] flex items-center gap-2 pointer-events-none whitespace-nowrap"
                  >
                    <span className="text-xs font-black tracking-tight">{item.label}</span>
                    <span className="text-[9px] font-mono text-[#00E599] bg-[#00E599]/10 px-1.5 py-0.5 rounded-md border border-[#00E599]/20">
                      {item.shortcut}
                    </span>
                  </motion.div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Live Telemetry Card (When Expanded) */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="px-3 pb-2 overflow-hidden relative z-10"
            >
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#121422] to-[#0d0e18] border border-white/10 text-xs shadow-inner">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Crown className="w-3 h-3 text-[#00E599]" />
                    <span className="text-[9px] font-black uppercase tracking-wider text-white">
                      Statutory Tier
                    </span>
                  </div>
                  <span className="text-[8px] font-mono font-black text-[#00E599] bg-[#00E599]/15 px-1.5 py-0.5 rounded-md border border-[#00E599]/30 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" /> 99.8% ML
                  </span>
                </div>
                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mt-1.5">
                  <div className="bg-gradient-to-r from-[#00A878] to-[#00E599] h-full w-[98%] rounded-full shadow-[0_0_8px_#00E599]" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom: Compact User Block */}
        <div className="p-2 border-t border-white/10 bg-[#080912]/90 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2 min-w-0 overflow-hidden mx-auto lg:mx-0">
            {/* User Avatar */}
            <div className="relative shrink-0">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-zinc-800 to-zinc-700 border border-white/20 text-white flex items-center justify-center font-black text-[11px] shadow-inner">
                {user?.name ? user.name[0] : "S"}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-[#00E599] rounded-full border-2 border-[#0c0d16] shadow-[0_0_6px_#00E599]" />
            </div>

            {/* Expanded User Details */}
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -6, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: "auto" }}
                  exit={{ opacity: 0, x: -6, width: 0 }}
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
                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
    </>
  );
};
