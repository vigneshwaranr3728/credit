import { RiskMetrics, RiskLevel } from '../types/index.js';
export declare function drawGauge(canvas: HTMLCanvasElement, score: number, riskLevel: RiskLevel): void;
export declare function drawBarChart(canvas: HTMLCanvasElement, data: {
    label: string;
    value: number;
    maxValue: number;
    color: string;
}[]): void;
export declare function drawDonutChart(canvas: HTMLCanvasElement, data: {
    label: string;
    value: number;
    color: string;
}[]): void;
export declare function metricsToBarData(metrics: RiskMetrics): {
    label: string;
    value: number;
    maxValue: number;
    color: string;
}[];
//# sourceMappingURL=chartUtils.d.ts.map