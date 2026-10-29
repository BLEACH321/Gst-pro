export interface PersonalTaxInfo {
  pan: string;
  aadhaar: string;
  fullName: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  mobile: string;
  email: string;
  address: string;
  bankAccountNumber: string;
  ifscCode: string;
  bankName: string;
  accountType: "savings" | "current";
  isPrimaryForRefund: boolean;
  employerCategory: "private" | "central_gov" | "state_gov" | "psu" | "other";
  residentialStatus: "resident" | "nri" | "rnor";
}

export interface IncomeDetails {
  // Salary Income
  grossSalary: number;
  basicSalary: number;
  hraReceived: number;
  specialAllowance: number;
  lta: number;
  otherAllowances: number;
  professionalTax: number;
  perquisites: number;

  // House Property
  hasHouseProperty: boolean;
  propertyType: "self_occupied" | "let_out";
  annualRentReceived: number;
  municipalTaxesPaid: number;
  homeLoanInterest24b: number; // Max 2L for self-occupied

  // Capital Gains
  stcgEquity: number; // 20%
  ltcgEquity: number; // 12.5% (exemption 1.25L)
  stcgOther: number;
  ltcgOther: number;

  // Other Sources
  savingsInterest: number;
  fdInterest: number;
  dividendIncome: number;
  otherIncome: number;

  // Business / Presumptive (ITR-4)
  grossTurnover: number;
  presumptiveIncome: number;
}

export interface DeductionsDetails {
  // 80C (Max 1,50,000)
  epfVpf: number;
  ppf: number;
  elss: number;
  lifeInsurance: number;
  tuitionFees: number;
  principalHomeLoan: number;
  nscSukanya: number;

  // 80D Health Insurance
  healthInsuranceSelf: number; // Max 25k (50k for senior)
  healthInsuranceParents: number; // Max 25k (50k for senior)
  parentsSeniorCitizen: boolean;

  // NPS
  npsSelf80CCD1B: number; // Max 50,000
  npsEmployer80CCD2: number; // Allowed in both regimes (up to 14% basic)

  // HRA Exemption Inputs
  rentPaidAnnually: number;
  isMetroCity: boolean;

  // Other Deductions
  donations80G: number;
  educationLoan80E: number;
  savingsInterest80TTA: number; // Max 10,000
}

export interface RegimeResult {
  regime: "old" | "new";
  grossTotalIncome: number;
  exemptions: number; // HRA, LTA etc
  standardDeduction: number;
  chapterVIA_Deductions: number;
  totalDeductions: number;
  netTaxableIncome: number;
  slabTax: number;
  rebate87A: number;
  taxAfterRebate: number;
  surcharge: number;
  healthAndEduCess: number;
  totalTaxPayable: number;
  taxPaidTds: number;
  taxPayableOrRefund: number; // Positive = payable, negative = refund
  effectiveTaxRate: number;
  breakdown: { slab: string; rate: string; taxableAmount: number; taxAmount: number }[];
}

export interface TaxComparison {
  oldRegime: RegimeResult;
  newRegime: RegimeResult;
  optimalRegime: "old" | "new";
  taxSavings: number;
  differenceSummary: string;
}

export interface Form16Data {
  employerName: string;
  employerTan: string;
  employeePan: string;
  financialYear: string;
  assessmentYear: string;
  grossSalary: number;
  standardDeduction: number;
  section80C: number;
  section80D: number;
  tdsDeducted: number;
  certificateNumber: string;
}

export interface AISTISEntry {
  id: string;
  category: "Salary" | "Interest" | "Dividend" | "Securities" | "High Value";
  description: string;
  reportedBy: string;
  financialYear: string;
  grossValue: number;
  tdsTcsDeducted: number;
  feedbackStatus: "Accepted" | "Modified" | "Pending";
}

export interface ITRFilingRecord {
  id: string;
  ackNumber: string;
  itrType: "ITR-1" | "ITR-2" | "ITR-4";
  assessmentYear: string;
  filingDate: string;
  status: "Successfully Filed" | "e-Verified" | "Processed" | "Draft";
  grossIncome: number;
  totalTaxPaid: number;
  refundOrPayable: number;
  regimeChosen: "old" | "new";
  verificationMethod: "Aadhaar OTP" | "Net Banking" | "Pending";
}
