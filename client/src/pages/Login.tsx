import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Logo3D } from "../components/common/Logo3D";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Mail,
  Building,
  User as UserIcon,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
  Box,
  Tag,
  Settings,
  AlertTriangle,
  FileCheck,
  Check,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LoginProps {
  onBackToLanding?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onBackToLanding }) => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form Fields (Blank by default)
  const [emailOrGstin, setEmailOrGstin] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [gstin, setGstin] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Floating background particles
  const [particles] = useState(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1.5,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 4,
    }))
  );

  // Password policy evaluation
  const hasFirstUpper = /^[A-Z]/.test(password);
  const hasMinLength = password.length >= 8;
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  const hasLetters = /[a-zA-Z]/.test(password);
  const isPasswordValid = hasFirstUpper && hasMinLength && hasNumber && hasSymbol && hasLetters;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Validate password complexity
    if (!hasFirstUpper) {
      setError("Password must start with an uppercase letter (A-Z).");
      return;
    }
    if (!hasMinLength) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (!hasNumber) {
      setError("Password must contain at least one numerical digit (0-9).");
      return;
    }
    if (!hasSymbol) {
      setError("Password must contain at least one special symbol (!@#$%^&*...).");
      return;
    }

    if (isRegister && password !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await register({ name, email: emailOrGstin, password, businessName, gstin });
      } else {
        await login(emailOrGstin, password);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const leftNodes = [
    { label: "Product Recognition", icon: Box, color: "#00E599", sub: "Auto AI Classification" },
    { label: "HSN/SAC Suggestion", icon: Tag, color: "#38bdf8", sub: "CBIC 2026 Table Lookup" },
    { label: "GST Calculation", icon: Settings, color: "#a78bfa", sub: "Deterministic 4-Way Split" }
  ];

  const rightNodes = [
    { label: "Rule Engine", icon: ShieldCheck, color: "#00E599", sub: "10 Statutory Rules" },
    { label: "Risk Analysis", icon: AlertTriangle, color: "#fbbf24", sub: "Isolation Forest ML" },
    { label: "AI Explanation", icon: Sparkles, color: "#38bdf8", sub: "SHAP Explainability" }
  ];

  return (
    <div className="min-h-screen bg-[#060c14] text-[#F7F8F6] flex flex-col justify-between font-sans relative overflow-x-hidden selection:bg-[#00E599] selection:text-black">
      {/* Dynamic Animated Ambient Background Glows */}
      <motion.div
        animate={{
          scale: [1, 1.18, 1],
          opacity: [0.12, 0.22, 0.12],
          x: [0, 20, 0],
          y: [0, -15, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-10 w-[600px] h-[600px] bg-[#00E599]/20 rounded-full blur-[170px] pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.15, 0.25, 0.15],
          x: [0, -25, 0],
          y: [0, 20, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 right-10 w-[650px] h-[650px] bg-[#00A878]/20 rounded-full blur-[180px] pointer-events-none"
      />

      {/* Floating Starfield Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0.1, y: `${p.y}vh`, x: `${p.x}vw` }}
            animate={{
              y: [`${p.y}vh`, `${(p.y + 20) % 100}vh`, `${p.y}vh`],
              opacity: [0.15, 0.7, 0.15],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute rounded-full bg-[#00E599]"
            style={{ width: `${p.size}px`, height: `${p.size}px` }}
          />
        ))}
      </div>

      {/* ================= TOP HEADER ================= */}
      <header className="p-6 sm:px-12 flex items-center justify-between relative z-20">
        {/* Brand Logo with optional back button */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={onBackToLanding}
          title="Back to Landing Page"
        >
          <Logo3D size="md" />
          <div className="flex flex-col">
            <span className="font-black text-xl text-white tracking-tight uppercase leading-none group-hover:text-[#00E599] transition-colors">
              GSTSAHAYAK
            </span>
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">
              AI TAX ENGINE
            </span>
          </div>
        </div>

        {/* Top-Right Tagline & Back to Home */}
        <div className="flex items-center gap-4">
          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-xl hover:bg-white/5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back Home</span>
            </button>
          )}
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-zinc-400 border-l border-white/10 pl-4">
            <span className="w-4 h-0.5 bg-[#00E599] animate-pulse" />
            <span>Smarter GST Compliance. Stronger Businesses.</span>
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTAINER ================= */}
      <main className="max-w-7xl mx-auto px-6 sm:px-12 py-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10 flex-1">
        {/* ================= LEFT COLUMN: HERO SHOWCASE & 3D HOLOGRAM ================= */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 space-y-6"
        >
          {/* Header Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E599]/10 border border-[#00E599]/25 text-[11px] font-black tracking-[0.2em] text-[#00E599] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E599] animate-ping" />
            AI POWERED • RULE BASED • GST COMPLIANT
          </div>

          {/* Large Hero Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.04] uppercase">
            PRE-VALIDATE INVOICES<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E599] via-[#38bdf8] to-[#00A878]">
              BEFORE THEY REACH
            </span><br />
            <span className="text-[#00E599] drop-shadow-[0_0_25px_rgba(0,229,153,0.3)]">
              THE PORTAL.
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-zinc-300 font-medium leading-relaxed max-w-xl">
            Combine deterministic statutory GST rules with Explainable AI to detect anomalies, calculate taxes, and eliminate errors — before you finalize.
          </p>

          {/* 3 Pill Badges */}
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-wider text-zinc-300">
            <motion.div
              whileHover={{ y: -2, scale: 1.02 }}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0b1828] border border-white/10 shadow-lg"
            >
              <ShieldCheck className="w-4 h-4 text-[#00E599]" />
              <span>GST RULE VALIDATION</span>
            </motion.div>
            <motion.div
              whileHover={{ y: -2, scale: 1.02 }}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0b1828] border border-white/10 shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-[#38bdf8]" />
              <span>AI ANOMALY DETECTION</span>
            </motion.div>
            <motion.div
              whileHover={{ y: -2, scale: 1.02 }}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0b1828] border border-white/10 shadow-lg"
            >
              <FileCheck className="w-4 h-4 text-[#00E599]" />
              <span>EXPLAINABLE AI INSIGHTS</span>
            </motion.div>
          </div>

          {/* ================= 3D HOLOGRAPHIC INVOICE PREVIEW & CONNECTED NODES ================= */}
          <div className="pt-2 relative flex items-center justify-center max-w-2xl">
            {/* SVG Dynamic Glowing Circuit Lines */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10 hidden sm:block overflow-visible"
              viewBox="0 0 600 300"
              fill="none"
            >
              {/* Left Circuit Path 1 (Product Recognition) */}
              <motion.path
                d="M 170 65 C 220 65, 230 110, 260 110"
                stroke="rgba(0, 229, 153, 0.4)"
                strokeWidth="2"
                strokeDasharray="4 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
              {/* Left Circuit Path 2 (HSN/SAC) */}
              <motion.path
                d="M 170 145 C 215 145, 225 150, 260 150"
                stroke="rgba(56, 189, 248, 0.45)"
                strokeWidth="2"
                strokeDasharray="4 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
              />
              {/* Left Circuit Path 3 (GST Calculation) */}
              <motion.path
                d="M 170 225 C 220 225, 230 190, 260 190"
                stroke="rgba(167, 139, 250, 0.4)"
                strokeWidth="2"
                strokeDasharray="4 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />

              {/* Right Circuit Path 1 (Rule Engine) */}
              <motion.path
                d="M 430 65 C 380 65, 370 110, 340 110"
                stroke="rgba(0, 229, 153, 0.4)"
                strokeWidth="2"
                strokeDasharray="4 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
              />
              {/* Right Circuit Path 2 (Risk Analysis) */}
              <motion.path
                d="M 430 145 C 385 145, 375 150, 340 150"
                stroke="rgba(251, 191, 36, 0.45)"
                strokeWidth="2"
                strokeDasharray="4 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.9, repeat: Infinity, ease: "linear" }}
              />
              {/* Right Circuit Path 3 (AI Explanation) */}
              <motion.path
                d="M 430 225 C 380 225, 370 190, 340 190"
                stroke="rgba(56, 189, 248, 0.4)"
                strokeWidth="2"
                strokeDasharray="4 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
              />
            </svg>

            {/* Left Connected Stack Nodes */}
            <div className="hidden sm:flex flex-col gap-3.5 shrink-0 z-20 -mr-3">
              {leftNodes.map((node, i) => {
                const Icon = node.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.15 }}
                    whileHover={{ scale: 1.06, x: 6 }}
                    className="bg-[#0b1726]/95 backdrop-blur-xl px-3.5 py-2.5 rounded-2xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex items-center gap-3 cursor-default group"
                  >
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center shadow-inner"
                      style={{
                        backgroundColor: `${node.color}15`,
                        borderColor: `${node.color}40`,
                        borderWidth: 1,
                        color: node.color
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-black text-white block group-hover:text-[#00E599] transition-colors whitespace-nowrap">
                        {node.label}
                      </span>
                      <span className="text-[9px] font-mono text-zinc-400 block whitespace-nowrap">
                        {node.sub}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Central 3D Hologram Floating Invoice Card */}
            <motion.div
              animate={{
                y: [-5, 5, -5],
                rotateX: [1, -1, 1],
                rotateY: [-1.5, 1.5, -1.5],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              whileHover={{ scale: 1.04 }}
              className="bg-gradient-to-b from-[#0e1d30]/95 via-[#0b1624]/95 to-[#070e18]/95 backdrop-blur-2xl rounded-3xl p-5 border border-[#00E599]/40 shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(0,229,153,0.25)] w-full max-w-xs relative z-20 space-y-3.5 overflow-hidden"
            >
              {/* Shimmering Laser Scan Line */}
              <motion.div
                animate={{ y: [-150, 320] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-x-0 h-10 bg-gradient-to-b from-transparent via-[#00E599]/20 to-transparent pointer-events-none"
              />

              {/* Card Top Pill & Title */}
              <div className="flex items-center justify-between pb-2 border-b border-white/10 relative z-10">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#00E599] animate-ping" />
                  <span className="text-xs font-black uppercase text-zinc-200 font-mono tracking-wider">
                    INVOICE
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#00E599]/20 text-[#00E599] border border-[#00E599]/50 text-[9px] font-black uppercase tracking-wider shadow-[0_0_15px_rgba(0,229,153,0.3)]">
                  VALIDATED
                </span>
              </div>

              {/* Amount Display */}
              <div className="flex items-baseline justify-between pt-0.5 relative z-10">
                <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
                  Tax Total (18%):
                </span>
                <span className="text-xl font-mono font-black text-white text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-200">
                  ₹ 1,50,000
                </span>
              </div>

              {/* Validated Line Items List */}
              <div className="space-y-2 pt-0.5 relative z-10">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-2.5 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between text-[11px]"
                >
                  <div>
                    <span className="font-bold text-white block">Laptop ASUS TUF</span>
                    <span className="text-zinc-400 font-mono text-[9px]">HSN 8471 • Qty 2</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#00E599]">GST 18%</span>
                    <div className="w-4 h-4 rounded-full bg-[#00E599]/20 flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-[#00E599]" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-2.5 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between text-[11px]"
                >
                  <div>
                    <span className="font-bold text-white block">Wireless Mouse</span>
                    <span className="text-zinc-400 font-mono text-[9px]">HSN 8471 • Qty 5</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#00E599]">GST 18%</span>
                    <div className="w-4 h-4 rounded-full bg-[#00E599]/20 flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-[#00E599]" />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Verified Ribbon Bottom */}
              <div className="pt-2 flex items-center justify-center relative z-10">
                <div className="w-full py-1.5 rounded-xl bg-gradient-to-r from-[#00A878]/30 via-[#00E599]/30 to-[#00A878]/30 border border-[#00E599]/40 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,153,0.2)]">
                  <Check className="w-3.5 h-3.5 text-[#00E599] stroke-[3]" />
                  <span className="text-[#00E599] text-[11px] font-black tracking-wide uppercase">
                    Verified Compliant
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Right Connected Stack Nodes */}
            <div className="hidden sm:flex flex-col gap-3.5 shrink-0 z-20 -ml-3">
              {rightNodes.map((node, i) => {
                const Icon = node.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.15 }}
                    whileHover={{ scale: 1.06, x: -6 }}
                    className="bg-[#0b1726]/95 backdrop-blur-xl px-3.5 py-2.5 rounded-2xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex items-center gap-3 cursor-default group"
                  >
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center shadow-inner"
                      style={{
                        backgroundColor: `${node.color}15`,
                        borderColor: `${node.color}40`,
                        borderWidth: 1,
                        color: node.color
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-black text-white block group-hover:text-[#00E599] transition-colors whitespace-nowrap">
                        {node.label}
                      </span>
                      <span className="text-[9px] font-mono text-zinc-400 block whitespace-nowrap">
                        {node.sub}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Bottom Security Footer */}
          <div className="flex items-center gap-2.5 text-xs text-zinc-400 pt-2 font-semibold">
            <ShieldCheck className="w-4 h-4 text-[#00E599]" />
            <span>Bank-Grade Encryption • Section 16(2) Statutory Engine • Built for Indian Enterprises</span>
          </div>
        </motion.div>

        {/* ================= RIGHT COLUMN: AUTH FORM CARD ================= */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5"
        >
          <div className="bg-[#0b1522]/95 backdrop-blur-2xl rounded-3xl p-7 sm:p-9 border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_40px_rgba(0,229,153,0.12)] relative space-y-5">
            {/* Animated Tab Switcher between Login and Register */}
            <div className="flex items-center p-1 bg-[#060c14] rounded-2xl border border-white/10 relative">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setError(null);
                }}
                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all relative z-10 flex items-center justify-center gap-2 ${
                  !isRegister ? "text-[#070e17]" : "text-zinc-400 hover:text-white"
                }`}
              >
                {!isRegister && (
                  <motion.div
                    layoutId="auth-tab-pill"
                    className="absolute inset-0 bg-gradient-to-r from-[#00A878] to-[#00E599] rounded-xl shadow-[0_0_20px_rgba(0,229,153,0.4)]"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10">Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setError(null);
                }}
                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all relative z-10 flex items-center justify-center gap-2 ${
                  isRegister ? "text-[#070e17]" : "text-zinc-400 hover:text-white"
                }`}
              >
                {isRegister && (
                  <motion.div
                    layoutId="auth-tab-pill"
                    className="absolute inset-0 bg-gradient-to-r from-[#00A878] to-[#00E599] rounded-xl shadow-[0_0_20px_rgba(0,229,153,0.4)]"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10">Create Account</span>
              </button>
            </div>

            {/* Header copy */}
            <div>
              <span className="text-[11px] font-bold text-[#00E599] block mb-1">
                {isRegister ? "Start 14-Day Free Enterprise Trial" : "Welcome back"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                {isRegister ? "Register your " : "Login to your "}
                <span className="text-[#00E599]">GSTSAHAYAK</span> workspace
              </h2>
              <p className="text-xs text-zinc-400 mt-1 font-medium leading-relaxed">
                {isRegister
                  ? "Join 1,200+ GST registered enterprises eliminating manual errors with AI."
                  : "Access your business, manage invoices, and stay GST compliant — all in one place."}
              </p>
            </div>

            {/* Error / Success Alerts */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="p-3.5 bg-[#D64545]/15 border border-[#D64545]/30 rounded-2xl text-xs text-[#D64545] font-semibold flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="p-3.5 bg-[#00E599]/15 border border-[#00E599]/30 rounded-2xl text-xs text-[#00E599] font-semibold flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* The Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <AnimatePresence>
                {isRegister && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3.5"
                  >
                    <div>
                      <label className="text-[11px] font-bold text-zinc-300 block mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Sunny Gupta"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-[#08121f] rounded-2xl border border-white/10 text-xs font-medium text-white placeholder-zinc-500 focus:border-[#00E599] focus:outline-hidden transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-300 block mb-1">
                        Enterprise / Business Name
                      </label>
                      <div className="relative">
                        <Building className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Gupta Enterprise Infotech Pvt Ltd"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-[#08121f] rounded-2xl border border-white/10 text-xs font-medium text-white placeholder-zinc-500 focus:border-[#00E599] focus:outline-hidden transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-300 block mb-1">
                        Business GSTIN (15 Digits)
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={15}
                        placeholder="27AABCG1234F1Z5"
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value.toUpperCase())}
                        className="w-full px-4 py-2.5 bg-[#08121f] rounded-2xl border border-white/10 text-xs font-mono font-bold uppercase text-white placeholder-zinc-500 focus:border-[#00E599] focus:outline-hidden transition-colors"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email / GSTIN Field */}
              <div>
                <label className="text-[11px] font-bold text-zinc-300 block mb-1">
                  Email or GSTIN
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your email or GSTIN"
                    value={emailOrGstin}
                    onChange={(e) => setEmailOrGstin(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#08121f] rounded-2xl border border-white/10 text-xs font-medium text-white placeholder-zinc-500 focus:border-[#00E599] focus:outline-hidden transition-colors"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="text-[11px] font-bold text-zinc-300 block mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-2.5 bg-[#08121f] rounded-2xl border border-white/10 text-xs font-medium text-white placeholder-zinc-500 focus:border-[#00E599] focus:outline-hidden transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Policy Real-Time Checklist */}
                {password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 rounded-2xl bg-[#060e18] border border-white/10 text-xs space-y-2 font-mono mt-2"
                  >
                    <div className="text-zinc-400 font-bold font-sans text-[10px] uppercase tracking-wider flex items-center justify-between border-b border-white/5 pb-1.5">
                      <span>Password Security Requirements</span>
                      <span className={`text-[10px] font-bold ${isPasswordValid ? "text-[#00E599]" : "text-amber-400"}`}>
                        {isPasswordValid ? "Compliant ✓" : "Requirements Pending"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className={`flex items-center gap-1.5 transition-colors ${hasFirstUpper ? "text-[#00E599]" : "text-zinc-500"}`}>
                        <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black border ${hasFirstUpper ? "bg-[#00E599]/20 border-[#00E599] text-[#00E599]" : "bg-white/5 border-zinc-700 text-zinc-500"}`}>
                          {hasFirstUpper ? "✓" : "A"}
                        </span>
                        <span>1st letter uppercase</span>
                      </div>

                      <div className={`flex items-center gap-1.5 transition-colors ${hasMinLength ? "text-[#00E599]" : "text-zinc-500"}`}>
                        <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black border ${hasMinLength ? "bg-[#00E599]/20 border-[#00E599] text-[#00E599]" : "bg-white/5 border-zinc-700 text-zinc-500"}`}>
                          {hasMinLength ? "✓" : "8"}
                        </span>
                        <span>Min. 8 characters</span>
                      </div>

                      <div className={`flex items-center gap-1.5 transition-colors ${hasNumber ? "text-[#00E599]" : "text-zinc-500"}`}>
                        <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black border ${hasNumber ? "bg-[#00E599]/20 border-[#00E599] text-[#00E599]" : "bg-white/5 border-zinc-700 text-zinc-500"}`}>
                          {hasNumber ? "✓" : "#"}
                        </span>
                        <span>Numbers (0-9)</span>
                      </div>

                      <div className={`flex items-center gap-1.5 transition-colors ${hasSymbol ? "text-[#00E599]" : "text-zinc-500"}`}>
                        <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black border ${hasSymbol ? "bg-[#00E599]/20 border-[#00E599] text-[#00E599]" : "bg-white/5 border-zinc-700 text-zinc-500"}`}>
                          {hasSymbol ? "✓" : "@"}
                        </span>
                        <span>Special symbol (@#$)</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Confirm Password (Register Mode) */}
              {isRegister && (
                <div>
                  <label className="text-[11px] font-bold text-zinc-300 block mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-11 py-2.5 bg-[#08121f] rounded-2xl border border-white/10 text-xs font-medium text-white placeholder-zinc-500 focus:border-[#00E599] focus:outline-hidden transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Remember Me & Forgot Password (Login Mode) */}
              {!isRegister && (
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label className="flex items-center gap-2 text-zinc-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-900 text-[#00E599] focus:ring-[#00E599]"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => alert("Password reset link has been dispatched to your registered work email.")}
                    className="text-[#00E599] font-bold hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Main Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-2 bg-gradient-to-r from-[#00A878] via-[#00E599] to-[#00A878] hover:opacity-95 text-[#070e17] font-black text-xs uppercase tracking-wider py-3.5 rounded-2xl shadow-[0_0_30px_rgba(0,229,153,0.35)] flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Authenticating Workspace...</span>
                  </div>
                ) : isRegister ? (
                  <>
                    <span>Register Workspace</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </>
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider OR */}
            <div className="relative flex items-center justify-center pt-1">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-[#0b1522] px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest absolute">
                OR
              </span>
            </div>

            {/* Action Toggles */}
            <div className="pt-1">
              <motion.button
                type="button"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError(null);
                }}
                className="w-full py-3 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/10 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-subtle"
              >
                <UserIcon className="w-4 h-4 text-zinc-400" />
                <span>{isRegister ? "Already have an account? Sign in" : "Create a new account"}</span>
              </motion.button>
            </div>

            {/* Legal terms footer */}
            <p className="text-[10px] text-zinc-500 text-center leading-relaxed pt-1">
              By continuing, you agree to our{" "}
              <a href="#terms" className="text-[#00E599] hover:underline">
                Terms & Conditions
              </a>{" "}
              and{" "}
              <a href="#privacy" className="text-[#00E599] hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </motion.div>
      </main>

      {/* ================= BOTTOM FOOTER ================= */}
      <footer className="p-6 sm:px-12 text-center text-xs text-zinc-600 border-t border-white/5 relative z-10">
        <p className="text-[11px] font-mono">
          GSTSAHAYAK • Next-Gen Hybrid Tax-Tech Architecture & Explainable AI
        </p>
      </footer>
    </div>
  );
};
