# Policy Servicing Request Desk - Enterprise Architecture

## Solution Overview
Enterprise-grade insurance policy servicing platform built on Microsoft Power Platform,
enabling customers to self-serve and operations teams to manage servicing efficiently.

## Architecture Layers

```
┌──────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                         │
│  ┌─────────────────────┐  ┌─────────────────────────────────────┐ │
│  │  PCF Code Component  │  │    Microsoft Copilot Studio Agent    │ │
│  │  React 18 + Vite    │  │    Policy Servicing Assistant        │ │
│  │  Fluent UI v9       │  │    RAG + Azure OpenAI GPT-4o         │ │
│  │  TypeScript         │  └─────────────────────────────────────┘ │
│  └─────────────────────┘                                           │
└──────────────────────────────────────────────────────────────────┘
                              │
┌──────────────────────────────────────────────────────────────────┐
│                        BUSINESS LOGIC LAYER                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐ │
│  │  Power       │  │  Eligibility │  │  Execution Engine        │ │
│  │  Automate    │  │  Engine      │  │  (Azure Function App)    │ │
│  │  Flows       │  │  (Rules DB)  │  │                          │ │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              Approval Workflow Engine                         │  │
│  │  PAA Approvals + Custom Logic + Escalation Rules             │  │
│  └──────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                              │
┌──────────────────────────────────────────────────────────────────┐
│                          DATA LAYER                               │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                    Microsoft Dataverse                         │ │
│  │  Tables: Policy, Customer, ServiceRequest, Catalog,           │ │
│  │  Approval, AuditLog, Notification, KnowledgeArticle           │ │
│  └──────────────────────────────────────────────────────────────┘ │
│  ┌──────────────────┐  ┌───────────────┐  ┌─────────────────────┐ │
│  │  Azure Blob      │  │  Azure AI     │  │  Azure Cache        │ │
│  │  Storage         │  │  Search       │  │  for Redis          │ │
│  │  (Attachments)   │  │  (RAG Index)  │  │  (API Cache)        │ │
│  └──────────────────┘  └───────────────┘  └─────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                              │
┌──────────────────────────────────────────────────────────────────┐
│                       INTEGRATION LAYER                           │
│  ┌───────────────┐  ┌────────────────┐  ┌───────────────────────┐ │
│  │  Core System  │  │  Notification  │  │  Azure Application    │ │
│  │  Connector    │  │  Gateway       │  │  Insights             │ │
│  │  (via APIM)   │  │  Email/SMS     │  │  (Monitoring)         │ │
│  └───────────────┘  └────────────────┘  └───────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                              │
┌──────────────────────────────────────────────────────────────────┐
│                       SECURITY LAYER                              │
│  Microsoft Entra ID │ MFA │ RBAC │ RLS │ Field Security │ TLS     │
└──────────────────────────────────────────────────────────────────┘
```

## Component Architecture - PCF Application

```
App (FluentProvider + QueryClientProvider + Router)
├── AppLayout
│   ├── Sidebar (Navigation)
│   └── Header (User, Theme, Notifications)
│
├── Pages (Lazy-loaded with Suspense)
│   ├── Dashboard
│   │   ├── KPICard x6
│   │   ├── RecentRequestsList
│   │   ├── QuickActions
│   │   └── StatusBreakdown
│   │
│   ├── PolicySearch
│   │   ├── SearchForm (4 search criteria)
│   │   ├── ResultsTable (paginated, sortable)
│   │   └── PolicyDetail (drawer/panel)
│   │
│   ├── RequestCatalogue
│   │   ├── CategoryFilter
│   │   ├── SearchBox
│   │   └── CatalogGrid (RequestCards)
│   │
│   ├── RequestCreation (Multi-step Wizard)
│   │   ├── Step 1: PolicySelector
│   │   ├── Step 2: EligibilityChecker
│   │   ├── Step 3: DynamicForm
│   │   ├── Step 4: DocumentUpload
│   │   ├── Step 5: ReviewSummary
│   │   └── Step 6: SuccessConfirmation
│   │
│   ├── RequestTracking
│   │   ├── FilterBar
│   │   ├── RequestTable (with SLA progress)
│   │   └── RequestDetailDialog
│   │       ├── StatusBadges
│   │       ├── Timeline
│   │       ├── RequestData
│   │       └── Comments
│   │
│   ├── OperationsWorkbench
│   │   ├── MetricsStrip (5 KPIs)
│   │   ├── TabView (Queue / Approvals / SLA / Agents)
│   │   ├── BulkActionBar
│   │   └── RequestQueue (Table with actions)
│   │
│   ├── AgentPage (AI Copilot Chat)
│   │   ├── AgentInfoCard
│   │   ├── QuickPrompts
│   │   ├── ChatWindow
│   │   └── InputArea
│   │
│   ├── AuditPage
│   ├── NotificationsPage
│   ├── AdministrationPage
│   ├── KnowledgeBasePage
│   └── ReportsPage
│
└── Shared Components
    ├── StatusBadge
    ├── PriorityBadge
    ├── KPICard
    ├── Timeline
    └── LoadingSkeletons
```

## Performance Strategy

### Caching
- React Query: 5-minute stale time for policy data
- Service layer cache: 5-minute in-memory cache for searches
- Policy detail: 1-minute cache (more volatile)
- Request catalogue: 10-minute cache (rarely changes)

### Code Splitting
- All pages lazy-loaded
- Vendor chunks: react-vendor, fluent-ui, query, utils
- Initial bundle target: <200KB gzipped

### Virtualization
- react-virtuoso for large request lists (>100 rows)
- Table pagination: 10/20/50 rows per page

### Optimistic Updates
- Request status changes updated optimistically in UI
- Rollback on API failure

## Security Implementation

### Authentication Flow
1. Power Apps authenticates user via Entra ID
2. PCF component receives user context from Power Platform
3. Dataverse API calls use the authenticated session token
4. Row-level security enforced in Dataverse queries

### RBAC Permissions Matrix
```
Permission          | Customer | Agent | Supervisor | Manager | Admin
--------------------|----------|-------|------------|---------|------
Search Policies     | Own      | All   | All        | All     | All
Create Request      | ✅       | ✅    | ✅         | ✅      | ✅
View Requests       | Own      | Team  | All        | All     | All
Approve L1          | ❌       | ✅    | ✅         | ✅      | ✅
Approve L2          | ❌       | ❌    | ✅         | ✅      | ✅
Execute Changes     | ❌       | ✅    | ✅         | ✅      | ✅
Bulk Operations     | ❌       | ❌    | ✅         | ✅      | ✅
View Audit Logs     | ❌       | ❌    | ✅         | ✅      | ✅
User Management     | ❌       | ❌    | ❌         | ❌      | ✅
System Config       | ❌       | ❌    | ❌         | ❌      | ✅
```

## Monitoring & Observability

### Application Insights
- Page load times
- API call duration histograms
- Error rates and exceptions
- Custom events: RequestCreated, RequestApproved, EligibilityChecked
- User flow analytics

### Alerts
- SLA breach rate > 5% → P2 alert
- API error rate > 1% → P2 alert
- Notification delivery failure > 5% → P3 alert
- Average response time > 3s → P3 alert

### Dashboards
- Operations Dashboard: Queue depth, TAT, SLA compliance
- Management Dashboard: Trends, throughput, team performance
- Technical Dashboard: API health, error rates, latency

## Environments

| Environment | Purpose | URL Pattern | Data |
|-------------|---------|-------------|------|
| Development | Active development | dev.crm.dynamics.com | Mock + Synthetic |
| Test | QA + Integration testing | test.crm.dynamics.com | Anonymized prod |
| UAT | User acceptance testing | uat.crm.dynamics.com | Anonymized prod |
| Production | Live system | prod.crm.dynamics.com | Real data |

## Disaster Recovery
- **RPO:** 1 hour (Dataverse backup every hour)
- **RTO:** 4 hours
- **Strategy:** Microsoft Power Platform geo-redundancy
- **Backups:** Daily automated exports via Power Platform admin
- **Failover:** Passive secondary environment in paired region

## Compliance
- IRDAI Guidelines for Insurance IT
- DPDP Act (Data Protection)
- ISO 27001 security controls
- Audit log retention: 7 years
- PAN/Aadhaar masking in all displays
- Encryption at rest and in transit
