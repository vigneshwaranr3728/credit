// types/index.ts - All TypeScript type definitions

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type EmploymentType = 'salaried' | 'self-employed' | 'business' | 'freelance' | 'unemployed';
export type LoanPurpose = 'home' | 'education' | 'vehicle' | 'medical' | 'personal' | 'business';
export type RepaymentHistory = 'excellent' | 'good' | 'fair' | 'poor' | 'no-history';

export interface BorrowerProfile {
  id: string;
  name: string;
  age: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  loanAmount: number;
  loanTenureMonths: number;
  existingEMI: number;
  creditScore: number;
  employmentType: EmploymentType;
  loanPurpose: LoanPurpose;
  dependents: number;
  repaymentHistory: RepaymentHistory;
  collateral: boolean;
  collateralValue: number;
}

export interface RiskMetrics {
  overallScore: number;
  riskLevel: RiskLevel;
  dtiRatio: number;        // Debt-to-Income Ratio
  emiAffordability: number; // % of income going to EMI
  creditUtilization: number;
  savingsRatio: number;
  riskFactors: RiskFactor[];
  positiveFactors: PositiveFactor[];
  recommendation: string;
  monthlyEMI: number;
  totalInterest: number;
  totalPayable: number;
}

export interface RiskFactor {
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  impact: number; // 0-100
}

export interface PositiveFactor {
  category: string;
  description: string;
  benefit: number; // 0-100
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color: string;
}

export interface HistoricalPattern {
  month: string;
  defaultRate: number;
  approvalRate: number;
  avgCreditScore: number;
}

export interface RiskDistribution {
  low: number;
  medium: number;
  high: number;
  critical: number;
}
