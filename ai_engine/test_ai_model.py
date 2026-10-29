"""
GST Sahayak - AI Anomaly Detection Model Test Suite
Validates model training, feature extraction, outlier detection, and explainable AI attribution.
"""

import sys
import os
import json
import subprocess
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from anomaly_detector import (
    train_or_load_model,
    extract_features,
    calculate_feature_attributions,
    analyze_invoice,
    FEATURE_NAMES
)

total_tests = 0
passed_tests = 0
failed_tests = 0

def check(description, condition, details=""):
    global total_tests, passed_tests, failed_tests
    total_tests += 1
    if condition:
        passed_tests += 1
        print(f"  [PASS] {description}")
    else:
        failed_tests += 1
        print(f"  [FAIL] {description} - {details}")

print("==================================================")
print("RUNNING AI ANOMALY DETECTION MODEL TEST SUITE")
print("==================================================")

# ----------------------------------------------------
# TEST 1: Model Training & Loading
# ----------------------------------------------------
print("\n[Group 1: Model Serialization & Feature Statistics]")
bundle = train_or_load_model()
check("Model bundle loaded", bundle is not None and "model" in bundle and "stats" in bundle)
model = bundle["model"]
stats = bundle["stats"]
check("Model is IsolationForest", hasattr(model, "score_samples"))
check("Stats contain all 13 features", all(f in stats["mean"] for f in FEATURE_NAMES))

# ----------------------------------------------------
# TEST 2: Feature Extraction
# ----------------------------------------------------
print("\n[Group 2: Feature Extraction]")
demo_invoice = {
    "invoiceNumber": "INV-2026-0001",
    "grandTotal": 100288.2,
    "taxableAmount": 84990.0,
    "totalGst": 15298.2,
    "discount": 0,
    "isInterState": False,
    "items": [
        {"productName": "Laptop", "quantity": 1, "unitPrice": 84990, "gstRate": 18}
    ]
}
feats = extract_features(demo_invoice)
check("Extracted 13 features", len(feats) == 13)
check("Invoice amount matches", feats["invoice_amount"] == 100288.2)
check("Inter-state flag is 0", feats["inter_state_flag"] == 0)
check("Quantity is 1", feats["quantity_total"] == 1)

# ----------------------------------------------------
# TEST 3: Nominal / Normal Transaction Analysis
# ----------------------------------------------------
print("\n[Group 3: Normal Transaction Inference]")
normal_res = analyze_invoice(demo_invoice)
check("Normal invoice riskLevel is VALID", normal_res["riskLevel"] == "VALID")
check("Normal invoice isAnomaly is False", normal_res["isAnomaly"] is False)
check("Normal invoice riskScore < 50", normal_res["riskScore"] < 50.0, f"Score was {normal_res['riskScore']}")
check("Top factors list is present", len(normal_res["topFactors"]) > 0)
check("Reasons explanation is present", len(normal_res["reasons"]) > 0)

# ----------------------------------------------------
# TEST 4: Extreme Outlier Anomaly Detection (Surge Amount + Extreme Volume)
# ----------------------------------------------------
print("\n[Group 4: Extreme Surge Outlier Inference]")
surge_invoice = {
    "invoiceNumber": "INV-2026-9999",
    "grandTotal": 8499000.0, # 84.99 Lakhs
    "taxableAmount": 7202542.0,
    "totalGst": 1296458.0,
    "discount": 50000,
    "isInterState": True,
    "items": [
        {"productName": "Laptop", "quantity": 100, "unitPrice": 84990, "gstRate": 18}
    ]
}
surge_res = analyze_invoice(surge_invoice)
check("Surge invoice riskLevel is POTENTIAL_RISK", surge_res["riskLevel"] == "POTENTIAL_RISK")
check("Surge invoice isAnomaly is True", surge_res["isAnomaly"] is True)
check("Surge invoice riskScore >= 65", surge_res["riskScore"] >= 65.0, f"Score was {surge_res['riskScore']}")
check("Suggested actions include verification", any("PO" in a or "approval" in a or "e-Way" in a or "e-way" in a for a in surge_res["suggestedActions"]))

# ----------------------------------------------------
# TEST 5: Deep Discount Anomaly Detection
# ----------------------------------------------------
print("\n[Group 5: Abnormal Promotional Discount Inference]")
discount_invoice = {
    "invoiceNumber": "INV-2026-DISC",
    "grandTotal": 650000.0,
    "taxableAmount": 550847.0,
    "totalGst": 99153.0,
    "discount": 300000.0, # Massive 35%+ discount
    "subtotal": 850847.0,
    "isInterState": False,
    "items": [
        {"productName": "Workstations", "quantity": 10, "unitPrice": 85084.7, "gstRate": 18}
    ]
}
disc_res = analyze_invoice(discount_invoice)
check("High discount invoice triggers WARNING or POTENTIAL_RISK", disc_res["riskLevel"] in ["WARNING", "POTENTIAL_RISK"])
check("Discount percentage is captured in features", disc_res["features"]["discount_rate"] > 25.0)

# ----------------------------------------------------
# TEST 6: Feature Attribution Normalization (Sum to ~100%)
# ----------------------------------------------------
print("\n[Group 6: Explainable AI Attribution Weights]")
attribs = surge_res["featureContributions"]
total_weight = sum(attribs.values())
check("Feature attributions sum approximately to 100%", 95.0 <= total_weight <= 105.0, f"Sum was {total_weight}")
check("Key outlier feature has substantial attribution", any(v >= 20.0 for v in attribs.values()))

# ----------------------------------------------------
# TEST 7: Clean Subprocess Handshake (No Unhandled Warnings to Stdout)
# ----------------------------------------------------
print("\n[Group 7: Subprocess JSON Parsing & Warning Handling]")
detector_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "anomaly_detector.py")
proc = subprocess.Popen(
    [sys.executable, "-W", "ignore", detector_path],
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True
)
stdout_data, stderr_data = proc.communicate(json.dumps(demo_invoice))

parsed_json = None
parse_error = None
try:
    parsed_json = json.loads(stdout_data.strip())
except Exception as e:
    parse_error = str(e)

check("Subprocess output is valid JSON without stderr contamination", parsed_json is not None, f"Error: {parse_error}")
if parsed_json:
    check("Subprocess returned riskScore", "riskScore" in parsed_json)

print("\n==================================================")
print(f"AI MODEL TEST RESULTS: {passed_tests}/{total_tests} PASSED ({failed_tests} FAILED)")
print("==================================================")

if failed_tests > 0:
    sys.exit(1)
else:
    sys.exit(0)
