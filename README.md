# 🛡️ CreditGuard — Credit Risk Analysis Platform

> Protecting middle-class families from loan defaults through financial literacy and data-driven risk analysis.

---

## 📦 Project Structure

```
credit-risk-analyzer/
├── src/
│   ├── types/
│   │   └── index.ts          ← TypeScript type definitions
│   ├── utils/
│   │   ├── riskEngine.ts     ← Core risk calculation engine
│   │   └── chartUtils.ts     ← Canvas chart rendering
│   ├── main.ts               ← App controller & UI logic
│   ├── styles.css            ← Full styling (CSS variables, dark mode, responsive)
│   ├── index.html            ← Main HTML with all sections
│   └── favicon.svg           ← App icon
├── dist/                     ← ✅ COMPILED OUTPUT — open this
│   ├── index.html            ← Open in browser
│   ├── styles.css
│   ├── main.js               ← Compiled TypeScript
│   ├── utils/
│   └── types/
├── scripts/
│   └── build.js
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 How to Run

### Option 1: Open directly in browser
Simply open `dist/index.html` in any modern browser. No server needed.

### Option 2: Serve locally
```bash
cd dist
npx serve . -p 3000
# Then visit http://localhost:3000
```

### Option 3: Rebuild from TypeScript source
```bash
npm install     # only needs internet
npx tsc         # compile TypeScript
```

---

## 🎯 Features

| Feature | Description |
|---|---|
| **Risk Analyzer** | Full borrower risk assessment form with sliders |
| **Live Preview** | Real-time EMI, interest rate, DTI calculation |
| **Gauge Chart** | Visual risk score dial (0–100) |
| **Bar Charts** | Key metrics visualization using Canvas |
| **Donut Chart** | Income distribution breakdown |
| **Risk Factors** | Detailed positive/negative factor breakdown |
| **Dark Mode** | Toggle with localStorage persistence |
| **EMI Calculator** | Quick affordability check tool |
| **Learn Section** | Financial literacy content |
| **Risk Patterns** | India-specific default pattern insights |
| **Sample Profiles** | 4 real-world borrower profiles to load |
| **Print Report** | Browser print-optimized report |
| **Toast Notifications** | Action feedback system |
| **Scroll Animations** | Intersection Observer-based reveals |
| **Fully Responsive** | Mobile, tablet, desktop |

---

## 🔧 Technology Stack

- **TypeScript** — Type-safe application logic
- **Vanilla CSS** — Custom properties, dark mode, animations
- **HTML5 Canvas** — Gauge, bar, and donut charts (no dependencies)
- **Web APIs** — IntersectionObserver, localStorage, Canvas 2D

---

## 📊 Risk Score Algorithm

The risk score (0–100) is calculated based on:

1. **DTI Ratio** — Debt-to-Income (>50% = -30 pts)
2. **Credit Score** — CIBIL score impact (<600 = -25 pts)
3. **EMI Affordability** — % of income going to new EMI
4. **Savings Buffer** — Disposable income ratio
5. **Employment Stability** — Income regularity
6. **Repayment History** — Past loan behavior
7. **Collateral** — Asset backing for the loan
8. **Loan Purpose** — Productive vs. consumptive

---

## 🌍 Built to Help

This project is built specifically for middle-class India:
- Explains concepts in plain language
- Shows real rupee amounts (₹)
- India-specific credit score (CIBIL) ranges
- Regional default pattern insights
- Financial counseling guidance in Hindi context

---

*Built with ❤️ to prevent financial distress in everyday families.*
