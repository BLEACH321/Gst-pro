import React, { useState, useMemo } from "react";
import {
  FileText,
  Calculator,
  ShieldCheck,
  TrendingUp,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Zap,
  Building,
  User,
  CreditCard,
  Briefcase,
  Layers,
  Award,
  Clock,
  Printer,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Info,
  DollarSign
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  PersonalTaxInfo,
  IncomeDetails,
  DeductionsDetails,
  Form16Data,
  AISTISEntry,
  ITRFilingRecord
} from "../types/itr";
import {
  compareTaxRegimes,
  calculateHraExemption
} from "../services/itrTaxCalculator";

// Sample Form 16 Presets
const FORM_16_PRESETS: { label: string; company: string; data: Partial<IncomeDetails & DeductionsDetails & PersonalTaxInfo> & { tds: number } }[] = [
  {
    label: "Infosys Ltd (Senior Software Engineer)",
    company: "Infosys Ltd",
    data: {
      fullName: "Sunny Gupta",
      pan: "ABCDE1234F",
      aadhaar: "8392 4829 1029",
      grossSalary: 1450000,
      basicSalary: 700000,
      hraReceived: 280000,
      specialAllowance: 420000,
      professionalTax: 2500,
      epfVpf: 84000,
      elss: 40000,
      lifeInsurance: 26000,
      healthInsuranceSelf: 22000,
      healthInsuranceParents: 30000,
      parentsSeniorCitizen: true,
      npsSelf80CCD1B: 50000,
      rentPaidAnnually: 300000,
      isMetroCity: true,
      savingsInterest: 14500,
      tds: 112000
    }
  },
  {
    label: "Tata Consultancy Services (Tech Lead)",
    company: "TCS Ltd",
    data: {
      fullName: "Priya Sharma",
      pan: "BCDEF2345G",
      aadhaar: "4521 9845 2314",
      grossSalary: 2200000,
      basicSalary: 1050000,
      hraReceived: 420000,
      specialAllowance: 680000,
      professionalTax: 2500,
      hasHouseProperty: true,
      propertyType: "self_occupied",
      homeLoanInterest24b: 185000,
      epfVpf: 126000,
      principalHomeLoan: 50000,
      healthInsuranceSelf: 25000,
      healthInsuranceParents: 45000,
      parentsSeniorCitizen: true,
      npsSelf80CCD1B: 50000,
      savingsInterest: 18000,
      fdInterest: 32000,
      stcgEquity: 45000,
      ltcgEquity: 185000,
      tds: 285000
    }
  },
  {
    label: "Independent Tech Consultant / Freelancer (ITR-4)",
    company: "Freelance / Professional",
    data: {
      fullName: "Rahul Verma",
      pan: "CDEFG3456H",
      aadhaar: "9823 4712 9012",
      grossSalary: 0,
      basicSalary: 0,
      grossTurnover: 2800000,
      presumptiveIncome: 1400000, // 50% under 44ADA
      ppf: 150000,
      healthInsuranceSelf: 20000,
      npsSelf80CCD1B: 50000,
      savingsInterest: 9000,
      tds: 85000
    }
  }
];

// Sample AIS/TIS entries
const MOCK_AIS_ENTRIES: AISTISEntry[] = [
  {
    id: "AIS-01",
    category: "Salary",
    description: "Salary paid u/s 192 by Infosys BPM & Technologies",
    reportedBy: "Infosys Ltd (TAN: BLRI01928F)",
    financialYear: "2025-26",
    grossValue: 1450000,
    tdsTcsDeducted: 112000,
    feedbackStatus: "Accepted"
  },
  {
    id: "AIS-02",
    category: "Interest",
    description: "Interest from Savings Bank accounts across 2 banks",
    reportedBy: "HDFC Bank Ltd & ICICI Bank Ltd",
    financialYear: "2025-26",
    grossValue: 14500,
    tdsTcsDeducted: 0,
    feedbackStatus: "Accepted"
  },
  {
    id: "AIS-03",
    category: "Dividend",
    description: "Dividend credited on listed equity shares (TCS, ITC)",
    reportedBy: "Computer Age Management Services (CAMS)",
    financialYear: "2025-26",
    grossValue: 8400,
    tdsTcsDeducted: 840,
    feedbackStatus: "Accepted"
  },
  {
    id: "AIS-04",
    category: "Securities",
    description: "Mutual Funds Redemption (STCG & LTCG equity units)",
    reportedBy: "Zerodha Broking Limited",
    financialYear: "2025-26",
    grossValue: 245000,
    tdsTcsDeducted: 0,
    feedbackStatus: "Accepted"
  },
  {
    id: "AIS-05",
    category: "High Value",
    description: "Credit card aggregate payments exceeding ₹10 Lakhs",
    reportedBy: "Axis Bank Credit Cards",
    financialYear: "2025-26",
    grossValue: 1045000,
    tdsTcsDeducted: 0,
    feedbackStatus: "Accepted"
  }
];

export const IncomeTaxPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"filing" | "calculators" | "ais" | "history">("filing");
  const [filingStep, setFilingStep] = useState<number>(1);
  const [selectedRegimeChoice, setSelectedRegimeChoice] = useState<"old" | "new" | null>(null);
  const [isFilingSubmitted, setIsFilingSubmitted] = useState(false);
  const [ackNumber, setAckNumber] = useState<string>("");

  // Personal Info State
  const [personalInfo, setPersonalInfo] = useState<PersonalTaxInfo>({
    pan: "ABCDE1234F",
    aadhaar: "8392 4829 1029",
    fullName: "Sunny Gupta",
    dateOfBirth: "1994-08-15",
    gender: "male",
    mobile: "+91 98201 54321",
    email: "zeesunny2145@gmail.com",
    address: "Unit 402, Signature IT Tower, MIDC, Andheri (E), Mumbai - 400093",
    bankAccountNumber: "50100234918231",
    ifscCode: "HDFC0000123",
    bankName: "HDFC Bank",
    accountType: "savings",
    isPrimaryForRefund: true,
    employerCategory: "private",
    residentialStatus: "resident"
  });

  // Income State
  const [income, setIncome] = useState<IncomeDetails>({
    grossSalary: 1450000,
    basicSalary: 700000,
    hraReceived: 280000,
    specialAllowance: 420000,
    lta: 0,
    otherAllowances: 50000,
    professionalTax: 2500,
    perquisites: 0,
    hasHouseProperty: false,
    propertyType: "self_occupied",
    annualRentReceived: 0,
    municipalTaxesPaid: 0,
    homeLoanInterest24b: 0,
    stcgEquity: 0,
    ltcgEquity: 0,
    stcgOther: 0,
    ltcgOther: 0,
    savingsInterest: 14500,
    fdInterest: 0,
    dividendIncome: 8400,
    otherIncome: 0,
    grossTurnover: 0,
    presumptiveIncome: 0
  });

  // Deductions State
  const [deductions, setDeductions] = useState<DeductionsDetails>({
    epfVpf: 84000,
    ppf: 0,
    elss: 40000,
    lifeInsurance: 26000,
    tuitionFees: 0,
    principalHomeLoan: 0,
    nscSukanya: 0,
    healthInsuranceSelf: 22000,
    healthInsuranceParents: 30000,
    parentsSeniorCitizen: true,
    npsSelf80CCD1B: 50000,
    npsEmployer80CCD2: 0,
    rentPaidAnnually: 300000,
    isMetroCity: true,
    donations80G: 0,
    educationLoan80E: 0,
    savingsInterest80TTA: 10000
  });

  // TDS / Tax Paid
  const [tdsPaid, setTdsPaid] = useState<number>(112000);

  // Form 16 Drag-Drop State
  const [form16Uploaded, setForm16Uploaded] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Compute comparison in real-time
  const taxComparison = useMemo(() => {
    return compareTaxRegimes(income, deductions, tdsPaid);
  }, [income, deductions, tdsPaid]);

  // Selected regime defaults to recommended
  const effectiveRegime = selectedRegimeChoice || taxComparison.optimalRegime;
  const activeResult = effectiveRegime === "new" ? taxComparison.newRegime : taxComparison.oldRegime;

  // Calculators State
  const [calcSalary, setCalcSalary] = useState<number>(1200000);
  const [calc80C, setCalc80C] = useState<number>(150000);
  const [calc80D, setCalc80D] = useState<number>(25000);
  const [calcHraRent, setCalcHraRent] = useState<number>(240000);
  const [calcHraBasic, setCalcHraBasic] = useState<number>(600000);
  const [calcHraReceived, setCalcHraReceived] = useState<number>(240000);
  const [calcIsMetro, setCalcIsMetro] = useState<boolean>(true);

  // Capital Gains Calculator State
  const [calcStcg, setCalcStcg] = useState<number>(50000);
  const [calcLtcg, setCalcLtcg] = useState<number>(200000);

  // Filing history records
  const [filingHistory, setFilingHistory] = useState<ITRFilingRecord[]>([
    {
      id: "REC-2025-01",
      ackNumber: "ACK/2025/ITR1/984210384",
      itrType: "ITR-1",
      assessmentYear: "AY 2025-26",
      filingDate: "18 July 2025",
      status: "Processed",
      grossIncome: 1280000,
      totalTaxPaid: 84200,
      refundOrPayable: -8500, // ₹8,500 Refund Issued
      regimeChosen: "new",
      verificationMethod: "Aadhaar OTP"
    },
    {
      id: "REC-2024-01",
      ackNumber: "ACK/2024/ITR1/874102941",
      itrType: "ITR-1",
      assessmentYear: "AY 2024-25",
      filingDate: "26 July 2024",
      status: "Processed",
      grossIncome: 1040000,
      totalTaxPaid: 65400,
      refundOrPayable: 0,
      regimeChosen: "old",
      verificationMethod: "Aadhaar OTP"
    }
  ]);

  // Handle Form 16 Preset selection
  const handleApplyPreset = (index: number) => {
    setUploadLoading(true);
    setTimeout(() => {
      const preset = FORM_16_PRESETS[index];
      setPersonalInfo((prev) => ({
        ...prev,
        fullName: preset.data.fullName || prev.fullName,
        pan: preset.data.pan || prev.pan,
        aadhaar: preset.data.aadhaar || prev.aadhaar
      }));

      setIncome((prev) => ({
        ...prev,
        grossSalary: preset.data.grossSalary ?? prev.grossSalary,
        basicSalary: preset.data.basicSalary ?? prev.basicSalary,
        hraReceived: preset.data.hraReceived ?? prev.hraReceived,
        specialAllowance: preset.data.specialAllowance ?? prev.specialAllowance,
        professionalTax: preset.data.professionalTax ?? prev.professionalTax,
        hasHouseProperty: preset.data.hasHouseProperty ?? prev.hasHouseProperty,
        propertyType: preset.data.propertyType ?? prev.propertyType,
        homeLoanInterest24b: preset.data.homeLoanInterest24b ?? prev.homeLoanInterest24b,
        stcgEquity: preset.data.stcgEquity ?? prev.stcgEquity,
        ltcgEquity: preset.data.ltcgEquity ?? prev.ltcgEquity,
        savingsInterest: preset.data.savingsInterest ?? prev.savingsInterest,
        fdInterest: preset.data.fdInterest ?? prev.fdInterest,
        grossTurnover: preset.data.grossTurnover ?? prev.grossTurnover,
        presumptiveIncome: preset.data.presumptiveIncome ?? prev.presumptiveIncome
      }));

      setDeductions((prev) => ({
        ...prev,
        epfVpf: preset.data.epfVpf ?? prev.epfVpf,
        ppf: preset.data.ppf ?? prev.ppf,
        elss: preset.data.elss ?? prev.elss,
        lifeInsurance: preset.data.lifeInsurance ?? prev.lifeInsurance,
        principalHomeLoan: preset.data.principalHomeLoan ?? prev.principalHomeLoan,
        healthInsuranceSelf: preset.data.healthInsuranceSelf ?? prev.healthInsuranceSelf,
        healthInsuranceParents: preset.data.healthInsuranceParents ?? prev.healthInsuranceParents,
        parentsSeniorCitizen: preset.data.parentsSeniorCitizen ?? prev.parentsSeniorCitizen,
        npsSelf80CCD1B: preset.data.npsSelf80CCD1B ?? prev.npsSelf80CCD1B,
        rentPaidAnnually: preset.data.rentPaidAnnually ?? prev.rentPaidAnnually,
        isMetroCity: preset.data.isMetroCity ?? prev.isMetroCity
      }));

      setTdsPaid(preset.data.tds);
      setForm16Uploaded(true);
      setUploadLoading(false);
    }, 600);
  };

  // Submit Filing Handler
  const handleFinalSubmitFiling = () => {
    const generatedAck = `ACK/2026/ITR1/${Math.floor(100000000 + Math.random() * 900000000)}`;
    setAckNumber(generatedAck);
    setIsFilingSubmitted(true);

    // Fire celebration confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // safe fallback
    }

    const newRecord: ITRFilingRecord = {
      id: `REC-2026-${Date.now()}`,
      ackNumber: generatedAck,
      itrType: income.presumptiveIncome > 0 ? "ITR-4" : income.stcgEquity > 0 ? "ITR-2" : "ITR-1",
      assessmentYear: "AY 2026-27 (FY 2025-26)",
      filingDate: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
      status: "Successfully Filed",
      grossIncome: activeResult.grossTotalIncome,
      totalTaxPaid: activeResult.totalTaxPayable,
      refundOrPayable: activeResult.taxPayableOrRefund,
      regimeChosen: effectiveRegime,
      verificationMethod: "Aadhaar OTP"
    };

    setFilingHistory((prev) => [newRecord, ...prev]);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 font-sans">
      {/* Top Banner: ClearTax Official AY 2026-27 Ribbon */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#002B49] via-[#0B1E36] to-[#07111F] border border-cyan-500/25 p-6 shadow-2xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-cyan-400 text-black shadow-sm flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                ClearTax ITR Filing Engine
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/10 text-cyan-200 border border-white/10">
                AY 2026-27 (FY 2025-26)
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Budget 2025/26 Compliant
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Income Tax e-Filing & Regime Optimization
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              Auto-fill from Form 16, instantly compare <strong className="text-white">Old vs New Tax Regime</strong>, verify AIS/TIS tax credits, and claim maximal refunds with 100% statutory precision.
            </p>
          </div>

          {/* Quick Stat Pill */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 sm:p-4 text-xs">
            <div className="text-center px-3 border-r border-white/10">
              <span className="block text-[10px] uppercase font-bold text-zinc-400">Deadline</span>
              <span className="font-black text-amber-400 text-sm">31 July 2026</span>
            </div>
            <div className="text-center px-3 border-r border-white/10">
              <span className="block text-[10px] uppercase font-bold text-zinc-400">Standard Ded.</span>
              <span className="font-black text-[#00E599] text-sm">₹75,000 (New)</span>
            </div>
            <div className="text-center px-3">
              <span className="block text-[10px] uppercase font-bold text-zinc-400">Tax Rebate</span>
              <span className="font-black text-cyan-300 text-sm">Nil up to ₹7L</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab("filing")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "filing"
                ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                : "bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>e-Filing Wizard</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-black/20 rounded-md font-mono">5 Steps</span>
          </button>

          <button
            onClick={() => setActiveTab("calculators")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "calculators"
                ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                : "bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Tax Calculators Hub</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded-md">Live</span>
          </button>

          <button
            onClick={() => setActiveTab("ais")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "ais"
                ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                : "bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>AIS / TIS & Form 26AS</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "history"
                ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                : "bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Filing History & ITR-V</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-white/10 rounded-md font-mono">{filingHistory.length}</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: ITR E-FILING WIZARD                                */}
      {/* ======================================================== */}
      {activeTab === "filing" && (
        <div className="space-y-6">
          {/* Step Progress Header */}
          <div className="bg-[#0c0d16] border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto py-1">
              {[
                { num: 1, title: "Form 16 & Personal" },
                { num: 2, title: "Income Sources" },
                { num: 3, title: "Deductions & Exemptions" },
                { num: 4, title: "Regime Compare" },
                { num: 5, title: "e-File & Ack" }
              ].map((s) => (
                <button
                  key={s.num}
                  onClick={() => setFilingStep(s.num)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    filingStep === s.num
                      ? "bg-cyan-500 text-black"
                      : filingStep > s.num
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-white/5 text-zinc-400 hover:text-white"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      filingStep === s.num
                        ? "bg-black text-cyan-400"
                        : filingStep > s.num
                        ? "bg-emerald-500 text-black"
                        : "bg-white/10 text-white"
                    }`}
                  >
                    {filingStep > s.num ? "✓" : s.num}
                  </span>
                  <span>{s.title}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Active Choice:</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white/10 text-white uppercase">
                {effectiveRegime} Regime
              </span>
            </div>
          </div>

          {/* STEP 1: FORM 16 UPLOAD & PERSONAL INFO */}
          {filingStep === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form 16 Auto-Fill Box */}
              <div className="lg:col-span-1 bg-[#0c0d16] border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UploadCloud className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-sm font-bold text-white">Form 16 Auto-Fill</h3>
                  </div>
                  {form16Uploaded && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Auto-Parsed
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-400">
                  Upload your Form 16 PDF or select a corporate sample to auto-populate salary, allowances, PF, and TDS with 100% accuracy.
                </p>

                {/* Preset Selector */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Quick Sample Corporate Profiles:
                  </span>
                  <div className="space-y-1.5">
                    {FORM_16_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleApplyPreset(idx)}
                        disabled={uploadLoading}
                        className="w-full text-left px-3 py-2 rounded-xl bg-white/5 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 transition-all text-xs text-zinc-200 flex items-center justify-between group cursor-pointer"
                      >
                        <div>
                          <div className="font-bold text-white group-hover:text-cyan-300">{preset.company}</div>
                          <div className="text-[10px] text-zinc-400">{preset.label}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-cyan-400 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Drag Drop Mock Box */}
                <div className="border-2 border-dashed border-white/15 hover:border-cyan-400/50 rounded-2xl p-5 text-center transition-all cursor-pointer bg-white/[0.02]">
                  <UploadCloud className="w-8 h-8 text-cyan-400 mx-auto mb-2 animate-bounce" />
                  <p className="text-xs font-bold text-white">Drag & drop Form 16 PDF</p>
                  <p className="text-[10px] text-zinc-400 mt-1">Supports DigiLocker, ClearTax, and Employer PDFs</p>
                </div>
              </div>

              {/* Personal & Bank Details */}
              <div className="lg:col-span-2 bg-[#0c0d16] border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">Taxpayer Identity & Bank Account</h3>
                  </div>
                  <span className="text-[11px] text-zinc-400">PAN verified via NSDL</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">Full Name (as per PAN)</label>
                    <input
                      type="text"
                      value={personalInfo.fullName}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-white focus:border-cyan-400 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">Permanent Account Number (PAN)</label>
                    <input
                      type="text"
                      value={personalInfo.pan}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, pan: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-white font-mono uppercase focus:border-cyan-400 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">Aadhaar Number</label>
                    <input
                      type="text"
                      value={personalInfo.aadhaar}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, aadhaar: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-white font-mono focus:border-cyan-400 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">Date of Birth</label>
                    <input
                      type="date"
                      value={personalInfo.dateOfBirth}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, dateOfBirth: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-white focus:border-cyan-400 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">Email Address (for ITD alerts)</label>
                    <input
                      type="email"
                      value={personalInfo.email}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-white focus:border-cyan-400 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">Mobile Number</label>
                    <input
                      type="text"
                      value={personalInfo.mobile}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, mobile: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-white focus:border-cyan-400 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-cyan-400" />
                    Refund Bank Account Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-zinc-400 mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={personalInfo.bankName}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, bankName: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-white focus:border-cyan-400 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1">Account Number</label>
                      <input
                        type="text"
                        value={personalInfo.bankAccountNumber}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, bankAccountNumber: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-white font-mono focus:border-cyan-400 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1">IFSC Code</label>
                      <input
                        type="text"
                        value={personalInfo.ifscCode}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, ifscCode: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-white font-mono uppercase focus:border-cyan-400 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    onClick={() => setFilingStep(2)}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer"
                  >
                    <span>Continue to Income Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: INCOME SOURCES */}
          {filingStep === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Controls */}
              <div className="lg:col-span-2 space-y-5">
                {/* Salary Income Section */}
                <div className="bg-[#0c0d16] border border-white/10 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-cyan-400" />
                      <h3 className="text-sm font-bold text-white">Income from Salary (Form 16 Part B)</h3>
                    </div>
                    <span className="text-xs text-[#00E599] font-mono font-bold">
                      ₹{income.grossSalary.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-zinc-400 mb-1">Gross Salary (Before Exemptions)</label>
                      <input
                        type="number"
                        value={income.grossSalary}
                        onChange={(e) => setIncome({ ...income, grossSalary: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-white font-mono focus:border-cyan-400 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1">Basic Salary (for HRA & PF computation)</label>
                      <input
                        type="number"
                        value={income.basicSalary}
                        onChange={(e) => setIncome({ ...income, basicSalary: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-white font-mono focus:border-cyan-400 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1">House Rent Allowance (HRA) Received</label>
                      <input
                        type="number"
                        value={income.hraReceived}
                        onChange={(e) => setIncome({ ...income, hraReceived: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-white font-mono focus:border-cyan-400 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1">Special & Other Allowances</label>
                      <input
                        type="number"
                        value={income.specialAllowance}
                        onChange={(e) => setIncome({ ...income, specialAllowance: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-white font-mono focus:border-cyan-400 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1">Professional Tax (Max ₹2,500)</label>
                      <input
                        type="number"
                        value={income.professionalTax}
                        onChange={(e) => setIncome({ ...income, professionalTax: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-white font-mono focus:border-cyan-400 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1">TDS Deducted by Employer (Form 26AS)</label>
                      <input
                        type="number"
                        value={tdsPaid}
                        onChange={(e) => setTdsPaid(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-white font-mono focus:border-cyan-400 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* House Property & Home Loan */}
                <div className="bg-[#0c0d16] border border-white/10 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Building className="w-5 h-5 text-amber-400" />
                      <h3 className="text-sm font-bold text-white">House Property & Home Loan Interest</h3>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={income.hasHouseProperty}
                        onChange={(e) => setIncome({ ...income, hasHouseProperty: e.target.checked })}
                        className="rounded accent-cyan-500"
                      />
                      <span className="text-zinc-300">I have house property</span>
                    </label>
                  </div>

                  {income.hasHouseProperty && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block text-zinc-400 mb-1">Property Usage</label>
                        <select
                          value={income.propertyType}
                          onChange={(e) => setIncome({ ...income, propertyType: e.target.value as any })}
                          className="w-full px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-white focus:border-cyan-400 focus:outline-hidden"
                        >
                          <option value="self_occupied">Self-Occupied (Deduction u/s 24b up to 2L)</option>
                          <option value="let_out">Let-Out (Rented Property)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-zinc-400 mb-1">Home Loan Interest Paid u/s 24(b)</label>
                        <input
                          type="number"
                          value={income.homeLoanInterest24b}
                          onChange={(e) => setIncome({ ...income, homeLoanInterest24b: Number(e.target.value) })}
                          placeholder="e.g. 180000"
                          className="w-full px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-white font-mono focus:border-cyan-400 focus:outline-hidden"
                        />
                      </div>
                      {income.propertyType === "let_out" && (
                        <>
                          <div>
                            <label className="block text-zinc-400 mb-1">Annual Rent Received</label>
                            <input
                              type="number"
                              value={income.annualRentReceived}
                              onChange={(e) => setIncome({ ...income, annualRentReceived: Number(e.target.value) })}
                              className="w-full px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-white font-mono focus:border-cyan-400 focus:outline-hidden"
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-400 mb-1">Municipal Taxes Paid</label>
                            <input
                              type="number"
                              value={income.municipalTaxesPaid}
                              onChange={(e) => setIncome({ ...income, municipalTaxesPaid: Number(e.target.value) })}
                              className="w-full px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-white font-mono focus:border-cyan-400 focus:outline-hidden"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Capital Gains & Other Sources */}
                <div className="bg-[#0c0d16] border border-white/10 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-sm font-bold text-white">Capital Gains & Other Income Sources</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-zinc-400 mb-1">STCG on Listed Equity / Equity MF (Taxed @ 20%)</label>
                      <input
                        type="number"
                        value={income.stcgEquity}
                        onChange={(e) => setIncome({ ...income, stcgEquity: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-white font-mono focus:border-cyan-400 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1">LTCG on Listed Equity (Taxed @ 12.5% above ₹1.25L)</label>
                      <input
                        type="number"
                        value={income.ltcgEquity}
                        onChange={(e) => setIncome({ ...income, ltcgEquity: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-white font-mono focus:border-cyan-400 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1">Savings Bank Interest</label>
                      <input
                        type="number"
                        value={income.savingsInterest}
                        onChange={(e) => setIncome({ ...income, savingsInterest: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-white font-mono focus:border-cyan-400 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1">FD Interest / Dividend Income</label>
                      <input
                        type="number"
                        value={income.dividendIncome + income.fdInterest}
                        onChange={(e) => setIncome({ ...income, dividendIncome: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-white font-mono focus:border-cyan-400 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => setFilingStep(1)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    ← Back to Step 1
                  </button>
                  <button
                    onClick={() => setFilingStep(3)}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer"
                  >
                    <span>Proceed to Deductions</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Real-time Summary Card (Sticky) */}
              <div className="space-y-4">
                <div className="sticky top-20 bg-gradient-to-b from-[#0c0d16] to-[#07111F] border border-cyan-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <span className="text-xs font-black uppercase text-cyan-400 tracking-wider">Live Tax Snapshot</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold">
                      FY 2025-26
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-zinc-400">
                      <span>Gross Total Income</span>
                      <span className="text-white font-mono font-bold">
                        ₹{activeResult.grossTotalIncome.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Standard Deduction</span>
                      <span className="text-emerald-400 font-mono font-bold">
                        -₹{activeResult.standardDeduction.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Net Taxable Income</span>
                      <span className="text-white font-mono font-bold">
                        ₹{activeResult.netTaxableIncome.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Total Tax Liability</span>
                      <span className="text-amber-400 font-mono font-bold">
                        ₹{activeResult.totalTaxPayable.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>TDS Already Paid</span>
                      <span className="text-cyan-400 font-mono font-bold">
                        ₹{tdsPaid.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10">
                    {activeResult.taxPayableOrRefund <= 0 ? (
                      <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-center">
                        <span className="block text-[10px] uppercase font-bold text-emerald-300">Expected Tax Refund</span>
                        <span className="text-xl font-black text-[#00E599] font-mono">
                          ₹{Math.abs(activeResult.taxPayableOrRefund).toLocaleString("en-IN")}
                        </span>
                        <span className="block text-[10px] text-zinc-400 mt-1">Direct to Bank via RTGS</span>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-center">
                        <span className="block text-[10px] uppercase font-bold text-amber-300">Balance Tax Payable</span>
                        <span className="text-xl font-black text-amber-400 font-mono">
                          ₹{activeResult.taxPayableOrRefund.toLocaleString("en-IN")}
                        </span>
                        <span className="block text-[10px] text-zinc-400 mt-1">Challan 280 Payment</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: DEDUCTIONS & EXEMPTIONS */}
          {filingStep === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-5">
                {/* Section 80C Investments */}
                <div className="bg-[#0c0d16] border border-white/10 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div>
                      <h3 className="text-sm font-bold text-white">Section 80C Investments</h3>
                      <p className="text-[11px] text-zinc-400">Max eligible deduction under Section 80C is ₹1,50,000 (Applicable in Old Regime)</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      ₹{Math.min(150000, (deductions.epfVpf || 0) + (deductions.elss || 0) + (deductions.lifeInsurance || 0) + (deductions.ppf || 0)).toLocaleString("en-IN")} / ₹1,50,000
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-zinc-400 mb-1">Employee PF / VPF</label>
                      <input
                        type="number"
                        value={deductions.epfVpf}
                        onChange={(e) => setDeductions({ ...deductions, epfVpf: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-white font-mono focus:border-cyan-400 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1">ELSS Mutual Funds</label>
                      <input
                        type="number"
                        value={deductions.elss}
                        onChange={(e) => setDeductions({ ...deductions, elss: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-white font-mono focus:border-cyan-400 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1">Life Insurance Premium (LIC)</label>
                      <input
                        type="number"
                        value={deductions.lifeInsurance}
                        onChange={(e) => setDeductions({ ...deductions, lifeInsurance: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-white font-mono focus:border-cyan-400 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1">Public Provident Fund (PPF)</label>
                      <input
                        type="number"
                        value={deductions.ppf}
                        onChange={(e) => setDeductions({ ...deductions, ppf: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-white font-mono focus:border-cyan-400 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1">Home Loan Principal (80C)</label>
                      <input
                        type="number"
                        value={deductions.principalHomeLoan}
                        onChange={(e) => setDeductions({ ...deductions, principalHomeLoan: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-white font-mono focus:border-cyan-400 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1">Children Tuition Fees</label>
                      <input
                        type="number"
                        value={deductions.tuitionFees}
                        onChange={(e) => setDeductions({ ...deductions, tuitionFees: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-white font-mono focus:border-cyan-400 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 80D Health & 80CCD NPS */}
                <div className="bg-[#0c0d16] border border-white/10 rounded-2xl p-5 space-y-4">
                  <div className="pb-3 border-b border-white/10">
                    <h3 className="text-sm font-bold text-white">Health Insurance (80D) & NPS (80CCD)</h3>
                    <p className="text-[11px] text-zinc-400">Maximize deductions for medical insurance and National Pension System</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-zinc-400 mb-1">Self, Spouse & Children Health Insurance (Max ₹25k)</label>
                      <input
                        type="number"
                        value={deductions.healthInsuranceSelf}
                        onChange={(e) => setDeductions({ ...deductions, healthInsuranceSelf: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-white font-mono focus:border-cyan-400 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-zinc-400">Parents Health Insurance</label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={deductions.parentsSeniorCitizen}
                            onChange={(e) => setDeductions({ ...deductions, parentsSeniorCitizen: e.target.checked })}
                            className="rounded accent-cyan-500"
                          />
                          <span className="text-[10px] text-cyan-300">Senior Citizen (Max 50k)</span>
                        </label>
                      </div>
                      <input
                        type="number"
                        value={deductions.healthInsuranceParents}
                        onChange={(e) => setDeductions({ ...deductions, healthInsuranceParents: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-white font-mono focus:border-cyan-400 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1">Self NPS Contribution u/s 80CCD(1B) (Max ₹50,000)</label>
                      <input
                        type="number"
                        value={deductions.npsSelf80CCD1B}
                        onChange={(e) => setDeductions({ ...deductions, npsSelf80CCD1B: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-white font-mono focus:border-cyan-400 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1">Employer NPS 80CCD(2) (Allowed in BOTH Regimes)</label>
                      <input
                        type="number"
                        value={deductions.npsEmployer80CCD2}
                        onChange={(e) => setDeductions({ ...deductions, npsEmployer80CCD2: Number(e.target.value) })}
                        placeholder="Up to 14% of Basic"
                        className="w-full px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-white font-mono focus:border-cyan-400 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* HRA Exemption Calculator inputs */}
                <div className="bg-[#0c0d16] border border-white/10 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div>
                      <h3 className="text-sm font-bold text-white">House Rent Allowance (HRA) Exemption u/s 10(13A)</h3>
                      <p className="text-[11px] text-zinc-400">Calculated as the minimum of Actual HRA, Rent - 10% basic, or 50%/40% basic</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      Exemption: ₹{calculateHraExemption(income.basicSalary, income.hraReceived, deductions.rentPaidAnnually, deductions.isMetroCity).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-zinc-400 mb-1">Annual Rent Paid to Landlord</label>
                      <input
                        type="number"
                        value={deductions.rentPaidAnnually}
                        onChange={(e) => setDeductions({ ...deductions, rentPaidAnnually: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-white font-mono focus:border-cyan-400 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1">City of Residence</label>
                      <div className="flex items-center gap-4 mt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="metroCity"
                            checked={deductions.isMetroCity}
                            onChange={() => setDeductions({ ...deductions, isMetroCity: true })}
                            className="accent-cyan-500"
                          />
                          <span className="text-white">Metro (Mumbai, Delhi, Kolkata, Chennai) - 50%</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="metroCity"
                            checked={!deductions.isMetroCity}
                            onChange={() => setDeductions({ ...deductions, isMetroCity: false })}
                            className="accent-cyan-500"
                          />
                          <span className="text-white">Non-Metro - 40%</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => setFilingStep(2)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    ← Back to Step 2
                  </button>
                  <button
                    onClick={() => setFilingStep(4)}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer"
                  >
                    <span>View Regime Comparison</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Deductions Impact Summary */}
              <div className="space-y-4">
                <div className="bg-[#0c0d16] border border-white/10 rounded-2xl p-5 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-white">Deductions Summary</h4>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between text-zinc-400">
                      <span>Total 80C Claimed</span>
                      <span className="text-white font-mono">
                        ₹{Math.min(150000, (deductions.epfVpf || 0) + (deductions.elss || 0) + (deductions.lifeInsurance || 0) + (deductions.ppf || 0)).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>80D Health Insurance</span>
                      <span className="text-white font-mono">
                        ₹{((deductions.healthInsuranceSelf || 0) + (deductions.healthInsuranceParents || 0)).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>80CCD(1B) NPS</span>
                      <span className="text-white font-mono">
                        ₹{(deductions.npsSelf80CCD1B || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>HRA Exemption</span>
                      <span className="text-white font-mono">
                        ₹{calculateHraExemption(income.basicSalary, income.hraReceived, deductions.rentPaidAnnually, deductions.isMetroCity).toLocaleString("en-IN")}
                      </span>
                    </div>
                    {income.hasHouseProperty && income.propertyType === "self_occupied" && (
                      <div className="flex justify-between text-zinc-400">
                        <span>Sec 24b Interest</span>
                        <span className="text-white font-mono">
                          ₹{Math.min(200000, income.homeLoanInterest24b || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-white/10 text-[11px] text-zinc-400 space-y-1.5">
                    <p className="flex items-center gap-1.5 text-cyan-300">
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      In the New Regime, standard deduction is ₹75,000 without requiring investment proofs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: REGIME COMPARISON & OPTIMIZATION */}
          {filingStep === 4 && (
            <div className="space-y-6">
              {/* Highlight Recommendation Banner */}
              <div
                className={`p-6 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl ${
                  taxComparison.optimalRegime === "new"
                    ? "bg-gradient-to-r from-emerald-950/60 via-[#07111F] to-[#0c0d16] border-emerald-500/40"
                    : "bg-gradient-to-r from-indigo-950/60 via-[#07111F] to-[#0c0d16] border-indigo-500/40"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/15">
                    <Award className="w-8 h-8 text-[#00E599]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#00E599] text-black">
                        AI Recommended
                      </span>
                      <span className="text-sm font-bold text-white uppercase tracking-wider">
                        {taxComparison.optimalRegime === "new" ? "New Tax Regime" : "Old Tax Regime"}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                      {taxComparison.taxSavings > 0 ? (
                        <>
                          You save <span className="text-[#00E599]">₹{taxComparison.taxSavings.toLocaleString("en-IN")}</span> by selecting the {taxComparison.optimalRegime.toUpperCase()} Regime!
                        </>
                      ) : (
                        "Both regimes offer identical tax savings."
                      )}
                    </h2>
                    <p className="text-xs text-zinc-300 mt-1 max-w-xl">
                      {taxComparison.differenceSummary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => {
                      setSelectedRegimeChoice("new");
                      setFilingStep(5);
                    }}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      effectiveRegime === "new"
                        ? "bg-[#00E599] text-black shadow-lg shadow-emerald-500/25"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    Select New Regime
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRegimeChoice("old");
                      setFilingStep(5);
                    }}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      effectiveRegime === "old"
                        ? "bg-indigo-400 text-black shadow-lg shadow-indigo-500/25"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    Select Old Regime
                  </button>
                </div>
              </div>

              {/* Side by Side Comparative Breakdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* NEW REGIME CARD */}
                <div
                  className={`rounded-3xl p-6 border transition-all ${
                    effectiveRegime === "new"
                      ? "bg-[#0c0d16] border-[#00E599] shadow-[0_0_30px_rgba(0,229,153,0.15)] ring-1 ring-[#00E599]"
                      : "bg-[#0c0d16]/70 border-white/10 opacity-80"
                  }`}
                >
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-white">New Tax Regime</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-zinc-300 font-mono">
                          Sec 115BAC
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400">Budget 2025/2026 Enhanced Slab Structure</p>
                    </div>
                    {taxComparison.optimalRegime === "new" && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-[#00E599]/20 text-[#00E599] border border-[#00E599]/30">
                        ⭐ Best Value
                      </span>
                    )}
                  </div>

                  <div className="py-4 space-y-3 text-xs border-b border-white/10">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Gross Total Income</span>
                      <span className="text-white font-mono font-bold">
                        ₹{taxComparison.newRegime.grossTotalIncome.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Standard Deduction</span>
                      <span className="text-[#00E599] font-mono font-bold">-₹75,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Chapter VI-A Deductions</span>
                      <span className="text-zinc-400 font-mono">
                        {taxComparison.newRegime.chapterVIA_Deductions > 0
                          ? `-₹${taxComparison.newRegime.chapterVIA_Deductions.toLocaleString("en-IN")} (NPS)`
                          : "Not Allowed"}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span className="text-zinc-300">Net Taxable Income</span>
                      <span className="text-white font-mono">
                        ₹{taxComparison.newRegime.netTaxableIncome.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Slab Tax Calculation</span>
                      <span className="text-white font-mono">
                        ₹{taxComparison.newRegime.slabTax.toLocaleString("en-IN")}
                      </span>
                    </div>
                    {taxComparison.newRegime.rebate87A > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Rebate u/s 87A (Tax Nil up to 7L)</span>
                        <span className="font-mono font-bold">
                          -₹{taxComparison.newRegime.rebate87A.toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Health & Education Cess (4%)</span>
                      <span className="text-white font-mono">
                        ₹{taxComparison.newRegime.healthAndEduCess.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <div>
                      <span className="block text-[11px] text-zinc-400">Total Tax Payable</span>
                      <span className="text-2xl font-black text-[#00E599] font-mono">
                        ₹{taxComparison.newRegime.totalTaxPayable.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[11px] text-zinc-400">Effective Tax Rate</span>
                      <span className="text-sm font-bold text-white font-mono">
                        {taxComparison.newRegime.effectiveTaxRate}%
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedRegimeChoice("new");
                      setFilingStep(5);
                    }}
                    className="w-full mt-5 py-2.5 rounded-xl bg-white/10 hover:bg-[#00E599] hover:text-black text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Proceed with New Regime →
                  </button>
                </div>

                {/* OLD REGIME CARD */}
                <div
                  className={`rounded-3xl p-6 border transition-all ${
                    effectiveRegime === "old"
                      ? "bg-[#0c0d16] border-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.15)] ring-1 ring-indigo-400"
                      : "bg-[#0c0d16]/70 border-white/10 opacity-80"
                  }`}
                >
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-white">Old Tax Regime</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-zinc-300 font-mono">
                          With Deductions
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400">Full 80C, 80D, HRA & Home Loan Claims</p>
                    </div>
                    {taxComparison.optimalRegime === "old" && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        ⭐ Best Value
                      </span>
                    )}
                  </div>

                  <div className="py-4 space-y-3 text-xs border-b border-white/10">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Gross Total Income</span>
                      <span className="text-white font-mono font-bold">
                        ₹{taxComparison.oldRegime.grossTotalIncome.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Standard Deduction</span>
                      <span className="text-emerald-400 font-mono font-bold">-₹50,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">HRA / Salary Exemptions</span>
                      <span className="text-emerald-400 font-mono font-bold">
                        -₹{taxComparison.oldRegime.exemptions.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Chapter VI-A Deductions</span>
                      <span className="text-emerald-400 font-mono font-bold">
                        -₹{taxComparison.oldRegime.chapterVIA_Deductions.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span className="text-zinc-300">Net Taxable Income</span>
                      <span className="text-white font-mono">
                        ₹{taxComparison.oldRegime.netTaxableIncome.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Slab Tax Calculation</span>
                      <span className="text-white font-mono">
                        ₹{taxComparison.oldRegime.slabTax.toLocaleString("en-IN")}
                      </span>
                    </div>
                    {taxComparison.oldRegime.rebate87A > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Rebate u/s 87A</span>
                        <span className="font-mono font-bold">
                          -₹{taxComparison.oldRegime.rebate87A.toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Health & Education Cess (4%)</span>
                      <span className="text-white font-mono">
                        ₹{taxComparison.oldRegime.healthAndEduCess.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <div>
                      <span className="block text-[11px] text-zinc-400">Total Tax Payable</span>
                      <span className="text-2xl font-black text-indigo-400 font-mono">
                        ₹{taxComparison.oldRegime.totalTaxPayable.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[11px] text-zinc-400">Effective Tax Rate</span>
                      <span className="text-sm font-bold text-white font-mono">
                        {taxComparison.oldRegime.effectiveTaxRate}%
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedRegimeChoice("old");
                      setFilingStep(5);
                    }}
                    className="w-full mt-5 py-2.5 rounded-xl bg-white/10 hover:bg-indigo-500 hover:text-black text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Proceed with Old Regime →
                  </button>
                </div>
              </div>

              <div className="flex justify-start">
                <button
                  onClick={() => setFilingStep(3)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold transition-all cursor-pointer"
                >
                  ← Back to Deductions
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: E-FILE SUBMISSION & ITR-V ACKNOWLEDGEMENT */}
          {filingStep === 5 && (
            <div className="space-y-6">
              {!isFilingSubmitted ? (
                /* Pre-submission confirmation */
                <div className="bg-[#0c0d16] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 max-w-3xl mx-auto shadow-2xl">
                  <div className="text-center space-y-2">
                    <div className="w-14 h-14 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl mx-auto flex items-center justify-center text-cyan-400">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      Review & Transmit to Income Tax Department
                    </h2>
                    <p className="text-xs text-zinc-400 max-w-md mx-auto">
                      Your return will be transmitted securely using CBDT XML/JSON E-Filing API specification for AY 2026-27.
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-4 space-y-3 text-xs border border-white/10">
                    <div className="grid grid-cols-2 gap-3 pb-3 border-b border-white/10">
                      <div>
                        <span className="block text-zinc-400 text-[10px] uppercase font-bold">Taxpayer</span>
                        <span className="font-bold text-white">{personalInfo.fullName}</span>
                      </div>
                      <div>
                        <span className="block text-zinc-400 text-[10px] uppercase font-bold">PAN / Aadhaar</span>
                        <span className="font-mono text-cyan-400">{personalInfo.pan}</span>
                      </div>
                      <div>
                        <span className="block text-zinc-400 text-[10px] uppercase font-bold">Assessment Year</span>
                        <span className="font-bold text-white">AY 2026-27 (FY 2025-26)</span>
                      </div>
                      <div>
                        <span className="block text-zinc-400 text-[10px] uppercase font-bold">Selected Regime</span>
                        <span className="font-bold text-[#00E599] uppercase">{effectiveRegime} Regime</span>
                      </div>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-zinc-400">Total Income</span>
                      <span className="font-mono font-bold text-white">
                        ₹{activeResult.grossTotalIncome.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-400">Total Tax Payable</span>
                      <span className="font-mono font-bold text-white">
                        ₹{activeResult.totalTaxPayable.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-400">TDS / Advance Tax Paid</span>
                      <span className="font-mono font-bold text-cyan-400">
                        ₹{tdsPaid.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex justify-between items-center text-sm font-black">
                      <span>{activeResult.taxPayableOrRefund <= 0 ? "Tax Refund Due:" : "Balance Tax Payable:"}</span>
                      <span
                        className={`font-mono text-base ${
                          activeResult.taxPayableOrRefund <= 0 ? "text-[#00E599]" : "text-amber-400"
                        }`}
                      >
                        ₹{Math.abs(activeResult.taxPayableOrRefund).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Verification Mode Choice */}
                  <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs space-y-2">
                    <span className="font-bold text-cyan-300 block">Instant e-Verification:</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked readOnly className="accent-cyan-400" />
                      <span className="text-white">Verify immediately using Aadhaar OTP (Registered Mobile)</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setFilingStep(4)}
                      className="w-1/3 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold transition-all cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleFinalSubmitFiling}
                      className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-[#00E599] hover:opacity-90 text-black text-xs font-black transition-all shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Zap className="w-4 h-4 fill-black" />
                      <span>Transmit & e-File Return Now</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Post-submission ITR-V Ack Slip */
                <div className="bg-[#0c0d16] border border-emerald-500/30 rounded-3xl p-6 sm:p-8 space-y-6 max-w-3xl mx-auto shadow-2xl animate-scaleUp">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full mx-auto flex items-center justify-center text-[#00E599]">
                      <CheckCircle2 className="w-9 h-9" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-[#00E599]/20 text-[#00E599] border border-[#00E599]/30 inline-block">
                      Filing Transmitted & Verified
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white">
                      ITR Successfully Filed for AY 2026-27!
                    </h2>
                    <p className="text-xs text-zinc-400">
                      Acknowledgment Number: <strong className="text-cyan-400 font-mono">{ackNumber}</strong>
                    </p>
                  </div>

                  {/* Simulated Official ITR-V Slip Box */}
                  <div className="bg-[#121422] border border-white/15 rounded-2xl p-5 text-xs font-mono space-y-4 text-zinc-300">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2 font-sans">
                        <Award className="w-5 h-5 text-amber-400" />
                        <div>
                          <div className="font-bold text-white text-xs">INCOME TAX DEPARTMENT (GOVERNMENT OF INDIA)</div>
                          <div className="text-[10px] text-zinc-400">INDIAN INCOME TAX RETURN ACKNOWLEDGEMENT (ITR-V)</div>
                        </div>
                      </div>
                      <span className="text-[11px] text-emerald-400 font-bold font-sans">✓ e-VERIFIED</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>Name: <span className="text-white font-bold">{personalInfo.fullName}</span></div>
                      <div>PAN: <span className="text-cyan-400 font-bold">{personalInfo.pan}</span></div>
                      <div>Form: <span className="text-white">ITR-1 (SAHAJ)</span></div>
                      <div>Status: <span className="text-white">Individual / Resident</span></div>
                      <div>Assessment Year: <span className="text-white font-bold">2026-27</span></div>
                      <div>Financial Year: <span className="text-white">2025-26</span></div>
                      <div>Filing Date: <span className="text-white">{new Date().toLocaleDateString("en-IN")}</span></div>
                      <div>Ack Number: <span className="text-amber-400 font-bold">{ackNumber}</span></div>
                    </div>

                    <div className="pt-3 border-t border-white/10 space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span>1. Gross Total Income:</span>
                        <span className="text-white font-bold">₹{activeResult.grossTotalIncome.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>2. Total Deductions Allowed:</span>
                        <span className="text-white">₹{activeResult.totalDeductions.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>3. Total Tax Payable:</span>
                        <span className="text-white">₹{activeResult.totalTaxPayable.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>4. Taxes Paid (TDS/TCS/Advance):</span>
                        <span className="text-cyan-400">₹{tdsPaid.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-white/10 font-bold text-white">
                        <span>{activeResult.taxPayableOrRefund <= 0 ? "5. Net Refund Claimed:" : "5. Net Tax Payable:"}</span>
                        <span className={activeResult.taxPayableOrRefund <= 0 ? "text-[#00E599]" : "text-amber-400"}>
                          ₹{Math.abs(activeResult.taxPayableOrRefund).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <button
                      onClick={() => window.print()}
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print Acknowledgement</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setIsFilingSubmitted(false);
                          setFilingStep(1);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-300 text-xs font-bold cursor-pointer"
                      >
                        Start Another Filing
                      </button>
                      <button
                        onClick={() => setActiveTab("history")}
                        className="px-5 py-2.5 rounded-xl bg-[#00E599] hover:bg-emerald-400 text-black text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer"
                      >
                        <span>View in Filing History</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: TAX CALCULATORS HUB                                */}
      {/* ======================================================== */}
      {activeTab === "calculators" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Interactive Old vs New Regime Comparator */}
            <div className="lg:col-span-2 bg-[#0c0d16] border border-white/10 rounded-3xl p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Live Income Tax Calculator (FY 2025-26)</h3>
                    <p className="text-xs text-zinc-400">Slide salary and deductions to see instant regime tax shifts</p>
                  </div>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 font-bold border border-cyan-500/20">
                  AY 2026-27 Slabs
                </span>
              </div>

              {/* Sliders */}
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-zinc-300 font-bold">Annual Gross Salary</span>
                    <span className="font-mono text-cyan-400 font-black text-sm">
                      ₹{calcSalary.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="300000"
                    max="5000000"
                    step="50000"
                    value={calcSalary}
                    onChange={(e) => setCalcSalary(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer h-2 bg-white/10 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
                    <span>₹3 Lakhs</span>
                    <span>₹25 Lakhs</span>
                    <span>₹50 Lakhs</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-zinc-400">Section 80C Claim (Old)</span>
                      <span className="font-mono text-white font-bold">₹{calc80C.toLocaleString("en-IN")}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="150000"
                      step="10000"
                      value={calc80C}
                      onChange={(e) => setCalc80C(Number(e.target.value))}
                      className="w-full accent-emerald-400 cursor-pointer h-2 bg-white/10 rounded-lg"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-zinc-400">Section 80D Health Claim</span>
                      <span className="font-mono text-white font-bold">₹{calc80D.toLocaleString("en-IN")}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      step="5000"
                      value={calc80D}
                      onChange={(e) => setCalc80D(Number(e.target.value))}
                      className="w-full accent-indigo-400 cursor-pointer h-2 bg-white/10 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Calculation Comparison */}
              {(() => {
                const liveComp = compareTaxRegimes(
                  {
                    ...income,
                    grossSalary: calcSalary,
                    basicSalary: calcSalary * 0.5,
                    hraReceived: calcSalary * 0.2
                  },
                  {
                    ...deductions,
                    epfVpf: calc80C,
                    healthInsuranceSelf: Math.min(25000, calc80D),
                    healthInsuranceParents: Math.max(0, calc80D - 25000)
                  },
                  0
                );

                return (
                  <div className="pt-4 border-t border-white/10 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-[#00E599]/10 border border-[#00E599]/30 text-center">
                        <span className="text-[10px] uppercase font-bold text-emerald-300 block">New Regime Tax</span>
                        <span className="text-xl sm:text-2xl font-black text-[#00E599] font-mono">
                          ₹{liveComp.newRegime.totalTaxPayable.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] text-zinc-400 block mt-1">
                          Effective: {liveComp.newRegime.effectiveTaxRate}%
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-center">
                        <span className="text-[10px] uppercase font-bold text-indigo-300 block">Old Regime Tax</span>
                        <span className="text-xl sm:text-2xl font-black text-indigo-400 font-mono">
                          ₹{liveComp.oldRegime.totalTaxPayable.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] text-zinc-400 block mt-1">
                          Effective: {liveComp.oldRegime.effectiveTaxRate}%
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs flex items-center justify-between">
                      <span className="text-zinc-300">
                        {liveComp.taxSavings > 0 ? (
                          <>
                            Recommended: <strong className="text-white uppercase">{liveComp.optimalRegime} Regime</strong> (Saves ₹{liveComp.taxSavings.toLocaleString("en-IN")})
                          </>
                        ) : (
                          "Both regimes result in the exact same tax liability."
                        )}
                      </span>
                      <button
                        onClick={() => {
                          setIncome({ ...income, grossSalary: calcSalary, basicSalary: calcSalary * 0.5 });
                          setActiveTab("filing");
                          setFilingStep(4);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-cyan-400 text-black text-[11px] font-bold hover:bg-cyan-300 transition-all cursor-pointer"
                      >
                        File with this Profile →
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Sidebar Calculators: HRA & Capital Gains */}
            <div className="space-y-6">
              {/* HRA Exemption Calculator */}
              <div className="bg-[#0c0d16] border border-white/10 rounded-3xl p-5 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                  <Building className="w-5 h-5 text-amber-400" />
                  <h4 className="text-sm font-bold text-white">HRA Exemption Calculator</h4>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-zinc-400 mb-1">Annual Basic Salary</label>
                    <input
                      type="number"
                      value={calcHraBasic}
                      onChange={(e) => setCalcHraBasic(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white/5 rounded-xl border border-white/10 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">HRA Received from Employer</label>
                    <input
                      type="number"
                      value={calcHraReceived}
                      onChange={(e) => setCalcHraReceived(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white/5 rounded-xl border border-white/10 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">Total Rent Paid Annually</label>
                    <input
                      type="number"
                      value={calcHraRent}
                      onChange={(e) => setCalcHraRent(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white/5 rounded-xl border border-white/10 text-white font-mono"
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={calcIsMetro}
                        onChange={(e) => setCalcIsMetro(e.target.checked)}
                        className="rounded accent-cyan-500"
                      />
                      <span className="text-zinc-300">Metro City (50% basic rule)</span>
                    </label>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block">Tax Exempt HRA Amount</span>
                    <span className="text-lg font-black text-amber-400 font-mono">
                      ₹{calculateHraExemption(calcHraBasic, calcHraReceived, calcHraRent, calcIsMetro).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Capital Gains Tax Calculator */}
              <div className="bg-[#0c0d16] border border-white/10 rounded-3xl p-5 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  <h4 className="text-sm font-bold text-white">Capital Gains (Budget 2024/25)</h4>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-zinc-400 mb-1">
                      <span>STCG on Equity (Tax @ 20%)</span>
                      <span className="text-white font-mono font-bold">₹{calcStcg.toLocaleString("en-IN")}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="500000"
                      step="10000"
                      value={calcStcg}
                      onChange={(e) => setCalcStcg(Number(e.target.value))}
                      className="w-full accent-indigo-400 cursor-pointer h-2 bg-white/10 rounded-lg"
                    />
                    <div className="text-right text-[10px] text-indigo-300 mt-0.5">
                      Tax: ₹{(calcStcg * 0.2).toLocaleString("en-IN")}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-zinc-400 mb-1">
                      <span>LTCG on Equity (Tax @ 12.5% &gt; ₹1.25L)</span>
                      <span className="text-white font-mono font-bold">₹{calcLtcg.toLocaleString("en-IN")}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1000000"
                      step="25000"
                      value={calcLtcg}
                      onChange={(e) => setCalcLtcg(Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer h-2 bg-white/10 rounded-lg"
                    />
                    <div className="text-right text-[10px] text-cyan-300 mt-0.5">
                      Tax: ₹{(Math.max(0, calcLtcg - 125000) * 0.125).toLocaleString("en-IN")}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block">Total Capital Gains Tax</span>
                    <span className="text-lg font-black text-white font-mono">
                      ₹{Math.round(calcStcg * 0.2 + Math.max(0, calcLtcg - 125000) * 0.125).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: AIS / TIS & FORM 26AS TAX CREDITS                  */}
      {/* ======================================================== */}
      {activeTab === "ais" && (
        <div className="space-y-6">
          <div className="bg-[#0c0d16] border border-white/10 rounded-3xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Annual Information Statement (AIS / TIS)</h3>
                  <p className="text-xs text-zinc-400">Synchronized directly with Income Tax Department e-Filing portal for PAN: {personalInfo.pan}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Total Tax Credits:</span>
                <span className="text-xs font-mono font-black text-[#00E599] bg-[#00E599]/10 px-2.5 py-1 rounded-lg border border-[#00E599]/30">
                  ₹{MOCK_AIS_ENTRIES.reduce((acc, x) => acc + x.tdsTcsDeducted, 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* AIS Entries Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-white/5 text-zinc-400 uppercase text-[10px] font-bold border-b border-white/10">
                  <tr>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Information Description</th>
                    <th className="p-3.5">Reporting Source / Entity</th>
                    <th className="p-3.5 text-right">Reported Value</th>
                    <th className="p-3.5 text-right">TDS / TCS Credit</th>
                    <th className="p-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {MOCK_AIS_ENTRIES.map((entry) => (
                    <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/10 text-white">
                          {entry.category}
                        </span>
                      </td>
                      <td className="p-3.5 font-medium text-white max-w-xs">{entry.description}</td>
                      <td className="p-3.5 text-zinc-400">{entry.reportedBy}</td>
                      <td className="p-3.5 text-right font-mono font-bold text-white">
                        ₹{entry.grossValue.toLocaleString("en-IN")}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                        {entry.tdsTcsDeducted > 0 ? `₹${entry.tdsTcsDeducted.toLocaleString("en-IN")}` : "—"}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                          {entry.feedbackStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>All 5 AIS items reconcile cleanly with your Form 16 and bank interest disclosures.</span>
              </div>
              <button
                onClick={() => {
                  setActiveTab("filing");
                  setFilingStep(2);
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all shrink-0 cursor-pointer"
              >
                Auto-fill in ITR →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: FILING HISTORY & ITR-V ACKNOWLEDGEMENT             */}
      {/* ======================================================== */}
      {activeTab === "history" && (
        <div className="space-y-6">
          <div className="bg-[#0c0d16] border border-white/10 rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">e-Filing History & Compliance Records</h3>
                  <p className="text-xs text-zinc-400">Download ITR-V acknowledgements and track refund status</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveTab("filing");
                  setFilingStep(1);
                  setIsFilingSubmitted(false);
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all cursor-pointer"
              >
                + File New Return
              </button>
            </div>

            <div className="space-y-4">
              {filingHistory.map((rec) => (
                <div
                  key={rec.id}
                  className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/40 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase bg-white/10 text-white">
                        {rec.itrType}
                      </span>
                      <div>
                        <div className="font-bold text-white text-sm">{rec.assessmentYear}</div>
                        <div className="text-[11px] text-zinc-400 font-mono">{rec.ackNumber}</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 self-start sm:self-auto">
                      ✓ {rec.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-white/10">
                    <div>
                      <span className="block text-zinc-400 text-[10px] uppercase">Filing Date</span>
                      <span className="text-white font-medium">{rec.filingDate}</span>
                    </div>
                    <div>
                      <span className="block text-zinc-400 text-[10px] uppercase">Gross Income</span>
                      <span className="text-white font-mono font-bold">
                        ₹{rec.grossIncome.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div>
                      <span className="block text-zinc-400 text-[10px] uppercase">Regime Chosen</span>
                      <span className="text-cyan-300 font-bold uppercase">{rec.regimeChosen}</span>
                    </div>
                    <div>
                      <span className="block text-zinc-400 text-[10px] uppercase">Refund / Payable</span>
                      <span
                        className={`font-mono font-bold ${
                          rec.refundOrPayable <= 0 ? "text-[#00E599]" : "text-amber-400"
                        }`}
                      >
                        {rec.refundOrPayable <= 0
                          ? `₹${Math.abs(rec.refundOrPayable).toLocaleString("en-IN")} Refund`
                          : `₹${rec.refundOrPayable.toLocaleString("en-IN")} Paid`}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => alert(`ITR-V Acknowledgment PDF downloaded for ${rec.ackNumber}`)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download ITR-V</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
