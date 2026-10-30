import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getBusinessProfile,
  updateBusinessProfile,
  verifyGstinApi,
  confirmBusinessProfileApi
} from "../services/api";
import { GstinVerificationDetails, GstinVerificationResponse } from "../types";
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Save,
  RotateCcw,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  Search,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  ShieldAlert,
  Info,
  Calendar,
  FileCheck2,
  ArrowRight
} from "lucide-react";

// Test GSTIN presets for student viva, testing, and rapid inspection
const QUICK_TEST_GSTINS = [
  { label: "Active (TCS)", gstin: "27AAPFU0939F1ZV", note: "Active Regular Taxpayer (Maharashtra)" },
  { label: "Active (Infosys)", gstin: "29AABCU9603R1ZX", note: "Active Regular Taxpayer (Karnataka)" },
  { label: "Active (Reliance)", gstin: "24AAACR4533K1Z9", note: "Active Regular Taxpayer (Gujarat)" },
  { label: "Cancelled Reg", gstin: "27AAACR1234A1Z3", note: "Cancelled / Inactive Registration" },
  { label: "Suspended Reg", gstin: "07AAAAA0000A1Z4", note: "Suspended Registration" },
  { label: "Bad Checksum", gstin: "27AAPFU0939F1Z0", note: "Mod-36 Checksum Failure" },
  { label: "Not Found", gstin: "27AABCT0000A1ZE", note: "Registration Not in Database" },
  { label: "API Timeout", gstin: "27AABCT9999A1ZW", note: "Simulated Gateway Failure" }
];

export const BusinessProfile: React.FC = () => {
  const { business, refreshUser } = useAuth();

  // Verification Input & State
  const [inputGstin, setInputGstin] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<GstinVerificationResponse | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    businessName: "",
    legalName: "",
    tradeName: "",
    gstin: "",
    pan: "",
    businessCategory: "Consumer Goods, Sanitaryware & IT Hardware",
    registrationType: "Regular",
    registrationStatus: "ACTIVE",
    registrationDate: "",
    state: "Maharashtra",
    address: "",
    principalPlace: "",
    email: "",
    phone: "",
    isGstinVerified: false,
    verificationProvider: ""
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedGstin, setCopiedGstin] = useState(false);

  // Load existing profile into state on mount
  useEffect(() => {
    if (business) {
      setFormData({
        businessName: business.businessName || "",
        legalName: business.legalName || business.businessName || "",
        tradeName: business.tradeName || business.businessName || "",
        gstin: business.gstin || "",
        pan: business.pan || (business.gstin ? business.gstin.slice(2, 12) : ""),
        businessCategory: business.businessCategory || "Consumer Goods, Sanitaryware & IT Hardware",
        registrationType: business.registrationType || "Regular",
        registrationStatus: business.registrationStatus || "ACTIVE",
        registrationDate: business.registrationDate || "",
        state: business.state || "Maharashtra",
        address: business.address || "",
        principalPlace: business.principalPlace || "",
        email: business.email || "",
        phone: business.phone || "",
        isGstinVerified: Boolean(business.isGstinVerified),
        verificationProvider: business.verificationProvider || "GST Sahayak Verified Gateway"
      });
      setInputGstin(business.gstin || "");
    }
  }, [business]);

  // Handle Live Verification
  const handleVerifyGstin = async (gstinToVerify?: string) => {
    const targetGstin = (gstinToVerify || inputGstin).trim().toUpperCase();
    if (!targetGstin) {
      setVerificationError("Please enter a 15-character GSTIN to verify.");
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);
    setVerificationResult(null);

    try {
      const res = await verifyGstinApi(targetGstin, formData.businessName);

      setVerificationResult(res);

      if (res.success && res.verification) {
        const v = res.verification;
        // Automatically populate retrieved business details into form preview
        setFormData((prev) => ({
          ...prev,
          businessName: prev.businessName || v.tradeName || v.legalName,
          legalName: v.legalName,
          tradeName: v.tradeName || v.legalName,
          gstin: v.gstin,
          pan: v.pan,
          state: v.state,
          address: v.address || prev.address,
          principalPlace: v.principalPlace || prev.principalPlace,
          registrationType: v.taxpayerType || "Regular",
          registrationStatus: v.registrationStatus || "ACTIVE",
          registrationDate: v.registrationDate || "",
          verificationProvider: v.verificationProvider,
          isGstinVerified: true
        }));
        setIsEditing(true); // Open edit view for user to confirm and review
      } else if (res.isInactive) {
        setVerificationError(`Taxpayer registration is ${res.status}. Inactive GSTINs cannot be treated as valid active suppliers.`);
      } else {
        setVerificationError(res.error || "GSTIN could not be verified. Please check the number.");
      }
    } catch (err: any) {
      console.error("Verification API Error:", err);
      if (err.message && err.message.includes("503")) {
        setVerificationError("GSTIN verification is temporarily unavailable. Please try again later.");
      } else if (err.message && err.message.includes("404")) {
        setVerificationError("GSTIN could not be verified. Please check the number.");
      } else {
        setVerificationError(err.message || "Invalid GSTIN format. Please check the GSTIN and try again.");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // Quick Preset Click
  const handleQuickPreset = (presetGstin: string) => {
    setInputGstin(presetGstin);
    handleVerifyGstin(presetGstin);
  };

  // Explicit User Confirmation to Create / Save Profile
  const handleConfirmAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError(null);
    setSuccessMsg(null);
    setIsSaving(true);

    try {
      const res = await confirmBusinessProfileApi({
        ...formData,
        gstin: formData.gstin.trim().toUpperCase()
      });

      await refreshUser();
      setIsEditing(false);
      setSuccessMsg("Company profile confirmed and successfully saved in the PostgreSQL/Prisma datastore.");
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      console.error("Save Profile Error:", err);
      setVerificationError(err.message || "Failed to save company profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyGstin = () => {
    if (formData.gstin) {
      navigator.clipboard.writeText(formData.gstin);
      setCopiedGstin(true);
      setTimeout(() => setCopiedGstin(false), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn pb-16 font-sans">
      {/* 1. Header Banner */}
      <div className="cred-card p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00A878] to-[#00E599] text-[#07111F] flex items-center justify-center font-black text-2xl shadow-[0_0_25px_rgba(0,229,153,0.35)] shrink-0">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#00E599]/10 border border-[#00E599]/30 text-[#00E599] text-[10px] font-mono font-bold uppercase tracking-widest mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Statutory Company Master Node
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
              Business Profile & GST Verification
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Validate taxpayer credentials with the authorized verification gateway and automatically build your official invoicing profile.
            </p>
          </div>
        </div>

        {formData.isGstinVerified && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#00E599]/10 border border-[#00E599]/30 text-[#00E599] text-xs font-mono font-bold shrink-0">
            <CheckCircle2 className="w-4 h-4 text-[#00E599]" />
            <span>Verified Active Taxpayer</span>
          </div>
        )}
      </div>

      {/* 2. Interactive GSTIN Verification Gateway HUD */}
      <div className="cred-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
        <div>
          <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Search className="w-4 h-4 text-[#00E599]" />
            GSTIN Statutory Verification & Auto-Profile Gateway
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Enter any 15-character Goods and Services Tax Identification Number. The system validates the Mod-36 check digit, queries registration status, and retrieves official legal entities.
          </p>
        </div>

        {/* GSTIN Input Box + Action Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              maxLength={15}
              value={inputGstin}
              onChange={(e) => {
                setInputGstin(e.target.value.toUpperCase());
                setVerificationError(null);
              }}
              placeholder="e.g. 27AAPFU0939F1ZV (Enter 15-Digit GSTIN)"
              className="w-full px-4 py-3.5 bg-black/60 rounded-2xl border border-white/15 text-sm font-mono font-bold text-white placeholder-zinc-500 focus:border-[#00E599] focus:outline-hidden tracking-wider uppercase"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-zinc-500">
              {inputGstin.length} / 15
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleVerifyGstin()}
            disabled={isVerifying || !inputGstin.trim()}
            className="cred-btn-emerald py-3.5 px-7 text-xs font-bold whitespace-nowrap justify-center cursor-pointer disabled:opacity-50"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Verifying with Gateway...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Verify GSTIN</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Test Scenarios Bar */}
        <div className="space-y-2 pt-1 border-t border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#00E599]" />
              Quick Test Scenarios (Click to test edge cases):
            </span>
            <a
              href="https://services.gst.gov.in/services/quicklinks/searchtxp"
              target="_blank"
              rel="noreferrer"
              className="text-[10px] text-zinc-400 hover:text-[#00E599] hover:underline flex items-center gap-1 font-mono"
            >
              <span>Official GST Portal Search</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {QUICK_TEST_GSTINS.map((q) => (
              <button
                key={q.gstin}
                type="button"
                onClick={() => handleQuickPreset(q.gstin)}
                title={q.note}
                className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white border border-white/5 hover:border-white/20 text-[10px] font-mono transition-all cursor-pointer flex items-center gap-1"
              >
                <span className="font-bold text-[#00E599]">{q.label}:</span>
                <span>{q.gstin}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Verification Success Alert */}
        {verificationResult?.success && verificationResult.verification && (
          <div className="p-4 rounded-2xl bg-[#00E599]/10 border border-[#00E599]/40 text-xs text-[#00E599] flex items-start gap-3 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-[#00E599] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-white text-sm">
                GSTIN verified successfully. Please confirm your business details.
              </p>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                Retrieved official record for <strong className="text-white">{verificationResult.verification.legalName}</strong> from{" "}
                <span className="font-mono text-[#00E599]">{verificationResult.verification.verificationProvider}</span> (Ref: {verificationResult.verification.referenceId}).
              </p>
            </div>
          </div>
        )}

        {/* Verification Error Alert */}
        {verificationError && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-3 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-white text-sm">{verificationError}</p>
              <p className="text-[11px] text-zinc-400">
                Format validation, Mod-36 check digits, and live registration records are validated deterministically. Please review the number or retry.
              </p>
            </div>
          </div>
        )}

        {/* Business Name Mismatch Warning Card */}
        {verificationResult?.nameCheck?.isMismatch && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-2.5 animate-fadeIn">
            <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Business Name Mismatch Detected</span>
            </div>
            <p className="text-[11px] text-zinc-300 leading-relaxed">
              The entered business name differs from the officially registered legal entity name in the government record.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px]">
              <div>
                <span className="text-zinc-500 block text-[9px] uppercase font-bold">Retrieved Legal Name:</span>
                <span className="text-[#00E599] font-bold">{verificationResult.nameCheck.retrievedLegalName}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[9px] uppercase font-bold">Entered Profile Name:</span>
                <span className="text-amber-300 font-bold">{verificationResult.nameCheck.enteredName || "(Blank)"}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (verificationResult.nameCheck?.retrievedLegalName) {
                  setFormData((prev) => ({
                    ...prev,
                    businessName: verificationResult.nameCheck?.retrievedLegalName || prev.businessName
                  }));
                }
              }}
              className="text-xs font-bold text-[#00E599] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Adopt Official Legal Name as Display Name</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Duplicate / Existing Company Warning */}
        {verificationResult?.alreadyExistsInDatabase && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-3 animate-fadeIn">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">Existing Company Detected</p>
              <p className="text-[11px] text-zinc-300 mt-0.5">
                {verificationResult.existingCompanyMessage || "This GSTIN is already registered by another organization account in GST Sahayak."}
              </p>
            </div>
          </div>
        )}

        {/* 3. Verified Business Details Preview Grid */}
        {verificationResult?.verification && (
          <div className="p-5 sm:p-6 rounded-2xl bg-black/40 border border-white/10 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-[#00E599]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  Verified Taxpayer Credentials
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#00E599] bg-[#00E599]/10 px-2 py-0.5 rounded-full border border-[#00E599]/20 font-bold">
                Status: {verificationResult.verification.registrationStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[9px] text-zinc-500 uppercase font-bold block">Legal Registered Name</span>
                <span className="font-bold text-white text-xs block mt-1">{verificationResult.verification.legalName}</span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[9px] text-zinc-500 uppercase font-bold block">Trade Name</span>
                <span className="font-bold text-white text-xs block mt-1">{verificationResult.verification.tradeName || "N/A"}</span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[9px] text-zinc-500 uppercase font-bold block">Permanent Account Number (PAN)</span>
                <span className="font-bold text-[#00E599] text-xs block mt-1">{verificationResult.verification.pan}</span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[9px] text-zinc-500 uppercase font-bold block">State & Jurisdiction</span>
                <span className="font-bold text-white text-xs block mt-1">
                  {verificationResult.verification.state} (Code: {verificationResult.verification.stateCode})
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[9px] text-zinc-500 uppercase font-bold block">Taxpayer Classification</span>
                <span className="font-bold text-white text-xs block mt-1">{verificationResult.verification.taxpayerType}</span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[9px] text-zinc-500 uppercase font-bold block">Registration Date</span>
                <span className="font-bold text-white text-xs block mt-1">{verificationResult.verification.registrationDate || "Active on Portal"}</span>
              </div>

              <div className="sm:col-span-2 lg:col-span-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[9px] text-zinc-500 uppercase font-bold block">Principal Place of Business Address</span>
                <span className="font-bold text-zinc-200 text-xs block mt-1 font-sans">{verificationResult.verification.address}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-[#00E599]/15 border border-[#00E599]/40 text-xs text-[#00E599] flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-[#00E599] shrink-0" />
          <span className="font-bold">{successMsg}</span>
        </div>
      )}

      {/* 4. Complete Company Profile Form */}
      <form onSubmit={handleConfirmAndSave} className="cred-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#00E599]" />
              Official Company Profile Data
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Review and finalize your company profile details. These are stamped on all pre-screened invoices and tax schedules.
            </p>
          </div>

          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="cred-btn-secondary py-2 px-4 text-xs font-bold cursor-pointer"
            >
              Edit Details
            </button>
          ) : (
            <span className="text-[10px] font-mono font-bold text-[#00E599] bg-[#00E599]/10 px-2.5 py-1 rounded-full border border-[#00E599]/25">
              Review & Confirmation Mode
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business Display / Operating Name */}
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-zinc-300 block mb-1.5 uppercase tracking-wide">
              Business Display Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              disabled={!isEditing}
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className={`w-full px-4 py-3 text-xs rounded-xl border transition-all ${
                isEditing
                  ? "border-white/20 focus:border-[#00E599] bg-black/60 text-white"
                  : "border-white/10 bg-white/[0.02] text-zinc-200 font-bold"
              }`}
            />
          </div>

          {/* Legal Name */}
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1.5 uppercase tracking-wide">
              Official Legal Registered Name
            </label>
            <input
              type="text"
              disabled={!isEditing}
              value={formData.legalName}
              onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
              placeholder="As per GST registration"
              className={`w-full px-4 py-3 text-xs rounded-xl border font-mono transition-all ${
                isEditing
                  ? "border-white/20 focus:border-[#00E599] bg-black/60 text-white"
                  : "border-white/10 bg-white/[0.02] text-zinc-300"
              }`}
            />
          </div>

          {/* GSTIN */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wide">
                GSTIN <span className="text-rose-400">*</span>
              </label>
              {formData.gstin && (
                <button
                  type="button"
                  onClick={handleCopyGstin}
                  className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 font-mono cursor-pointer"
                >
                  {copiedGstin ? <Check className="w-3 h-3 text-[#00E599]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedGstin ? "Copied" : "Copy"}</span>
                </button>
              )}
            </div>
            <input
              type="text"
              required
              disabled={!isEditing}
              value={formData.gstin}
              onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
              className={`w-full px-4 py-3 text-xs font-mono font-bold tracking-wider rounded-xl border transition-all ${
                isEditing
                  ? "border-white/20 focus:border-[#00E599] bg-black/60 text-[#00E599]"
                  : "border-white/10 bg-white/[0.02] text-[#00E599]"
              }`}
            />
          </div>

          {/* State / Jurisdiction */}
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1.5 uppercase tracking-wide">
              Registered State <span className="text-rose-400">*</span>
            </label>
            <select
              disabled={!isEditing}
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className={`w-full px-4 py-3 text-xs rounded-xl border transition-all ${
                isEditing
                  ? "border-white/20 focus:border-[#00E599] bg-black/60 text-white"
                  : "border-white/10 bg-white/[0.02] text-zinc-200 font-bold"
              }`}
            >
              <option value="Maharashtra">Maharashtra (Code 27)</option>
              <option value="Karnataka">Karnataka (Code 29)</option>
              <option value="Gujarat">Gujarat (Code 24)</option>
              <option value="Delhi">Delhi (Code 07)</option>
              <option value="Tamil Nadu">Tamil Nadu (Code 33)</option>
              <option value="Uttar Pradesh">Uttar Pradesh (Code 09)</option>
              <option value="Telangana">Telangana (Code 36)</option>
              <option value="West Bengal">West Bengal (Code 19)</option>
              <option value="Haryana">Haryana (Code 06)</option>
              <option value="Rajasthan">Rajasthan (Code 08)</option>
            </select>
          </div>

          {/* Business Category */}
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1.5 uppercase tracking-wide">
              Primary Business Category
            </label>
            <input
              type="text"
              disabled={!isEditing}
              value={formData.businessCategory}
              onChange={(e) => setFormData({ ...formData, businessCategory: e.target.value })}
              className={`w-full px-4 py-3 text-xs rounded-xl border transition-all ${
                isEditing
                  ? "border-white/20 focus:border-[#00E599] bg-black/60 text-white"
                  : "border-white/10 bg-white/[0.02] text-zinc-200"
              }`}
            />
          </div>

          {/* Registration Type */}
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1.5 uppercase tracking-wide">
              Taxpayer Classification
            </label>
            <select
              disabled={!isEditing}
              value={formData.registrationType}
              onChange={(e) => setFormData({ ...formData, registrationType: e.target.value })}
              className={`w-full px-4 py-3 text-xs rounded-xl border transition-all ${
                isEditing
                  ? "border-white/20 focus:border-[#00E599] bg-black/60 text-white"
                  : "border-white/10 bg-white/[0.02] text-zinc-200"
              }`}
            >
              <option value="Regular">Regular Taxpayer</option>
              <option value="Composition">Composition Scheme</option>
              <option value="SEZ Unit">SEZ Unit / Developer</option>
              <option value="ISD">Input Service Distributor (ISD)</option>
            </select>
          </div>

          {/* Official Invoicing Email */}
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1.5 uppercase tracking-wide">
              Official Invoicing Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                disabled={!isEditing}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full pl-9 pr-4 py-3 text-xs rounded-xl border transition-all ${
                  isEditing
                    ? "border-white/20 focus:border-[#00E599] bg-black/60 text-white"
                    : "border-white/10 bg-white/[0.02] text-zinc-200"
                }`}
              />
            </div>
          </div>

          {/* Official Contact Phone */}
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1.5 uppercase tracking-wide">
              Official Contact Phone
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                disabled={!isEditing}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full pl-9 pr-4 py-3 text-xs rounded-xl border transition-all ${
                  isEditing
                    ? "border-white/20 focus:border-[#00E599] bg-black/60 text-white"
                    : "border-white/10 bg-white/[0.02] text-zinc-200"
                }`}
              />
            </div>
          </div>

          {/* Principal Address */}
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-zinc-300 block mb-1.5 uppercase tracking-wide">
              Principal Place of Business Address <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              required
              disabled={!isEditing}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className={`w-full p-4 text-xs rounded-xl border leading-relaxed transition-all ${
                isEditing
                  ? "border-white/20 focus:border-[#00E599] bg-black/60 text-white"
                  : "border-white/10 bg-white/[0.02] text-zinc-300 font-sans"
              }`}
            />
          </div>
        </div>

        {/* Confirmation Footer Bar */}
        {isEditing && (
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-[#00E599]" />
              <span>Click confirm below to commit verified credentials to the permanent PostgreSQL datastore.</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setVerificationError(null);
                }}
                className="cred-btn-secondary py-2.5 px-5 text-xs w-full sm:w-auto justify-center cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="cred-btn-emerald py-2.5 px-6 text-xs w-full sm:w-auto justify-center cursor-pointer shadow-[0_0_20px_rgba(0,229,153,0.3)]"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Confirm & Create Company Profile</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
