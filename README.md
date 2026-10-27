# OnePassVisa.com — Global Visa & Travel Document Portal (Phase 1 Front-End)

Welcome to the official front-end codebase for **OnePassVisa.com** (`https://onepassvisa.com`), designed and engineered to match and exceed global industry leaders (`ivisaportal.com`, `ivisa.com`, `atlys.com`).

## ✨ Key Pages & Interactive Features

| Page | File | Description |
| :--- | :--- | :--- |
| **Flagship Homepage** | `index.html` | Interactive Visa Eligibility Checker, Live Specimen Boarding-Pass/MRZ card, Popular Destinations filter grid, 4-Step Process, Speed & Fee Calculator, Government Comparison Matrix, Reviews & FAQ. |
| **Destinations Hub** | `destinations.html` | Full searchable & region-filterable catalog of 18+ major global destinations with interactive Document Checklist & Fee Breakdown modals. |
| **5-Step Application Funnel** | `apply.html` | Guided 5-step application wizard with **AI Passport MRZ OCR Auto-Fill Simulator**, **7-Point Biometric Visa Photo Compliance Checker**, promo code (`ONEPASS10`), and instant Order Reference generation. |
| **Live Order Tracker** | `track.html` | Real-time 6-stage consular audit tracker supporting both sample dossiers (`OPV-2026-84920`, `OPV-2026-51304`, `OPV-2026-39102`) and new orders created in `apply.html`, plus Printable Official eVisa Certificate preview. |
| **Services Suite** | `services.html` | eVisas & ETAs, Schengen/US/UK Embassy Concierge, Digital Arrival Cards (SGAC, MDAC, Visit Japan Web), Biometric Photo Studio, Document Apostille, and Corporate B2B Mobility Desk. |
| **Help & Gov Directory** | `faq.html` | Searchable FAQ knowledge base and Official Sovereign Government Portals Transparency Directory. |
| **About & 24/7 Contact** | `about.html` | Company mission, global hubs (Dubai, London, New York, Singapore, Toronto), and interactive 24/7 Priority Support Ticket form. |
| **Legal & Policy Center** | `policies.html` | Complete legal suite: Terms & Conditions (`#terms`), Privacy Policy (`#privacy`), Refund & Cancellation Policy (`#refund`), Interactive Cookie Consent (`#cookies`), Non-Government Affiliation Disclaimer (`#disclaimer`), GDPR & CCPA (`#gdpr`), and Security Architecture (`#security`). |

---

## 🚀 Local Preview

Run the built-in Python web server from this directory:

```bash
python3 -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080) in your browser.

---

## 🌐 Deploying to GitHub & Vercel (`onepassvisa.com`)

### Step 1: Push to GitHub
1. Create a new repository on [https://github.com/new](https://github.com/new) named `onepassvisa`.
2. In your terminal inside `/Users/qasim/.gemini/antigravity/scratch/onepassvisa`, run:
   ```bash
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/onepassvisa.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Vercel & Connect `onepassvisa.com`
1. Log in to [https://vercel.com/new](https://vercel.com/new) with your GitHub account.
2. Click **Import** next to your `onepassvisa` repository and click **Deploy** (zero build configuration required—`vercel.json` is pre-configured).
3. Once deployed, go to **Project Settings → Domains**, enter `onepassvisa.com` and `www.onepassvisa.com`, and add the Vercel `A` (`76.76.21.21`) and `CNAME` (`cname.vercel-dns.com`) records at your domain registrar.
