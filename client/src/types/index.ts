export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  business?: Business;
}

export interface Business {
  id: string;
  userId: string;
  businessName: string;
  gstin: string;
  businessCategory: string;
  registrationType: string;
  state: string;
  address: string;
  email: string;
  phone: string;
}

export interface Customer {
  id: string;
  userId: string;
  name: string;
  gstin?: string | null;
  state: string;
  address?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface Product {
  id: string;
  userId: string;
  name: string;
  category: string;
  hsnSac: string;
  gstRate: number;
  price: number;
  unit: string;
  description?: string | null;
}

export interface InvoiceItem {
  id?: string;
  productId?: string | null;
  productName: string;
  hsnSac: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxableAmount: number;
  gstRate: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

export interface ValidationRuleResult {
  id?: string;
  ruleId: string;
  ruleName: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  severity: 'ERROR' | 'WARNING' | 'INFO';
  message: string;
  suggestedAction?: string | null;
}

export interface AnomalyResult {
  id?: string;
  anomalyScore: number;
  isAnomaly: boolean;
  riskLevel: 'VALID' | 'WARNING' | 'POTENTIAL_RISK';
  explanation: string;
  featureContributions: string | Record<string, number>;
  suggestedActions: string | string[];
}

export interface Invoice {
  id: string;
  userId: string;
  businessId?: string | null;
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  customerGstin?: string | null;
  customerState: string;
  customerAddress?: string | null;
  subtotal: number;
  discount: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalGst: number;
  grandTotal: number;
  status: 'DRAFT' | 'VALIDATED' | 'FINALIZED' | 'CANCELLED';
  riskLevel: 'VALID' | 'WARNING' | 'POTENTIAL_RISK';
  riskScore: number;
  isInterState: boolean;
  createdAt: string;
  items: InvoiceItem[];
  validationRules?: ValidationRuleResult[];
  anomalyResult?: AnomalyResult | null;
}

export interface Rule {
  id: string;
  ruleId: string;
  ruleName: string;
  description: string;
  category: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
  isEnabled: boolean;
  conditionType: string;
  createdAt: string;
  updatedAt: string;
}

export interface HsnSuggestion {
  hsnSac: string;
  suggestedName: string;
  category: string;
  gstRate: number;
  unit: string;
  description: string;
  confidence: 'High' | 'Medium' | 'Low';
  score: number;
  requiresVerification: boolean;
}

export interface ValidationSummaryResponse {
  overallStatus: 'VALID' | 'WARNING' | 'POTENTIAL_RISK';
  ruleEngine: {
    status: 'PASS' | 'FAIL' | 'WARNING';
    summary: {
      totalRules: number;
      passed: number;
      warnings: number;
      failed: number;
    };
    results: ValidationRuleResult[];
  };
  aiAnalysis: {
    riskScore: number;
    riskLevel: 'VALID' | 'WARNING' | 'POTENTIAL_RISK';
    isAnomaly: boolean;
    anomalyScore: number;
    explanation: string;
    reasons: string[];
    suggestedActions: string[];
    topFactors: string[];
    featureContributions: Record<string, number>;
  };
  summary: {
    totalRulesEvaluated: number;
    passedRules: number;
    warningRules: number;
    failedRules: number;
    anomalyScore: number;
    isAnomaly: boolean;
    riskLevel: 'VALID' | 'WARNING' | 'POTENTIAL_RISK';
  };
}
