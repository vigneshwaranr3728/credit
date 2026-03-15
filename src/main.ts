// main.ts - Application entry point and UI controller

import { BorrowerProfile, RiskMetrics, RiskLevel } from './types/index.js';
import { analyzeRisk, generateSampleProfiles, getInterestRate, calculateMonthlyEMI } from './utils/riskEngine.js';
import { drawGauge, drawBarChart, drawDonutChart, metricsToBarData } from './utils/chartUtils.js';

class CreditRiskApp {
  private currentProfile: BorrowerProfile | null = null;
  private currentMetrics: RiskMetrics | null = null;
  private darkMode: boolean = false;

  constructor() {
    this.init();
  }

  private init(): void {
    this.setupThemeToggle();
    this.setupNavigation();
    this.setupFormListeners();
    this.setupRangeSliders();
    this.setupSampleProfiles();
    this.setupQuickCalculator();
    this.loadDashboard();
    this.setupScrollAnimations();
    this.setupTooltips();
    this.setupTabSwitcher();
    this.animateCounters();
  }

  // ─── Theme Toggle ───────────────────────────────────────────────────────────
  private setupThemeToggle(): void {
    const toggle = document.getElementById('themeToggle') as HTMLButtonElement;
    const root = document.documentElement;

    toggle?.addEventListener('click', () => {
      this.darkMode = !this.darkMode;
      root.setAttribute('data-theme', this.darkMode ? 'dark' : 'light');
      toggle.innerHTML = this.darkMode
        ? `<span class="toggle-icon">☀️</span><span>Light Mode</span>`
        : `<span class="toggle-icon">🌙</span><span>Dark Mode</span>`;
      localStorage.setItem('theme', this.darkMode ? 'dark' : 'light');
    });

    const saved = localStorage.getItem('theme');
    if (saved === 'dark') toggle?.click();
  }

  // ─── Navigation ─────────────────────────────────────────────────────────────
  private setupNavigation(): void {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = (link as HTMLAnchorElement).getAttribute('href')?.slice(1);
        if (target) this.navigateTo(target);
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      });
    });

    document.querySelectorAll('[data-nav]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-nav')!;
        this.navigateTo(target);
        document.querySelectorAll('.nav-link').forEach(l => {
          l.classList.toggle('active', (l as HTMLAnchorElement).href?.includes(target));
        });
      });
    });
  }

  private navigateTo(section: string): void {
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(section);
    if (target) {
      target.classList.add('active');
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ─── Range Sliders ──────────────────────────────────────────────────────────
  private setupRangeSliders(): void {
    const sliders = [
      { id: 'loanAmount', displayId: 'loanAmountDisplay', prefix: '₹', multiplier: 1 },
      { id: 'income', displayId: 'incomeDisplay', prefix: '₹', multiplier: 1 },
      { id: 'creditScore', displayId: 'creditScoreDisplay', prefix: '', multiplier: 1 },
      { id: 'tenure', displayId: 'tenureDisplay', prefix: '', suffix: ' mo', multiplier: 1 },
      { id: 'existingEMI', displayId: 'existingEMIDisplay', prefix: '₹', multiplier: 1 },
      { id: 'expenses', displayId: 'expensesDisplay', prefix: '₹', multiplier: 1 },
      { id: 'collateralValue', displayId: 'collateralValueDisplay', prefix: '₹', multiplier: 1 },
    ];

    sliders.forEach(({ id, displayId, prefix, suffix = '', multiplier }) => {
      const slider = document.getElementById(id) as HTMLInputElement;
      const display = document.getElementById(displayId);
      if (!slider || !display) return;

      const update = () => {
        const val = parseInt(slider.value) * multiplier;
        display.textContent = `${prefix}${val.toLocaleString('en-IN')}${suffix}`;
        this.updateLivePreview();
      };
      slider.addEventListener('input', update);
      update();
    });
  }

  // ─── Form Listeners ─────────────────────────────────────────────────────────
  private setupFormListeners(): void {
    const form = document.getElementById('riskForm');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.analyzeAndDisplay();
    });

    const resetBtn = document.getElementById('resetBtn');
    resetBtn?.addEventListener('click', () => this.resetForm());

    const collateralToggle = document.getElementById('hasCollateral') as HTMLInputElement;
    collateralToggle?.addEventListener('change', () => {
      const section = document.getElementById('collateralSection');
      if (section) section.style.display = collateralToggle.checked ? 'block' : 'none';
    });

    // Real-time validation
    document.querySelectorAll('.form-input, .form-select').forEach(input => {
      input.addEventListener('change', () => this.updateLivePreview());
    });
  }

  // ─── Live Preview ────────────────────────────────────────────────────────────
  private updateLivePreview(): void {
    const profile = this.readForm();
    if (!profile) return;

    const rate = getInterestRate(profile);
    const emi = calculateMonthlyEMI(profile.loanAmount, rate, profile.loanTenureMonths);
    const dti = ((emi + profile.existingEMI) / profile.monthlyIncome * 100);

    const emiEl = document.getElementById('previewEMI');
    const rateEl = document.getElementById('previewRate');
    const dtiEl = document.getElementById('previewDTI');

    if (emiEl) emiEl.textContent = `₹${emi.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
    if (rateEl) rateEl.textContent = `${rate.toFixed(1)}%`;
    if (dtiEl) {
      dtiEl.textContent = `${dti.toFixed(1)}%`;
      dtiEl.style.color = dti > 50 ? '#ef4444' : dti > 40 ? '#f59e0b' : '#10b981';
    }
  }

  // ─── Sample Profiles ─────────────────────────────────────────────────────────
  private setupSampleProfiles(): void {
    const profiles = generateSampleProfiles();
    const container = document.getElementById('sampleProfiles');
    if (!container) return;

    container.innerHTML = profiles.map((p, i) => {
      const metrics = analyzeRisk(p);
      const colorMap: Record<RiskLevel, string> = { LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#ef4444', CRITICAL: '#7c3aed' };
      return `
        <div class="profile-card" data-index="${i}" role="button" tabindex="0">
          <div class="profile-header">
            <div class="profile-avatar">${p.name.charAt(0)}</div>
            <div>
              <div class="profile-name">${p.name}</div>
              <div class="profile-meta">${p.employmentType} · ₹${(p.monthlyIncome/1000).toFixed(0)}K/mo</div>
            </div>
            <div class="risk-badge" style="background:${colorMap[metrics.riskLevel]}15;color:${colorMap[metrics.riskLevel]};border:1px solid ${colorMap[metrics.riskLevel]}40">
              ${metrics.riskLevel}
            </div>
          </div>
          <div class="profile-stats">
            <div class="stat"><span>Loan</span><strong>₹${(p.loanAmount/100000).toFixed(1)}L</strong></div>
            <div class="stat"><span>Score</span><strong>${p.creditScore}</strong></div>
            <div class="stat"><span>Risk</span><strong>${metrics.overallScore}/100</strong></div>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.profile-card').forEach((card) => {
      const handler = () => {
        const i = parseInt(card.getAttribute('data-index')!);
        this.loadProfile(profiles[i]);
        this.navigateTo('analyzer');
        document.querySelectorAll('.nav-link').forEach(l => {
          l.classList.toggle('active', (l as HTMLAnchorElement).getAttribute('href') === '#analyzer');
        });
      };
      card.addEventListener('click', handler);
      card.addEventListener('keydown', (e) => { if ((e as KeyboardEvent).key === 'Enter') handler(); });
    });
  }

  // ─── Quick Calculator ────────────────────────────────────────────────────────
  private setupQuickCalculator(): void {
    const calcBtn = document.getElementById('calcBtn');
    calcBtn?.addEventListener('click', () => {
      const income = parseFloat((document.getElementById('calcIncome') as HTMLInputElement)?.value || '0');
      const loan = parseFloat((document.getElementById('calcLoan') as HTMLInputElement)?.value || '0');
      const tenure = parseInt((document.getElementById('calcTenure') as HTMLInputElement)?.value || '60');

      if (!income || !loan) {
        this.showToast('Please enter income and loan amount', 'warning');
        return;
      }

      const emi = calculateMonthlyEMI(loan, 12, tenure);
      const dti = (emi / income) * 100;
      const result = document.getElementById('calcResult');
      if (result) {
        result.innerHTML = `
          <div class="calc-result-grid">
            <div class="calc-metric"><span>Monthly EMI</span><strong>₹${emi.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</strong></div>
            <div class="calc-metric"><span>DTI Ratio</span><strong style="color:${dti > 50 ? '#ef4444' : dti > 40 ? '#f59e0b' : '#10b981'}">${dti.toFixed(1)}%</strong></div>
            <div class="calc-metric"><span>Affordability</span><strong>${dti <= 30 ? '✅ Good' : dti <= 40 ? '⚠️ Caution' : '❌ High Risk'}</strong></div>
          </div>
        `;
        result.style.display = 'block';
      }
    });
  }

  // ─── Read Form ───────────────────────────────────────────────────────────────
  private readForm(): BorrowerProfile | null {
    try {
      return {
        id: `USR_${Date.now()}`,
        name: (document.getElementById('borrowerName') as HTMLInputElement)?.value || 'User',
        age: parseInt((document.getElementById('age') as HTMLInputElement)?.value || '30'),
        monthlyIncome: parseInt((document.getElementById('income') as HTMLInputElement)?.value || '0'),
        monthlyExpenses: parseInt((document.getElementById('expenses') as HTMLInputElement)?.value || '0'),
        loanAmount: parseInt((document.getElementById('loanAmount') as HTMLInputElement)?.value || '0'),
        loanTenureMonths: parseInt((document.getElementById('tenure') as HTMLInputElement)?.value || '60'),
        existingEMI: parseInt((document.getElementById('existingEMI') as HTMLInputElement)?.value || '0'),
        creditScore: parseInt((document.getElementById('creditScore') as HTMLInputElement)?.value || '650'),
        employmentType: (document.getElementById('employment') as HTMLSelectElement)?.value as any || 'salaried',
        loanPurpose: (document.getElementById('loanPurpose') as HTMLSelectElement)?.value as any || 'personal',
        dependents: parseInt((document.getElementById('dependents') as HTMLInputElement)?.value || '0'),
        repaymentHistory: (document.getElementById('repaymentHistory') as HTMLSelectElement)?.value as any || 'no-history',
        collateral: (document.getElementById('hasCollateral') as HTMLInputElement)?.checked || false,
        collateralValue: parseInt((document.getElementById('collateralValue') as HTMLInputElement)?.value || '0'),
      };
    } catch { return null; }
  }

  // ─── Load Profile ────────────────────────────────────────────────────────────
  private loadProfile(profile: BorrowerProfile): void {
    const setVal = (id: string, val: string | number) => {
      const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement;
      if (el) { el.value = String(val); el.dispatchEvent(new Event('input')); }
    };

    setVal('borrowerName', profile.name);
    setVal('age', profile.age);
    setVal('income', profile.monthlyIncome);
    setVal('expenses', profile.monthlyExpenses);
    setVal('loanAmount', profile.loanAmount);
    setVal('tenure', profile.loanTenureMonths);
    setVal('existingEMI', profile.existingEMI);
    setVal('creditScore', profile.creditScore);
    setVal('employment', profile.employmentType);
    setVal('loanPurpose', profile.loanPurpose);
    setVal('dependents', profile.dependents);
    setVal('repaymentHistory', profile.repaymentHistory);

    const collateral = document.getElementById('hasCollateral') as HTMLInputElement;
    if (collateral) { collateral.checked = profile.collateral; collateral.dispatchEvent(new Event('change')); }
    if (profile.collateral) setVal('collateralValue', profile.collateralValue);

    this.showToast(`Loaded profile: ${profile.name}`, 'success');
    this.updateLivePreview();
  }

  // ─── Analyze & Display ───────────────────────────────────────────────────────
  private analyzeAndDisplay(): void {
    const profile = this.readForm();
    if (!profile) return;

    if (!profile.monthlyIncome || !profile.loanAmount) {
      this.showToast('Please fill in all required fields', 'error');
      return;
    }

    this.currentProfile = profile;
    this.currentMetrics = analyzeRisk(profile);

    this.showLoadingState();
    setTimeout(() => {
      this.renderResults(profile, this.currentMetrics!);
      this.navigateTo('results');
      document.querySelectorAll('.nav-link').forEach(l => {
        l.classList.toggle('active', (l as HTMLAnchorElement).getAttribute('href') === '#results');
      });
    }, 800);
  }

  // ─── Render Results ──────────────────────────────────────────────────────────
  private renderResults(profile: BorrowerProfile, metrics: RiskMetrics): void {
    const colorMap: Record<RiskLevel, string> = {
      LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#ef4444', CRITICAL: '#7c3aed'
    };
    const color = colorMap[metrics.riskLevel];

    // Gauge
    const gaugeCanvas = document.getElementById('gaugeCanvas') as HTMLCanvasElement;
    if (gaugeCanvas) drawGauge(gaugeCanvas, metrics.overallScore, metrics.riskLevel);

    // Bar chart
    const barCanvas = document.getElementById('barCanvas') as HTMLCanvasElement;
    if (barCanvas) drawBarChart(barCanvas, metricsToBarData(metrics));

    // Donut
    const donutCanvas = document.getElementById('donutCanvas') as HTMLCanvasElement;
    if (donutCanvas) drawDonutChart(donutCanvas, [
      { label: 'EMI', value: Math.round(metrics.emiAffordability), color: '#3b82f6' },
      { label: 'Expenses', value: Math.round((profile.monthlyExpenses / profile.monthlyIncome) * 100), color: '#f59e0b' },
      { label: 'Savings', value: Math.max(0, Math.round(metrics.savingsRatio)), color: '#10b981' },
      { label: 'Other', value: Math.max(0, 100 - Math.round(metrics.emiAffordability) - Math.round((profile.monthlyExpenses / profile.monthlyIncome) * 100) - Math.max(0, Math.round(metrics.savingsRatio))), color: '#e5e7eb' }
    ]);

    // Summary cards
    const summaryEl = document.getElementById('resultSummary');
    if (summaryEl) {
      summaryEl.innerHTML = `
        <div class="summary-card" style="border-left:4px solid ${color}">
          <div class="summary-icon" style="color:${color}">📊</div>
          <div>
            <div class="summary-label">Overall Risk</div>
            <div class="summary-value" style="color:${color}">${metrics.riskLevel}</div>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-icon">💸</div>
          <div>
            <div class="summary-label">Monthly EMI</div>
            <div class="summary-value">₹${metrics.monthlyEMI.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</div>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-icon">📈</div>
          <div>
            <div class="summary-label">Total Interest</div>
            <div class="summary-value">₹${metrics.totalInterest.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</div>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-icon">💰</div>
          <div>
            <div class="summary-label">Total Payable</div>
            <div class="summary-value">₹${metrics.totalPayable.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</div>
          </div>
        </div>
      `;
    }

    // Recommendation
    const recEl = document.getElementById('recommendation');
    if (recEl) {
      recEl.innerHTML = `<div class="recommendation-box" style="border-left:4px solid ${color};background:${color}10">${metrics.recommendation}</div>`;
    }

    // Risk factors
    const factorsEl = document.getElementById('riskFactors');
    if (factorsEl) {
      factorsEl.innerHTML = metrics.riskFactors.length
        ? metrics.riskFactors.map(f => `
          <div class="factor-item factor-${f.severity}">
            <div class="factor-icon">${f.severity === 'high' ? '🔴' : f.severity === 'medium' ? '🟡' : '🟢'}</div>
            <div class="factor-body">
              <div class="factor-category">${f.category}</div>
              <div class="factor-desc">${f.description}</div>
            </div>
            <div class="factor-impact">-${f.impact}</div>
          </div>`).join('')
        : '<p class="no-factors">No significant risk factors detected.</p>';
    }

    // Positive factors
    const posEl = document.getElementById('positiveFactors');
    if (posEl) {
      posEl.innerHTML = metrics.positiveFactors.length
        ? metrics.positiveFactors.map(f => `
          <div class="factor-item factor-positive">
            <div class="factor-icon">✅</div>
            <div class="factor-body">
              <div class="factor-category">${f.category}</div>
              <div class="factor-desc">${f.description}</div>
            </div>
            <div class="factor-impact" style="color:#10b981">+${f.benefit}</div>
          </div>`).join('')
        : '<p class="no-factors">No strong positive factors found.</p>';
    }

    // Print button
    document.getElementById('printBtn')?.addEventListener('click', () => window.print());
    document.getElementById('newAnalysisBtn')?.addEventListener('click', () => {
      this.navigateTo('analyzer');
    });

    this.hideLoadingState();
  }

  // ─── Dashboard ───────────────────────────────────────────────────────────────
  private loadDashboard(): void {
    const profiles = generateSampleProfiles();
    const allMetrics = profiles.map(p => analyzeRisk(p));
    const avgScore = allMetrics.reduce((s, m) => s + m.overallScore, 0) / allMetrics.length;
    const defaultRate = allMetrics.filter(m => m.riskLevel === 'HIGH' || m.riskLevel === 'CRITICAL').length;

    const el = (id: string) => document.getElementById(id);
    const setText = (id: string, val: string) => { const e = el(id); if (e) e.textContent = val; };

    setText('dashAvgScore', avgScore.toFixed(0));
    setText('dashDefaultRate', `${((defaultRate / profiles.length) * 100).toFixed(0)}%`);
    setText('dashProfiles', profiles.length.toString());
  }

  // ─── Scroll Animations ───────────────────────────────────────────────────────
  private setupScrollAnimations(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.animate-in').forEach(el => observer.observe(el));
  }

  // ─── Tooltips ───────────────────────────────────────────────────────────────
  private setupTooltips(): void {
    document.querySelectorAll('[data-tooltip]').forEach(el => {
      const tip = document.createElement('div');
      tip.className = 'tooltip';
      tip.textContent = el.getAttribute('data-tooltip') || '';
      document.body.appendChild(tip);

      el.addEventListener('mouseenter', (e) => {
        const rect = (el as HTMLElement).getBoundingClientRect();
        tip.style.cssText = `display:block;top:${rect.bottom + 8 + window.scrollY}px;left:${rect.left + window.scrollX}px`;
      });
      el.addEventListener('mouseleave', () => tip.style.display = 'none');
    });
  }

  // ─── Tab Switcher ────────────────────────────────────────────────────────────
  private setupTabSwitcher(): void {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const group = btn.getAttribute('data-tab-group');
        const target = btn.getAttribute('data-tab');
        document.querySelectorAll(`[data-tab-group="${group}"]`).forEach(b => b.classList.remove('active'));
        document.querySelectorAll(`[data-tab-content="${group}"]`).forEach(c => {
          c.classList.toggle('active', c.getAttribute('data-tab-id') === target);
        });
        btn.classList.add('active');
      });
    });
  }

  // ─── Animate Counters ────────────────────────────────────────────────────────
  private animateCounters(): void {
    document.querySelectorAll('[data-count]').forEach(el => {
      const target = parseFloat(el.getAttribute('data-count') || '0');
      let current = 0;
      const step = target / 60;
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = Math.round(current).toString();
        if (current >= target) clearInterval(timer);
      }, 16);
    });
  }

  // ─── Toast Notifications ─────────────────────────────────────────────────────
  private showToast(msg: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): void {
    const container = document.getElementById('toastContainer') || (() => {
      const c = document.createElement('div');
      c.id = 'toastContainer';
      document.body.appendChild(c);
      return c;
    })();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    toast.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3000);
  }

  // ─── Loading State ───────────────────────────────────────────────────────────
  private showLoadingState(): void {
    const btn = document.querySelector('.analyze-btn') as HTMLButtonElement;
    if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Analyzing...'; }
  }

  private hideLoadingState(): void {
    const btn = document.querySelector('.analyze-btn') as HTMLButtonElement;
    if (btn) { btn.disabled = false; btn.innerHTML = '🔍 Analyze Risk'; }
  }

  // ─── Reset Form ───────────────────────────────────────────────────────────────
  private resetForm(): void {
    (document.getElementById('riskForm') as HTMLFormElement)?.reset();
    this.updateLivePreview();
    const collateralSection = document.getElementById('collateralSection');
    if (collateralSection) collateralSection.style.display = 'none';
    this.showToast('Form reset successfully', 'info');
  }
}

// Bootstrap app
document.addEventListener('DOMContentLoaded', () => {
  new CreditRiskApp();
  // Set first nav active
  document.querySelector('.nav-link')?.classList.add('active');
  document.getElementById('dashboard')?.classList.add('active');
});
