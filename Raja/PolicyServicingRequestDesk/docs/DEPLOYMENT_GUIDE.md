# Deployment Guide - Policy Servicing Request Desk

## Deployment Overview

The Policy Servicing Request Desk is deployed as a **Power Apps Code Component (PCF)** in a **Power Platform Solution**.

**Deployment Flow:**
```
Development → Build PCF → Package Solution → Test Environment → UAT → Production
```

---

## Prerequisites

### Required Tools
- **Power Platform CLI (pac)** v2.7+
- **Power BI Service Principal** (for automated deployments)
- **npm** 18+ (already installed)
- **Dataverse Environment** with:
  - Administrator role
  - Solution import permissions
  - Power Automate flow deployment permissions

### Required Access
- Power Platform Admin Center: https://admin.powerplatform.microsoft.com
- Dataverse Environment: https://yourorg.crm.dynamics.com
- Azure DevOps: For CI/CD pipeline

---

## Local Build & Test

### Step 1: Build the PCF Component

```bash
cd c:\Users\vmuser\Desktop\Projects\Raja\PolicyServicingRequestDesk

# Run type checking
npm run type-check

# Run ESLint
npm run lint

# Build production bundle
npm run build
```

**Output Generated:**
```
out/
└── controls/
    └── PolicyServicingRequestDesk/
        ├── bundle.js
        ├── ControlManifest.xml
        └── index.js
```

### Step 2: Authenticate with Dataverse

```bash
# Create authentication profile
pac auth create `
  --url https://yourorg.crm.dynamics.com `
  --username your@email.com `
  --password YourPassword

# List all profiles
pac auth list

# Use a specific profile for commands
pac auth select --index 0
```

**Using Service Principal (Recommended for CI/CD):**
```bash
pac auth create `
  --url https://yourorg.crm.dynamics.com `
  --tenant your-tenant-id.onmicrosoft.com `
  --applicationid client-id `
  --clientsecret client-secret `
  --environment 00000000-0000-0000-0000-000000000000
```

### Step 3: Push PCF to Development Environment

```bash
# From project root, push the PCF component
pac pcf push `
  --publisher-prefix psrd

# Verify push succeeded
# Component will be available in Power Apps solution maker
```

---

## Solution Packaging

### Step 4: Build Solution Package

```bash
# Navigate to Solution folder
cd Solution

# Create unmanaged solution
pac solution build `
  --solution-folder . `
  --output-folder ..\out

# Creates: PolicyServicingRequestDesk.zip (unmanaged)
```

### Step 5: Generate Managed Solution

```bash
# Use Power Platform CLI v2.7+ for managed solution
pac solution create-managed `
  --solution-zip out\PolicyServicingRequestDesk.zip `
  --output-file out\PolicyServicingRequestDesk_managed.zip
```

---

## Deployment to Environments

### Environment Setup

Create three environments:

| Environment | Purpose | URL Pattern | Data |
|-------------|---------|-------------|------|
| **Development** | Active development | dev.crm.dynamics.com | Mock/Synthetic |
| **Test/UAT** | QA & User testing | test.crm.dynamics.com | Anonymized Prod |
| **Production** | Live system | prod.crm.dynamics.com | Real Data |

### Deploy to Development

```bash
# Authenticate
pac auth create --url https://dev.crm.dynamics.com --username dev@company.com

# Import unmanaged solution
pac solution import `
  --path out\PolicyServicingRequestDesk.zip `
  --publish-workflows true `
  --overwrite-unmanaged-customizations true

# Post-deployment: Activate flows and configure connections
```

### Deploy to Test/UAT

```bash
# Authenticate to test environment
pac auth create --url https://test.crm.dynamics.com

# Import managed solution
pac solution import `
  --path out\PolicyServicingRequestDesk_managed.zip `
  --publish-workflows true

# Run smoke tests
# Verify: App loads, policy search works, request catalogue displays
```

### Deploy to Production

```bash
# ⚠️  PRODUCTION DEPLOYMENT - Extra caution required

# 1. Authenticate
pac auth create --url https://prod.crm.dynamics.com

# 2. Backup current solution
# DO THIS MANUALLY - Export current solution as managed
# File > Export > PolicyServicingRequestDesk (managed)

# 3. Import new version
pac solution import `
  --path out\PolicyServicingRequestDesk_managed.zip `
  --publish-workflows true `
  --skip-dependency-check false

# 4. Verify deployment
# - Check app opens correctly
# - Verify no errors in console
# - Test critical workflows
# - Monitor Application Insights

# 5. Rollback plan (if needed)
# Import the previously exported backup solution
pac solution import `
  --path PolicyServicingRequestDesk_backup.zip `
  --publish-workflows true `
  --overwrite-unmanaged-customizations true
```

---

## Automated Deployment (CI/CD)

### Azure DevOps Pipeline

Located: `devops/azure-pipelines.yml`

**Pipeline Stages:**
1. **Build** - Compile & test
2. **Deploy Dev** - Auto-deploy on develop branch
3. **Deploy Test** - Manual approval required
4. **Deploy UAT** - Manual approval required
5. **Deploy Prod** - Manual approval required

### Configure Pipeline

#### Step 1: Create Service Connections

In Azure DevOps Project Settings:

**Service Connection for Each Environment:**

```
Project Settings > Service Connections > New Service Connection

Type: Power Platform
Name: PSRD-Dev-ServiceConnection
Environment URL: https://dev.crm.dynamics.com
Authentication: Service Principal
Tenant ID: your-tenant.onmicrosoft.com
Client ID: app-registration-id
Client Secret: app-secret
```

Repeat for `PSRD-Test-ServiceConnection` and `PSRD-Prod-ServiceConnection`.

#### Step 2: Create Variable Groups

In Azure DevOps Pipelines:

```
Pipelines > Library > Variable Groups

Group: PSRD-Variables
- PublisherPrefix: psrd
- SolutionName: PolicyServicingRequestDeskSolution

Group: PSRD-Dev-Variables
- DevopsEnvironmentName: PSRD-Dev
- ServiceConnection: PSRD-Dev-ServiceConnection

Group: PSRD-Test-Variables
- TestEnvironmentName: PSRD-Test
- ServiceConnection: PSRD-Test-ServiceConnection

Group: PSRD-Prod-Variables
- ProdEnvironmentName: PSRD-Prod
- ServiceConnection: PSRD-Prod-ServiceConnection
```

#### Step 3: Trigger Pipeline

```yaml
# Pipeline runs on:
# - Push to main branch → Deploy to Dev
# - PR to main → Build & test only
# - Manual queue → Choose environment
```

### Manual Pipeline Trigger

```bash
# Queue build via Azure DevOps CLI
az pipelines build queue `
  --project "PSRD" `
  --definition-name "PSRD-Pipeline" `
  --branch refs/heads/main
```

---

## Post-Deployment Checklist

### Development Environment
- [ ] PCF component loads in canvas app
- [ ] Policy search returns results
- [ ] Request creation wizard opens
- [ ] Mock data displays correctly
- [ ] No console errors
- [ ] Dataverse connections work (if configured)

### Test/UAT Environment
- [ ] All 10 request types display
- [ ] Eligibility engine validates correctly
- [ ] Approval workflows trigger
- [ ] Email/SMS notifications send
- [ ] SLA calculations correct
- [ ] Audit logs created
- [ ] User acceptance testing passed

### Production Environment
- [ ] Application loads with real data
- [ ] All critical workflows functional
- [ ] Performance acceptable (<3s dashboard load)
- [ ] No data integrity issues
- [ ] Monitoring/alerts configured
- [ ] Backup created successfully
- [ ] Incident response plan activated

### Monitoring Post-Deployment
- Monitor Application Insights dashboard
- Alert on error rate > 1%
- Monitor SLA breach notifications
- Check API response times
- Review audit logs for anomalies

---

## Rollback Procedure

### If Deployment Fails

```bash
# 1. Stop all running flows
# Power Automate > My Flows > Deactivate all PSRD flows

# 2. Uninstall current solution
# Power Automate > Solutions > PolicyServicingRequestDesk > Delete

# 3. Re-import previous backup
pac solution import `
  --path PolicyServicingRequestDesk_backup.zip `
  --publish-workflows true

# 4. Reactivate flows
# Power Automate > My Flows > Activate all PSRD flows

# 5. Verify rollback succeeded
# Test critical paths in app
```

### Data Recovery

If data was corrupted:
1. **Dataverse Backup**: Restore from 24-hour backup (Power Platform Admin Center)
2. **Audit Trail**: Review `psrd_auditlog` table for changes
3. **Contact Microsoft**: Open support case for point-in-time restore

---

## Troubleshooting Deployment

### Issue: "Solution Import Failed"

**Possible Causes:**
- Duplicate table/field names
- Missing dependent solution
- PCF component build errors

**Resolution:**
```bash
# 1. Verify PCF build output
npm run build
ls out/controls/PolicyServicingRequestDesk/

# 2. Check solution.xml for errors
# Review Solution folder for issues

# 3. Try manual import via Power Apps
# Settings > Solutions > Import (manual)
```

### Issue: "Flow Activation Failed"

**Possible Causes:**
- Missing connection references
- Invalid user/role permissions
- Dataverse table security

**Resolution:**
```bash
# 1. Check flow connections
# Power Automate > My Flows > Edit flow > Check connections

# 2. Verify Dataverse permissions
# Settings > Users > Check roles

# 3. Manually activate flow via UI
# Power Automate > My Flows > Flow name > Enable
```

### Issue: "PCF Component Not Rendering"

**Possible Causes:**
- Incorrect publisher prefix
- Missing ControlManifest.xml
- Browser cache issue

**Resolution:**
```bash
# 1. Clear browser cache
# Ctrl+Shift+Delete > Clear browsing data

# 2. Verify publisher prefix matches
grep -i "publisher" Solution/solution.xml

# 3. Force refresh Power Apps
# Ctrl+Shift+R
```

---

## Version Management

### Versioning Strategy

**Format:** `MAJOR.MINOR.PATCH`
- **MAJOR**: Breaking changes, new modules
- **MINOR**: New features, non-breaking changes
- **PATCH**: Bug fixes, minor updates

**Example:** `1.5.2` → Production Release 1, Feature Release 5, Bug Fix 2

### Update Solution Version

```bash
# In Solution/solution.xml
<ImportExportXml>
  <SolutionManifest>
    <Version>1.5.2</Version>
    ...
  </SolutionManifest>
</ImportExportXml>
```

### Managed vs Unmanaged

| Aspect | Unmanaged | Managed |
|--------|-----------|---------|
| **Use Case** | Development | Production |
| **Customizable** | Yes | No |
| **Layering** | Supported | Single layer |
| **Deletion** | Can delete all | Can't delete managed |
| **Distribution** | Internal only | Can distribute |

---

## Monitoring & Support

### Application Insights Dashboard

Monitor key metrics:
- Page load time
- API response time
- Error rates
- Custom events (RequestCreated, Approved, etc.)
- User session duration

### Alert Setup

```
Metric: Error Rate
Condition: > 1% for 5 minutes
Action: Email + SMS to support team
```

### Support Escalation

1. **Level 1**: Check Application Insights logs
2. **Level 2**: Review Dataverse audit trail
3. **Level 3**: Check Power Automate flow run history
4. **Level 4**: Open Microsoft Support ticket

---

## Resources

- [Power Platform Admin Center](https://admin.powerplatform.microsoft.com)
- [Power Apps Solutions Guide](https://learn.microsoft.com/power-apps/maker/model-driven-apps/solution-layers)
- [PCF Deployment](https://learn.microsoft.com/power-apps/developer/component-framework/distribution/publish-components)
- [Power Automate Administration](https://learn.microsoft.com/power-automate/run-cloud-desktop-flows)
