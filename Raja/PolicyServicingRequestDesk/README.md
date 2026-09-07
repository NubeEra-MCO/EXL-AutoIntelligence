# Policy Servicing Request Desk - Power Platform Solution

A comprehensive insurance policy servicing solution built with Microsoft Power Platform (Power Apps, Power Automate, Copilot Studio, and Dataverse).

## 📋 Project Overview

**Domain:** Insurance  
**Solution Name:** PolicyServicingRequestDesk  
**Build Path:** 5-phase implementation  
**Timeline:** Quick MVP with core functionalities

### Business Problem
Routine policy changes (address updates, nominee changes, premium mode switches) consume significant servicing capacity. Customers cannot track request status, leading to repeat calls and inefficient handling.

### Solution Components
- 📊 **Request Catalogue:** Policy data with eligibility rules
- 📱 **Canvas App:** Request creation, eligibility checks, live status view
- 🤖 **Copilot Agent:** Status inquiries and eligible change execution with approval
- 📈 **Tracking System:** Status history for complete visibility

## 🎯 Business Outcomes
- Deflection of routine servicing contacts
- Visible request status
- Faster turnaround on endorsements
- Lower repeat-contact rate

## 📁 Project Structure

```
PolicyServicingRequestDesk/
├── README.md (this file)
├── IMPLEMENTATION_GUIDE.md
├── ARCHITECTURE.md
├── CONFIGURATION/
│   ├── solution-config.json
│   ├── dataverse-schema.md
│   ├── request-types.json
│   └── eligibility-rules.json
├── DATAVERSE/
│   ├── tables/
│   │   ├── policy.json
│   │   ├── request.json
│   │   ├── statushistory.json
│   │   └── auditlog.json
│   └── sample-data.json
├── POWER-APPS/
│   ├── app-config.json
│   └── ui-layout.md
├── POWER-AUTOMATE/
│   ├── flows/
│   │   ├── create-request-flow.json
│   │   ├── approval-flow.json
│   │   ├── status-update-flow.json
│   │   └── audit-log-flow.json
│   └── flow-templates.md
├── COPILOT-STUDIO/
│   ├── agent-config.json
│   ├── topics/
│   │   ├── status-inquiry.json
│   │   ├── address-change.json
│   │   ├── nominee-change.json
│   │   └── premium-mode-change.json
│   └── knowledge-base.md
├── DEPLOYMENT/
│   ├── pac-commands.sh
│   ├── environment-setup.md
│   └── deployment-checklist.md
└── DOCUMENTATION/
    ├── user-guide.md
    └── admin-guide.md
```

## ⚡ Quick Start

1. **Setup Environment** → Run pac commands to create developer environment
2. **Create Dataverse Tables** → Define policy, request, status history, audit tables
3. **Build Canvas App** → Create request form and status dashboard
4. **Create Flows** → Set up approval and execution automation
5. **Deploy Agent** → Configure Copilot Studio bot with request handling

## 🚀 Implementation Phases

### Phase 1: Data Model (Dataverse)
- Policy table (policy number, customer, premium mode, address, nominee)
- Request table (policy ref, request type, status, priority)
- Status History table (request ref, status, timestamp, handler)
- Audit Log table (change details, user, timestamp)

### Phase 2: Canvas App (Power Apps)
- Policy lookup and request creation form
- Request eligibility validation engine
- Live request status dashboard
- Request history view

### Phase 3: Automation (Power Automate)
- Request creation with eligibility validation
- Approval workflow for eligible requests
- Status update notifications
- Audit trail logging

### Phase 4: Intelligent Agent (Copilot Studio)
- Status inquiry topic
- Request type guidance
- Change approval and execution
- Knowledge base integration

### Phase 5: Deployment (Packaging & Publishing)
- Solution package creation
- Environment deployment via pac
- Configuration data seeding

## 📌 Request Types & Eligibility Rules

### 1. Address Change
- **Eligibility:** All policy statuses except "Suspended" or "Lapsed"
- **Required Info:** New address, verification ID
- **Processing:** Direct execution
- **SLA:** 2 business days

### 2. Nominee Change
- **Eligibility:** Active policies only, no outstanding claims
- **Required Info:** New nominee details, verification
- **Processing:** Approval required
- **SLA:** 3 business days

### 3. Premium Mode Change
- **Eligibility:** Annual policies only, no payment failures in last 12 months
- **Required Info:** New mode preference, effective date
- **Processing:** Approval + backend processing
- **SLA:** 5 business days

### 4. Policy Information Update
- **Eligibility:** All active policies
- **Required Info:** Specific field to update, verification
- **Processing:** Direct execution
- **SLA:** 1 business day

## 📊 Dataverse Tables Schema

See `CONFIGURATION/dataverse-schema.md` for detailed schema.

## 🔧 Technology Stack
- **Database:** Microsoft Dataverse
- **Frontend:** Power Apps (Canvas App)
- **Automation:** Power Automate
- **AI/Bot:** Copilot Studio
- **Deployment:** Power Platform CLI (pac)
- **Environment:** Power Platform Developer Environment

## 📝 Next Steps

1. Open `IMPLEMENTATION_GUIDE.md` for step-by-step setup
2. Follow the pac commands in `DEPLOYMENT/pac-commands.sh`
3. Configure Dataverse tables from `CONFIGURATION/dataverse-schema.md`
4. Build the Canvas App using `POWER-APPS/app-config.json`
5. Deploy using the deployment checklist

## ⚠️ Important Notes

- **No Security Policies** - Basic setup; add security roles before production
- **Sample Data** - Use provided sample data for testing
- **Compliance** - Add audit logging for regulatory requirements
- **Scalability** - Solution designed for MVP; optimize for production load

## 📞 Support & Documentation

- See `IMPLEMENTATION_GUIDE.md` for detailed implementation steps
- See `ARCHITECTURE.md` for system architecture and data flows
- See `DOCUMENTATION/user-guide.md` for end-user guidance

---

**Last Updated:** September 2024  
**Version:** 1.0 MVP
