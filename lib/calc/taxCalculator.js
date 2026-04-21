"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxCalculator = void 0;
exports.buildIncomeBases = buildIncomeBases;
exports.calculateCanadaChildBenefitFromYearData = calculateCanadaChildBenefitFromYearData;
exports.createTaxCalculator = createTaxCalculator;
exports.getAvailableYears = getAvailableYears;
exports.compareTaxYears = compareTaxYears;
exports.calcOntarioHealthPremium = calcOntarioHealthPremium;
exports.calcOntarioNonRefundableTaxCredits = calcOntarioNonRefundableTaxCredits;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Helper function to safely convert and clamp values to non-negative numbers
 */
function clampNonNeg(n) {
    const x = Number(n !== null && n !== void 0 ? n : 0);
    return Number.isFinite(x) ? Math.max(0, x) : 0;
}
/**
 * Returns income concepts used in different parts of the calculation engine.
 * - cppEiBase: NEVER affected by support transfers
 * - netIncomeForTax: includes spousal support inclusion/deduction
 * - afniForBenefits: usually derived from net income
 */
function buildIncomeBases(inputs) {
    const employmentPensionable = clampNonNeg(inputs.employmentIncomePensionable);
    // CPP/EI base is locked to employment pensionable earnings
    const cppEiBase = employmentPensionable;
    // Taxable income / net income base (simplified)
    // Add other taxable items here as needed.
    let netIncomeForTax = employmentPensionable +
        clampNonNeg(inputs.selfEmploymentNetIncome) +
        clampNonNeg(inputs.taxableIncomeOther);
    // Spousal support: paid (deduction), received (inclusion)
    // (You should still gate deductibility/taxability elsewhere based on ITA requirements.)
    netIncomeForTax -= clampNonNeg(inputs.spousalSupportPaid);
    netIncomeForTax += clampNonNeg(inputs.spousalSupportReceived);
    // Child support is ignored for tax in Canada (no deduction/inclusion),
    // so do not include it in netIncomeForTax.
    // AFNI for benefits is often derived from net income; keep separate anyway.
    const afniForBenefits = netIncomeForTax;
    return { cppEiBase, netIncomeForTax, afniForBenefits };
}
function clampNonNegCCB(n) {
    return Number.isFinite(n) ? Math.max(0, n) : 0;
}
function getFirstTierRate(ccb, totalChildren) {
    if (totalChildren === 1)
        return ccb.reduction_rate_first_tier_one_child;
    if (totalChildren === 2)
        return ccb.reduction_rate_first_tier_two_children;
    if (totalChildren === 3)
        return ccb.reduction_rate_first_tier_three_children;
    return ccb.reduction_rate_first_tier_four_or_more_children;
}
function getSecondTierRate(ccb, totalChildren) {
    if (totalChildren === 1)
        return ccb.reduction_rate_second_tier_one_child;
    if (totalChildren === 2)
        return ccb.reduction_rate_second_tier_two_children;
    if (totalChildren === 3)
        return ccb.reduction_rate_second_tier_three_children;
    return ccb.reduction_rate_second_tier_four_or_more_children;
}
/**
 * Calculates annual CCB for a given year dataset.
 *
 * @param taxData - The loaded <year>.json object (must include Canada_Child_Benefit)
 * @param adjustedFamilyNetIncome - AFNI used for CCB reduction
 * @param childrenUnder6 - count of eligible children under 6 (in claimant's care arrangement described by `care`)
 * @param children6to17 - count of eligible children age 6-17 (same)
 * @param care - PRIMARY | SHARED | NONE (eligibility gate + 50% shared)
 */
function calculateCanadaChildBenefitFromYearData(taxData, adjustedFamilyNetIncome, childrenUnder6 = 0, children6to17 = 0, care = "PRIMARY") {
    const ccb = taxData.Canada_Child_Benefit;
    const u6 = clampNonNegCCB(childrenUnder6);
    const a6_17 = clampNonNegCCB(children6to17);
    const totalChildren = u6 + a6_17;
    // Eligibility / care gate (fixes "benefit with no children in primary care")
    if (totalChildren === 0)
        return 0;
    if (care === "NONE")
        return 0;
    const AFNI = clampNonNegCCB(adjustedFamilyNetIncome);
    // Base entitlement
    let benefit = u6 * ccb.base_amount_per_child_under_6 +
        a6_17 * ccb.base_amount_per_child_6_to_17;
    // Tier 1 reduction band
    if (AFNI > ccb.income_threshold_for_reduction) {
        const r1 = getFirstTierRate(ccb, totalChildren);
        const firstTierBand = Math.max(0, ccb.second_tier_threshold - ccb.income_threshold_for_reduction);
        const firstTierIncome = Math.min(AFNI - ccb.income_threshold_for_reduction, firstTierBand);
        benefit -= firstTierIncome * r1;
    }
    // Tier 2 reduction band
    if (AFNI > ccb.second_tier_threshold) {
        const r2 = getSecondTierRate(ccb, totalChildren);
        const secondTierIncome = AFNI - ccb.second_tier_threshold;
        benefit -= secondTierIncome * r2;
    }
    // Clamp to zero before care adjustment
    benefit = Math.max(0, benefit);
    // Shared custody: 50% per your rule
    const careFactor = care === "SHARED" ? 0.5 : 1.0;
    return Math.max(0, benefit * careFactor);
}
/**
 * Tax Calculator class that can work with any tax year
 */
class TaxCalculator {
    constructor(year, dataDirectory) {
        this.year = year;
        this.taxData = this.loadTaxData(year, dataDirectory);
    }
    /**
     * Load tax data for a specific year
     */
    loadTaxData(year, dataDirectory) {
        const dir = dataDirectory || __dirname;
        const filePath = path.join(dir, `${year}.json`);
        if (!fs.existsSync(filePath)) {
            throw new Error(`Tax data file not found for year ${year}: ${filePath}`);
        }
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(fileContent);
    }
    /**
     * Calculate federal tax based on taxable income
     */
    calculateFederalTax(taxableIncome) {
        var _a;
        if (taxableIncome <= 0)
            return 0;
        let tax = 0;
        const brackets = this.taxData.federal_taxable_income_brackets;
        const rates = this.taxData.federal_tax_rates;
        for (let i = 0; i < brackets.length; i++) {
            const bracket = brackets[i];
            const rate = rates[bracket.index.toString()];
            if (taxableIncome > bracket.min) {
                const upperLimit = (_a = bracket.max) !== null && _a !== void 0 ? _a : taxableIncome;
                const taxableInBracket = Math.min(taxableIncome, upperLimit) - bracket.min;
                tax += taxableInBracket * rate;
            }
        }
        return tax;
    }
    /**
     * Calculate provincial tax based on taxable income
     */
    calculateProvincialTax(taxableIncome) {
        var _a;
        if (taxableIncome <= 0)
            return 0;
        let tax = 0;
        const brackets = this.taxData.provincial_taxable_income_brackets;
        const rates = this.taxData.provincial_tax_rates;
        for (let i = 0; i < brackets.length; i++) {
            const bracket = brackets[i];
            const rate = rates[bracket.index.toString()];
            if (taxableIncome > bracket.min) {
                const upperLimit = (_a = bracket.max) !== null && _a !== void 0 ? _a : taxableIncome;
                const taxableInBracket = Math.min(taxableIncome, upperLimit) - bracket.min;
                tax += taxableInBracket * rate;
            }
        }
        return tax;
    }
    /**
     * Calculate marginal tax rate (combined federal + provincial)
     */
    calculateMarginalTaxRate(taxableIncome) {
        let federalRate = 0;
        let provincialRate = 0;
        // Find federal rate
        const federalBrackets = this.taxData.federal_taxable_income_brackets;
        for (const bracket of federalBrackets) {
            if (taxableIncome > bracket.min) {
                if (bracket.max === null || taxableIncome <= bracket.max) {
                    federalRate = this.taxData.federal_tax_rates[bracket.index.toString()];
                    break;
                }
            }
        }
        // Find provincial rate
        const provincialBrackets = this.taxData.provincial_taxable_income_brackets;
        for (const bracket of provincialBrackets) {
            if (taxableIncome > bracket.min) {
                if (bracket.max === null || taxableIncome <= bracket.max) {
                    provincialRate = this.taxData.provincial_tax_rates[bracket.index.toString()];
                    break;
                }
            }
        }
        return (federalRate + provincialRate) * 100;
    }
    /**
     * Calculate Ontario two-tier surtax
     */
    calculateOntarioSurtax(basicProvincialTax) {
        var _a;
        const B = Math.max(0, basicProvincialTax || 0);
        const tiers = this.taxData.two_tier_surtax.tiers;
        let surtax = 0;
        for (const t of tiers) {
            const lower = t.basic_tax_range.greater_than;
            const upper = (_a = t.basic_tax_range.up_to) !== null && _a !== void 0 ? _a : Infinity;
            const taxableInTier = Math.max(0, Math.min(B, upper) - lower);
            surtax += taxableInTier * t.rate;
        }
        // currency rounding if your engine expects cents
        return Math.round(surtax * 100) / 100;
    }
    /**
     * Calculate Ontario Health Premium
     */
    calculateOntarioHealthPremium(taxableIncome) {
        const TI = Math.max(0, taxableIncome || 0);
        let ohp = 0;
        if (TI <= 20000)
            ohp = 0;
        else if (TI <= 36000)
            ohp = Math.min(300, 0.06 * (TI - 20000));
        else if (TI <= 48000)
            ohp = Math.min(450, 300 + 0.06 * (TI - 36000));
        else if (TI <= 72000)
            ohp = Math.min(600, 450 + 0.25 * (TI - 48000));
        else if (TI <= 200000)
            ohp = Math.min(750, 600 + 0.25 * (TI - 72000));
        else
            ohp = Math.min(900, 750 + 0.25 * (TI - 200000));
        // typical rounding convention
        return Math.round(ohp * 100) / 100;
    }
    /**
     * Calculate CPP contributions from locked base income
     * Uses employmentIncomePensionable (NEVER affected by support payments)
     */
    calculateCPPContribution(info) {
        var _a;
        const cpp = this.taxData.CPP_contribution_rates;
        // Use employmentIncomePensionable if provided, otherwise fallback to income
        // This ensures CPP is calculated on gross employment income before support adjustments
        let cppBaseIncome = (_a = info.employmentIncomePensionable) !== null && _a !== void 0 ? _a : info.income;
        // If self-employed, use selfEmploymentNetIncome if provided
        if (info.isSelfEmployed && info.selfEmploymentNetIncome !== undefined) {
            cppBaseIncome = info.selfEmploymentNetIncome;
        }
        const YMPE = cpp.maximum_pensionable_earnings;
        const YBE = cpp.yearly_basic_exemption;
        const pensionable = Math.min(clampNonNeg(cppBaseIncome), YMPE);
        const contributory = Math.max(0, pensionable - YBE);
        if (contributory === 0)
            return 0;
        const rate = info.isSelfEmployed ? cpp.self_employed_rate : cpp.employee_rate;
        let contribution = contributory * rate;
        // Cap employee contribution if present in JSON
        if (!info.isSelfEmployed && Number.isFinite(cpp.maximum_employee_contribution)) {
            contribution = Math.min(contribution, cpp.maximum_employee_contribution);
        }
        return Math.round(contribution * 100) / 100;
    }
    /**
     * Calculate EI premiums from locked base income
     * Uses employmentIncomePensionable (NEVER affected by support payments)
     */
    calculateEIPremium(info) {
        var _a;
        const ei = this.taxData.EI_premium_rates;
        // Use employmentIncomePensionable if provided, otherwise fallback to income
        const eiBaseIncome = (_a = info.employmentIncomePensionable) !== null && _a !== void 0 ? _a : info.income;
        const insurableEarnings = Math.min(clampNonNeg(eiBaseIncome), ei.maximum_insurable_earnings);
        let premium = insurableEarnings * ei.employee_rate;
        // Cap employee premium if present in JSON
        if (Number.isFinite(ei.maximum_employee_premium)) {
            premium = Math.min(premium, ei.maximum_employee_premium);
        }
        return Math.round(premium * 100) / 100;
    }
    /**
     * Calculate federal non-refundable tax credits
     */
    calculateFederalNonRefundableCredits(info) {
        const credits = this.taxData.non_refundable_tax_credits;
        const federalCreditRate = 0.15; // Federal lowest rate
        let totalCredits = credits.basic_personal_amount;
        // Spouse or common-law partner amount
        if (info.hasSpouse && info.spouseIncome !== undefined) {
            const spouseAmount = Math.max(0, credits.spouse_or_common_law_partner_amount_max - info.spouseIncome);
            totalCredits += spouseAmount;
        }
        // Age amount (if 65 or older)
        if (info.age && info.age >= 65) {
            totalCredits += credits.age_amount_max;
        }
        // Pension income amount
        if (info.pensionIncome && info.pensionIncome > 0) {
            totalCredits += Math.min(info.pensionIncome, credits.pension_income_amount_max);
        }
        // Medical expenses
        if (info.medicalExpenses && info.medicalExpenses > 0) {
            const threshold = Math.min(credits.medical_expense_threshold.fixed, info.income * credits.medical_expense_threshold.percent_of_net_income);
            const claimableExpenses = Math.max(0, info.medicalExpenses - threshold);
            totalCredits += claimableExpenses;
        }
        // Charitable donations
        if (info.charitableDonations && info.charitableDonations > 0) {
            if (info.charitableDonations <= 200) {
                totalCredits += info.charitableDonations * credits.donation_credit.first_200_rate / federalCreditRate;
            }
            else {
                totalCredits += 200 * credits.donation_credit.first_200_rate / federalCreditRate;
                totalCredits += (info.charitableDonations - 200) * credits.donation_credit.exceeding_200_rate / federalCreditRate;
            }
        }
        return totalCredits * federalCreditRate;
    }
    /**
     * Calculate Ontario non-refundable tax credits using comprehensive module
     */
    calculateOntarioNonRefundableCredits(info) {
        const input = {
            // Use net income for threshold calculations
            netIncome: info.income,
            // Medical expenses
            medicalExpensesPaid: info.medicalExpenses,
            // Donations
            donations: info.charitableDonations,
            // Pension
            pensionAmount: info.pensionIncome && info.pensionIncome > 0
                ? Math.min(info.pensionIncome, this.taxData.non_refundable_tax_credits.pension_income_amount_max)
                : 0,
            // Age amount (if 65 or older)
            ageAmount: info.age && info.age >= 65
                ? this.taxData.non_refundable_tax_credits.age_amount_max
                : 0,
            // Spouse amount
            spouseOrCLPAmount: info.hasSpouse && info.spouseIncome !== undefined
                ? Math.max(0, this.taxData.non_refundable_tax_credits.spouse_or_common_law_partner_amount_max - info.spouseIncome)
                : 0,
        };
        return calcOntarioNonRefundableTaxCredits(input, this.taxData);
    }
    /**
     * Calculate Canada Child Benefit (wrapper for the new function)
     */
    calculateCanadaChildBenefit(adjustedFamilyNetIncome, childrenUnder6 = 0, children6to17 = 0, care = "PRIMARY") {
        return calculateCanadaChildBenefitFromYearData(this.taxData, adjustedFamilyNetIncome, childrenUnder6, children6to17, care);
    }
    /**
     * Calculate Ontario Child Benefit
     */
    calculateOntarioChildBenefit(adjustedFamilyNetIncome, numberOfChildren = 0) {
        if (numberOfChildren === 0)
            return 0;
        const ocbData = this.taxData.ontario_child_benefit;
        let benefit = numberOfChildren * ocbData.maximum_per_child_under_18;
        if (adjustedFamilyNetIncome > ocbData.benefit_reduction_threshold_8pct_over) {
            const excessIncome = adjustedFamilyNetIncome - ocbData.benefit_reduction_threshold_8pct_over;
            benefit -= excessIncome * ocbData.reduction_rate;
        }
        return Math.max(0, benefit);
    }
    /**
     * Calculate Climate Action Incentive
     */
    calculateClimateActionIncentive(isSingle, numberOfChildren = 0) {
        const caiData = this.taxData.Climate_Action_Incentive;
        let benefit = isSingle ? caiData.base_amount_single : caiData.base_amount_couple;
        benefit += numberOfChildren * caiData.base_amount_per_child;
        return benefit;
    }
    /**
     * Calculate Canada Worker Benefit
     */
    calculateCanadaWorkerBenefit(workingIncome, adjustedNetIncome, isSingle) {
        const cwbData = this.taxData.Canada_Worker_Benefit;
        // Calculate base benefit
        let benefit = Math.max(0, (workingIncome - cwbData.base_amount) * cwbData.base_amount_rate);
        // Apply maximum
        const maxBenefit = isSingle ? cwbData.maximum_benefit_single : cwbData.maximum_benefit_family;
        benefit = Math.min(benefit, maxBenefit);
        // Phase out
        const phaseOutThreshold = isSingle ? cwbData.phase_out_threshold_single : cwbData.phase_out_threshold_family;
        if (adjustedNetIncome > phaseOutThreshold) {
            const reduction = (adjustedNetIncome - phaseOutThreshold) * cwbData.phase_out_rate;
            benefit = Math.max(0, benefit - reduction);
        }
        return benefit;
    }
    /**
     * Calculate GST/HST Credit
     */
    calculateGSTHSTCredit(adjustedFamilyNetIncome, isSingle, numberOfChildren = 0) {
        const gstData = this.taxData.GST_HST_Credit;
        let credit = isSingle ? gstData.base_amount_single : gstData.base_amount_couple;
        credit += numberOfChildren * gstData.base_amount_per_child;
        // Phase out
        const threshold = isSingle ? gstData.income_threshold_single : gstData.income_threshold_couple;
        if (adjustedFamilyNetIncome > threshold) {
            const reduction = (adjustedFamilyNetIncome - threshold) * gstData.phase_out_rate;
            credit = Math.max(0, credit - reduction);
        }
        return credit;
    }
    /**
     * Calculate LIFT Credit (Low Income Individuals and Families Tax Credit)
     */
    calculateLIFTCredit(adjustedNetIncome, isSingle, adjustedFamilyNetIncome) {
        const liftData = this.taxData.lift_credit;
        let credit = isSingle ? liftData.maximum_credit_single : liftData.maximum_credit_couple;
        // Phase out based on appropriate income
        const incomeForPhaseOut = isSingle ? adjustedNetIncome : (adjustedFamilyNetIncome !== null && adjustedFamilyNetIncome !== void 0 ? adjustedFamilyNetIncome : adjustedNetIncome);
        const threshold = isSingle ? liftData.income_threshold_single : liftData.income_threshold_couple;
        if (incomeForPhaseOut > threshold) {
            const reduction = (incomeForPhaseOut - threshold) * liftData.phase_out_rate;
            credit = Math.max(0, credit - reduction);
        }
        return credit;
    }
    /**
     * Calculate Ontario Tax Reduction
     */
    calculateOntarioTaxReduction(provincialTax, surtax, taxableIncome, numberOfDependentsWithImpairment = 0) {
        const reductionData = this.taxData.ontario_tax_reduction;
        let reduction = reductionData.basic_reduction;
        reduction += numberOfDependentsWithImpairment *
            reductionData.reduction_for_each_child_or_dependent_with_impairment;
        // The reduction is phased out based on income (simplified formula)
        if (taxableIncome > 20000) {
            const phaseOutRate = 0.05; // 5% reduction per $1000 over threshold
            const excessIncome = taxableIncome - 20000;
            const phaseOut = (excessIncome / 1000) * reduction * phaseOutRate;
            reduction = Math.max(0, reduction - phaseOut);
        }
        // Can't exceed the sum of provincial tax and surtax
        return Math.min(reduction, provincialTax + surtax);
    }
    /**
     * Calculate all benefits
     */
    calculateAllBenefits(info) {
        var _a, _b, _c, _d;
        const adjustedFamilyNetIncome = info.income + ((_a = info.spouseIncome) !== null && _a !== void 0 ? _a : 0);
        const isSingle = !info.hasSpouse;
        const numberOfChildren = ((_b = info.childrenUnder6) !== null && _b !== void 0 ? _b : 0) + ((_c = info.children6to17) !== null && _c !== void 0 ? _c : 0);
        const canadaChildBenefit = this.calculateCanadaChildBenefit(adjustedFamilyNetIncome, info.childrenUnder6, info.children6to17, (_d = info.careArrangement) !== null && _d !== void 0 ? _d : "PRIMARY");
        const ontarioChildBenefit = this.calculateOntarioChildBenefit(adjustedFamilyNetIncome, numberOfChildren);
        const climateActionIncentive = this.calculateClimateActionIncentive(isSingle, numberOfChildren);
        const canadaWorkerBenefit = this.calculateCanadaWorkerBenefit(info.income, info.income, isSingle);
        const gstHstCredit = this.calculateGSTHSTCredit(adjustedFamilyNetIncome, isSingle, numberOfChildren);
        const liftCredit = this.calculateLIFTCredit(info.income, isSingle, adjustedFamilyNetIncome);
        // Ontario Trillium Benefit (simplified - would need more detailed calculation)
        const ontarioTrilliumBenefit = 0;
        const totalBenefits = canadaChildBenefit + ontarioChildBenefit + climateActionIncentive +
            canadaWorkerBenefit + gstHstCredit + liftCredit + ontarioTrilliumBenefit;
        return {
            canadaChildBenefit,
            ontarioChildBenefit,
            climateActionIncentive,
            canadaWorkerBenefit,
            gstHstCredit,
            liftCredit,
            ontarioTrilliumBenefit,
            totalBenefits
        };
    }
    /**
     * Main comprehensive tax calculation
     */
    calculateCompleteTaxAndBenefits(info) {
        const grossIncome = info.income;
        // Calculate CPP/EI on employment income (NOT adjusted by support)
        const cppContribution = this.calculateCPPContribution(info);
        const eiPremium = info.isSelfEmployed ? 0 : this.calculateEIPremium(info);
        const totalDeductions = cppContribution + eiPremium;
        // Calculate taxable income (simplified - would need more deductions in real scenario)
        const taxableIncome = grossIncome - totalDeductions;
        // Calculate taxes
        const federalTaxBeforeCredits = this.calculateFederalTax(taxableIncome);
        const provincialTaxBeforeCredits = this.calculateProvincialTax(taxableIncome);
        // Calculate credits
        const federalCredits = this.calculateFederalNonRefundableCredits(info);
        const ontarioNRTCResult = this.calculateOntarioNonRefundableCredits(info);
        const provincialCredits = ontarioNRTCResult.totalOntarioNRTCValue;
        // Provincial tax after credits but before surtax
        const provincialTaxAfterCredits = Math.max(0, provincialTaxBeforeCredits - provincialCredits);
        const provincialSurtax = this.calculateOntarioSurtax(provincialTaxAfterCredits);
        const ontarioHealthPremium = this.calculateOntarioHealthPremium(taxableIncome);
        const ontarioTaxReduction = this.calculateOntarioTaxReduction(provincialTaxAfterCredits, provincialSurtax, taxableIncome, info.childrenWithImpairment);
        // Final taxes
        const federalTax = Math.max(0, federalTaxBeforeCredits - federalCredits);
        const provincialTax = Math.max(0, provincialTaxAfterCredits + provincialSurtax + ontarioHealthPremium - ontarioTaxReduction);
        const totalTax = federalTax + provincialTax;
        // Calculate benefits
        const benefits = this.calculateAllBenefits(info);
        // Calculate net income
        const netIncome = grossIncome - totalDeductions - totalTax + benefits.totalBenefits;
        // Calculate rates
        const effectiveTaxRate = (totalTax / grossIncome) * 100;
        const marginalTaxRate = this.calculateMarginalTaxRate(taxableIncome);
        return {
            year: this.year,
            grossIncome,
            federalTax,
            provincialTax,
            provincialSurtax,
            ontarioTaxReduction,
            cppContribution,
            eiPremium,
            totalTax,
            totalDeductions,
            netIncome,
            federalCredits,
            provincialCredits,
            benefits,
            effectiveTaxRate,
            marginalTaxRate
        };
    }
    /**
     * Calculate spousal support impact
     */
    calculateSpousalSupportImpact(payorIncome, recipientIncome, spousalSupportAmount, payorInfo = {}, recipientInfo = {}) {
        // Calculate payor before support
        const payorBeforeSupport = this.calculateCompleteTaxAndBenefits(Object.assign({ income: payorIncome, hasSpouse: false }, payorInfo));
        // Calculate payor after support (spousal support is deductible)
        const payorAfterSupport = this.calculateCompleteTaxAndBenefits(Object.assign({ income: payorIncome - spousalSupportAmount, hasSpouse: false }, payorInfo));
        // Calculate recipient before support
        const recipientBeforeSupport = this.calculateCompleteTaxAndBenefits(Object.assign({ income: recipientIncome, hasSpouse: false }, recipientInfo));
        // Calculate recipient after support (spousal support is taxable)
        const recipientAfterSupport = this.calculateCompleteTaxAndBenefits(Object.assign({ income: recipientIncome + spousalSupportAmount, hasSpouse: false }, recipientInfo));
        const payorNetCost = payorBeforeSupport.netIncome - payorAfterSupport.netIncome;
        const recipientNetBenefit = recipientAfterSupport.netIncome - recipientBeforeSupport.netIncome;
        // Tax efficiency: how much of the support amount is retained after taxes
        const taxEfficiency = (recipientNetBenefit / spousalSupportAmount) * 100;
        return {
            payorBeforeSupport,
            payorAfterSupport,
            recipientBeforeSupport,
            recipientAfterSupport,
            payorNetCost,
            recipientNetBenefit,
            taxEfficiency
        };
    }
    /**
     * Get the tax year this calculator is using
     */
    getYear() {
        return this.year;
    }
    /**
     * Get the province this calculator is using
     */
    getProvince() {
        return this.taxData.province;
    }
}
exports.TaxCalculator = TaxCalculator;
/**
 * Factory function to create a tax calculator for a specific year
 */
function createTaxCalculator(year, dataDirectory) {
    return new TaxCalculator(year, dataDirectory);
}
/**
 * Get list of available tax years
 */
function getAvailableYears(dataDirectory) {
    const dir = dataDirectory || __dirname;
    try {
        const files = fs.readdirSync(dir);
        const years = [];
        files.forEach((file) => {
            const match = file.match(/^(\d{4})\.json$/);
            if (match) {
                years.push(parseInt(match[1], 10));
            }
        });
        return years.sort((a, b) => a - b);
    }
    catch (_a) {
        return [];
    }
}
/**
 * Compare tax calculations across multiple years
 */
function compareTaxYears(years, info, dataDirectory) {
    return years.map(year => {
        const calculator = new TaxCalculator(year, dataDirectory);
        return calculator.calculateCompleteTaxAndBenefits(info);
    });
}
/**
 * Calculate Ontario Health Premium (standalone function)
 */
function calcOntarioHealthPremium(taxableIncome) {
    const TI = Math.max(0, taxableIncome || 0);
    let ohp = 0;
    if (TI <= 20000)
        ohp = 0;
    else if (TI <= 36000)
        ohp = Math.min(300, 0.06 * (TI - 20000));
    else if (TI <= 48000)
        ohp = Math.min(450, 300 + 0.06 * (TI - 36000));
    else if (TI <= 72000)
        ohp = Math.min(600, 450 + 0.25 * (TI - 48000));
    else if (TI <= 200000)
        ohp = Math.min(750, 600 + 0.25 * (TI - 72000));
    else
        ohp = Math.min(900, 750 + 0.25 * (TI - 200000));
    // typical rounding convention
    return Math.round(ohp * 100) / 100;
}
function clampNonNeg(n) {
    if (n === undefined || n === null)
        return 0;
    const x = Number(n);
    return Number.isFinite(x) ? Math.max(0, x) : 0;
}
function round2(n) {
    return Math.round(n * 100) / 100;
}
function getLowestOntarioRate(yearData) {
    var _a;
    const r = (_a = yearData.provincial_tax_rates) === null || _a === void 0 ? void 0 : _a["1"];
    if (typeof r !== "number" || !Number.isFinite(r) || r <= 0) {
        throw new Error(`Ontario year ${yearData.year}: provincial_tax_rates["1"] missing/invalid (lowest ON rate).`);
    }
    return r;
}
function calcOntarioMedicalBase(input, yearData) {
    var _a;
    const expenses = clampNonNeg(input.medicalExpensesPaid);
    if (expenses <= 0)
        return 0;
    const thr = (_a = yearData.non_refundable_tax_credits) === null || _a === void 0 ? void 0 : _a.medical_expense_threshold;
    if (!thr)
        return 0;
    const fixed = Number(thr.fixed);
    const pct = Number(thr.percent_of_net_income);
    if (!Number.isFinite(fixed) || fixed < 0) {
        throw new Error(`Ontario year ${yearData.year}: medical_expense_threshold.fixed invalid.`);
    }
    if (!Number.isFinite(pct) || pct < 0) {
        throw new Error(`Ontario year ${yearData.year}: medical_expense_threshold.percent_of_net_income invalid.`);
    }
    const netIncome = clampNonNeg(input.netIncome);
    const threshold = Math.min(fixed, netIncome * pct);
    return Math.max(0, expenses - threshold);
}
function calcOntarioDonationCreditValue(donations, yearData) {
    var _a;
    const d = clampNonNeg(donations);
    if (d <= 0) {
        return { donationBaseFirst200: 0, donationBaseOver200: 0, donationCreditValue: 0 };
    }
    const sched = (_a = yearData.non_refundable_tax_credits) === null || _a === void 0 ? void 0 : _a.donation_credit;
    if (!sched) {
        // If your historical JSONs omit donation rates, treat as 0 rather than guessing.
        return { donationBaseFirst200: 0, donationBaseOver200: 0, donationCreditValue: 0 };
    }
    const r1 = Number(sched.first_200_rate);
    const r2 = Number(sched.exceeding_200_rate);
    if (!Number.isFinite(r1) || r1 < 0) {
        throw new Error(`Ontario year ${yearData.year}: donation_credit.first_200_rate invalid.`);
    }
    if (!Number.isFinite(r2) || r2 < 0) {
        throw new Error(`Ontario year ${yearData.year}: donation_credit.exceeding_200_rate invalid.`);
    }
    const baseFirst200 = Math.min(d, 200);
    const baseOver200 = Math.max(0, d - 200);
    const credit = baseFirst200 * r1 + baseOver200 * r2;
    return {
        donationBaseFirst200: baseFirst200,
        donationBaseOver200: baseOver200,
        donationCreditValue: credit,
    };
}
/**
 * Main entry point: returns the VALUE (tax reduction) of Ontario non-refundable credits.
 * Inputs are eligible "amount bases" unless otherwise noted (donations/medical).
 */
function calcOntarioNonRefundableTaxCredits(input, yearData) {
    var _a, _b;
    const lowestRate = getLowestOntarioRate(yearData);
    // Default BPA to year JSON if caller didn't provide it.
    const bpa = input.basicPersonalAmount !== undefined
        ? clampNonNeg(input.basicPersonalAmount)
        : clampNonNeg((_a = yearData.non_refundable_tax_credits) === null || _a === void 0 ? void 0 : _a.basic_personal_amount);
    // Standard bases (valued at lowest ON rate)
    const standardBaseSum = bpa +
        clampNonNeg(input.spouseOrCLPAmount) +
        clampNonNeg(input.eligibleDependentAmount) +
        clampNonNeg(input.caregiverAmount) +
        clampNonNeg(input.ageAmount) +
        clampNonNeg(input.pensionAmount) +
        clampNonNeg(input.disabilityAmount) +
        clampNonNeg(input.disabilitySupplement) +
        clampNonNeg(input.adoptionExpenses);
    const standardCreditValue = standardBaseSum * lowestRate;
    // Medical (base above threshold, then valued at lowest ON rate)
    const medicalBase = calcOntarioMedicalBase(input, yearData);
    const medicalCreditValue = medicalBase * lowestRate;
    // Donations (two-rate schedule)
    const donation = calcOntarioDonationCreditValue((_b = input.donations) !== null && _b !== void 0 ? _b : 0, yearData);
    const totalOntarioNRTCValue = standardCreditValue + medicalCreditValue + donation.donationCreditValue;
    return {
        year: yearData.year,
        lowestRate,
        standardBaseSum: round2(standardBaseSum),
        medicalBase: round2(medicalBase),
        donationBaseFirst200: round2(donation.donationBaseFirst200),
        donationBaseOver200: round2(donation.donationBaseOver200),
        standardCreditValue: round2(standardCreditValue),
        medicalCreditValue: round2(medicalCreditValue),
        donationCreditValue: round2(donation.donationCreditValue),
        totalOntarioNRTCValue: round2(totalOntarioNRTCValue),
    };
}
exports.default = TaxCalculator;
