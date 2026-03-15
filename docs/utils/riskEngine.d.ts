import { BorrowerProfile, RiskMetrics, RiskLevel } from '../types/index.js';
export declare function calculateMonthlyEMI(principal: number, annualRate: number, months: number): number;
export declare function getInterestRate(profile: BorrowerProfile): number;
export declare function analyzeRisk(profile: BorrowerProfile): RiskMetrics;
export declare function getRiskColor(level: RiskLevel): string;
export declare function generateSampleProfiles(): BorrowerProfile[];
//# sourceMappingURL=riskEngine.d.ts.map