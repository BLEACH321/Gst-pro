import { IncomeDetails, DeductionsDetails, RegimeResult, TaxComparison } from "../types/itr";

export function calculateHraExemption(
  basicSalary: number,
  hraReceived: number,
  rentPaidAnnually: number,
  isMetroCity: boolean
): number {
  if (rentPaidAnnually <= 0 || hraReceived <= 0) return 0;

  const rentMinusTenPercent = Math.max(0, rentPaidAnnually - basicSalary * 0.1);
  const salaryPercentage = basicSalary * (isMetroCity ? 0.5 : 0.4);

  const exemption = Math.min(hraReceived, rentMinusTenPercent, salaryPercentage);
  return Math.max(0, Math.round(exemption));
}

export function computeOldRegime(
  income: IncomeDetails,
  deductions: DeductionsDetails,
  tdsPaid: number
): RegimeResult {
  // 1. Gross Income from all sources
  let grossSalary = income.grossSalary || 0;
  
  // House Property Net Income (loss up to 2L allowed)
  let housePropertyIncome = 0;
  if (income.hasHouseProperty) {
    if (income.propertyType === "self_occupied") {
      housePropertyIncome = -Math.min(200000, income.homeLoanInterest24b || 0);
    } else {
      const nav = Math.max(0, (income.annualRentReceived || 0) - (income.municipalTaxesPaid || 0));
      const standard30 = nav * 0.3;
      housePropertyIncome = nav - standard30 - (income.homeLoanInterest24b || 0);
    }
  }

  // Capital gains (Special rate calculations)
  const stcgTax = (income.stcgEquity || 0) * 0.2;
  const ltcgExempt = Math.max(0, (income.ltcgEquity || 0) - 125000);
  const ltcgTax = ltcgExempt * 0.125;
  const capitalGainsTax = stcgTax + ltcgTax;

  // Other Sources
  const otherSources =
    (income.savingsInterest || 0) +
    (income.fdInterest || 0) +
    (income.dividendIncome || 0) +
    (income.otherIncome || 0);

  // Business income (if any)
  const businessIncome = income.presumptiveIncome || 0;

  const grossTotalIncome = grossSalary + housePropertyIncome + otherSources + businessIncome;

  // 2. Exemptions under Salary
  const hraExemption = calculateHraExemption(
    income.basicSalary || 0,
    income.hraReceived || 0,
    deductions.rentPaidAnnually || 0,
    deductions.isMetroCity
  );
  const salaryExemptions = hraExemption + (income.lta || 0);

  // 3. Standard Deduction for Old Regime
  const standardDeduction = grossSalary > 0 ? 50000 : 0;
  const professionalTax = Math.min(2500, income.professionalTax || 0);

  // 4. Chapter VI-A Deductions
  // Section 80C (Max 1.5 Lakh)
  const total80C_Investments =
    (deductions.epfVpf || 0) +
    (deductions.ppf || 0) +
    (deductions.elss || 0) +
    (deductions.lifeInsurance || 0) +
    (deductions.tuitionFees || 0) +
    (deductions.principalHomeLoan || 0) +
    (deductions.nscSukanya || 0);
  const claimed80C = Math.min(150000, total80C_Investments);

  // Section 80D Health Insurance
  const maxSelf80D = 25000;
  const maxParents80D = deductions.parentsSeniorCitizen ? 50000 : 25000;
  const claimed80D =
    Math.min(maxSelf80D, deductions.healthInsuranceSelf || 0) +
    Math.min(maxParents80D, deductions.healthInsuranceParents || 0);

  // Section 80CCD(1B) NPS
  const claimed80CCD1B = Math.min(50000, deductions.npsSelf80CCD1B || 0);

  // Section 80CCD(2) Employer NPS (allowed in both)
  const claimed80CCD2 = Math.min((income.basicSalary || 0) * 0.14, deductions.npsEmployer80CCD2 || 0);

  // Section 80TTA (Savings interest up to 10k)
  const claimed80TTA = Math.min(10000, income.savingsInterest || 0);

  // Section 80G donations
  const claimed80G = deductions.donations80G || 0;

  const chapterVIA = claimed80C + claimed80D + claimed80CCD1B + claimed80CCD2 + claimed80TTA + claimed80G;

  const totalDeductions = salaryExemptions + standardDeduction + professionalTax + chapterVIA;
  const netTaxableIncome = Math.max(0, grossTotalIncome - totalDeductions);

  // 5. Slab Tax (Old Regime: 0-2.5L Nil, 2.5-5L 5%, 5-10L 20%, >10L 30%)
  const breakdown: { slab: string; rate: string; taxableAmount: number; taxAmount: number }[] = [];
  let slabTax = 0;

  if (netTaxableIncome <= 250000) {
    breakdown.push({ slab: "Up to ₹2,50,000", rate: "0%", taxableAmount: netTaxableIncome, taxAmount: 0 });
  } else {
    breakdown.push({ slab: "Up to ₹2,50,000", rate: "0%", taxableAmount: 250000, taxAmount: 0 });

    const slab2 = Math.min(250000, netTaxableIncome - 250000);
    const tax2 = slab2 * 0.05;
    slabTax += tax2;
    breakdown.push({ slab: "₹2,50,001 - ₹5,00,000", rate: "5%", taxableAmount: slab2, taxAmount: tax2 });

    if (netTaxableIncome > 500000) {
      const slab3 = Math.min(500000, netTaxableIncome - 500000);
      const tax3 = slab3 * 0.2;
      slabTax += tax3;
      breakdown.push({ slab: "₹5,00,001 - ₹10,00,000", rate: "20%", taxableAmount: slab3, taxAmount: tax3 });
    }

    if (netTaxableIncome > 1000000) {
      const slab4 = netTaxableIncome - 1000000;
      const tax4 = slab4 * 0.3;
      slabTax += tax4;
      breakdown.push({ slab: "Above ₹10,00,000", rate: "30%", taxableAmount: slab4, taxAmount: tax4 });
    }
  }

  // Section 87A Rebate: if netTaxableIncome <= 500000, rebate up to 12500
  let rebate87A = 0;
  if (netTaxableIncome <= 500000) {
    rebate87A = Math.min(slabTax, 12500);
  }

  const taxAfterRebate = Math.max(0, slabTax - rebate87A) + capitalGainsTax;

  // Surcharge (for high income > 50L)
  let surcharge = 0;
  if (netTaxableIncome > 50000000) surcharge = taxAfterRebate * 0.37;
  else if (netTaxableIncome > 20000000) surcharge = taxAfterRebate * 0.25;
  else if (netTaxableIncome > 10000000) surcharge = taxAfterRebate * 0.15;
  else if (netTaxableIncome > 5000000) surcharge = taxAfterRebate * 0.1;

  // Health and Education Cess @ 4%
  const healthAndEduCess = Math.round((taxAfterRebate + surcharge) * 0.04);
  const totalTaxPayable = Math.round(taxAfterRebate + surcharge + healthAndEduCess);

  const taxPayableOrRefund = totalTaxPayable - tdsPaid;
  const effectiveTaxRate = grossTotalIncome > 0 ? (totalTaxPayable / grossTotalIncome) * 100 : 0;

  return {
    regime: "old",
    grossTotalIncome,
    exemptions: salaryExemptions,
    standardDeduction,
    chapterVIA_Deductions: chapterVIA,
    totalDeductions,
    netTaxableIncome,
    slabTax: Math.round(slabTax),
    rebate87A: Math.round(rebate87A),
    taxAfterRebate: Math.round(taxAfterRebate),
    surcharge: Math.round(surcharge),
    healthAndEduCess,
    totalTaxPayable,
    taxPaidTds: tdsPaid,
    taxPayableOrRefund,
    effectiveTaxRate: Number(effectiveTaxRate.toFixed(2)),
    breakdown
  };
}

export function computeNewRegime(
  income: IncomeDetails,
  deductions: DeductionsDetails,
  tdsPaid: number
): RegimeResult {
  // Gross Salary
  const grossSalary = income.grossSalary || 0;

  // House property in New Regime: loss on self-occupied is NOT allowed to be set off against salary.
  // Only let-out property income is considered.
  let housePropertyIncome = 0;
  if (income.hasHouseProperty && income.propertyType === "let_out") {
    const nav = Math.max(0, (income.annualRentReceived || 0) - (income.municipalTaxesPaid || 0));
    const standard30 = nav * 0.3;
    housePropertyIncome = nav - standard30 - (income.homeLoanInterest24b || 0);
  }

  // Capital Gains
  const stcgTax = (income.stcgEquity || 0) * 0.2;
  const ltcgExempt = Math.max(0, (income.ltcgEquity || 0) - 125000);
  const ltcgTax = ltcgExempt * 0.125;
  const capitalGainsTax = stcgTax + ltcgTax;

  // Other Sources
  const otherSources =
    (income.savingsInterest || 0) +
    (income.fdInterest || 0) +
    (income.dividendIncome || 0) +
    (income.otherIncome || 0);

  const businessIncome = income.presumptiveIncome || 0;

  const grossTotalIncome = grossSalary + housePropertyIncome + otherSources + businessIncome;

  // Standard Deduction in New Regime for FY 2025-26 / AY 2026-27 is ₹75,000!
  const standardDeduction = grossSalary > 0 ? 75000 : 0;

  // Employer NPS under Section 80CCD(2) IS allowed in New Regime (up to 14% basic)
  const claimed80CCD2 = Math.min((income.basicSalary || 0) * 0.14, deductions.npsEmployer80CCD2 || 0);

  const totalDeductions = standardDeduction + claimed80CCD2;
  const netTaxableIncome = Math.max(0, grossTotalIncome - totalDeductions);

  // New Regime FY 2025-26 Slabs:
  // 0 - 3,00,000: Nil
  // 3,00,001 - 7,00,000: 5% (max 20,000)
  // 7,00,001 - 10,00,000: 10% (max 30,000)
  // 10,00,001 - 12,00,000: 15% (max 30,000)
  // 12,00,001 - 15,00,000: 20% (max 60,000)
  // Above 15,00,000: 30%
  const breakdown: { slab: string; rate: string; taxableAmount: number; taxAmount: number }[] = [];
  let slabTax = 0;

  if (netTaxableIncome <= 300000) {
    breakdown.push({ slab: "Up to ₹3,00,000", rate: "0%", taxableAmount: netTaxableIncome, taxAmount: 0 });
  } else {
    breakdown.push({ slab: "Up to ₹3,00,000", rate: "0%", taxableAmount: 300000, taxAmount: 0 });

    const s1 = Math.min(400000, netTaxableIncome - 300000);
    const t1 = s1 * 0.05;
    slabTax += t1;
    breakdown.push({ slab: "₹3,00,001 - ₹7,00,000", rate: "5%", taxableAmount: s1, taxAmount: t1 });

    if (netTaxableIncome > 700000) {
      const s2 = Math.min(300000, netTaxableIncome - 700000);
      const t2 = s2 * 0.1;
      slabTax += t2;
      breakdown.push({ slab: "₹7,00,001 - ₹10,00,000", rate: "10%", taxableAmount: s2, taxAmount: t2 });
    }

    if (netTaxableIncome > 1000000) {
      const s3 = Math.min(200000, netTaxableIncome - 1000000);
      const t3 = s3 * 0.15;
      slabTax += t3;
      breakdown.push({ slab: "₹10,00,001 - ₹12,00,000", rate: "15%", taxableAmount: s3, taxAmount: t3 });
    }

    if (netTaxableIncome > 1200000) {
      const s4 = Math.min(300000, netTaxableIncome - 1200000);
      const t4 = s4 * 0.2;
      slabTax += t4;
      breakdown.push({ slab: "₹12,00,001 - ₹15,00,000", rate: "20%", taxableAmount: s4, taxAmount: t4 });
    }

    if (netTaxableIncome > 1500000) {
      const s5 = netTaxableIncome - 1500000;
      const t5 = s5 * 0.3;
      slabTax += t5;
      breakdown.push({ slab: "Above ₹15,00,000", rate: "30%", taxableAmount: s5, taxAmount: t5 });
    }
  }

  // Section 87A Rebate:
  // In New Regime, if net taxable income <= ₹7,00,000, rebate is 100% of tax (up to ₹25,000) -> Tax is 0!
  // Marginal relief: if income marginally exceeds 7L (e.g. 7,10,000), tax cannot exceed (income - 7,00,000).
  let rebate87A = 0;
  if (netTaxableIncome <= 700000) {
    rebate87A = slabTax;
  } else {
    const excessIncome = netTaxableIncome - 700000;
    if (slabTax > excessIncome) {
      // Marginal relief reduction
      rebate87A = slabTax - excessIncome;
    }
  }

  const taxAfterRebate = Math.max(0, slabTax - rebate87A) + capitalGainsTax;

  // Surcharge (Capped at 25% max in New Regime)
  let surcharge = 0;
  if (netTaxableIncome > 20000000) surcharge = taxAfterRebate * 0.25;
  else if (netTaxableIncome > 10000000) surcharge = taxAfterRebate * 0.15;
  else if (netTaxableIncome > 5000000) surcharge = taxAfterRebate * 0.1;

  // Cess 4%
  const healthAndEduCess = Math.round((taxAfterRebate + surcharge) * 0.04);
  const totalTaxPayable = Math.round(taxAfterRebate + surcharge + healthAndEduCess);

  const taxPayableOrRefund = totalTaxPayable - tdsPaid;
  const effectiveTaxRate = grossTotalIncome > 0 ? (totalTaxPayable / grossTotalIncome) * 100 : 0;

  return {
    regime: "new",
    grossTotalIncome,
    exemptions: 0,
    standardDeduction,
    chapterVIA_Deductions: claimed80CCD2,
    totalDeductions,
    netTaxableIncome,
    slabTax: Math.round(slabTax),
    rebate87A: Math.round(rebate87A),
    taxAfterRebate: Math.round(taxAfterRebate),
    surcharge: Math.round(surcharge),
    healthAndEduCess,
    totalTaxPayable,
    taxPaidTds: tdsPaid,
    taxPayableOrRefund,
    effectiveTaxRate: Number(effectiveTaxRate.toFixed(2)),
    breakdown
  };
}

export function compareTaxRegimes(
  income: IncomeDetails,
  deductions: DeductionsDetails,
  tdsPaid: number
): TaxComparison {
  const oldRegime = computeOldRegime(income, deductions, tdsPaid);
  const newRegime = computeNewRegime(income, deductions, tdsPaid);

  const optimalRegime: "old" | "new" = newRegime.totalTaxPayable <= oldRegime.totalTaxPayable ? "new" : "old";
  const taxSavings = Math.abs(oldRegime.totalTaxPayable - newRegime.totalTaxPayable);

  let differenceSummary = "";
  if (taxSavings === 0) {
    differenceSummary = "Both regimes result in the exact same tax liability.";
  } else if (optimalRegime === "new") {
    differenceSummary = `New Tax Regime saves you ₹${taxSavings.toLocaleString("en-IN")} due to lower slab rates & ₹75,000 standard deduction.`;
  } else {
    differenceSummary = `Old Tax Regime saves you ₹${taxSavings.toLocaleString("en-IN")} thanks to your deductions (80C, HRA, Home Loan Interest).`;
  }

  return {
    oldRegime,
    newRegime,
    optimalRegime,
    taxSavings,
    differenceSummary
  };
}
