#!/usr/bin/env pwsh
# =============================================================================
# deploy-to-powerplatform.ps1
# Full deployment: Dataverse tables + PCF component + Solution import
# Prerequisites: pac CLI installed, authenticated to target environment
# Usage: .\deploy-to-powerplatform.ps1 -EnvironmentUrl "https://yourorg.crm.dynamics.com"
# =============================================================================
param(
    [Parameter(Mandatory=$true)]
    [string]$EnvironmentUrl,
    [switch]$SkipTableCreation,
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " PSRD Power Platform Deployment" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# ── Step 1: Authenticate ──────────────────────────────────────────────────────
Write-Host "[1/5] Authenticating to $EnvironmentUrl..." -ForegroundColor Yellow
pac auth create --url $EnvironmentUrl
if ($LASTEXITCODE -ne 0) { throw "Authentication failed. Run 'pac auth create --url $EnvironmentUrl' manually." }
Write-Host "  Authentication successful." -ForegroundColor Green

# ── Step 2: Build PCF bundle ──────────────────────────────────────────────────
if (-not $SkipBuild) {
    Write-Host "`n[2/5] Building PCF component..." -ForegroundColor Yellow
    Push-Location $ProjectRoot
    npm run build
    if ($LASTEXITCODE -ne 0) { Pop-Location; throw "Build failed." }
    Pop-Location
    Write-Host "  Build successful." -ForegroundColor Green
} else {
    Write-Host "`n[2/5] Skipping build (--SkipBuild flag set)." -ForegroundColor Gray
}

# ── Step 3: Create Dataverse tables via PAC CLI ───────────────────────────────
if (-not $SkipTableCreation) {
    Write-Host "`n[3/5] Creating Dataverse tables..." -ForegroundColor Yellow

    $tables = @(
        @{
            name = "psrd_policy"
            displayName = "Policy"
            pluralName = "Policies"
            description = "Insurance policy records"
        },
        @{
            name = "psrd_customer"
            displayName = "Customer"
            pluralName = "Customers"
            description = "Policy holder / customer records"
        },
        @{
            name = "psrd_requestcatalog"
            displayName = "Request Catalog"
            pluralName = "Request Catalogs"
            description = "Available service request types and configuration"
        },
        @{
            name = "psrd_servicerequest"
            displayName = "Service Request"
            pluralName = "Service Requests"
            description = "Policy servicing requests"
        },
        @{
            name = "psrd_requeststatushistory"
            displayName = "Request Status History"
            pluralName = "Request Status Histories"
            description = "Audit trail of request status changes"
        },
        @{
            name = "psrd_approval"
            displayName = "Approval"
            pluralName = "Approvals"
            description = "Multi-level approval records for service requests"
        },
        @{
            name = "psrd_eligibilityrule"
            displayName = "Eligibility Rule"
            pluralName = "Eligibility Rules"
            description = "Rules to determine request eligibility"
        },
        @{
            name = "psrd_requireddocument"
            displayName = "Required Document"
            pluralName = "Required Documents"
            description = "Document requirements per request type"
        },
        @{
            name = "psrd_auditlog"
            displayName = "Audit Log"
            pluralName = "Audit Logs"
            description = "System activity audit trail"
        }
    )

    foreach ($table in $tables) {
        Write-Host "  Creating table: $($table.displayName) ($($table.name))..." -NoNewline
        pac dataverse table create `
            --table-name $table.name `
            --display-name $table.displayName `
            --plural-name $table.pluralName `
            --description $table.description `
            2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host " Done" -ForegroundColor Green
        } else {
            Write-Host " Already exists or skipped" -ForegroundColor DarkYellow
        }
    }
    Write-Host "  Tables created." -ForegroundColor Green
} else {
    Write-Host "`n[3/5] Skipping table creation (--SkipTableCreation flag set)." -ForegroundColor Gray
}

# ── Step 4: Push PCF component ────────────────────────────────────────────────
Write-Host "`n[4/5] Pushing PCF component to environment..." -ForegroundColor Yellow
Push-Location $ProjectRoot
pac pcf push --publisher-prefix psrd
if ($LASTEXITCODE -ne 0) { Pop-Location; throw "PCF push failed." }
Pop-Location
Write-Host "  PCF component pushed." -ForegroundColor Green

# ── Step 5: Package and import solution ───────────────────────────────────────
Write-Host "`n[5/5] Packaging and importing solution..." -ForegroundColor Yellow
$SolutionZip = "$ProjectRoot\out\PolicyServicingRequestDeskSolution.zip"

pac solution pack `
    --zipfile $SolutionZip `
    --folder "$ProjectRoot\solution\src" `
    --packagetype Unmanaged

if ($LASTEXITCODE -ne 0) { throw "Solution packing failed." }

pac solution import `
    --path $SolutionZip `
    --async true `
    --force-overwrite true

if ($LASTEXITCODE -ne 0) { throw "Solution import failed." }

Write-Host "  Solution imported." -ForegroundColor Green

# ── Summary ───────────────────────────────────────────────────────────────────
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nNext steps:"
Write-Host "  1. Open Power Apps: https://make.powerapps.com"
Write-Host "  2. Select environment: $EnvironmentUrl"
Write-Host "  3. Go to Solutions > Policy Servicing Request Desk Solution"
Write-Host "  4. Add the PCF component to a Model-Driven App canvas"
Write-Host "  5. Set property 'environmentUrl' = '$EnvironmentUrl'"
Write-Host "  6. Set VITE_USE_MOCK=false in .env and rebuild for production`n"
