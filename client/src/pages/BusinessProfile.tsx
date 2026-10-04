import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getBusinessProfile, updateBusinessProfile } from "../services/api";
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  MapPin,
  Mail,
  Phone,
  Briefcase
} from "lucide-react";

export const BusinessProfile: React.FC = () => {
  const { business, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    businessName: "",
    gstin: "",
    businessCategory: "Electronics, IT Hardware & Cloud Services",
    registrationType: "Regular",
    state: "Maharashtra",
    address: "",
    email: "",
    phone: ""
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (business) {
      setFormData({
        businessName: business.businessName || "",
        gstin: business.gstin || "",
        businessCategory: business.businessCategory || "Information Technology & Hardware",
        registrationType: business.registrationType || "Regular",
        state: business.state || "Maharashtra",
        address: business.address || "",
        email: business.email || "",
        phone: business.phone || ""
      });
    }
  }, [business]);

  const validateGstin = (code: string) => {
    const reg = /^[0-3][0-9][A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return reg.test(code.toUpperCase());
  };

  const isGstinValid = validateGstin(formData.gstin);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      await updateBusinessProfile(formData);
      await refreshUser();
      setIsEditing(false);
      setSuccessMsg("Business profile updated successfully in PostgreSQL/Prisma datastore.");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (business) {
      setFormData({
        businessName: business.businessName || "",
        gstin: business.gstin || "",
        businessCategory: business.businessCategory || "",
        registrationType: business.registrationType || "Regular",
        state: business.state || "Maharashtra",
        address: business.address || "",
        email: business.email || "",
        phone: business.phone || ""
      });
    }
    setIsEditing(false);
    setErrorMsg(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Header card */}
      <div className="cyber-card p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-black text-2xl shadow-glow-cyan border border-blue-400/30">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white leading-tight">
              Business Profile & GST Registration
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Primary entity metadata automatically populated across all generated tax invoices.
            </p>
          </div>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-all border border-blue-400/30"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        )}
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500/40 rounded-2xl text-xs text-emerald-300 font-medium flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-950/80 border border-rose-500/40 rounded-2xl text-xs text-rose-300 font-medium flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="cyber-card rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business Name */}
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Legal Business Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              disabled={!isEditing}
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className={`w-full px-4 py-2.5 text-xs rounded-xl border transition-all ${
                isEditing
                  ? "border-slate-700 focus:border-cyan-500 bg-slate-950 text-white"
                  : "border-slate-800 bg-slate-950/60 text-slate-200 font-bold"
              }`}
            />
          </div>

          {/* GSTIN */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300">
                Goods and Services Tax Identification Number (GSTIN) <span className="text-rose-400">*</span>
              </label>
              {formData.gstin && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    isGstinValid
                      ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40"
                      : "bg-rose-950/80 text-rose-300 border border-rose-500/40"
                  }`}
                >
                  {isGstinValid ? "✓ Valid Structure (Maharashtra 27)" : "✗ Invalid GSTIN Format"}
                </span>
              )}
            </div>
            <input
              type="text"
              required
              disabled={!isEditing}
              value={formData.gstin}
              onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
              placeholder="e.g. 27AABCG1234F1Z5"
              className={`w-full px-4 py-2.5 text-xs font-mono font-bold uppercase rounded-xl border transition-all ${
                isEditing
                  ? "border-slate-700 focus:border-cyan-500 bg-slate-950 text-cyan-300"
                  : "border-slate-800 bg-slate-950/60 text-cyan-400"
              }`}
            />
            <p className="text-[11px] text-slate-400 mt-1">
              15-character alphanumeric statutory GST identification code.
            </p>
          </div>

          {/* State & Place of Origin */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Registration State / Jurisdiction <span className="text-rose-400">*</span>
            </label>
            <select
              disabled={!isEditing}
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className={`w-full px-4 py-2.5 text-xs rounded-xl border transition-all ${
                isEditing
                  ? "border-slate-700 focus:border-cyan-500 bg-slate-950 text-white"
                  : "border-slate-800 bg-slate-950/60 text-slate-200 font-bold"
              }`}
            >
              <option value="Maharashtra">Maharashtra (Code 27)</option>
              <option value="Karnataka">Karnataka (Code 29)</option>
              <option value="Delhi">Delhi (Code 07)</option>
              <option value="Gujarat">Gujarat (Code 24)</option>
              <option value="Tamil Nadu">Tamil Nadu (Code 33)</option>
              <option value="Uttar Pradesh">Uttar Pradesh (Code 09)</option>
              <option value="Telangana">Telangana (Code 36)</option>
              <option value="West Bengal">West Bengal (Code 19)</option>
              <option value="Haryana">Haryana (Code 06)</option>
            </select>
          </div>

          {/* Business Category */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Primary Business Category
            </label>
            <input
              type="text"
              disabled={!isEditing}
              value={formData.businessCategory}
              onChange={(e) => setFormData({ ...formData, businessCategory: e.target.value })}
              className={`w-full px-4 py-2.5 text-xs rounded-xl border transition-all ${
                isEditing
                  ? "border-slate-700 focus:border-cyan-500 bg-slate-950 text-white"
                  : "border-slate-800 bg-slate-950/60 text-slate-200 font-medium"
              }`}
            />
          </div>

          {/* Registration Type */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              GST Registration Type
            </label>
            <select
              disabled={!isEditing}
              value={formData.registrationType}
              onChange={(e) => setFormData({ ...formData, registrationType: e.target.value })}
              className={`w-full px-4 py-2.5 text-xs rounded-xl border transition-all ${
                isEditing
                  ? "border-slate-700 focus:border-cyan-500 bg-slate-950 text-white"
                  : "border-slate-800 bg-slate-950/60 text-slate-200 font-medium"
              }`}
            >
              <option value="Regular">Regular Taxpayer</option>
              <option value="Composition">Composition Scheme</option>
              <option value="SEZ Unit">SEZ Unit / Developer</option>
              <option value="ISD">Input Service Distributor (ISD)</option>
            </select>
          </div>

          {/* Official Email */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Official Invoicing Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                disabled={!isEditing}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border transition-all ${
                  isEditing
                    ? "border-slate-700 focus:border-cyan-500 bg-slate-950 text-white"
                    : "border-slate-800 bg-slate-950/60 text-slate-200 font-medium"
                }`}
              />
            </div>
          </div>

          {/* Official Phone */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Official Contact Phone
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                disabled={!isEditing}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border transition-all ${
                  isEditing
                    ? "border-slate-700 focus:border-cyan-500 bg-slate-950 text-white"
                    : "border-slate-800 bg-slate-950/60 text-slate-200 font-medium"
                }`}
              />
            </div>
          </div>

          {/* Registered Principal Place of Business */}
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Principal Place of Business (Full Address) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <textarea
                rows={3}
                required
                disabled={!isEditing}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className={`w-full p-4 text-xs rounded-xl border transition-all ${
                  isEditing
                    ? "border-slate-700 focus:border-cyan-500 bg-slate-950 text-white"
                    : "border-slate-800 bg-slate-950/60 text-slate-200 font-medium"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Live Statutory Status Banner */}
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-between text-xs text-emerald-200">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="font-bold text-white">GST Sahayak Verified Entity</p>
              <p className="text-[11px] text-emerald-300/80">
                Rule engine automatically applies 50% CGST + 50% SGST for Maharashtra intra-state and
                100% IGST for other states.
              </p>
            </div>
          </div>
          <span className="font-mono text-[10px] bg-black/40 text-emerald-300 border border-emerald-500/30 font-bold px-2.5 py-1 rounded-full">
            Active Status
          </span>
        </div>
      </form>
    </div>
  );
};
