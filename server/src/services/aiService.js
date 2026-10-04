/**
 * GST Sahayak - AI Anomaly Detection & Explainable AI Service Bridge
 * Spawns Python Isolation Forest & SHAP-like attribution engine or provides statistical fallback.
 */

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCRIPT_PATH = path.resolve(__dirname, "../../../ai_engine/anomaly_detector.py");

/**
 * Invokes Python Isolation Forest engine on invoice object
 * @param {Object} invoiceData Complete invoice payload with items and financial totals
 * @returns {Promise<Object>} Anomaly detection score, risk level, feature contributions and NLP explanation
 */
export async function analyzeInvoiceWithAI(invoiceData) {
  return new Promise((resolve) => {
    try {
      const pythonProcess = spawn("py", [SCRIPT_PATH], {
        windowsHide: true
      });

      let stdoutData = "";
      let stderrData = "";

      pythonProcess.stdout.on("data", (data) => {
        stdoutData += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        stderrData += data.toString();
      });

      pythonProcess.on("close", (code) => {
        if (code === 0 && stdoutData.trim()) {
          try {
            const parsed = JSON.parse(stdoutData.trim());
            return resolve(parsed);
          } catch (e) {
            console.warn("Could not parse Python AI output, using JS fallback engine:", e.message);
          }
        }
        // If python failed or non-zero, run JS fallback
        const fallback = runFallbackAIAnalysis(invoiceData);
        resolve(fallback);
      });

      pythonProcess.on("error", (err) => {
        console.warn("Python execution error, activating JS fallback engine:", err.message);
        const fallback = runFallbackAIAnalysis(invoiceData);
        resolve(fallback);
      });

      // Write JSON payload to Python stdin
      pythonProcess.stdin.write(JSON.stringify(invoiceData));
      pythonProcess.stdin.end();

    } catch (err) {
      console.warn("AI Service dispatch error, using fallback:", err.message);
      const fallback = runFallbackAIAnalysis(invoiceData);
      resolve(fallback);
    }
  });
}

/**
 * JS statistical backup engine in case python runtime is unavailable
 */
export function runFallbackAIAnalysis(invoiceData) {
  const items = invoiceData.items || [];
  const grandTotal = Number(invoiceData.grandTotal || 0);
  const taxable = Number(invoiceData.taxableAmount || 0);
  const discount = Number(invoiceData.discount || 0);
  const totalQty = items.reduce((acc, it) => acc + Number(it.quantity || 1), 0);
  const gstRateAvg = items.length > 0 
    ? items.reduce((acc, it) => acc + Number(it.gstRate || 18), 0) / items.length 
    : 18;

  const baselineCustomerAvg = 55000.0;
  const deviation = ((grandTotal - baselineCustomerAvg) / baselineCustomerAvg) * 100;
  
  let riskScore = 12.0;
  const reasons = [];
  const actions = [];
  const topFactors = [];

  // Anomaly heuristics
  if (grandTotal > 500000) {
    riskScore += 45.0;
    reasons.push(`Invoice total (₹${grandTotal.toLocaleString("en-IN")}) is 400%+ above standard retail/SME thresholds.`);
    actions.push("Conduct secondary authorization for high-ticket transaction.");
    topFactors.push("Total Invoice Amount");
  } else if (grandTotal > 200000) {
    riskScore += 25.0;
    reasons.push(`Invoice total (₹${grandTotal.toLocaleString("en-IN")}) is significantly higher than historical average.`);
    actions.push("Verify customer purchase order and credit terms.");
    topFactors.push("Total Invoice Amount");
  }

  if (totalQty > 100) {
    riskScore += 30.0;
    reasons.push(`Bulk order quantity (${totalQty} units) deviates from regular purchase batch.`);
    actions.push("Confirm warehouse stock availability and physical dispatch logs.");
    topFactors.push("Total Item Quantity");
  }

  if (discount > 0 && taxable > 0 && (discount / (taxable + discount)) > 0.25) {
    const discPct = ((discount / (taxable + discount)) * 100).toFixed(1);
    riskScore += 28.0;
    reasons.push(`Unusual promotional discount rate (${discPct}%) applied.`);
    actions.push("Review special discount authorization documentation.");
    topFactors.push("Discount Percentage");
  }

  if (gstRateAvg === 28.0) {
    riskScore += 10.0;
    topFactors.push("Effective GST Rate");
  }

  const cappedRisk = Math.min(Math.max(riskScore, 5.0), 98.0);
  const riskLevel = cappedRisk >= 65 ? "POTENTIAL_RISK" : (cappedRisk >= 40 ? "WARNING" : "VALID");
  const isAnomaly = cappedRisk >= 65;

  if (reasons.length === 0) {
    reasons.push("Invoice transaction patterns conform to normal commercial parameters.");
    actions.push("Proceed with final invoice dispatch and filing.");
    topFactors.push("Consistent Transaction History", "Standard GST Rate");
  }

  return {
    riskScore: Number(cappedRisk.toFixed(1)),
    riskLevel,
    isAnomaly,
    anomalyScore: Number((cappedRisk / 100).toFixed(4)),
    features: {
      invoice_amount: grandTotal,
      taxable_amount: taxable,
      gst_amount: grandTotal - taxable,
      quantity_total: totalQty,
      gst_rate_avg: gstRateAvg,
      deviation_from_customer_avg: deviation
    },
    featureContributions: {
      "Total Invoice Amount": grandTotal > 150000 ? 42.5 : 12.0,
      "Total Item Quantity": totalQty > 30 ? 28.3 : 10.0,
      "Taxable Base Value": 15.2,
      "Discount Percentage": discount > 0 ? 12.0 : 2.0,
      "Effective GST Rate": 8.0,
      "Historical Deviation": deviation > 50 ? 25.0 : 5.0
    },
    explanation: riskLevel === "POTENTIAL_RISK" ? "Potential Risk Detected" : (riskLevel === "WARNING" ? "Warning: Requires Verification" : "Compliant / No Risk"),
    reasons,
    suggestedActions: actions,
    topFactors: topFactors.length > 0 ? topFactors : ["Total Invoice Amount", "GST Rate"]
  };
}
