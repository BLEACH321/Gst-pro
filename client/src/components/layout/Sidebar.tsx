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
  CheckCircle2,
  User as UserIcon,
  LogOut,
  Zap,
  Crown,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { Logo3D } from "../common/Logo3D";

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onCloseMobile
}) => {
  const { user, business, logout } = useAuth();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "agent", label: "AI Agent Workspace", icon: Sparkles },
    { id: "create-invoice", label: "Create Invoice", icon: FilePlus2 },
    { id: "invoice-history", label: "Invoice History", icon: FileText },
    { id: "products", label: "Product Catalog", icon: Package },
    { id: "business", label: "Business Profile", icon: Building2 },
    { id: "anomalies", label: "Compliance & Risk", icon: AlertTriangle },
    { id: "reports", label: "Tax Reports", icon: FileBarChart2 },
    { id: "rules", label: "Rule Governance", icon: ShieldCheck }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-40 lg:hidden backdrop-blur-md"
            onClick={onCloseMobile}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#0a0a0d] text-zinc-300 flex flex-col transition-all duration-300 ease-in-out border-r border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06),0_20px_50px_rgba(0,0,0,0.9)] lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Subtle Ambient Sidebar Light */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#00E599]/5 to-transparent pointer-events-none" />

        {/* Minimalist Logo Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => onSelectTab("dashboard")}>
            <Logo3D size="md" />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-black text-white text-sm tracking-tight uppercase group-hover:text-[#00E599] transition-colors">
                  GST Sahayak
                </h1>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E599] shadow-[0_0_10px_#00E599] animate-pulse" />
              </div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                Compliance Protocol
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Animated Navigation Items */}
        <nav className="flex-1 px-3.5 py-6 space-y-1.5 overflow-y-auto custom-scrollbar relative z-10">
          <div className="px-3 pb-3 text-[9px] font-black uppercase tracking-widest text-zinc-500 flex items-center justify-between">
            <span>Workspace Modules</span>
            <span className="text-zinc-600 font-mono text-[10px]">{navItems.length.toString().padStart(2, "0")}</span>
          </div>

          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.035 }}
              >
                <motion.button
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs transition-all duration-200 group relative cursor-pointer ${
                    isActive ? "text-black font-black" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {/* Sliding Active Framer Motion Pill */}
                  {isActive && (
                    <motion.div
                      layoutId="active-sidebar-pill"
                      className="absolute inset-0 bg-white rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.25),inset_0_1px_2px_rgba(255,255,255,0.9)]"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    />
                  )}

                  {/* Icon with micro-interaction */}
                  <div className="relative z-10 flex items-center justify-center">
                    <Icon
                      className={`w-4 h-4 transition-all duration-200 group-hover:scale-110 ${
                        isActive ? "text-black stroke-[2.5]" : "text-zinc-400 group-hover:text-[#00E599]"
                      }`}
                    />
                  </div>

                  <span className="flex-1 text-left tracking-tight relative z-10">
                    {item.label}
                  </span>

                  {isActive && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-1.5 h-1.5 rounded-full bg-black shrink-0 relative z-10 shadow-sm"
                    />
                  )}
                </motion.button>
              </motion.div>
            );
          })}
        </nav>

        {/* GST Compliance Tier Mini Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-3.5 mx-3 mb-3 rounded-2xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/5 text-xs relative overflow-hidden group cursor-default shadow-subtle"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-[#00E599]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">
                Compliance Tier
              </span>
            </div>
            <span className="text-[9px] font-mono font-black text-[#00E599] bg-[#00E599]/10 px-2 py-0.5 rounded-full border border-[#00E599]/30">
              Verified
            </span>
          </div>
          <p className="text-[10px] text-zinc-400 leading-snug">
            Section 16(2) statutory pre-screen protocol active.
          </p>
        </motion.div>

        {/* User Profile Footer */}
        <div className="p-3.5 border-t border-white/5 bg-black/40 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-white/10 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-inner">
                {user?.name ? user.name[0] : "S"}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#00E599] rounded-full border-2 border-[#0a0a0d] shadow-[0_0_8px_#00E599]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-white truncate tracking-tight">
                {user?.name || "Sunny Gupta"}
              </p>
              <p className="text-[10px] text-zinc-500 font-mono truncate">
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
