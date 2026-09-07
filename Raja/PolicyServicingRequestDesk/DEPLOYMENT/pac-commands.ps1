# PAC Commands - Automated Setup Script

Complete automated setup using Power Platform CLI (pac) commands.

## Prerequisites Check

```powershell
# Check PowerShell version
Write-Host "PowerShell Version: $($PSVersionTable.PSVersion)" -ForegroundColor Green

# Check PAC installation
try {
    $pacVersion = pac --version
    Write-Host "PAC CLI Version: $pacVersion" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: PAC CLI not installed. Please install from https://aka.ms/PowerAppsCLI" -ForegroundColor Red
    exit
}

# Create project directories
$projectRoot = "C:\Users\vmuser\Desktop\PolicyServicingRequestDesk"
$dirs = @("DEPLOYMENT", "CONFIGURATION", "SOLUTION", "BACKUPS", "POWER-APPS", "POWER-AUTOMATE", "COPILOT-STUDIO", "DATAVERSE")

foreach ($dir in $dirs) {
    $path = "$projectRoot\$dir"
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
        Write-Host "✓ Created: $dir" -ForegroundColor Green
    }
}
```

---

## Step 1: Authentication Setup

Save as: `DEPLOYMENT\01-auth-setup.ps1`

```powershell
<#
    Script: 01-auth-setup.ps1
    Purpose: Authenticate and set working environment
    Run this first before any other PAC commands
#>

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   POLICY SERVICING DESK - AUTH SETUP                  ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Step 1: Clear existing auth (optional)
Write-Host "Step 1: Clearing previous authentication..." -ForegroundColor Yellow
# pac auth clear  # Uncomment if you want to clear and start fresh

# Step 2: Create authentication context
Write-Host "Step 2: Authenticating to Power Platform..." -ForegroundColor Yellow
Write-Host "A browser window will open for login. Please sign in with your Microsoft 365 account." -ForegroundColor Cyan

pac auth create --url https://admin.powerplatform.com

Write-Host "✓ Authentication successful!" -ForegroundColor Green
Write-Host ""

# Step 3: List available environments
Write-Host "Step 3: Listing available environments..." -ForegroundColor Yellow
pac admin list

Write-Host ""
Write-Host "✓ Setup complete! Run 02-environment-create.ps1 next" -ForegroundColor Green
```

---

## Step 2: Environment Creation

Save as: `DEPLOYMENT\02-environment-create.ps1`

```powershell
<#
    Script: 02-environment-create.ps1
    Purpose: Create developer environment
    Prerequisites: Run 01-auth-setup.ps1 first
#>

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   POLICY SERVICING DESK - ENVIRONMENT CREATE          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Configuration
$environmentName = "InsuranceDemo"
$environmentRegion = "unitedstates"
$environmentType = "Sandbox"
$currency = "USD"
$language = 1033  # English (US)

Write-Host "Creating environment: $environmentName" -ForegroundColor Yellow
Write-Host "Region: $environmentRegion" -ForegroundColor Cyan
Write-Host "Type: $environmentType" -ForegroundColor Cyan
Write-Host ""
Write-Host "This may take 5-15 minutes..." -ForegroundColor Yellow
Write-Host ""

# Create environment
pac admin create `
    --name $environmentName `
    --region $environmentRegion `
    --type $environmentType `
    --currency $currency `
    --language $language

Write-Host ""
Write-Host "✓ Environment creation initiated!" -ForegroundColor Green
Write-Host "Waiting for environment to be ready..." -ForegroundColor Cyan
Write-Host ""

# Verify environment was created
Start-Sleep -Seconds 10

$envList = pac admin list
Write-Host $envList

Write-Host ""
Write-Host "✓ Environment ready! Run 03-solution-create.ps1 next" -ForegroundColor Green
```

---

## Step 3: Solution Creation

Save as: `DEPLOYMENT\03-solution-create.ps1`

```powershell
<#
    Script: 03-solution-create.ps1
    Purpose: Create solution container
    Prerequisites: Run 02-environment-create.ps1 first
#>

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   POLICY SERVICING DESK - SOLUTION CREATE             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Configuration
$environmentName = "InsuranceDemo"
$publisherName = "InsuranceTeam"
$publisherPrefix = "ins"
$solutionName = "PolicyServicingRequestDesk"

# Set working environment
Write-Host "Step 1: Setting active environment to: $environmentName" -ForegroundColor Yellow

pac auth select --environment $environmentName

Write-Host "✓ Environment set" -ForegroundColor Green
Write-Host ""

# Navigate to solution directory
$solutionPath = "C:\Users\vmuser\Desktop\PolicyServicingRequestDesk\SOLUTION\PolicyServicingRequestDesk"

if (-not (Test-Path $solutionPath)) {
    New-Item -ItemType Directory -Path $solutionPath -Force | Out-Null
    Write-Host "✓ Created solution directory: $solutionPath" -ForegroundColor Green
}

Set-Location -Path $solutionPath

Write-Host ""
Write-Host "Step 2: Creating solution container..." -ForegroundColor Yellow
Write-Host "Publisher: $publisherName" -ForegroundColor Cyan
Write-Host "Prefix: $publisherPrefix" -ForegroundColor Cyan
Write-Host "Solution Name: $solutionName" -ForegroundColor Cyan
Write-Host ""

# Create solution
pac solution create `
    --publisher-name $publisherName `
    --publisher-prefix $publisherPrefix

Write-Host ""
Write-Host "✓ Solution created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Go to https://make.powerapps.com" -ForegroundColor Cyan
Write-Host "2. Select 'InsuranceDemo' environment" -ForegroundColor Cyan
Write-Host "3. Create Dataverse tables following IMPLEMENTATION_GUIDE.md" -ForegroundColor Cyan
Write-Host "4. Then run 04-solution-export.ps1" -ForegroundColor Cyan
```

---

## Step 4: Solution Export

Save as: `DEPLOYMENT\04-solution-export.ps1`

```powershell
<#
    Script: 04-solution-export.ps1
    Purpose: Export solution for backup/deployment
    Prerequisites: Tables and components added to solution
#>

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   POLICY SERVICING DESK - SOLUTION EXPORT             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Configuration
$environmentName = "InsuranceDemo"
$solutionName = "PolicyServicingRequestDesk"
$exportPath = "C:\Users\vmuser\Desktop\PolicyServicingRequestDesk\DEPLOYMENT"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# Set environment
Write-Host "Step 1: Setting active environment" -ForegroundColor Yellow
pac auth select --environment $environmentName

Write-Host "✓ Environment: $environmentName" -ForegroundColor Green
Write-Host ""

# Export unmanaged (for development)
Write-Host "Step 2: Exporting unmanaged solution..." -ForegroundColor Yellow

$unmanagedFile = "$exportPath\$solutionName`_$timestamp.zip"

pac solution export `
    --path $unmanagedFile `
    --name $solutionName `
    --unmanaged

if (Test-Path $unmanagedFile) {
    Write-Host "✓ Unmanaged export complete: $unmanagedFile" -ForegroundColor Green
}

Write-Host ""

# Export managed (for deployment)
Write-Host "Step 3: Exporting managed solution..." -ForegroundColor Yellow

$managedFile = "$exportPath\$solutionName`_managed_$timestamp.zip"

pac solution export `
    --path $managedFile `
    --name $solutionName `
    --managed

if (Test-Path $managedFile) {
    Write-Host "✓ Managed export complete: $managedFile" -ForegroundColor Green
}

Write-Host ""
Write-Host "Backup location: $exportPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ Export complete!" -ForegroundColor Green
```

---

## Step 5: Solution Import

Save as: `DEPLOYMENT\05-solution-import.ps1`

```powershell
<#
    Script: 05-solution-import.ps1
    Purpose: Import solution to environment
    Use Case: Deploy to new environment or restore from backup
#>

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   POLICY SERVICING DESK - SOLUTION IMPORT             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Configuration
$targetEnvironment = Read-Host "Enter target environment name (default: InsuranceDemo)"
if ([string]::IsNullOrWhiteSpace($targetEnvironment)) {
    $targetEnvironment = "InsuranceDemo"
}

$solutionPath = Read-Host "Enter solution file path (e.g., C:\...\solution.zip)"

if (-not (Test-Path $solutionPath)) {
    Write-Host "ERROR: Solution file not found at: $solutionPath" -ForegroundColor Red
    exit
}

# Set environment
Write-Host "Step 1: Authenticating to target environment" -ForegroundColor Yellow

pac auth select --environment $targetEnvironment

Write-Host "✓ Environment: $targetEnvironment" -ForegroundColor Green
Write-Host ""

# Import solution
Write-Host "Step 2: Importing solution..." -ForegroundColor Yellow
Write-Host "This may take several minutes..." -ForegroundColor Cyan
Write-Host ""

pac solution import `
    --path $solutionPath `
    --environment $targetEnvironment

Write-Host ""
Write-Host "✓ Solution import complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Verify in Power Apps:" -ForegroundColor Cyan
Write-Host "1. Go to https://make.powerapps.com" -ForegroundColor Cyan
Write-Host "2. Select '$targetEnvironment' environment" -ForegroundColor Cyan
Write-Host "3. Click Solutions" -ForegroundColor Cyan
Write-Host "4. Verify 'PolicyServicingRequestDesk' appears" -ForegroundColor Cyan
```

---

## Step 6: Verify Installation

Save as: `DEPLOYMENT\06-verify-install.ps1`

```powershell
<#
    Script: 06-verify-install.ps1
    Purpose: Verify solution components are installed
#>

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   POLICY SERVICING DESK - VERIFICATION CHECK          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Configuration
$environmentName = "InsuranceDemo"

# Set environment
pac auth select --environment $environmentName

Write-Host "Checking environment: $environmentName" -ForegroundColor Yellow
Write-Host ""

# List solutions
Write-Host "Step 1: Checking installed solutions..." -ForegroundColor Yellow

try {
    $solutions = pac solution list
    Write-Host $solutions
    Write-Host ""
    
    if ($solutions -match "PolicyServicingRequestDesk") {
        Write-Host "✓ Solution 'PolicyServicingRequestDesk' found" -ForegroundColor Green
    } else {
        Write-Host "✗ Solution 'PolicyServicingRequestDesk' NOT found" -ForegroundColor Red
    }
}
catch {
    Write-Host "Error listing solutions: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Step 2: Manual verification checklist" -ForegroundColor Yellow
Write-Host ""
Write-Host "Go to https://make.powerapps.com and verify:" -ForegroundColor Cyan
Write-Host "  □ Environment: InsuranceDemo selected" -ForegroundColor Cyan
Write-Host "  □ Solutions: PolicyServicingRequestDesk exists" -ForegroundColor Cyan
Write-Host "  □ Tables: ins_policy, ins_request, ins_statushistory, ins_auditlog" -ForegroundColor Cyan
Write-Host "  □ Power Apps: PolicyRequestDesk canvas app" -ForegroundColor Cyan
Write-Host "  □ Power Automate: All 4 flows present and enabled" -ForegroundColor Cyan
Write-Host "  □ Copilot Studio: PolicyServiceAgent bot created" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ Verification complete!" -ForegroundColor Green
```

---

## Master Setup Script

Save as: `DEPLOYMENT\00-setup-all.ps1`

```powershell
<#
    Script: 00-setup-all.ps1
    Purpose: Master script to run all setup steps in sequence
    Usage: .\00-setup-all.ps1
#>

Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║   POLICY SERVICING DESK - COMPLETE SETUP               ║" -ForegroundColor Magenta
Write-Host "║   Insurance Solution on Power Platform                 ║" -ForegroundColor Magenta
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

$deploymentPath = "C:\Users\vmuser\Desktop\PolicyServicingRequestDesk\DEPLOYMENT"

# Verify PAC CLI
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
try {
    $pacVersion = pac --version
    Write-Host "✓ PAC CLI found: $pacVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ PAC CLI not found. Install from https://aka.ms/PowerAppsCLI" -ForegroundColor Red
    exit
}

Write-Host ""

# Step 1: Authentication
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "STEP 1: AUTHENTICATION" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

& "$deploymentPath\01-auth-setup.ps1"

Write-Host ""
$proceed = Read-Host "Continue to next step? (y/n)"
if ($proceed -ne "y") { exit }

Write-Host ""

# Step 2: Environment Creation
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "STEP 2: ENVIRONMENT CREATION" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

& "$deploymentPath\02-environment-create.ps1"

Write-Host ""
$proceed = Read-Host "Continue to next step? (y/n)"
if ($proceed -ne "y") { exit }

Write-Host ""

# Step 3: Solution Creation
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "STEP 3: SOLUTION CREATION" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

& "$deploymentPath\03-solution-create.ps1"

Write-Host ""
Write-Host "⚠️  IMPORTANT: Add Dataverse tables and components via Power Apps UI" -ForegroundColor Yellow
Write-Host "Follow IMPLEMENTATION_GUIDE.md Phase 2-5 before proceeding." -ForegroundColor Yellow
Write-Host ""

$proceed = Read-Host "Have you added all components? Continue to export? (y/n)"
if ($proceed -ne "y") { exit }

Write-Host ""

# Step 4: Solution Export
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "STEP 4: SOLUTION EXPORT" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

& "$deploymentPath\04-solution-export.ps1"

Write-Host ""

# Step 5: Verification
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "STEP 5: VERIFICATION" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

& "$deploymentPath\06-verify-install.ps1"

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   ✓ SETUP COMPLETE!                                    ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Test in Power Apps: https://make.powerapps.com" -ForegroundColor Cyan
Write-Host "2. Create sample data for testing" -ForegroundColor Cyan
Write-Host "3. Deploy to production when ready" -ForegroundColor Cyan
Write-Host ""
```

---

## Deployment Checklist

Save as: `DEPLOYMENT\deployment-checklist.md`

### Pre-Deployment Checklist

- [ ] Power Platform CLI installed and verified
- [ ] Microsoft 365 admin account ready
- [ ] Power Platform Administrator role assigned
- [ ] Dataverse license available
- [ ] All stakeholders notified of deployment
- [ ] Backup created of existing environments (if applicable)
- [ ] Documentation reviewed by team

### Deployment Steps Checklist

- [ ] Run: `01-auth-setup.ps1` - Authenticate
- [ ] Run: `02-environment-create.ps1` - Create InsuranceDemo
- [ ] Wait for environment to be ready (5-15 min)
- [ ] Run: `03-solution-create.ps1` - Create solution container
- [ ] **Via Power Apps UI:**
  - [ ] Create 4 Dataverse tables
  - [ ] Create Canvas App (PolicyRequestDesk)
  - [ ] Create 4 Power Automate flows
  - [ ] Create Copilot Studio agent
  - [ ] Add all components to solution
- [ ] Run: `04-solution-export.ps1` - Export solution
- [ ] Run: `05-solution-import.ps1` - (Optional) Import to another environment
- [ ] Run: `06-verify-install.ps1` - Verify installation

### Post-Deployment Checklist

- [ ] Verify all components in Power Apps
- [ ] Test Canvas App functionality
- [ ] Test Power Automate flows
- [ ] Test Copilot Studio agent
- [ ] Create sample test data
- [ ] Run test cases from IMPLEMENTATION_GUIDE.md
- [ ] Verify email notifications send
- [ ] Check audit logs
- [ ] Assign user security roles (optional)
- [ ] Communicate availability to users
- [ ] Create backup of deployed solution

### Rollback Checklist

If deployment fails:

- [ ] Delete problematic solution
- [ ] Restore from backup export
- [ ] Verify environment is clean
- [ ] Review error logs
- [ ] Fix issues locally
- [ ] Re-export solution
- [ ] Retry deployment

---

## Troubleshooting Commands

```powershell
# Clear authentication and start fresh
pac auth clear
pac auth create --url https://admin.powerplatform.com

# List all environments
pac admin list

# Delete environment (if needed)
pac admin delete --name "EnvironmentName"

# Check which environment is currently active
pac auth list

# Select specific environment
pac auth select --environment "InsuranceDemo"

# List all solutions
pac solution list

# Check PAC version
pac --version

# Get detailed help
pac --help
pac solution --help
```

---

**Last Updated:** September 2024  
**Version:** 1.0
