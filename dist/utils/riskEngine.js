// utils/riskEngine.ts - Core risk calculation logic
export function calculateMonthlyEMI(principal, annualRate, months) {
    const r = annualRate / 12 / 100;
    if (r === 0)
        return principal / months;
    return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}
export function getInterestRate(profile) {
    let baseRate = 10;
    if (profile.creditScore >= 750)
        baseRate = 8;
    else if (profile.creditScore >= 700)
        baseRate = 10;
    else if (profile.creditScore >= 650)
        baseRate = 13;
    else if (profile.creditScore >= 600)
        baseRate = 16;
    else
        baseRate = 20;
    if (profile.employmentType === 'salaried')
        baseRate -= 0.5;
    if (profile.collateral)
        baseRate -= 1;
    if (profile.repaymentHistory === 'excellent')
        baseRate -= 0.5;
    if (profile.repaymentHistory === 'poor')
        baseRate += 2;
    return Math.max(7, Math.min(24, baseRate));
}
export function analyzeRisk(profile) {
    const interestRate = getInterestRate(profile);
    const monthlyEMI = calculateMonthlyEMI(profile.loanAmount, interestRate, profile.loanTenureMonths);
    const totalPayable = monthlyEMI * profile.loanTenureMonths;
    const totalInterest = totalPayable - profile.loanAmount;
    const totalMonthlyObligations = monthlyEMI + profile.existingEMI;
    const dtiRatio = (totalMonthlyObligations / profile.monthlyIncome) * 100;
    const emiAffordability = (monthlyEMI / profile.monthlyIncome) * 100;
    const disposableIncome = profile.monthlyIncome - profile.monthlyExpenses - profile.existingEMI;
    const savingsRatio = (disposableIncome / profile.monthlyIncome) * 100;
    const creditUtilization = profile.creditScore < 650 ? 75 : profile.creditScore < 700 ? 55 : profile.creditScore < 750 ? 35 : 20;
    let score = 100;
    const riskFactors = [];
    const positiveFactors = [];
    // DTI Analysis
    if (dtiRatio > 50) {
        score -= 30;
        riskFactors.push({ category: 'Debt-to-Income', description: `DTI ratio is ${dtiRatio.toFixed(1)}% — severely over safe limit of 40%`, severity: 'high', impact: 30 });
    }
    else if (dtiRatio > 40) {
        score -= 15;
        riskFactors.push({ category: 'Debt-to-Income', description: `DTI ratio is ${dtiRatio.toFixed(1)}% — above recommended 40%`, severity: 'medium', impact: 15 });
    }
    else {
        positiveFactors.push({ category: 'Debt-to-Income', description: `Healthy DTI ratio of ${dtiRatio.toFixed(1)}%`, benefit: 20 });
    }
    // Credit Score
    if (profile.creditScore < 600) {
        score -= 25;
        riskFactors.push({ category: 'Credit Score', description: `Low credit score of ${profile.creditScore} — high default probability`, severity: 'high', impact: 25 });
    }
    else if (profile.creditScore < 650) {
        score -= 15;
        riskFactors.push({ category: 'Credit Score', description: `Below average credit score of ${profile.creditScore}`, severity: 'medium', impact: 15 });
    }
    else if (profile.creditScore >= 750) {
        positiveFactors.push({ category: 'Credit Score', description: `Excellent credit score of ${profile.creditScore}`, benefit: 25 });
    }
    else if (profile.creditScore >= 700) {
        positiveFactors.push({ category: 'Credit Score', description: `Good credit score of ${profile.creditScore}`, benefit: 15 });
    }
    // EMI Affordability
    if (emiAffordability > 40) {
        score -= 20;
        riskFactors.push({ category: 'EMI Burden', description: `EMI is ${emiAffordability.toFixed(1)}% of income — too high`, severity: 'high', impact: 20 });
    }
    else if (emiAffordability > 30) {
        score -= 10;
        riskFactors.push({ category: 'EMI Burden', description: `EMI is ${emiAffordability.toFixed(1)}% of income — borderline`, severity: 'medium', impact: 10 });
    }
    else {
        positiveFactors.push({ category: 'EMI Burden', description: `Manageable EMI of ${emiAffordability.toFixed(1)}% of income`, benefit: 15 });
    }
    // Savings
    if (savingsRatio < 10) {
        score -= 15;
        riskFactors.push({ category: 'Savings Buffer', description: `Very low savings ratio of ${savingsRatio.toFixed(1)}% — no emergency buffer`, severity: 'high', impact: 15 });
    }
    else if (savingsRatio < 20) {
        score -= 5;
        riskFactors.push({ category: 'Savings Buffer', description: `Thin savings margin of ${savingsRatio.toFixed(1)}%`, severity: 'low', impact: 5 });
    }
    else {
        positiveFactors.push({ category: 'Savings Buffer', description: `Healthy savings ratio of ${savingsRatio.toFixed(1)}%`, benefit: 15 });
    }
    // Employment
    if (profile.employmentType === 'unemployed') {
        score -= 30;
        riskFactors.push({ category: 'Employment', description: 'No stable income source — extremely high risk', severity: 'high', impact: 30 });
    }
    else if (profile.employmentType === 'freelance') {
        score -= 10;
        riskFactors.push({ category: 'Employment', description: 'Irregular income as freelancer increases uncertainty', severity: 'medium', impact: 10 });
    }
    else if (profile.employmentType === 'salaried') {
        positiveFactors.push({ category: 'Employment', description: 'Stable salaried income reduces default risk', benefit: 15 });
    }
    // Repayment History
    if (profile.repaymentHistory === 'poor') {
        score -= 20;
        riskFactors.push({ category: 'Repayment History', description: 'Poor repayment history — strong predictor of default', severity: 'high', impact: 20 });
    }
    else if (profile.repaymentHistory === 'fair') {
        score -= 8;
        riskFactors.push({ category: 'Repayment History', description: 'Fair repayment history with some missed payments', severity: 'medium', impact: 8 });
    }
    else if (profile.repaymentHistory === 'excellent') {
        positiveFactors.push({ category: 'Repayment History', description: 'Excellent repayment track record', benefit: 20 });
    }
    // Dependents
    if (profile.dependents > 3) {
        score -= 10;
        riskFactors.push({ category: 'Family Obligations', description: `${profile.dependents} dependents increases financial burden`, severity: 'medium', impact: 10 });
    }
    // Collateral
    if (profile.collateral && profile.collateralValue >= profile.loanAmount * 0.8) {
        positiveFactors.push({ category: 'Collateral', description: `Collateral of ₹${profile.collateralValue.toLocaleString('en-IN')} provides security`, benefit: 15 });
        score += 10;
    }
    // Loan Purpose
    if (profile.loanPurpose === 'education' || profile.loanPurpose === 'home') {
        positiveFactors.push({ category: 'Loan Purpose', description: `${profile.loanPurpose === 'home' ? 'Home' : 'Education'} loan has productive asset backing`, benefit: 10 });
        score += 5;
    }
    else if (profile.loanPurpose === 'personal') {
        score -= 5;
        riskFactors.push({ category: 'Loan Purpose', description: 'Personal loans have higher default rates', severity: 'low', impact: 5 });
    }
    score = Math.max(0, Math.min(100, score));
    let riskLevel;
    let recommendation;
    if (score >= 75) {
        riskLevel = 'LOW';
        recommendation = `✅ This loan application looks financially sound. EMI of ₹${monthlyEMI.toFixed(0)} is manageable. Proceed with standard documentation.`;
    }
    else if (score >= 55) {
        riskLevel = 'MEDIUM';
        recommendation = `⚠️ Moderate risk detected. Consider reducing loan amount by 20-30% or extending tenure. Ensure ₹${(profile.monthlyIncome * 0.3).toFixed(0)}/month buffer exists.`;
    }
    else if (score >= 35) {
        riskLevel = 'HIGH';
        recommendation = `🔴 High default risk. This loan may lead to debt trap for the borrower. Recommend financial counseling before proceeding.`;
    }
    else {
        riskLevel = 'CRITICAL';
        recommendation = `🚨 CRITICAL RISK: This loan is very likely to default. Income is insufficient to service debt. Do NOT proceed without major restructuring.`;
    }
    return {
        overallScore: score,
        riskLevel,
        dtiRatio,
        emiAffordability,
        creditUtilization,
        savingsRatio,
        riskFactors,
        positiveFactors,
        recommendation,
        monthlyEMI,
        totalInterest,
        totalPayable
    };
}
export function getRiskColor(level) {
    const colors = {
        LOW: '#10b981',
        MEDIUM: '#f59e0b',
        HIGH: '#ef4444',
        CRITICAL: '#7c3aed'
    };
    return colors[level];
}
export function generateSampleProfiles() {
    return [
        {
            id: 'P001', name: 'Ramesh Kumar', age: 32, monthlyIncome: 45000, monthlyExpenses: 20000,
            loanAmount: 500000, loanTenureMonths: 60, existingEMI: 5000, creditScore: 720,
            employmentType: 'salaried', loanPurpose: 'home', dependents: 2,
            repaymentHistory: 'good', collateral: true, collateralValue: 600000
        },
        {
            id: 'P002', name: 'Priya Devi', age: 28, monthlyIncome: 28000, monthlyExpenses: 18000,
            loanAmount: 300000, loanTenureMonths: 48, existingEMI: 8000, creditScore: 620,
            employmentType: 'self-employed', loanPurpose: 'personal', dependents: 1,
            repaymentHistory: 'fair', collateral: false, collateralValue: 0
        },
        {
            id: 'P003', name: 'Vijay Selvam', age: 45, monthlyIncome: 80000, monthlyExpenses: 30000,
            loanAmount: 2000000, loanTenureMonths: 120, existingEMI: 15000, creditScore: 780,
            employmentType: 'business', loanPurpose: 'business', dependents: 3,
            repaymentHistory: 'excellent', collateral: true, collateralValue: 2500000
        },
        {
            id: 'P004', name: 'Meena Lakshmi', age: 35, monthlyIncome: 22000, monthlyExpenses: 16000,
            loanAmount: 400000, loanTenureMonths: 36, existingEMI: 6000, creditScore: 580,
            employmentType: 'freelance', loanPurpose: 'medical', dependents: 4,
            repaymentHistory: 'poor', collateral: false, collateralValue: 0
        }
    ];
}
//# sourceMappingURL=riskEngine.js.map