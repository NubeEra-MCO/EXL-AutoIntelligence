# Environment Setup Guide

Complete guide to set up Power Platform developer environment using Power Platform CLI (PAC).

## Prerequisites

### Required Software
1. **Power Platform CLI (pac)** - Latest version
   - Download: https://aka.ms/PowerAppsCLI
   - Install: Run MSI installer
   - Verify: Open PowerShell, run `pac --version`

2. **PowerShell** - Version 5.1 or later
   - Windows comes with this by default
   - Verify: `$PSVersionTable.PSVersion`

3. **Git** (Optional but recommended)
   - For version control and solution packaging

4. **Visual Studio Code** (Optional)
   - For editing configuration files
   - Install Power Platform Extension

### Required Permissions
- Power Platform Administrator role
- Environment creation privileges
- Ability to assign security roles

---

## Step 1: Initial Setup

### 1.1 Verify PAC Installation

```powershell
# Check PAC version
pac --version

# Check available commands
pac --help
```

### 1.2 Create Working Directory

```powershell
# Navigate to project folder
cd C:\Users\vmuser\Desktop\PolicyServicingRequestDesk

# Create subdirectories for organization
mkdir DEPLOYMENT
mkdir CONFIGURATION
mkdir SOLUTION
mkdir BACKUPS

# Verify structure
Get-ChildItem -Recurse
```

---

## Step 2: Authentication & Environment Creation

### 2.1 Authenticate to Power Platform

```powershell
# Create authentication context (interactive login)
pac auth create --url https://admin.powerplatform.com

# This will open a browser for Microsoft 365 login
# After login, the authentication token is stored locally
```

### 2.2 List Existing Environments

```powershell
# See all available environments
pac admin list

# Output will show:
# • Display Name
# • Environment ID
# • Organization ID
# • Environment Type (Production/Sandbox/Trial)
# • URL
```

### 2.3 Create Developer Environment

```powershell
# Create new Sandbox environment
pac admin create `
  --name "InsuranceDemo" `
  --region "unitedstates" `
  --type Sandbox `
  --currency USD `
  --language 1033

# Alternative: Create in different region
# Regions: europe, asiapacific, australia, unitedstates, canada

# This process takes 5-10 minutes
# Wait for "Environment created successfully" message
```

### 2.4 Verify Environment Creation

```powershell
# List again to find your new environment
pac admin list

# Note down:
# • Environment ID (looks like: org1234567)
# • Environment URL (looks like: https://org1234567.crm.dynamics.com)

# Set this as your working environment
pac auth select --environment InsuranceDemo
```

---

## Step 3: Initialize Solution Structure

### 3.1 Create Solution Folder

```powershell
# Create solution directory
mkdir SOLUTION\PolicyServicingRequestDesk
cd SOLUTION\PolicyServicingRequestDesk

# Initialize git (optional but recommended)
git init
git config user.name "Your Name"
git config user.email "your.email@company.com"
```

### 3.2 Create Solution in Environment

```powershell
# Create new solution via PAC
pac solution create `
  --publisher-name "InsuranceTeam" `
  --publisher-prefix "ins"

# The PAC CLI will:
# 1. Ask for solution name → "PolicyServicingRequestDesk"
# 2. Create solution in Dataverse
# 3. Generate cdsproj file locally
```

### 3.3 Verify Solution Creation

```powershell
# List solutions
pac solution list

# Output shows:
# • PolicyServicingRequestDesk
# • Version: 1.0.0.0
# • Status: Active
```

---

## Step 4: Solution Configuration

### 4.1 Edit Solution Properties

The PAC CLI creates these files locally:

```
PolicyServicingRequestDesk/
├── cdsproj (solution metadata)
├── Other\Customizations.xml (will be created on first export)
└── solution.xml
```

### 4.2 Add Solution Components

Add components to your solution in Power Apps UI:
1. Go to https://make.powerapps.com
2. Select InsuranceDemo environment
3. Go to Solutions
4. Select PolicyServicingRequestDesk
5. Add → New (Tables, Flows, Apps, etc.)

Or use PAC commands:

```powershell
# Add existing table to solution
pac solution add-component `
  --solution-file cdsproj `
  --component-type 1 `
  --component-id [TABLE_ID]

# Component types:
# 1 = Entity (Table)
# 61 = Model App
# 300 = Canvas App
# 336 = Flow (Process)
```

---

## Step 5: Dataverse Configuration

### 5.1 Enable Dataverse Features

```powershell
# Set environment variables (these are set via UI, not PAC)
# Go to make.powerapps.com > Dataverse > Settings:

# Enable:
# ✓ Plug-in isolation
# ✓ Server-side synchronization
# ✓ Auditing (for compliance)
# ✓ Duplicate detection rules
```

### 5.2 Create Tables (Automated Script)

Create `DEPLOYMENT\create-tables.ps1`:

```powershell
# This is a template - tables are created via UI, not PAC
# Instead, use Power Apps UI or Microsoft Dataverse REST API

# For now, follow IMPLEMENTATION_GUIDE.md Phase 2 to create tables via UI
```

---

## Step 6: Export & Version Control

### 6.1 Export Solution (Managed)

```powershell
# Export as managed solution (for deployment)
pac solution export `
  --path ".\" `
  --managed

# Creates: PolicyServicingRequestDesk_managed.zip
# This is the deployable package
```

### 6.2 Export Solution (Unmanaged)

```powershell
# Export as unmanaged solution (for development)
pac solution export `
  --path ".\" `
  --unmanaged

# Creates: PolicyServicingRequestDesk.zip
# Use this for backups and team sharing
```

### 6.3 Add to Git (Optional)

```powershell
# Add solution files to git
git add .
git commit -m "Initial solution structure - Phase 1 setup"

# Create .gitignore (optional)
$gitignore = @"
*.zip
.vs/
bin/
obj/
*.user
"@
$gitignore | Out-File -FilePath .gitignore -Encoding UTF8

git add .gitignore
git commit -m "Add .gitignore"
```

---

## Step 7: Deploy to Environment

### 7.1 Import Solution to Same Environment

```powershell
# If solution is modified, import back to dev environment
pac solution import `
  --path ".\PolicyServicingRequestDesk.zip" `
  --environment "InsuranceDemo"

# This updates the solution in Dataverse with your local changes
```

### 7.2 Deploy to New Environment

```powershell
# First, authenticate with target environment
pac auth create --url https://admin.powerplatform.com
pac auth select --environment TargetEnvironment

# Then import solution
pac solution import `
  --path ".\PolicyServicingRequestDesk_managed.zip" `
  --environment "TargetEnvironment" `
  --activate-plugins

# Solution is now deployed to target environment
```

---

## Step 8: Plugin & Flow Registration (Advanced)

### 8.1 List Plugins

```powershell
# View registered plugins (if any)
pac plugin list
```

### 8.2 Register Custom Connectors

```powershell
# If using custom connectors
pac connector create `
  --name "InsuranceAPI" `
  --icon-url "https://example.com/icon.png"
```

---

## Step 9: Post-Deployment Configuration

### 9.1 Set Environment Variables

```powershell
# Create environment variable (Power Apps UI or REST API)
# Name: InsuranceAdminEmail
# Value: admin@company.com

# This allows flows to reference environment-specific values
```

### 9.2 Configure User Access

```powershell
# Assign security roles to users (via UI)
# Go to make.powerapps.com:
# 1. Settings → Admin Center
# 2. Environments → InsuranceDemo
# 3. Access → Users
# 4. Assign roles:
#    • Insurance Agent: Team members
#    • Insurance Manager: Supervisors
```

### 9.3 Enable Email Notifications

Power Automate requires mailbox configuration:

```
1. Go to make.powerapps.com
2. Flows
3. Cloud flows → Automated
4. Select an email notification flow
5. Test the flow
6. Verify email settings in Office 365
```

---

## Step 10: Testing & Validation

### 10.1 Verify Solution Import

```powershell
# List solutions in environment
pac admin list-solutions --environment "InsuranceDemo"

# Verify PolicyServicingRequestDesk is present
```

### 10.2 Test Data Creation

1. Go to https://make.powerapps.com
2. Select InsuranceDemo environment
3. Create sample policy record
4. Verify: Record appears in Dataverse

### 10.3 Test Power Automate Flows

1. Go to https://make.powerautomate.com
2. Select InsuranceDemo environment
3. Test each flow manually
4. Verify: Email notifications send, status updates work

### 10.4 Test Copilot Studio Agent

1. Go to https://copilotstudio.microsoft.com
2. Select InsuranceDemo environment
3. Test agent responses
4. Verify: Agent can query Dataverse and respond accurately

---

## Troubleshooting

### Issue: Authentication Fails

```powershell
# Clear authentication cache
pac auth clear

# Create new authentication
pac auth create --url https://admin.powerplatform.com

# If still failing, check:
# - Microsoft 365 account has Power Platform licenses
# - Power Platform Administrator role assigned
```

### Issue: Environment Creation Fails

```powershell
# Verify you have environment creation quota
pac admin capacity

# If quota exceeded, delete old trial environments first
pac admin delete --name "OldEnvironment"
```

### Issue: Solution Import Fails

```powershell
# Check solution file integrity
# Try re-exporting the solution

# Verify target environment is accessible
pac auth select --environment TargetEnvironment
pac admin list

# Check for dependency conflicts
# Review flow errors in Power Automate UI
```

### Issue: Flows Not Running

```powershell
# Verify flow is enabled (check Power Automate UI)
# Check flow run history for errors
# Verify Dataverse table connections exist
# Check Office 365 mail connection is active
```

---

## Useful PAC Commands Reference

```powershell
# Authentication
pac auth create              # Login to Power Platform
pac auth delete              # Remove auth profile
pac auth list                # Show all auth profiles
pac auth select              # Set active environment
pac auth clear               # Clear all authentication

# Admin Operations
pac admin list               # List environments
pac admin create             # Create new environment
pac admin delete             # Delete environment
pac admin list-solutions     # List solutions in environment
pac admin capacity           # Show capacity usage

# Solution Operations
pac solution create          # Create new solution
pac solution list            # List solutions
pac solution import          # Import solution
pac solution export          # Export solution
pac solution add-component   # Add component to solution

# Plugin Operations
pac plugin list              # List plugins
pac plugin register          # Register plugin step

# Connection Operations
pac connector list           # List connectors
pac connector create         # Create custom connector

# Package Operations
pac package create           # Create package
pac package deploy           # Deploy package
```

---

## Environment Variables Setup

Create file: `DEPLOYMENT\environment-variables.ps1`

```powershell
# Environment Configuration Variables

# Power Platform Settings
$environmentName = "InsuranceDemo"
$publisherName = "InsuranceTeam"
$publisherPrefix = "ins"
$organizationUrl = "https://admin.powerplatform.com"

# Solution Configuration
$solutionName = "PolicyServicingRequestDesk"
$solutionVersion = "1.0.0.0"

# Email Configuration
$notificationEmail = "insurance-team@company.com"
$adminEmail = "admin@company.com"
$approverEmail = "manager@company.com"

# Contact Info
$projectName = "Policy Servicing Request Desk"
$projectTeam = "Insurance Solutions Team"

# File Paths
$projectRoot = "C:\Users\vmuser\Desktop\PolicyServicingRequestDesk"
$solutionPath = "$projectRoot\SOLUTION\PolicyServicingRequestDesk"
$deploymentPath = "$projectRoot\DEPLOYMENT"
$backupPath = "$projectRoot\BACKUPS"

# Export both unmanaged and managed
$unmanaged = "$deploymentPath\$solutionName.zip"
$managed = "$deploymentPath\$solutionName`_managed.zip"
```

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────┐
│       POWER PLATFORM CLI QUICK REFERENCE            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  LOGIN:                                            │
│    pac auth create --url https://admin.powerplat...│
│    pac auth select --environment InsuranceDemo    │
│                                                     │
│  CREATE ENVIRONMENT:                               │
│    pac admin create --name "InsuranceDemo" ...    │
│                                                     │
│  CREATE SOLUTION:                                  │
│    pac solution create --publisher-name "Team"... │
│                                                     │
│  EXPORT SOLUTION:                                  │
│    pac solution export --path "." --managed      │
│    pac solution export --path "." --unmanaged    │
│                                                     │
│  IMPORT SOLUTION:                                  │
│    pac solution import --path ".\solution.zip"   │
│                                                     │
│  LIST SOLUTIONS:                                   │
│    pac solution list                              │
│                                                     │
│  HELP:                                             │
│    pac --help                                      │
│    pac solution --help                            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Next Steps

1. ✅ Install Power Platform CLI
2. ✅ Create InsuranceDemo environment
3. ✅ Create PolicyServicingRequestDesk solution
4. ✅ Follow IMPLEMENTATION_GUIDE.md Phase 2-5 to add components
5. ✅ Return to this guide for export/import commands

---

**Last Updated:** September 2024  
**Version:** 1.0
