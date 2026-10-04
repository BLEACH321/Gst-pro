import React, { useState, useEffect } from "react";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Cpu,
  Layers,
  Search,
  Check,
  RefreshCw,
  Zap,
  TrendingUp,
  FileText,
  Building2,
  Package,
  ShoppingBag,
  Briefcase,
  ChevronRight,
  Play,
  Box,
  Tag,
  Settings,
  Calculator,
  Shield,
  HelpCircle,
  Laptop,
  CreditCard,
  Monitor
} from "lucide-react";
import { motion } from "framer-motion";
import { PublicAgentModal } from "../components/agent/PublicAgentModal";

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  const [scrolled, setScrolled] = useState(false);
  const [publicAgentOpen, setPublicAgentOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#070e17] text-[#F7F8F6] selection:bg-[#00E599] selection:text-black font-sans overflow-x-hidden">
      {/* ================= STICKY NAVBAR ================= */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#070e17]/95 backdrop-blur-2xl border-b border-white/10 py-3.5 shadow-2xl"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-12 flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            {/* Teal Hexagon Icon */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00A878] to-[#00E599] flex items-center justify-center text-[#070e17] shadow-[0_0_20px_rgba(0,229,153,0.35)]">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" />
              </svg>
            </div>
            <span className="font-black text-lg text-white tracking-tight uppercase">
              GSTSAHAYAK
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-9 text-xs font-semibold text-zinc-300">
            <a href="#product" className="hover:text-white transition-colors">Product</a>
            <a href="#ai" className="hover:text-white transition-colors">AI</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#resources" className="hover:text-white transition-colors">Resources</a>
          </nav>

          {/* Right Action */}
          <div className="flex items-center gap-5">
            <button
              onClick={onLogin}
              className="text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer px-2 py-1"
            >
              Login
            </button>
            <button
              onClick={onGetStarted}
              className="bg-[#00E599] hover:bg-[#00c985] text-[#070e17] font-black text-xs px-5 py-2.5 rounded-full transition-all duration-300 shadow-[0_0_25px_rgba(0,229,153,0.35)] hover:scale-105 active:scale-95 cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-36 sm:pt-44 pb-24 px-6 sm:px-12 max-w-7xl mx-auto">
        {/* Ambient Teal Backlight */}
        <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-[#00E599]/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Hero Copy */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-block text-[11px] font-black tracking-[0.2em] text-[#00E599] uppercase">
              SMARTER GST COMPLIANCE
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.02] uppercase">
              GST INVOICING.<br />
              <span className="text-[#00E599]">RE-IMAGINED.</span>
            </h1>

            <p className="text-lg sm:text-xl text-zinc-300 font-medium leading-snug">
              Create. Validate. Understand.<br />
              Before you finalize.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onGetStarted}
                className="bg-[#00E599] hover:bg-[#00c985] text-[#070e17] font-black text-xs uppercase tracking-wider px-6 py-3.5 rounded-full flex items-center gap-2 transition-all duration-300 shadow-[0_0_30px_rgba(0,229,153,0.4)] hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>CREATE INVOICE</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>

              <button
                onClick={onGetStarted}
                className="bg-zinc-900/80 hover:bg-zinc-800 text-white border border-white/10 font-black text-xs uppercase tracking-wider px-6 py-3.5 rounded-full flex items-center gap-2.5 transition-all duration-300 hover:border-white/20 cursor-pointer"
              >
                <span>EXPLORE HOW IT WORKS</span>
                <div className="w-4 h-4 rounded-full border border-white flex items-center justify-center">
                  <Play className="w-2 h-2 fill-white ml-0.5" />
                </div>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-6 pt-6 text-xs text-zinc-400 font-bold">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00E599]" />
                <span className="uppercase text-[11px] tracking-wider text-zinc-300">AI ASSISTED</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#00E599]" />
                <span className="uppercase text-[11px] tracking-wider text-zinc-300">RULE VALIDATED</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00E599]" />
                <span className="uppercase text-[11px] tracking-wider text-zinc-300">PRE-CHECKED</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Skewed Invoice Preview + Connected AI Nodes */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            {/* The 3D Slanted Invoice Card */}
            <div className="relative w-full max-w-md bg-[#0b1522]/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 border border-[#00E599]/40 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(0,229,153,0.15)] transform lg:-rotate-2 hover:rotate-0 transition-transform duration-500">
              {/* Top Card Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="font-bold text-sm text-white">Invoice Preview</span>
                <span className="px-3 py-0.5 rounded-full bg-[#00E599]/10 text-[#00E599] border border-[#00E599]/30 text-[10px] font-bold flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[3]" />
                  Validated
                </span>
              </div>

              {/* Invoice Meta */}
              <div className="py-3 text-[11px] font-mono text-zinc-400 flex items-center justify-between">
                <span>Invoice No. <strong className="text-white">INV-2024-001</strong></span>
                <span>Date <strong className="text-white">12 Apr 2055</strong></span>
              </div>

              {/* Line Items Table */}
              <div className="my-2 border border-white/5 rounded-xl overflow-hidden text-[11px]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/[0.04] text-zinc-400 font-bold border-b border-white/5 text-[10px]">
                      <th className="py-2 px-2.5">Item</th>
                      <th className="py-2 px-2 text-center">HSN/SAC</th>
                      <th className="py-2 px-2 text-center">Qty</th>
                      <th className="py-2 px-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-zinc-300">
                    <tr>
                      <td className="py-2 px-2.5 font-medium text-white">ASUS TUF A16 Laptop</td>
                      <td className="py-2 px-2 text-center font-mono text-zinc-400">8471</td>
                      <td className="py-2 px-2 text-center">2</td>
                      <td className="py-2 px-2.5 text-right font-mono">₹ 1,50,000</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2.5 font-medium text-white">Wireless Mouse</td>
                      <td className="py-2 px-2 text-center font-mono text-zinc-400">8471</td>
                      <td className="py-2 px-2 text-center">5</td>
                      <td className="py-2 px-2.5 text-right font-mono">₹ 7,500</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2.5 font-medium text-white">Keyboard</td>
                      <td className="py-2 px-2 text-center font-mono text-zinc-400">8471</td>
                      <td className="py-2 px-2 text-center">3</td>
                      <td className="py-2 px-2.5 text-right font-mono">₹ 9,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="py-2 space-y-1 text-[11px] font-mono border-t border-white/5 pt-3">
                <div className="flex justify-between text-zinc-400">
                  <span>Taxable Amount</span>
                  <span className="text-white">₹ 1,61,500</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>GST (18%)</span>
                  <span className="text-white">₹ 29,070</span>
                </div>
                <div className="flex justify-between text-white font-bold text-xs pt-1 border-t border-white/5">
                  <span>Total</span>
                  <span className="text-[#00E599] text-sm">₹ 1,90,570</span>
                </div>
              </div>

              {/* Card Footer Badge */}
              <div className="mt-4 p-2.5 rounded-xl bg-[#00E599]/10 border border-[#00E599]/30 flex items-center gap-2 text-xs font-bold text-[#00E599]">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Pre-Validation Completed</span>
              </div>
            </div>

            {/* Connected Side Node Badges (Floating alongside the Card) */}
            <div className="hidden sm:flex flex-col gap-2.5 absolute -right-6 lg:-right-8 top-6 z-20">
              {[
                { label: "Product Recognition", sub: "Matched", icon: Box },
                { label: "HSN/SAC", sub: "Suggested", icon: Tag },
                { label: "GST Rules", sub: "Applied", icon: Settings },
                { label: "Validation", sub: "Passed", icon: CheckCircle2 },
                { label: "Risk Analysis", sub: "No Issues", icon: ShieldCheck },
                { label: "AI Explanation", sub: "Ready", icon: Sparkles }
              ].map((node, i) => {
                const Icon = node.icon;
                return (
                  <div
                    key={i}
                    className="bg-[#0d1c2d]/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 shadow-lg flex items-center gap-2.5 hover:border-[#00E599]/50 transition-all hover:scale-105 cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-lg bg-[#00E599]/15 border border-[#00E599]/40 flex items-center justify-center text-[#00E599]">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-white leading-none">{node.label}</p>
                      <p className="text-[9px] text-[#00E599] font-medium mt-0.5">{node.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION — THE CHALLENGE ================= */}
      <section id="how-it-works" className="py-24 px-6 sm:px-12 max-w-7xl mx-auto border-t border-white/10">
        <div className="max-w-2xl space-y-3 mb-14">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00E599]">
            THE CHALLENGE
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.05]">
            GST invoices<br />
            shouldn't feel<br />
            like guesswork.
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-medium leading-relaxed pt-1">
            From product classification to tax calculation, small mistakes can lead to big problems. GSTSAHAYAK checks your invoice before you finalize it.
          </p>
        </div>

        {/* Connected Process Chain Nodes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Product", icon: Box },
            { label: "HSN/SAC", icon: Tag },
            { label: "GST Configuration", icon: Settings },
            { label: "Calculation", icon: Calculator },
            { label: "Validation", icon: ShieldCheck },
            { label: "Risk Analysis", icon: AlertTriangle }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-[#0b1522] rounded-2xl p-6 border border-white/10 flex flex-col items-center justify-center text-center group hover:border-[#00E599]/50 transition-all hover:scale-105"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300 group-hover:text-[#00E599] group-hover:bg-[#00E599]/10 group-hover:border-[#00E599]/30 transition-all mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-white group-hover:text-[#00E599] transition-colors">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= SECTION — BUILT FOR EVERY BUSINESS ================= */}
      <section id="product" className="py-24 px-6 sm:px-12 max-w-7xl mx-auto border-t border-white/10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00E599] block mb-2">
              BUILT FOR EVERY BUSINESS
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Choose your<br />business type
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md font-medium leading-relaxed">
            Whether you're selling products, running a restaurant or offering professional services — GSTSAHAYAK adapts to your business needs.
          </p>
        </div>

        {/* 3 Business Category Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: E-COMMERCE */}
          <div className="bg-[#0b1522] rounded-3xl p-8 border border-white/10 flex flex-col justify-between group hover:border-[#00E599]/40 transition-all">
            <div className="space-y-5">
              {/* Visual Frame */}
              <div className="h-36 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/5 flex items-center justify-center relative overflow-hidden">
                <div className="w-24 h-24 bg-[#00E599]/10 rounded-full blur-2xl absolute" />
                <Laptop className="w-16 h-16 text-zinc-400 group-hover:text-white transition-colors relative z-10" />
              </div>

              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">
                  E-COMMERCE
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Manage hundreds of products. Validate every invoice before you finalize it.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-zinc-300 pt-2">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#00E599] stroke-[3]" />
                  <span>Bulk Product Upload</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#00E599] stroke-[3]" />
                  <span>HSN/SAC Mapping</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#00E599] stroke-[3]" />
                  <span>GST Automation</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#00E599] stroke-[3]" />
                  <span>Inventory Sync</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onGetStarted}
              className="mt-8 pt-4 border-t border-white/10 text-xs font-bold text-[#00E599] hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <span>Explore E-commerce</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: RETAIL */}
          <div className="bg-[#0b1522] rounded-3xl p-8 border border-white/10 flex flex-col justify-between group hover:border-[#00E599]/40 transition-all">
            <div className="space-y-5">
              {/* Visual Frame */}
              <div className="h-36 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/5 flex items-center justify-center relative overflow-hidden">
                <div className="w-24 h-24 bg-[#00E599]/10 rounded-full blur-2xl absolute" />
                <CreditCard className="w-16 h-16 text-zinc-400 group-hover:text-white transition-colors relative z-10" />
              </div>

              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">
                  RETAIL
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Create GST invoices quickly and stay compliant, always.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-zinc-300 pt-2">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#00E599] stroke-[3]" />
                  <span>Fast Invoicing</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#00E599] stroke-[3]" />
                  <span>Simple Setup</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#00E599] stroke-[3]" />
                  <span>GST Validation</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#00E599] stroke-[3]" />
                  <span>Sales Reports</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onGetStarted}
              className="mt-8 pt-4 border-t border-white/10 text-xs font-bold text-[#00E599] hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <span>Explore Retail</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: SERVICES */}
          <div className="bg-[#0b1522] rounded-3xl p-8 border border-white/10 flex flex-col justify-between group hover:border-[#00E599]/40 transition-all">
            <div className="space-y-5">
              {/* Visual Frame */}
              <div className="h-36 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/5 flex items-center justify-center relative overflow-hidden">
                <div className="w-24 h-24 bg-[#00E599]/10 rounded-full blur-2xl absolute" />
                <Monitor className="w-16 h-16 text-zinc-400 group-hover:text-white transition-colors relative z-10" />
              </div>

              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">
                  SERVICES
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  For freelancers, consultants and service providers.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-zinc-300 pt-2">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#00E599] stroke-[3]" />
                  <span>Service Classification</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#00E599] stroke-[3]" />
                  <span>Accurate Taxation</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#00E599] stroke-[3]" />
                  <span>Easy Reconciliation</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#00E599] stroke-[3]" />
                  <span>Professional Reports</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onGetStarted}
              className="mt-8 pt-4 border-t border-white/10 text-xs font-bold text-[#00E599] hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <span>Explore Services</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ================= FINAL CALL TO ACTION ================= */}
      <section className="py-20 px-6 sm:px-12 max-w-7xl mx-auto border-t border-white/10 text-center">
        <div className="bg-gradient-to-b from-[#0b1522] to-[#070e17] rounded-3xl p-10 sm:p-16 border border-white/10 relative overflow-hidden space-y-6">
          <div className="w-80 h-80 bg-[#00E599]/10 rounded-full blur-3xl absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none" />

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase relative z-10">
            EXPERIENCE PRE-VALIDATED<br />GST INVOICING.
          </h2>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto font-medium relative z-10">
            Eliminate rejection notices and tax calculation discrepancies with statutory rules and Isolation Forest ML.
          </p>

          <div className="pt-3 relative z-10">
            <button
              onClick={onGetStarted}
              className="bg-[#00E599] hover:bg-[#00c985] text-[#070e17] font-black text-xs uppercase tracking-wider px-8 py-4 rounded-full inline-flex items-center gap-2 transition-all shadow-[0_0_35px_rgba(0,229,153,0.4)] hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>LAUNCH GSTSAHAYAK APP</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="py-10 px-6 sm:px-12 border-t border-white/10 text-zinc-500 text-xs max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-[#00E599] flex items-center justify-center text-[#070e17] font-black text-[10px]">
            GS
          </div>
          <span className="font-mono text-zinc-400">GSTSAHAYAK • ClearTax UX & CRED Visual Architecture</span>
        </div>
        <p className="text-[11px] text-zinc-500">
          Statutory Pre-Validation & Explainable AI Telemetry Platform.
        </p>
      </footer>

      {/* ================= FLOATING PUBLIC ASSISTANT ================= */}
      <button
        onClick={() => setPublicAgentOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-tr from-[#00A878] to-[#00E599] text-[#07111F] px-5 py-3 rounded-full shadow-[0_0_30px_rgba(0,229,153,0.45)] flex items-center gap-2.5 font-black uppercase text-xs tracking-wider cursor-pointer hover:scale-105 active:scale-95 transition-all"
      >
        <Sparkles className="w-4 h-4" />
        <span>Ask GSTSAHAYAK Assistant</span>
      </button>

      {/* Public Agent Modal */}
      <PublicAgentModal
        isOpen={publicAgentOpen}
        onClose={() => setPublicAgentOpen(false)}
        onLoginClick={onLogin}
      />
    </div>
  );
};

