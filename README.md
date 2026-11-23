# MALLOULIAUTO - Marketing Homepage

Marketing website for MALLOULIAUTO — the intelligent platform for car repair in Tunisia. Showcases AI-powered diagnostic capabilities, partner network, and service offerings.

![MALLOULIAUTO](https://img.shields.io/badge/Status-MVP%20Ready-success)
![React](https://img.shields.io/badge/React-18+-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3+-38bdf8)
![License](https://img.shields.io/badge/License-Proprietary-red)

## 🚀 Features

### Core Functionality

- ✅ **AI Diagnostic Wizard** - 5-step intelligent diagnostic flow
- ✅ **Service Tier Selection** - 4 service levels from AI consultation to full garage repair
- ✅ **Vehicle Dashboard** - Health monitoring, maintenance reminders, service history
- ✅ **Partner Garages** - Browse and book 50+ certified garages in Greater Tunis
- ✅ **Mock Data & Simulation** - Fully functional with Tunisian automotive scenarios

### Technical Features

- 🎨 **Brand-Aligned Design** - Professional UI with MALLOULIAUTO colors (#447D9B, #FE7743, #273F4F)
- 📱 **Fully Responsive** - Mobile-first design (375px → 1440px+)
- ⚡ **Fast Performance** - Optimized React with Vite
- 🎭 **Smooth Animations** - Framer Motion for polished UX
- 🔄 **State Management** - Zustand for lightweight state
- 🧭 **Modern Routing** - React Router v6

## 📦 Tech Stack

```json
{
  "framework": "React 18+",
  "build": "Vite 7+",
  "styling": "Tailwind CSS 3+",
  "routing": "React Router 6",
  "state": "Zustand",
  "animations": "Framer Motion",
  "icons": "Lucide React",
  "forms": "React Hook Form",
  "dates": "date-fns"
}
```

## 🏗️ Project Structure

```
homepage/
├── src/
│   ├── components/
│   │   ├── diagnostic/
│   │   │   ├── VehicleSelection.jsx
│   │   │   ├── ProblemCategory.jsx
│   │   │   ├── SymptomInput.jsx
│   │   │   ├── AIAnalysis.jsx
│   │   │   └── DiagnosisResults.jsx
│   │   ├── Layout.jsx
│   │   ├── Navigation.jsx
│   │   └── Footer.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Diagnostic.jsx
│   │   ├── ServiceTiers.jsx
│   │   ├── Dashboard.jsx
│   │   └── Garages.jsx
│   ├── store/
│   │   └── useStore.js
│   ├── data/
│   │   └── mockData.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```
### Homepage (React)
| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **Vite** | Build tool |
| **Tailwind CSS** | Styling |
| **Framer Motion** | Animations |
| **React Router** | Navigation |

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ and npm/yarn
- Modern browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone and Navigate**

   ```bash
   cd homepage
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Start the site with its API and the local database** — full guide: [docs/dev-local.md](docs/dev-local.md)

   ```bash
   supabase start
   npm run env:local
   npx vercel dev --listen 3000
   ```

4. **Open in Browser**
   ```
   http://localhost:3000
   ```

   `npm run dev` (http://localhost:5173) serves the front end only: every `/api/*` call fails.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🎯 Demo Scenarios to Test

### Scenario 1: Battery/Electrical Issue

1. Navigate to "Diagnostic" page
2. Select: Renault Symbol 2019, 85000 km
3. Choose category: "Système Électrique"
4. Add symptoms: "démarrage", "batterie", "clic"
5. Watch AI analysis (3.5 seconds)
6. View result: "Décharge Batterie / Problème Alternateur" (94% confidence)
7. Select service tier

### Scenario 2: Engine Timing Belt

1. Start new diagnostic
2. Select: Peugeot 301 2018, 120000 km
3. Choose category: "Moteur / Mécanique"
4. Add symptoms: "bruit", "courroie", "sifflement"
5. Result: "Courroie de Distribution Usée" (91% confidence, URGENT)

### Scenario 3: Dashboard Exploration

1. Visit Dashboard
2. View vehicle health score (87/100)
3. Check maintenance reminders (Vidange in 420 km)
4. Browse service history
5. View monthly statistics

### Scenario 4: Find Garage

1. Navigate to "Garages Partenaires"
2. Browse garage cards with ratings/services
3. Filter by service type
4. View available time slots

## 🎨 Brand Colors

```css
--brand-blue: #447d9b /* Primary - trust, technology */ --brand-orange: #fe7743
  /* Secondary - vibrant accent, CTAs */ --brand-navy: #273f4f /* Accent - professional, text */
  --brand-gray: #d7d7d7 /* Light gray - backgrounds */ --emerald: #10b981 /* Success states */;
```

## 🇹🇳 Tunisian Context

### Currency

All prices displayed in **TND (Tunisian Dinar)**

### Locations

Greater Tunis areas: Tunis Centre, La Marsa, Carthage, Ariana, Manouba

### Car Brands

Focus on popular Tunisian brands:

- Renault (Symbol, Clio, Megane)
- Peugeot (208, 301, 308)
- Hyundai (i10, i20, Accent)
- Kia (Picanto, Rio, Sportage)

### Language

- **Primary**: French
- **Secondary**: Arabic (planned)

## 🚧 Known Limitations

### Demo Mode Only

- ✅ Backend: Vercel Functions in `api/` (chatbot, newsletter double opt-in, admin agents) — see `docs/api.md`
- ❌ No actual AI/ML model
- ❌ No payment processing
- ❌ No user authentication

### Simulation

- ✅ AI diagnostic uses rule-based matching
- ✅ Photo uploads are mocked
- ✅ Payment flow is UI-only

## 📝 Development Commands

```bash
npm install      # Install dependencies
npm run env:local # Point .env at the local Supabase stack (see docs/dev-local.md)
npx vercel dev --listen 3000 # Site + API on localhost:3000
npm run dev      # Front end only (localhost:5173), no /api
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Lint code
```

## 🌐 Deployment

### Vercel

```bash
npm i -g vercel
vercel
```

### Netlify

- Build Command: `npm run build`
- Publish Directory: `dist`

## 📄 License

Proprietary - © 2025 MALLOULIAUTO

---

**Built with ❤️ for the Tunisian automotive community**
