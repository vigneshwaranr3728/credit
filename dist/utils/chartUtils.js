// utils/chartUtils.ts - Chart rendering utilities
export function drawGauge(canvas, score, riskLevel) {
    const ctx = canvas.getContext('2d');
    if (!ctx)
        return;
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const cx = W / 2;
    const cy = H * 0.72;
    const radius = Math.min(W, H) * 0.38;
    // Background arc
    ctx.beginPath();
    ctx.arc(cx, cy, radius, Math.PI, 2 * Math.PI);
    ctx.lineWidth = 18;
    ctx.strokeStyle = '#e5e7eb';
    ctx.stroke();
    // Color gradient arc
    const colors = {
        LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#ef4444', CRITICAL: '#7c3aed'
    };
    const angle = Math.PI + (score / 100) * Math.PI;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, Math.PI, angle);
    ctx.lineWidth = 18;
    ctx.strokeStyle = colors[riskLevel];
    ctx.lineCap = 'round';
    ctx.stroke();
    // Score text
    ctx.fillStyle = '#111827';
    ctx.font = `bold ${W * 0.1}px 'Sora', sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(score.toString(), cx, cy - 8);
    ctx.fillStyle = '#6b7280';
    ctx.font = `${W * 0.055}px 'Sora', sans-serif`;
    ctx.fillText('Risk Score', cx, cy + 18);
    ctx.fillStyle = colors[riskLevel];
    ctx.font = `bold ${W * 0.065}px 'Sora', sans-serif`;
    ctx.fillText(riskLevel, cx, cy + 42);
}
export function drawBarChart(canvas, data) {
    const ctx = canvas.getContext('2d');
    if (!ctx)
        return;
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const padding = { top: 20, right: 20, bottom: 40, left: 110 };
    const chartW = W - padding.left - padding.right;
    const chartH = H - padding.top - padding.bottom;
    const barH = Math.min(32, (chartH / data.length) - 10);
    data.forEach((item, i) => {
        const y = padding.top + i * (chartH / data.length) + (chartH / data.length - barH) / 2;
        const barW = (item.value / item.maxValue) * chartW;
        // Background bar
        ctx.fillStyle = '#f3f4f6';
        ctx.beginPath();
        ctx.roundRect(padding.left, y, chartW, barH, 4);
        ctx.fill();
        // Value bar
        ctx.fillStyle = item.color;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.roundRect(padding.left, y, Math.max(4, barW), barH, 4);
        ctx.fill();
        ctx.globalAlpha = 1;
        // Label
        ctx.fillStyle = '#374151';
        ctx.font = `600 12px 'Sora', sans-serif`;
        ctx.textAlign = 'right';
        ctx.fillText(item.label, padding.left - 8, y + barH / 2 + 4);
        // Value
        ctx.fillStyle = '#6b7280';
        ctx.font = `500 11px 'Sora', sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText(`${item.value.toFixed(1)}%`, padding.left + barW + 6, y + barH / 2 + 4);
    });
}
export function drawDonutChart(canvas, data) {
    const ctx = canvas.getContext('2d');
    if (!ctx)
        return;
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const cx = W / 2;
    const cy = H / 2 - 10;
    const outerR = Math.min(W, H) * 0.32;
    const innerR = outerR * 0.62;
    const total = data.reduce((s, d) => s + d.value, 0);
    let startAngle = -Math.PI / 2;
    data.forEach(item => {
        const sliceAngle = (item.value / total) * 2 * Math.PI;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, outerR, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = item.color;
        ctx.fill();
        startAngle += sliceAngle;
    });
    // Donut hole
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    // Legend
    const legendY = H - 22;
    const legendSpacing = W / (data.length + 1);
    data.forEach((item, i) => {
        const lx = legendSpacing * (i + 1);
        ctx.fillStyle = item.color;
        ctx.fillRect(lx - 22, legendY - 6, 12, 12);
        ctx.fillStyle = '#6b7280';
        ctx.font = '10px Sora, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${item.label} ${item.value}%`, lx - 6, legendY + 4);
    });
}
export function metricsToBarData(metrics) {
    return [
        { label: 'DTI Ratio', value: metrics.dtiRatio, maxValue: 100, color: metrics.dtiRatio > 50 ? '#ef4444' : metrics.dtiRatio > 40 ? '#f59e0b' : '#10b981' },
        { label: 'EMI Burden', value: metrics.emiAffordability, maxValue: 100, color: metrics.emiAffordability > 40 ? '#ef4444' : metrics.emiAffordability > 30 ? '#f59e0b' : '#10b981' },
        { label: 'Credit Usage', value: metrics.creditUtilization, maxValue: 100, color: metrics.creditUtilization > 70 ? '#ef4444' : metrics.creditUtilization > 40 ? '#f59e0b' : '#10b981' },
        { label: 'Savings Rate', value: Math.max(0, metrics.savingsRatio), maxValue: 100, color: metrics.savingsRatio < 10 ? '#ef4444' : metrics.savingsRatio < 20 ? '#f59e0b' : '#10b981' }
    ];
}
//# sourceMappingURL=chartUtils.js.map