import React, { useRef } from "react";
import { Modal } from "../common/Modal";
import { Printer, Download, ShieldCheck, CheckCircle } from "lucide-react";
import { Invoice } from "../../types";

interface InvoicePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  businessData?: any;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  isOpen,
  onClose,
  invoice,
  businessData
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const business = businessData || {
    businessName: "Gupta Enterprise Infotech Pvt Ltd",
    gstin: "27AABCG1234F1Z5",
    state: "Maharashtra",
    address: "Unit 402, Signature IT Tower, MIDC Knowledge Park, Andheri (E), Mumbai - 400093",
    email: "billing@guptainfotech.com",
    phone: "+91 98201 54321"
  };

  const dateStr = new Date(invoice.invoiceDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="4xl"
      title="Statutory GST Tax Invoice Preview"
      subtitle={`${invoice.invoiceNumber} • Ready for High-Resolution Print / PDF Export`}
    >
      <div className="space-y-6">
        {/* Printable Area (Kept crisp white & high-contrast for physical printing / PDF generation) */}
        <div
          ref={printRef}
          id="printable-invoice"
          className="bg-white border border-slate-300 rounded-2xl p-6 sm:p-8 text-slate-800 shadow-2xl print:m-0 print:p-0 print:border-none print:shadow-none"
        >
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row items-start justify-between border-b-2 border-slate-900 pb-5 gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 block mb-1">
                TAX INVOICE (SEC 31 OF CGST ACT, 2017)
              </span>
              <h2 className="text-xl font-black text-slate-900 leading-tight">
                {business.businessName}
              </h2>
              <p className="text-xs text-slate-600 mt-1 max-w-sm">{business.address}</p>
              <div className="text-xs font-semibold text-slate-700 mt-2 space-y-0.5">
                <p>
                  <span className="text-slate-500 font-normal">GSTIN: </span>
                  <span className="font-mono font-bold text-slate-900">{business.gstin}</span>
                </p>
                <p>
                  <span className="text-slate-500 font-normal">State & Code: </span>
                  {business.state} (27)
                </p>
                <p>
                  <span className="text-slate-500 font-normal">Contact: </span>
                  {business.phone} | {business.email}
                </p>
              </div>
            </div>

            {/* Invoice Meta */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-right min-w-[200px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Invoice Number
              </span>
              <p className="text-base font-mono font-black text-slate-900 mb-2">
                {invoice.invoiceNumber}
              </p>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Invoice Date
              </span>
              <p className="text-xs font-bold text-slate-700">{dateStr}</p>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mt-2">
                Place of Supply
              </span>
              <p className="text-xs font-bold text-slate-700">{invoice.customerState}</p>
            </div>
          </div>

          {/* Billed To / Shipped To */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-5 text-xs">
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
              <h4 className="font-bold text-blue-700 uppercase text-[10px] tracking-wider mb-1.5">
                Billed To (Recipient)
              </h4>
              <p className="font-bold text-sm text-slate-900">{invoice.customerName}</p>
              <p className="text-slate-600 mt-1">{invoice.customerAddress || "Address on file"}</p>
              <p className="mt-2 font-mono">
                <span className="text-slate-500">GSTIN / UIN: </span>
                <span className="font-bold text-slate-800">
                  {invoice.customerGstin || "Unregistered (B2C)"}
                </span>
              </p>
              <p>
                <span className="text-slate-500">State: </span>
                <span className="font-semibold text-slate-700">{invoice.customerState}</span>
              </p>
            </div>

            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-blue-700 uppercase text-[10px] tracking-wider mb-1.5">
                  Tax Structure & Transport
                </h4>
                <p>
                  <span className="text-slate-500">Supply Nature: </span>
                  <span className="font-bold text-slate-800">
                    {invoice.isInterState ? "Inter-State Supply (IGST)" : "Intra-State Supply (CGST + SGST)"}
                  </span>
                </p>
                <p className="mt-1">
                  <span className="text-slate-500">Reverse Charge: </span>
                  <span className="font-semibold text-slate-700">No</span>
                </p>
              </div>

              {/* Compliance Stamp */}
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-200 text-[11px] text-emerald-700 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Pre-Validated with GST Sahayak Rule Engine</span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto my-4 border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3">HSN/SAC</th>
                  <th className="py-2.5 px-3 text-right">Qty</th>
                  <th className="py-2.5 px-3 text-right">Rate (₹)</th>
                  <th className="py-2.5 px-3 text-right">Taxable (₹)</th>
                  <th className="py-2.5 px-3 text-center">GST %</th>
                  <th className="py-2.5 px-3 text-right">Tax (₹)</th>
                  <th className="py-2.5 px-3 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item, idx) => {
                  const itemTax = item.cgst + item.sgst + item.igst;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {item.productName}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{item.hsnSac}</td>
                      <td className="py-2.5 px-3 text-right font-medium">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        {item.unitPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-medium">
                        {item.taxableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                        {item.gstRate}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                        {itemTax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {item.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Tax Breakdown & Financial Totals */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 my-4 text-xs">
            <div className="sm:col-span-7 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-xs mb-2">Statutory Tax Summary</h4>
              <div className="space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Central GST (CGST):</span>
                  <span className="font-mono font-semibold text-slate-900">
                    ₹{invoice.cgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>State GST (SGST):</span>
                  <span className="font-mono font-semibold text-slate-900">
                    ₹{invoice.sgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Integrated GST (IGST):</span>
                  <span className="font-mono font-semibold text-slate-900">
                    ₹{invoice.igst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-slate-900">
                  <span>Total Tax Assessed:</span>
                  <span className="font-mono">
                    ₹{invoice.totalGst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Final Total box */}
            <div className="sm:col-span-5 bg-slate-950 text-white p-4 rounded-xl flex flex-col justify-between">
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Taxable Base Value:</span>
                  <span className="font-mono font-semibold text-white">
                    ₹{invoice.taxableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total GST:</span>
                  <span className="font-mono font-semibold text-white">
                    ₹{invoice.totalGst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-800 flex items-baseline justify-between mt-2">
                <span className="text-xs uppercase tracking-wider font-bold text-slate-300">
                  Grand Total
                </span>
                <span className="text-xl font-mono font-black text-emerald-400">
                  ₹{invoice.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Signatory Footer */}
          <div className="pt-8 mt-6 border-t border-slate-200 flex items-end justify-between text-xs text-slate-500">
            <div>
              <p className="font-bold text-slate-800">Declaration:</p>
              <p className="text-[11px] text-slate-500 max-w-sm mt-0.5">
                We declare that this invoice shows the actual price of the goods/services described and
                that all particulars are true and correct.
              </p>
            </div>
            <div className="text-right">
              <div className="w-44 border-b border-slate-400 pb-10"></div>
              <p className="font-bold text-slate-800 mt-1">For {business.businessName}</p>
              <p className="text-[10px] text-slate-500">Authorized Signatory</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl text-xs font-black shadow-glow-cyan transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print / Save as PDF
          </button>
        </div>
      </div>
    </Modal>
  );
};
