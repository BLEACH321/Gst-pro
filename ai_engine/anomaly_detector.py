"""
GST Sahayak - AI Anomaly Detection & Explainable AI Engine
Uses Isolation Forest (Scikit-Learn) and feature attribution to evaluate transaction anomalies and explain risks.
"""

import sys
import json
import os
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
import joblib

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_FILE = os.path.join(MODEL_DIR, "isolation_forest.joblib")
DATA_FILE = os.path.join(MODEL_DIR, "synthetic_transactions.json")

FEATURE_NAMES = [
    "invoice_amount",
    "taxable_amount",
    "gst_amount",
    "gst_rate_avg",
    "quantity_total",
    "discount_rate",
    "item_count",
    "unit_price_avg",
    "unit_price_max",
    "deviation_from_customer_avg",
    "deviation_from_category_avg",
    "inter_state_flag",
    "frequency_score"
]

FEATURE_LABELS = {
    "invoice_amount": "Total Invoice Amount",
    "taxable_amount": "Taxable Base Value",
    "gst_amount": "Total GST Amount",
    "gst_rate_avg": "Effective GST Rate",
    "quantity_total": "Total Item Quantity",
    "discount_rate": "Discount Percentage",
    "item_count": "Number of Line Items",
    "unit_price_avg": "Average Unit Price",
    "unit_price_max": "Peak Unit Price",
    "deviation_from_customer_avg": "Customer Historical Deviation",
    "deviation_from_category_avg": "Product Category Deviation",
    "inter_state_flag": "Inter-State (IGST) Transaction",
    "frequency_score": "Recent Transaction Frequency"
}

def generate_synthetic_history(n_samples=150):
    """Generate realistic synthetic GST transaction dataset for Isolation Forest training."""
    np.random.seed(42)
    records = []
    
    # Normal business operations (85%)
    for i in range(int(n_samples * 0.85)):
        category = np.random.choice(["Electronics", "IT Hardware", "Office Supplies", "Consulting", "Industrial Tools"])
        qty = int(np.random.choice([1, 2, 3, 5, 10, 15, 20]))
        
        if category == "Electronics":
            base_unit = np.random.uniform(15000, 65000)
            gst_rate = 18.0
        elif category == "IT Hardware":
            base_unit = np.random.uniform(25000, 95000)
            gst_rate = 18.0
        elif category == "Office Supplies":
            base_unit = np.random.uniform(200, 3500)
            gst_rate = 12.0
        elif category == "Consulting":
            base_unit = np.random.uniform(20000, 120000)
            gst_rate = 18.0
        else:
            base_unit = np.random.uniform(5000, 45000)
            gst_rate = 28.0
            
        discount = np.random.choice([0.0, 2.5, 5.0, 7.5, 10.0])
        taxable = (base_unit * qty) * (1 - discount / 100.0)
        gst = taxable * (gst_rate / 100.0)
        total = taxable + gst
        
        records.append({
            "invoice_amount": round(total, 2),
            "taxable_amount": round(taxable, 2),
            "gst_amount": round(gst, 2),
            "gst_rate_avg": gst_rate,
            "quantity_total": qty,
            "discount_rate": discount,
            "item_count": int(np.random.choice([1, 2, 3, 4])),
            "unit_price_avg": round(base_unit, 2),
            "unit_price_max": round(base_unit * 1.1, 2),
            "deviation_from_customer_avg": round(np.random.normal(0, 15), 2),
            "deviation_from_category_avg": round(np.random.normal(0, 10), 2),
            "inter_state_flag": int(np.random.choice([0, 1])),
            "frequency_score": round(np.random.uniform(1.0, 5.0), 2)
        })
        
    # Anomalous transactions (15%)
    for i in range(int(n_samples * 0.15)):
        anomaly_type = np.random.choice(["surge_amount", "excessive_qty", "high_discount", "unusual_gst_mismatch"])
        
        if anomaly_type == "surge_amount":
            qty = int(np.random.uniform(50, 200))
            base_unit = np.random.uniform(120000, 350000)
            discount = 0.0
            gst_rate = 18.0
            taxable = base_unit * qty
            gst = taxable * 0.18
            total = taxable + gst
            records.append({
                "invoice_amount": round(total, 2),
                "taxable_amount": round(taxable, 2),
                "gst_amount": round(gst, 2),
                "gst_rate_avg": gst_rate,
                "quantity_total": qty,
                "discount_rate": discount,
                "item_count": 8,
                "unit_price_avg": round(base_unit, 2),
                "unit_price_max": round(base_unit * 1.5, 2),
                "deviation_from_customer_avg": round(np.random.uniform(180, 450), 2),
                "deviation_from_category_avg": round(np.random.uniform(200, 500), 2),
                "inter_state_flag": 1,
                "frequency_score": round(np.random.uniform(9.0, 15.0), 2)
            })
        elif anomaly_type == "excessive_qty":
            qty = int(np.random.uniform(1000, 5000))
            base_unit = 450.0
            discount = 12.0
            taxable = (base_unit * qty) * (1 - discount/100)
            gst = taxable * 0.18
            records.append({
                "invoice_amount": round(taxable + gst, 2),
                "taxable_amount": round(taxable, 2),
                "gst_amount": round(gst, 2),
                "gst_rate_avg": 18.0,
                "quantity_total": qty,
                "discount_rate": discount,
                "item_count": 1,
                "unit_price_avg": base_unit,
                "unit_price_max": base_unit,
                "deviation_from_customer_avg": round(np.random.uniform(150, 300), 2),
                "deviation_from_category_avg": round(np.random.uniform(120, 280), 2),
                "inter_state_flag": 0,
                "frequency_score": 12.0
            })
        elif anomaly_type == "high_discount":
            qty = 10
            base_unit = 50000.0
            discount = 45.0 # Very high discount
            taxable = (base_unit * qty) * (1 - discount/100)
            gst = taxable * 0.18
            records.append({
                "invoice_amount": round(taxable + gst, 2),
                "taxable_amount": round(taxable, 2),
                "gst_amount": round(gst, 2),
                "gst_rate_avg": 18.0,
                "quantity_total": qty,
                "discount_rate": discount,
                "item_count": 2,
                "unit_price_avg": base_unit,
                "unit_price_max": base_unit,
                "deviation_from_customer_avg": round(np.random.uniform(80, 160), 2),
                "deviation_from_category_avg": round(np.random.uniform(70, 140), 2),
                "inter_state_flag": 1,
                "frequency_score": 2.0
            })
        else: # unusual_gst_mismatch
            qty = 5
            base_unit = 25000.0
            discount = 0.0
            taxable = base_unit * qty
            gst = taxable * 0.28
            records.append({
                "invoice_amount": round(taxable + gst, 2),
                "taxable_amount": round(taxable, 2),
                "gst_amount": round(gst, 2),
                "gst_rate_avg": 28.0,
                "quantity_total": qty,
                "discount_rate": discount,
                "item_count": 3,
                "unit_price_avg": base_unit,
                "unit_price_max": base_unit,
                "deviation_from_customer_avg": round(np.random.uniform(50, 110), 2),
                "deviation_from_category_avg": round(np.random.uniform(60, 120), 2),
                "inter_state_flag": 0,
                "frequency_score": 8.5
            })
            
    df = pd.DataFrame(records)
    
    # Save synthetic data for persistence
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2)
        
    return df

def train_or_load_model():
    """Train Isolation Forest or load existing trained model."""
    if os.path.exists(MODEL_FILE):
        try:
            return joblib.load(MODEL_FILE)
        except Exception:
            pass
            
    df = generate_synthetic_history(200)
    X = df[FEATURE_NAMES]
    
    model = IsolationForest(
        n_estimators=100,
        contamination=0.15,
        random_state=42,
        bootstrap=False
    )
    model.fit(X)
    
    # Save model and feature statistics (mean & std) for perturbation attribution
    feature_stats = {
        "mean": X.mean().to_dict(),
        "std": (X.std() + 1e-6).to_dict(),
        "quantiles_90": X.quantile(0.90).to_dict()
    }
    
    joblib.dump({"model": model, "stats": feature_stats}, MODEL_FILE)
    return {"model": model, "stats": feature_stats}

def extract_features(invoice_data, customer_history=None, category_history=None):
    """Extract standard feature vector from incoming invoice payload."""
    items = invoice_data.get("items", [])
    
    total_qty = sum(float(item.get("quantity", 1)) for item in items) if items else float(invoice_data.get("quantity", 1))
    item_count = len(items) if items else 1
    
    unit_prices = [float(item.get("unitPrice", item.get("unit_price", 0))) for item in items] if items else [float(invoice_data.get("unitPrice", 0))]
    unit_price_avg = float(np.mean(unit_prices)) if unit_prices else 0.0
    unit_price_max = float(np.max(unit_prices)) if unit_prices else 0.0
    
    gst_rates = [float(item.get("gstRate", 18)) for item in items] if items else [float(invoice_data.get("gstRate", 18))]
    gst_rate_avg = float(np.mean(gst_rates)) if gst_rates else 18.0
    
    inv_amount = float(invoice_data.get("grandTotal", invoice_data.get("total", 0)))
    taxable_amount = float(invoice_data.get("taxableAmount", invoice_data.get("taxable", inv_amount / 1.18)))
    gst_amount = float(invoice_data.get("totalGst", invoice_data.get("gst", inv_amount - taxable_amount)))
    
    discount_val = float(invoice_data.get("discount", 0))
    subtotal_val = float(invoice_data.get("subtotal", taxable_amount + discount_val))
    discount_rate = (discount_val / subtotal_val * 100.0) if subtotal_val > 0 else 0.0
    
    # Historical comparisons
    cust_avg = customer_history.get("avg_amount", 55000.0) if customer_history else 55000.0
    dev_cust = ((inv_amount - cust_avg) / cust_avg * 100.0) if cust_avg > 0 else 0.0
    
    cat_avg = category_history.get("avg_amount", 48000.0) if category_history else 48000.0
    dev_cat = ((inv_amount - cat_avg) / cat_avg * 100.0) if cat_avg > 0 else 0.0
    
    is_interstate = 1 if invoice_data.get("isInterState", False) or float(invoice_data.get("igst", 0)) > 0 else 0
    freq_score = float(invoice_data.get("frequencyScore", 2.5))
    
    features = {
        "invoice_amount": inv_amount,
        "taxable_amount": taxable_amount,
        "gst_amount": gst_amount,
        "gst_rate_avg": gst_rate_avg,
        "quantity_total": total_qty,
        "discount_rate": round(discount_rate, 2),
        "item_count": item_count,
        "unit_price_avg": round(unit_price_avg, 2),
        "unit_price_max": round(unit_price_max, 2),
        "deviation_from_customer_avg": round(dev_cust, 2),
        "deviation_from_category_avg": round(dev_cat, 2),
        "inter_state_flag": is_interstate,
        "frequency_score": freq_score
    }
    return features

def calculate_feature_attributions(model, stats, sample_vector):
    """
    Calculate SHAP-like feature importance using baseline reference perturbation on Isolation Forest score.
    Returns relative percentage contribution of each feature to the risk score.
    """
    base_score = float(-model.score_samples([sample_vector])[0]) # Higher score = more anomalous
    means = [stats["mean"][f] for f in FEATURE_NAMES]
    stds = [stats["std"][f] for f in FEATURE_NAMES]
    
    attributions = {}
    total_delta = 0.0
    
    for i, f_name in enumerate(FEATURE_NAMES):
        perturbed = list(sample_vector)
        # Replace feature with its historical baseline mean
        perturbed[i] = means[i]
        pert_score = float(-model.score_samples([perturbed])[0])
        
        # Contribution is how much removing this deviation lowers the anomaly score
        delta = max(0.0, base_score - pert_score)
        
        # Z-score scaling boost for extreme deviations
        z_score = abs(sample_vector[i] - means[i]) / stds[i]
        weighted_delta = delta * (1.0 + min(z_score, 5.0) * 0.3)
        
        attributions[f_name] = weighted_delta
        total_delta += weighted_delta
        
    if total_delta > 0:
        for k in attributions:
            attributions[k] = round((attributions[k] / total_delta) * 100.0, 1)
    else:
        # Uniform fallback
        val = round(100.0 / len(FEATURE_NAMES), 1)
        for k in attributions:
            attributions[k] = val
            
    # Sort top contributors
    sorted_contribs = sorted(attributions.items(), key=lambda x: x[1], reverse=True)
    return {k: v for k, v in sorted_contribs}

def generate_natural_language_explanation(features, attributions, risk_level, risk_score):
    """Generate professional, clear Explainable AI text with specific reasons and actionable guidance."""
    reasons = []
    actions = []
    
    # Check top factors
    top_factors = list(attributions.keys())[:4]
    
    if features["deviation_from_customer_avg"] > 100:
        reasons.append(f"Invoice amount (₹{features['invoice_amount']:,.2f}) is {features['deviation_from_customer_avg']:.1f}% higher than historical customer transaction average.")
        actions.append("Verify customer purchase order (PO) number and dual credit approval.")
    elif features["invoice_amount"] > 300000:
        reasons.append(f"Invoice value of ₹{features['invoice_amount']:,.2f} represents a high-value commercial bracket requiring e-Way bill and compliance checks.")
        actions.append("Confirm mandatory e-Way bill eligibility (transactions over ₹50,000 threshold).")

    if features["quantity_total"] >= 50 and features["quantity_total"] > features["unit_price_avg"]:
        reasons.append(f"Total quantity ({features['quantity_total']} units) exceeds normal single-order threshold.")
        actions.append("Confirm warehouse stock availability and physical dispatch logs.")

    if features["discount_rate"] >= 20.0:
        reasons.append(f"Unusual high discount of {features['discount_rate']:.1f}% applied on standard catalog price.")
        actions.append("Review whether special discount authorization code is documented.")
        
    if features["gst_rate_avg"] == 28.0:
        reasons.append("Applicable GST tax slab is 28% (highest bracket/luxury/sin goods).")
        actions.append("Double-check HSN/SAC code classification against latest GST council schedule.")
        
    if features["frequency_score"] > 8.0:
        reasons.append("High transaction frequency: Multiple high-value invoices created for same party in recent hours.")
        actions.append("Check for potential duplicate billing or split-invoice transactions.")
        
    if not reasons:
        if risk_level == "POTENTIAL_RISK":
            reasons.append("Multivariate anomaly detected: Combination of transaction amount, item volume, and rate deviation differs from normal operating baselines.")
            actions.append("Conduct manual pre-filing review of invoice line items and tax components.")
        elif risk_level == "WARNING":
            reasons.append("Mild deviation from standard invoice patterns detected.")
            actions.append("Review line item pricing and customer GSTIN details before finalization.")
        else:
            reasons.append("All financial metrics, quantities, and GST rates conform to historical business norms.")
            actions.append("Invoice is ready for final approval, e-invoice generation, and dispatch.")

    return {
        "summary": "Potential Risk Detected" if risk_level == "POTENTIAL_RISK" else ("Warning: Requires Verification" if risk_level == "WARNING" else "Compliant / No Risk"),
        "reasons": reasons,
        "suggested_actions": actions,
        "top_factors": [FEATURE_LABELS.get(f, f) for f in top_factors]
    }

def analyze_invoice(invoice_data):
    """Main analysis entrypoint."""
    bundle = train_or_load_model()
    model = bundle["model"]
    stats = bundle["stats"]
    
    features = extract_features(invoice_data)
    sample_vector = [features[f] for f in FEATURE_NAMES]
    
    # Scikit-learn Isolation Forest returns -1 for anomaly, 1 for normal
    raw_pred = model.predict([sample_vector])[0]
    raw_score = model.score_samples([sample_vector])[0] # range roughly [-0.7, -0.3]
    
    # Normalize anomaly score to 0 - 100 risk scale
    # Raw scores <= -0.62 are severe anomalies; >= -0.45 are normal
    normalized_risk = float(np.clip(((-raw_score - 0.42) / 0.25) * 100.0, 0.0, 100.0))
    
    # Heuristic enhancements for deterministic extreme outliers
    if features["invoice_amount"] > 1000000 or features["deviation_from_customer_avg"] > 300 or features["discount_rate"] > 35:
        normalized_risk = max(normalized_risk, 78.0)
    elif features["invoice_amount"] > 500000 or features["quantity_total"] > 200 or features["discount_rate"] > 25:
        normalized_risk = max(normalized_risk, 55.0)
    elif features["invoice_amount"] < 100000 and features["quantity_total"] < 20 and features["discount_rate"] <= 10:
        normalized_risk = min(normalized_risk, 24.0)
        
    if normalized_risk >= 65.0:
        risk_level = "POTENTIAL_RISK"
        is_anomaly = True
    elif normalized_risk >= 40.0:
        risk_level = "WARNING"
        is_anomaly = False
    else:
        risk_level = "VALID"
        is_anomaly = False
        
    attributions = calculate_feature_attributions(model, stats, sample_vector)
    nlp_explanation = generate_natural_language_explanation(features, attributions, risk_level, normalized_risk)
    
    result = {
        "riskScore": round(normalized_risk, 1),
        "riskLevel": risk_level,
        "isAnomaly": is_anomaly,
        "anomalyScore": round(float(-raw_score), 4),
        "features": features,
        "featureContributions": attributions,
        "explanation": nlp_explanation["summary"],
        "reasons": nlp_explanation["reasons"],
        "suggestedActions": nlp_explanation["suggested_actions"],
        "topFactors": nlp_explanation["top_factors"]
    }
    return result

if __name__ == "__main__":
    # If run via CLI, read JSON payload from stdin or file
    if len(sys.argv) > 1 and sys.argv[1] == "--train":
        train_or_load_model()
        print(json.dumps({"status": "Model trained successfully"}))
        sys.exit(0)
        
    try:
        input_str = sys.stdin.read().strip()
        if not input_str and len(sys.argv) > 1:
            input_str = sys.argv[1]
            
        if input_str:
            data = json.loads(input_str)
            analysis = analyze_invoice(data)
            print(json.dumps(analysis, indent=2))
        else:
            # Demo run
            demo_invoice = {
                "invoiceNumber": "INV-2026-0099",
                "customerName": "Acme Infotech Ltd",
                "grandTotal": 485000,
                "taxableAmount": 411016.95,
                "totalGst": 73983.05,
                "discount": 5000,
                "isInterState": True,
                "items": [
                    {"productName": "ASUS TUF Gaming Laptop", "quantity": 10, "unitPrice": 41100, "gstRate": 18}
                ]
            }
            analysis = analyze_invoice(demo_invoice)
            print(json.dumps(analysis, indent=2))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)
