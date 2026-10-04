import React, { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Search,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Trash2,
  ArrowRight,
  Filter,
  Check,
  X
} from "lucide-react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  suggestHsnSacApi
} from "../services/api";
import { Product, HsnSuggestion } from "../types";
import { Modal } from "../components/common/Modal";

export const ProductMaster: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    category: "Electronics & IT Hardware",
    hsnSac: "",
    gstRate: 18,
    price: 0,
    unit: "PCS",
    description: ""
  });

  // AI HSN Assistant State
  const [aiQuery, setAiQuery] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<HsnSuggestion[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [verifiedSuggestion, setVerifiedSuggestion] = useState<HsnSuggestion | null>(null);

  const fetchProductsList = async () => {
    try {
      setLoading(true);
      const data = await getProducts(searchTerm, selectedCategory);
      setProducts(data);
    } catch (err) {
      console.error("Fetch products error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsList();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProductsList();
  };

  // AI HSN Search Handler
  const handleAiLookup = async (queryText: string) => {
    if (!queryText.trim()) {
      setAiSuggestions([]);
      return;
    }
    try {
      setAiLoading(true);
      const res = await suggestHsnSacApi(queryText);
      setAiSuggestions(res.suggestions || []);
    } catch (err) {
      console.error("AI HSN suggestion error:", err);
    } finally {
      setAiLoading(false);
    }
  };

  // Use Verified Suggestion
  const handleApplySuggestion = (sug: HsnSuggestion) => {
    setVerifiedSuggestion(sug);
    setFormData((prev) => ({
      ...prev,
      name: prev.name || sug.suggestedName,
      category: sug.category || prev.category,
      hsnSac: sug.hsnSac,
      gstRate: sug.gstRate,
      unit: sug.unit || prev.unit,
      description: sug.description || prev.description
    }));
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      category: "Electronics & IT Hardware",
      hsnSac: "",
      gstRate: 18,
      price: 0,
      unit: "PCS",
      description: ""
    });
    setAiQuery("");
    setAiSuggestions([]);
    setVerifiedSuggestion(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      category: prod.category,
      hsnSac: prod.hsnSac,
      gstRate: prod.gstRate,
      price: prod.price,
      unit: prod.unit,
      description: prod.description || ""
    });
    setAiQuery(prod.name);
    setAiSuggestions([]);
    setVerifiedSuggestion(null);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product from your catalog?")) {
      try {
        await deleteProduct(id);
        fetchProductsList();
      } catch (err) {
        alert("Failed to delete product");
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
      } else {
        await createProduct(formData);
      }
      setModalOpen(false);
      fetchProductsList();
    } catch (err: any) {
      alert(err.message || "Failed to save product");
    }
  };

  const categories = [
    "All",
    "Electronics & IT Hardware",
    "Information Technology",
    "Professional Services",
    "Office Supplies & Furniture",
    "Commercial Appliances",
    "Stationery & Office Supplies"
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header Card */}
      <div className="cyber-card p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            AI-Powered HSN/SAC Suggestion Engine
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Product & Service Master Catalog
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Store standardized products, statutory HSN/SAC codes, and GST rates for instant invoice creation.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 border border-blue-400/30"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>



      {/* Search & Category Filter Bar */}
      <div className="cyber-card p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products by name, HSN or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-hidden"
          />
        </form>

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          {categories.slice(0, 5).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white border border-cyan-400/40"
                  : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map((prod) => (
          <div
            key={prod.id}
            className="cyber-card rounded-2xl border border-slate-800 p-5 hover:border-cyan-500/40 hover:shadow-glow-cyan transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 uppercase">
                  {prod.category}
                </span>
                <span className="text-xs font-mono font-bold text-cyan-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                  HSN: {prod.hsnSac}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mt-2.5 leading-snug line-clamp-2 group-hover:text-cyan-300 transition-colors">
                {prod.name}
              </h3>

              {prod.description && (
                <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {prod.description}
                </p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Standard Price</p>
                <p className="text-base font-black text-white font-mono">
                  ₹{prod.price.toLocaleString("en-IN")}{" "}
                  <span className="text-xs font-normal text-slate-400">/ {prod.unit}</span>
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2 py-1 rounded-lg">
                  {prod.gstRate}% GST
                </span>
                <button
                  onClick={() => handleOpenEdit(prod)}
                  title="Edit Product"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(prod.id)}
                  title="Delete Product"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="2xl"
        title={editingProduct ? "Edit Catalog Product" : "Add Product to Master Catalog"}
        subtitle="Manage product description, HSN/SAC statutory classification and GST rates."
      >
        <div className="space-y-6 text-slate-200">
          {/* AI HSN/SAC Assistant Box */}
          <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/40">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                AI HSN/SAC Suggestion Assistant
              </label>
              <span className="text-[10px] text-cyan-400 font-medium">
                Type keywords (e.g. "ASUS TUF", "Laptop", "Legal", "AC")
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search semantic HSN database (e.g. ASUS TUF A16)..."
                value={aiQuery}
                onChange={(e) => {
                  setAiQuery(e.target.value);
                  handleAiLookup(e.target.value);
                }}
                className="flex-1 px-3.5 py-2 text-xs bg-slate-950 text-white rounded-xl border border-slate-700 focus:border-cyan-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => handleAiLookup(aiQuery)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl text-xs font-bold hover:from-blue-500 hover:to-cyan-400 transition-colors"
              >
                {aiLoading ? "Searching..." : "Suggest HSN"}
              </button>
            </div>

            {/* AI Suggestion Results List */}
            {aiSuggestions.length > 0 && (
              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  AI Suggested Classifications:
                </p>
                {aiSuggestions.map((sug, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-cyan-500/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-cyan-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          HSN: {sug.hsnSac}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {sug.suggestedName}
                        </span>
                        <span className="text-[10px] bg-emerald-950/80 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                          {sug.gstRate}% GST
                        </span>
                        <span className="text-[10px] bg-blue-950/80 text-blue-300 font-semibold px-2 py-0.5 rounded border border-blue-500/30">
                          {sug.confidence} Confidence
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{sug.description}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApplySuggestion(sug)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 flex-shrink-0"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Verify & Use</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {verifiedSuggestion && (
              <div className="mt-3 p-2.5 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Verified & Applied: HSN {verifiedSuggestion.hsnSac} ({verifiedSuggestion.gstRate}% GST)
                </span>
                <span className="text-[10px] font-bold uppercase text-white bg-emerald-900/60 px-2 py-0.5 rounded">Human Verified</span>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Product / Service Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ASUS TUF A16 Gaming Laptop"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-cyan-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-cyan-500 focus:outline-hidden"
                >
                  <option value="Electronics & IT Hardware">Electronics & IT Hardware</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Professional Services">Professional Services</option>
                  <option value="Office Supplies & Furniture">Office Supplies & Furniture</option>
                  <option value="Commercial Appliances">Commercial Appliances</option>
                  <option value="Stationery & Office Supplies">Stationery & Office Supplies</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  HSN / SAC Code <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 84713010"
                  value={formData.hsnSac}
                  onChange={(e) => setFormData({ ...formData, hsnSac: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-mono font-bold rounded-xl border border-slate-700 bg-slate-950 text-cyan-300 focus:border-cyan-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Applicable GST Rate (%) <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formData.gstRate}
                  onChange={(e) => setFormData({ ...formData, gstRate: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-cyan-500 focus:outline-hidden font-bold"
                >
                  <option value={0}>0% (Exempt)</option>
                  <option value={5}>5% (Basic Goods)</option>
                  <option value={12}>12% (Standard Slabs)</option>
                  <option value={18}>18% (Standard IT & Services)</option>
                  <option value={28}>28% (Luxury / High Slab)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Standard Unit Price (₹) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  step="0.01"
                  placeholder="84990"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 text-xs font-mono font-bold rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-cyan-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Unit of Measurement</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-cyan-500 focus:outline-hidden"
                >
                  <option value="PCS">PCS (Pieces)</option>
                  <option value="HRS">HRS (Hours)</option>
                  <option value="MTH">MTH (Months)</option>
                  <option value="SRV">SRV (Service Contract)</option>
                  <option value="SET">SET (Sets)</option>
                  <option value="BAG">BAG (Bags)</option>
                  <option value="KGS">KGS (Kilograms)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Description</label>
              <textarea
                rows={2}
                placeholder="Product technical specification or scope of service..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-cyan-500 focus:outline-hidden"
              />
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-colors border border-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/25 transition-all"
              >
                {editingProduct ? "Save Product" : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};
