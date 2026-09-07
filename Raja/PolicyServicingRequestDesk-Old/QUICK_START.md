# Quick Start Guide - Policy Servicing Request Desk

## 5-Minute Setup

### 1. Install Dependencies
```bash
npm install
```
**Time: 3 minutes** (first run)  
**Output:** 618 packages installed

### 2. Start Development Server
```bash
npm run dev
```
**Output:** 
```
VITE v5.4.21  ready in 1234 ms

➜  Local:   http://localhost:3000/
➜  press h to show help
```

### 3. Open in Browser
Visit **http://localhost:3000** and you should see:
- Dashboard with KPI cards
- Policy search functionality
- Request creation wizard
- All features working with mock data

**✅ You're live in development!**

---

## Common Commands

| Command | Purpose | Time |
|---------|---------|------|
| `npm run dev` | Start dev server (hot reload) | 5s |
| `npm run build` | Build production bundle | 40s |
| `npm run type-check` | Verify TypeScript | 10s |
| `npm run lint` | Check code quality | 15s |
| `npm run lint --fix` | Auto-fix code formatting | 15s |
| `npm test` | Run test suite | 20s |

---

## Project Structure Overview

```
PolicyServicingRequestDesk/
├── src/
│   ├── pages/              # 12 modules (Dashboard, Policy Search, etc)
│   ├── components/         # Reusable UI components
│   ├── services/           # API & business logic
│   ├── store/              # Global state (Zustand)
│   ├── types/              # TypeScript type definitions
│   ├── theme/              # Design tokens & styling
│   ├── utils/              # Helpers & formatters
│   ├── App.tsx             # Root component
│   └── main.tsx            # Vite entry point
├── docs/                   # Documentation
│   ├── DEVELOPMENT_GUIDE.md
│   ├── DEPLOYMENT_GUIDE.md
│   ├── TESTING_GUIDE.md
│   └── ARCHITECTURE.md
├── devops/                 # CI/CD pipeline
├── dataverse-schema/       # Data model documentation
├── power-automate/         # Workflow automation
├── copilot-studio/         # AI agent design
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Build config
└── .eslintrc.json          # Linting rules
```

---

## Features Available in Dev Mode

### ✅ Complete UI Modules (12 Pages)
1. **Dashboard** - KPI metrics, trends, quick actions
2. **Policy Search** - Multi-criteria search, detail view
3. **Request Catalogue** - Browse 16+ request types
4. **Request Creation** - 6-step wizard with validation
5. **Request Tracking** - Status, timeline, SLA tracking
6. **Operations Workbench** - Queue mgmt, agent metrics
7. **AI Copilot Agent** - Chat with eligibility engine
8. **Audit Logs** - 7-year retention with filters
9. **Notifications** - Email/SMS/in-app channels
10. **Administration** - User & system config
11. **Knowledge Base** - FAQ search with RAG
12. **Reports** - Analytics & dashboards

### ✅ Mock Data
- 50+ mock policies with full attributes
- 25+ mock service requests in various statuses
- 16+ request types and catalogs
- Realistic dates, currencies, and status flows

### ✅ UI Features
- Responsive design (desktop, tablet, mobile)
- Dark/light theme toggle
- Fluent UI v9 components
- Type-safe React with strict TypeScript
- Global state management
- Optimized API caching with React Query

---

## Next Steps: Connecting to Dataverse

### For Production Deployment
1. **Create Dataverse Environment**
   - Power Platform Admin Center
   - Create new environment (https://admin.powerplatform.microsoft.com)

2. **Update .env.local**
   ```bash
   VITE_DATAVERSE_URL=https://yourorg.crm.dynamics.com
   VITE_USE_MOCK=false
   ```

3. **Deploy PCF Component**
   - Follow: [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)
   - Uses Power Platform CLI (pac)

4. **Set up Flows & Copilot**
   - Power Automate flows: [power-automate/FLOWS.md](power-automate/FLOWS.md)
   - Copilot agent: [copilot-studio/AGENT_DESIGN.md](copilot-studio/AGENT_DESIGN.md)

---

## Testing Your Changes

```bash
# Type checking (required before commit)
npm run type-check

# ESLint verification (code quality)
npm run lint --fix

# Run test suite
npm test

# Full build (production bundle)
npm run build
```

---

## Troubleshooting

### App doesn't load at http://localhost:3000
```bash
# Kill process on port 3000
lsof -i :3000 | awk 'NR>1 {print $2}' | xargs kill -9

# Or use Windows (in PowerShell):
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Restart
npm run dev
```

### Type errors in editor
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm run type-check
```

### Import not found error
- Verify path aliases in `tsconfig.json` (@/* → src/*)
- Use correct file extension (.ts, .tsx)
- Check file actually exists in src folder

---

## Key Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18 | UI framework |
| TypeScript | 5.9 | Type safety |
| Fluent UI | 9 | Microsoft components |
| Vite | 5.4 | Build tool |
| Zustand | 5 | State management |
| TanStack Query | 5 | Data caching |
| React Router | 6 | Navigation |

---

## Documentation

| Document | Purpose |
|----------|---------|
| [DEVELOPMENT_GUIDE.md](docs/DEVELOPMENT_GUIDE.md) | How to develop locally |
| [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) | Deployment to Power Platform |
| [TESTING_GUIDE.md](docs/TESTING_GUIDE.md) | Testing strategies & execution |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design & patterns |
| [README.md](README.md) | Project overview |

---

## Support

**Having issues?**
1. Check [DEVELOPMENT_GUIDE.md](docs/DEVELOPMENT_GUIDE.md) Troubleshooting section
2. Review error message in console (F12)
3. Check Application Insights logs (if configured)
4. See [TESTING_GUIDE.md](docs/TESTING_GUIDE.md) for test failures

---

## Next Command
```bash
npm run dev
```

Then open: **http://localhost:3000** 🚀
