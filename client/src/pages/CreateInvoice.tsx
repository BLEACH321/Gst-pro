import React, { useState, useEffect } from "react";
import {
  FilePlus2,
  UserCheck,
  PackagePlus,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Trash2,
  Plus,
  Building,
  Receipt,
  Eye,
  Check,
  RefreshCw
} from "lucide-react";
import {
  getProducts,
  getCustomers,
  validateInvoicePreview,
  createInvoice,
  suggestHsnSacApi
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Product, Customer, InvoiceItem, ValidationSummaryResponse, HsnSuggestion } from "../types";
import { ValidationReportModal } from "../components/invoice/ValidationReportModal";
import { InvoicePrintModal } from "../components/invoice/InvoicePrintModal";

interface CreateInvoiceProps {
  onNavigateTab: (tab: string) => void;
  initialSyncedState?: any;
}

export const CreateInvoice: React.FC<CreateInvoiceProps> = ({ onNavigateTab, initialSyncedState }) => {
  const { business } = useAuth();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Data Sources
  const [productsCatalog, setProductsCatalog] = useState<Product[]>([]);
  const [customersList, setCustomersList] = useState<Customer[]>([]);

  // Step 1: Invoice Info
  const [invoiceNumber, setInvoiceNumber] = useState(`INV/2026/${Math.floor(1000 + Math.random() * 9000)}`);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);

  // Step 2: Customer Info
  const [customerName, setCustomerName] = useState("");
  const [customerGstin, setCustomerGstin] = useState("");
  const [customerState, setCustomerState] = useState("Maharashtra");
  const [customerAddress, setCustomerAddress] = useState("");

  // Step 3: Products / Services
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      productName: "ASUS TUF A16 Gaming Laptop (AMD Ryzen 7, 16GB, 1TB SSD)",
      hsnSac: "84713010",
      quantity: 1,
      unitPrice: 84990,
      discount: 0,
      taxableAmount: 84990,
      gstRate: 18,
      cgst: 7649.1,
      sgst: 7649.1,
      igst: 0,
      total: 100288.2
    }
  ]);

  // Synchronize state when Agent populates draft
  useEffect(() => {
    if (initialSyncedState?.invoiceState) {
      const inv = initialSyncedState.invoiceState;
      if (inv.invoiceNumber) setInvoiceNumber(inv.invoiceNumber);
      if (inv.customerName) setCustomerName(inv.customerName);
      if (inv.customerGstin) setCustomerGstin(inv.customerGstin);
      if (inv.customerState) setCustomerState(inv.customerState);
      if (inv.customerAddress) setCustomerAddress(inv.customerAddress);
      if (inv.items && inv.items.length > 0) setItems(inv.items);
      setCurrentStep(3); // Step to line items or validation
    }
  }, [initialSyncedState]);

  // AI HSN Inline Helper
  const [activeItemIndexForHsn, setActiveItemIndexForHsn] = useState<number | null>(null);
  const [hsnSearchQuery, setHsnSearchQuery] = useState("");
  const [hsnSuggestions, setHsnSuggestions] = useState<HsnSuggestion[]>([]);

  // Validation Results State
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationSummaryResponse | null>(null);
  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [savedInvoice, setSavedInvoice] = useState<any>(null);

  // Load catalogs on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [prods, custs] = await Promise.all([getProducts(), getCustomers()]);
        setProductsCatalog(prods);
        setCustomersList(custs);
      } catch (err) {
        console.error("Failed to load catalogs:", err);
      }
    }
    loadData();
  }, []);

  // Determine if Inter-State supply
  const supplierState = business?.state || "Maharashtra";
  const isInterState = customerState.trim().toLowerCase() !== supplierState.trim().toLowerCase();

  // Recalculate item and totals
  const recalculateItem = (item: InvoiceItem, interState: boolean): InvoiceItem => {
    const qty = Math.max(0, Number(item.quantity) || 0);
    const price = Math.max(0, Number(item.unitPrice) || 0);
    const disc = Math.max(0, Number(item.discount) || 0);
    const taxable = Math.max(0, qty * price - disc);
    const rate = Number(item.gstRate) || 0;

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (interState) {
      igst = Math.round(taxable * (rate / 100) * 100) / 100;
    } else {
      cgst = Math.round(taxable * (rate / 200) * 100) / 100;
      sgst = cgst;
    }

    const total = Math.round((taxable + cgst + sgst + igst) * 100) / 100;

    return {
      ...item,
      taxableAmount: taxable,
      cgst,
      sgst,
      igst,
      total
    };
  };

  // Recompute all items when customer state or item values change
  useEffect(() => {
    setItems((prev) => prev.map((it) => recalculateItem(it, isInterState)));
  }, [customerState]);

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    const current = { ...updated[index], [field]: value };
    updated[index] = recalculateItem(current, isInterState);
    setItems(updated);
  };

  const handleSelectProductPreset = (index: number, productId: string) => {
    const selected = productsCatalog.find((p) => p.id === productId);
    if (!selected) return;

    const updated = [...items];
    const current: InvoiceItem = {
      ...updated[index],
      productId: selected.id,
      productName: selected.name,
      hsnSac: selected.hsnSac,
      unitPrice: selected.price,
      gstRate: selected.gstRate
    };
    updated[index] = recalculateItem(current, isInterState);
    setItems(updated);
  };

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      productName: "",
      hsnSac: "84713010",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxableAmount: 0,
      gstRate: 18,
      cgst: 0,
      sgst: 0,
      igst: 0,
      total: 0
    };
    setItems([...items, recalculateItem(newItem, isInterState)]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  // Aggregated invoice financial figures
  const subtotal = items.reduce((acc, it) => acc + (it.quantity * it.unitPrice), 0);
  const totalDiscount = items.reduce((acc, it) => acc + Number(it.discount || 0), 0);
  const taxableAmount = items.reduce((acc, it) => acc + Number(it.taxableAmount || 0), 0);
  const totalCgst = items.reduce((acc, it) => acc + Number(it.cgst || 0), 0);
  const totalSgst = items.reduce((acc, it) => acc + Number(it.sgst || 0), 0);
  const totalIgst = items.reduce((acc, it) => acc + Number(it.igst || 0), 0);
  const totalGst = totalCgst + totalSgst + totalIgst;
  const grandTotal = Math.round((taxableAmount + totalGst) * 100) / 100;

  // Invoice payload builder
  const buildInvoicePayload = () => ({
    invoiceNumber,
    invoiceDate,
    customerName,
    customerGstin: customerGstin ? customerGstin.toUpperCase().trim() : null,
    customerState,
    customerAddress,
    subtotal,
    discount: totalDiscount,
    taxableAmount,
    cgst: totalCgst,
    sgst: totalSgst,
    igst: totalIgst,
    totalGst,
    grandTotal,
    isInterState,
    items
  });

  // Step 4: Run Hybrid Pre-Validation
  const handleValidateInvoice = async () => {
    try {
      setIsValidating(true);
      const payload = buildInvoicePayload();
      const result = await validateInvoicePreview(payload);
      setValidationResult(result);
      setValidationModalOpen(true);
    } catch (err: any) {
      alert("Pre-validation failed: " + err.message);
    } finally {
      setIsValidating(false);
    }
  };

  // Finalize & Save to DB
  const handleFinalizeAndSave = async () => {
    try {
      const payload = buildInvoicePayload();
      const saved = await createInvoice(payload);
      setSavedInvoice(saved);
      setValidationModalOpen(false);
      setPrintModalOpen(true);
    } catch (err: any) {
      alert("Failed to save invoice: " + err.message);
    }
  };

  // Inline AI HSN Search
  const triggerHsnLookup = async (index: number, text: string) => {
    setActiveItemIndexForHsn(index);
    setHsnSearchQuery(text);
    if (!text) return;
    try {
      const res = await suggestHsnSacApi(text);
      setHsnSuggestions(res.suggestions || []);
    } catch (e) {}
  };

  const applyInlineHsnSuggestion = (index: number, sug: HsnSuggestion) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      hsnSac: sug.hsnSac,
      gstRate: sug.gstRate,
      productName: updated[index].productName || sug.suggestedName
    };
    updated[index] = recalculateItem(updated[index], isInterState);
    setItems(updated);
    setActiveItemIndexForHsn(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-16">
      {/* CRED Wizard Header */}
      <div className="cred-card p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-[10px] font-black uppercase tracking-widest mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#00e599]" />
            GST Pre-Validation Flow
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            Create & Pre-Validate Invoice
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl font-medium leading-relaxed">
            Populate invoice line items, calculate statutory CGST/SGST/IGST splits, and trigger the 10-rule + Isolation Forest anomaly scan.
          </p>
        </div>

        {/* Wizard Step Badges */}
        <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5">
          {[
            { step: 1, label: "Invoice" },
            { step: 2, label: "Customer" },
            { step: 3, label: "Items" },
            { step: 4, label: "Pre-Validate" }
          ].map((s) => (
            <button
              key={s.step}
              onClick={() => setCurrentStep(s.step as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                currentStep === s.step
                  ? "bg-white text-black shadow-[0_0_25px_rgba(255,255,255,0.3)]"
                  : currentStep > s.step
                  ? "bg-[#00e599]/10 text-[#00e599] border border-[#00e599]/30"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono ${currentStep === s.step ? "bg-black text-white" : "bg-white/10 text-zinc-300"}`}>
                {s.step}
              </span>
              <span className="hidden md:inline">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Wizard Form Body */}
      <div className="cred-card rounded-3xl border border-white/10 p-6 sm:p-10 space-y-8">
        {/* ================= STEP 1: INVOICE INFO ================= */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-cyan-300 flex items-center justify-center font-bold">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Step 1: Statutory Invoice Identification
                </h3>
                <p className="text-xs text-slate-400">
                  Assign a unique invoice series and operational tax filing date.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Invoice Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. INV/2026/0101"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 text-xs font-mono font-bold uppercase rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-cyan-500 focus:outline-hidden"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  RULE-GST-008 automatically guards against duplicate invoice numbers.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Invoice Date <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-cyan-500 focus:outline-hidden"
                />
              </div>

              <div className="md:col-span-2 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Supplier Entity
                  </span>
                  <p className="text-xs font-bold text-white mt-0.5">
                    {business?.businessName || "Gupta Enterprise Infotech Pvt Ltd"}
                  </p>
                  <p className="text-[11px] font-mono text-cyan-400">
                    GSTIN: {business?.gstin || "27AABCG1234F1Z5"} ({business?.state || "Maharashtra"})
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 rounded-full">
                  ✓ Origin Verified
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/25"
              >
                <span>Continue to Customer Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: CUSTOMER INFO ================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-cyan-300 flex items-center justify-center font-bold">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Step 2: Customer (Recipient) & Place of Supply
                </h3>
                <p className="text-xs text-slate-400">
                  Select existing customer or enter new recipient details.
                </p>
              </div>
            </div>

            {/* Quick Customer Preset Picker */}
            {customersList.length > 0 && (
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Select Saved Customer Preset
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {customersList.slice(0, 6).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setCustomerName(c.name);
                        setCustomerGstin(c.gstin || "");
                        setCustomerState(c.state);
                        setCustomerAddress(c.address || "");
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        customerName === c.name
                          ? "bg-blue-950/60 border-cyan-400 shadow-glow-cyan"
                          : "bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300"
                      }`}
                    >
                      <p className="text-xs font-bold text-white truncate">{c.name}</p>
                      <p className="text-[11px] text-cyan-400 mt-0.5">{c.state}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Customer / Recipient Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Infotech Solutions LLP"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-cyan-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Customer GSTIN (Leave empty for Unregistered B2C)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 27AABCA5566G1Z9"
                  value={customerGstin}
                  onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 text-xs font-mono font-bold uppercase rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-cyan-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Place of Supply (Customer State) <span className="text-rose-400">*</span>
                </label>
                <select
                  value={customerState}
                  onChange={(e) => setCustomerState(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-cyan-500 focus:outline-hidden font-semibold"
                >
                  <option value="Maharashtra">Maharashtra (Intra-State: CGST + SGST)</option>
                  <option value="Karnataka">Karnataka (Inter-State: IGST)</option>
                  <option value="Delhi">Delhi (Inter-State: IGST)</option>
                  <option value="Gujarat">Gujarat (Inter-State: IGST)</option>
                  <option value="Tamil Nadu">Tamil Nadu (Inter-State: IGST)</option>
                  <option value="Uttar Pradesh">Uttar Pradesh (Inter-State: IGST)</option>
                  <option value="Telangana">Telangana (Inter-State: IGST)</option>
                  <option value="West Bengal">West Bengal (Inter-State: IGST)</option>
                  <option value="Haryana">Haryana (Inter-State: IGST)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Recipient Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bandra Kurla Complex, Mumbai"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-cyan-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Place of Supply Rule Notice */}
            <div
              className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
                isInterState
                  ? "bg-blue-950/60 border-blue-500/40 text-blue-200"
                  : "bg-emerald-950/60 border-emerald-500/40 text-emerald-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-cyan-400" />
                <div>
                  <p className="font-bold text-white">
                    {isInterState
                      ? "Inter-State Transaction Detected (IGST Applicable)"
                      : "Intra-State Transaction Detected (CGST + SGST Applicable)"}
                  </p>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    {isInterState
                      ? `Supplier (${supplierState}) ≠ Customer (${customerState}) → 100% IGST applied per Rule GST-005.`
                      : `Supplier (${supplierState}) = Customer (${customerState}) → Split 50% CGST + 50% SGST per Rule GST-005.`}
                  </p>
                </div>
              </div>
              <span className="font-mono font-bold text-[10px] uppercase bg-black/40 text-cyan-300 px-2.5 py-1 rounded-md border border-white/10">
                RULE-GST-005 AUTO-ALIGN
              </span>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-slate-800"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/25"
              >
                <span>Continue to Products & Services</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: PRODUCTS & SERVICES ================= */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-cyan-300 flex items-center justify-center font-bold">
                  <PackagePlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Step 3: Line Items & Mathematical Tax Computations
                  </h3>
                  <p className="text-xs text-slate-400">
                    Add products, quantity, unit rates, discounts and AI-assisted HSN codes.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Item</span>
              </button>
            </div>

            {/* Line Items Cards */}
            <div className="space-y-4">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-4 relative shadow-inner"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-800/60 px-2.5 py-1 rounded-lg">
                      Item #{idx + 1}
                    </span>

                    {/* Preset Product Selector */}
                    <div className="flex items-center gap-2">
                      <select
                        onChange={(e) => handleSelectProductPreset(idx, e.target.value)}
                        className="text-xs py-1.5 px-3 rounded-lg border border-slate-700 bg-slate-900 text-white"
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Load from Product Master...
                        </option>
                        {productsCatalog.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (₹{p.price})
                          </option>
                        ))}
                      </select>

                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg bg-rose-950/40 border border-rose-900/50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    {/* Product Name */}
                    <div className="md:col-span-4">
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Item Description
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. ASUS TUF A16 Laptop"
                        value={item.productName}
                        onChange={(e) => handleItemChange(idx, "productName", e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-900 text-white focus:border-cyan-500 focus:outline-hidden"
                      />
                    </div>

                    {/* HSN/SAC */}
                    <div className="md:col-span-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-300">HSN/SAC</label>
                        <button
                          type="button"
                          onClick={() => triggerHsnLookup(idx, item.productName || "Laptop")}
                          className="text-[10px] text-cyan-400 font-bold hover:underline flex items-center gap-0.5"
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          AI
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="84713010"
                        value={item.hsnSac}
                        onChange={(e) => handleItemChange(idx, "hsnSac", e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-700 bg-slate-900 text-cyan-300 focus:border-cyan-500 focus:outline-hidden"
                      />
                    </div>

                    {/* Qty */}
                    <div className="md:col-span-1">
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">Qty</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-700 bg-slate-900 text-white focus:border-cyan-500 focus:outline-hidden text-right"
                      />
                    </div>

                    {/* Unit Price */}
                    <div className="md:col-span-2">
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Unit Rate (₹)
                      </label>
                      <input
                        type="number"
                        required
                        min={0}
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, "unitPrice", Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-700 bg-slate-900 text-white focus:border-cyan-500 focus:outline-hidden text-right"
                      />
                    </div>

                    {/* Discount */}
                    <div className="md:col-span-1">
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Disc (₹)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={item.discount}
                        onChange={(e) => handleItemChange(idx, "discount", Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-700 bg-slate-900 text-amber-400 focus:border-cyan-500 focus:outline-hidden text-right"
                      />
                    </div>

                    {/* GST Rate */}
                    <div className="md:col-span-2">
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">GST Rate</label>
                      <select
                        value={item.gstRate}
                        onChange={(e) => handleItemChange(idx, "gstRate", Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-700 bg-slate-900 text-white focus:border-cyan-500 focus:outline-hidden"
                      >
                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={12}>12%</option>
                        <option value={18}>18%</option>
                        <option value={28}>28%</option>
                      </select>
                    </div>
                  </div>

                  {/* Inline AI HSN Suggestions Drawer */}
                  {activeItemIndexForHsn === idx && (
                    <div className="p-3 bg-cyan-950/80 rounded-xl border border-cyan-500/40 animate-fadeIn space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                          AI HSN Suggestions for "{hsnSearchQuery}":
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveItemIndexForHsn(null)}
                          className="text-[11px] text-slate-400 hover:text-white"
                        >
                          ✕ Close
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {hsnSuggestions.map((sug, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={() => applyInlineHsnSuggestion(idx, sug)}
                            className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-left hover:border-cyan-400 transition-colors"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-mono font-bold text-white">
                                {sug.hsnSac}
                              </span>
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30">
                                {sug.gstRate}% GST
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300 truncate mt-0.5">
                              {sug.suggestedName}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Live Item Calculation Summary */}
                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-300 pt-2 border-t border-slate-800 font-mono">
                    <div>
                      <span className="text-slate-400">Taxable: </span>
                      <span className="font-bold text-white">
                        ₹{item.taxableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {isInterState ? (
                      <div>
                        <span className="text-slate-400">IGST ({item.gstRate}%): </span>
                        <span className="font-bold text-cyan-400">
                          ₹{item.igst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ) : (
                      <div className="flex gap-4">
                        <div>
                          <span className="text-slate-400">CGST ({item.gstRate / 2}%): </span>
                          <span className="font-bold text-cyan-400">
                            ₹{item.cgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">SGST ({item.gstRate / 2}%): </span>
                          <span className="font-bold text-cyan-400">
                            ₹{item.sgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    )}

                    <div>
                      <span className="text-slate-400">Line Total: </span>
                      <span className="font-black text-white text-sm">
                        ₹{item.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Totals Summary Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0b1226] via-[#0e1a38] to-[#0b1226] text-white flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 border border-slate-700/80 shadow-2xl">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Subtotal</span>
                  <p className="text-base font-mono font-bold text-slate-200">
                    ₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Discount</span>
                  <p className="text-base font-mono font-bold text-amber-400">
                    ₹{totalDiscount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Taxable Base</span>
                  <p className="text-base font-mono font-bold text-white">
                    ₹{taxableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total GST</span>
                  <p className="text-base font-mono font-bold text-emerald-400">
                    ₹{totalGst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div className="text-right border-t md:border-t-0 md:border-l border-slate-700 pt-4 md:pt-0 md:pl-6">
                <span className="text-[11px] uppercase font-bold text-cyan-400 tracking-wider">
                  Grand Total
                </span>
                <h3 className="text-3xl font-mono font-black text-white">
                  ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </h3>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-slate-800"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/25"
              >
                <span>Continue to Review & Validation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: REVIEW & PRE-VALIDATION ================= */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-cyan-300 flex items-center justify-center font-bold">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Step 4: Invoice Review & Pre-Validation Execution
                </h3>
                <p className="text-xs text-slate-400">
                  Execute the dual deterministic GST rules and Explainable AI anomaly scan before final commitment.
                </p>
              </div>
            </div>

            {/* Review Invoice Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                  Invoice & Recipient Details
                </span>
                <p className="font-bold text-white text-sm">{customerName || "Acme Infotech"}</p>
                <p className="font-mono text-slate-300">
                  GSTIN: {customerGstin || "Unregistered (B2C)"}
                </p>
                <p className="text-slate-300">
                  Place of Supply: <span className="font-semibold text-white">{customerState}</span> (
                  {isInterState ? "Inter-State IGST" : "Intra-State CGST+SGST"})
                </p>
                <p className="font-mono text-cyan-400">Invoice No: {invoiceNumber}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                  Financial Overview
                </span>
                <div className="flex justify-between text-slate-300">
                  <span>Line Items:</span>
                  <span className="font-bold text-white">{items.length} items</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Taxable Base:</span>
                  <span className="font-mono font-bold text-white">
                    ₹{taxableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Total Tax Assessed:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    ₹{totalGst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800 font-black text-white text-sm">
                  <span>Grand Total:</span>
                  <span className="font-mono text-cyan-300">
                    ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Big Dual-Engine Pre-Validation CTA Button */}
            <div className="p-8 sm:p-10 rounded-3xl bg-[#111116] text-white text-center space-y-5 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_20px_40px_rgba(0,0,0,0.9)]">
              <div className="w-14 h-14 rounded-2xl bg-white/5 text-white mx-auto flex items-center justify-center font-bold border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                <Sparkles className="w-7 h-7 text-[#00e599]" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="text-2xl font-black text-white uppercase tracking-tight">
                  Execute Statutory & AI Pre-Validation
                </h4>
                <p className="text-xs text-zinc-400 font-medium">
                  Runs 10 deterministic GST rules + Isolation Forest AI Anomaly Detection & SHAP attribution.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  disabled={isValidating}
                  onClick={handleValidateInvoice}
                  className="cred-btn-primary mx-auto"
                >
                  {isValidating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                      <span>Scanning 10-Rule Suite & ML Model...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-black stroke-[3]" />
                      <span>Validate Invoice Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="cred-btn-secondary"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Line Items</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Validation Report Modal */}
      {validationResult && (
        <ValidationReportModal
          isOpen={validationModalOpen}
          onClose={() => setValidationModalOpen(false)}
          invoiceData={buildInvoicePayload()}
          validationData={validationResult}
          onFinalize={handleFinalizeAndSave}
          onEdit={() => {
            setValidationModalOpen(false);
            setCurrentStep(3);
          }}
          onPrint={() => {
            setValidationModalOpen(false);
            setPrintModalOpen(true);
          }}
        />
      )}

      {/* Printable GST Invoice Preview Modal */}
      <InvoicePrintModal
        isOpen={printModalOpen}
        onClose={() => {
          setPrintModalOpen(false);
          onNavigateTab("invoice-history");
        }}
        invoice={savedInvoice || buildInvoicePayload()}
        businessData={business}
      />
    </div>
  );
};
