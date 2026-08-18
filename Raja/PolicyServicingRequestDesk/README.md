# Policy Servicing Request Desk

## Enterprise Insurance Servicing Platform | Power Apps Code Component

[![Build Status](https://dev.azure.com/yourorg/PSRD/_apis/build/status/psrd-pipeline?branchName=main)](...)
[![Coverage](https://img.shields.io/badge/coverage-85%25-green)]()
[![Version](https://img.shields.io/badge/version-1.0.0-blue)]()

---

## Overview

The **Policy Servicing Request Desk (PSRD)** is a production-ready enterprise application
built on Microsoft Power Platform for insurance policy servicing operations.

### Key Capabilities
- 📋 **10 Request Types** — Address, Nominee, Premium Mode, Bank Account, Reinstatement & more
- 🤖 **AI Copilot Agent** — Copilot Studio-powered assistant with RAG capabilities
- ✅ **Eligibility Engine** — Configuration-driven business rule validation
- 🔄 **End-to-End Tracking** — Complete status history with audit trail
- 👥 **Operations Workbench** — Queue management, bulk operations, assignment
- 📊 **Real-time Dashboards** — KPIs, SLA monitoring, analytics
- 🔒 **Enterprise Security** — Entra ID, RBAC, Row-Level Security, Audit

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Fluent UI v9 |
| State | Zustand, React Query (TanStack) |
| Platform | Power Apps PCF, Power Platform |
| Backend | Microsoft Dataverse |
| Automation | Power Automate |
| AI | Microsoft Copilot Studio, Azure OpenAI |
| Security | Microsoft Entra ID |
| Monitoring | Azure Application Insights |
| DevOps | Azure DevOps, Power Platform Pipelines |

---

## Project Structure

```
PolicyServicingRequestDesk/
├── src/
│   ├── App.tsx                     # Root component
│   ├── main.tsx                    # Dev entry point
│   ├── router.tsx                  # Route definitions
│   ├── components/
│   │   ├── layout/                 # AppLayout, Sidebar, Header
│   │   └── common/                 # KPICard, StatusBadge, Timeline...
│   ├── pages/
│   │   ├── Dashboard/
│   │   ├── PolicySearch/           # Module 1
│   │   ├── RequestCatalogue/       # Module 2
│   │   ├── RequestCreation/        # Module 4 (Eligibility + Form + Wizard)
│   │   ├── RequestTracking/        # Module 5
│   │   ├── OperationsWorkbench/    # Module 6
│   │   ├── Agent/                  # AI Copilot
│   │   ├── Audit/                  # Module 9
│   │   ├── Notifications/          # Module 10
│   │   ├── Administration/
│   │   ├── KnowledgeBase/
│   │   └── Reports/
│   ├── services/
│   │   ├── dataverse.service.ts    # OData API client
│   │   ├── policy.service.ts       # Policy domain service
│   │   ├── request.service.ts      # Request domain service
│   │   └── mock-data.ts            # Development mock data
│   ├── store/
│   │   └── appStore.ts             # Zustand global state
│   ├── theme/
│   │   └── tokens.ts               # Design tokens + Fluent themes
│   ├── types/
│   │   ├── policy.types.ts
│   │   ├── request.types.ts
│   │   └── user.types.ts
│   └── utils/
│       ├── constants.ts
│       └── formatters.ts
├── dataverse-schema/
│   └── SCHEMA.md                   # Complete Dataverse schema
├── power-automate/
│   └── FLOWS.md                    # All flow designs
├── copilot-studio/
│   └── AGENT_DESIGN.md             # Copilot Studio configuration
├── devops/
│   └── azure-pipelines.yml         # CI/CD pipeline
├── docs/
│   └── ARCHITECTURE.md             # Solution architecture
├── ControlManifest.Input.xml        # PCF manifest
├── index.ts                         # PCF entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- Power Platform CLI (pac)
- Power Platform environment with Dataverse

### Development Setup

```bash
# Clone and navigate
cd PolicyServicingRequestDesk

# Install dependencies
npm install

# Copy env file
cp .env.example .env.local

# Start development server (with mock data)
npm run dev
# App available at http://localhost:3000
```

### Environment Variables
See `.env.example` for all configuration options.

**Quick Start (mock mode):**
```
VITE_USE_MOCK=true
```

### Build for Production
```bash
npm run build
# Output in: out/controls/PolicyServicingRequestDesk/
```

### Deploy to Power Platform
```bash
# Authenticate
pac auth create --url https://yourorg.crm.dynamics.com

# Push PCF component
pac pcf push --publisher-prefix psrd

# Build solution
pac solution build --solution-folder Solution

# Deploy solution
pac solution import --path Solution.zip
```

---

## Modules

| Module | Description | Status |
|--------|-------------|--------|
| Policy Search | Search by number, customer, mobile, email | ✅ Complete |
| Request Catalogue | Browse all 16 request types | ✅ Complete |
| Eligibility Engine | Config-driven rule validation | ✅ Complete |
| Request Creation | Multi-step wizard with file upload | ✅ Complete |
| Request Tracking | Timeline, status, comments | ✅ Complete |
| Operations Workbench | Queue, assignment, bulk ops | ✅ Complete |
| Customer Self-Service | Customer-facing request view | ✅ Complete |
| Execution Engine | Post-approval policy update | ✅ Complete |
| Audit & Compliance | Full audit trail | ✅ Complete |
| Notification Engine | Email/SMS/Teams | ✅ Complete |
| AI Copilot Agent | Copilot Studio integration | ✅ Complete |

---

## Testing

```bash
# Unit tests
npm test

# Test with UI
npm run test:ui

# Coverage report
npm run test:coverage
```

**Coverage Targets:**
- Services: 90%+
- Utilities: 95%+
- Components: 80%+

---

## Security

- **Authentication:** Microsoft Entra ID (SSO via Power Platform)
- **Authorization:** Dataverse Security Roles + RBAC
- **Data Protection:** Field-level security for PAN/Aadhaar
- **Audit:** 7-year audit log retention
- **Compliance:** IRDAI, DPDP Act

---

## Performance Targets

| Operation | Target | Implementation |
|-----------|--------|----------------|
| Policy Search | < 2s | Dataverse indexed query + cache |
| Status Lookup | < 1s | Direct by key + React Query cache |
| Eligibility Check | < 2s | Pre-computed rules |
| Dashboard Load | < 3s | Parallel queries + lazy loading |
| Form Render | < 0.5s | Dynamic form from JSON schema |

---

## Contributing

1. Create feature branch from `develop`
2. Follow TypeScript strict mode
3. Add unit tests for new services
4. Ensure ESLint passes: `npm run lint`
5. Submit PR for review

---

## License
Proprietary — Insurance Enterprise Product
