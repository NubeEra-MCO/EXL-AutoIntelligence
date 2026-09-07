#!/usr/bin/env pwsh
# =============================================================================
# create-dataverse-columns.ps1
# Creates all columns on Dataverse tables using PAC CLI after tables exist.
# Run AFTER deploy-to-powerplatform.ps1 Step 3 has created the base tables.
# Usage: .\create-dataverse-columns.ps1 -EnvironmentUrl "https://yourorg.crm.dynamics.com"
# =============================================================================
param(
    [Parameter(Mandatory=$true)]
    [string]$EnvironmentUrl
)

$ErrorActionPreference = "Stop"

function Add-Column {
    param($Table, $Name, $DisplayName, $Type, [int]$MaxLength = 0, $OptionSetName = "")
    $args = @("dataverse", "column", "create", "--table-name", $Table, "--column-name", $Name, "--display-name", $DisplayName, "--type", $Type)
    if ($MaxLength -gt 0) { $args += @("--max-length", "$MaxLength") }
    if ($OptionSetName) { $args += @("--choice-name", $OptionSetName) }
    & pac @args 2>&1 | Out-Null
    $status = if ($LASTEXITCODE -eq 0) { "OK" } else { "skip" }
    Write-Host "    $Table.$Name ($Type) [$status]"
}

Write-Host "`n[psrd_policy columns]" -ForegroundColor Cyan
Add-Column "psrd_policy" "psrd_policynumber"      "Policy Number"       "Text"     -MaxLength 50
Add-Column "psrd_policy" "psrd_productcode"       "Product Code"        "Text"     -MaxLength 50
Add-Column "psrd_policy" "psrd_productname"       "Product Name"        "Text"     -MaxLength 200
Add-Column "psrd_policy" "psrd_policytype"        "Policy Type"         "Choice"   -OptionSetName "psrd_policytype"
Add-Column "psrd_policy" "psrd_status"            "Status"              "Choice"   -OptionSetName "psrd_policystatus"
Add-Column "psrd_policy" "psrd_issuedate"         "Issue Date"          "DateOnly"
Add-Column "psrd_policy" "psrd_maturitydate"      "Maturity Date"       "DateOnly"
Add-Column "psrd_policy" "psrd_nextpremiumduedate""Next Premium Due"    "DateOnly"
Add-Column "psrd_policy" "psrd_annualpremium"     "Annual Premium"      "Currency"
Add-Column "psrd_policy" "psrd_sumassured"        "Sum Assured"         "Currency"
Add-Column "psrd_policy" "psrd_premiummode"       "Premium Mode"        "Choice"   -OptionSetName "psrd_premiummode"
Add-Column "psrd_policy" "psrd_openrequests"      "Open Requests"       "WholeNumber"
Add-Column "psrd_policy" "psrd_branchcode"        "Branch Code"         "Text"     -MaxLength 20
Add-Column "psrd_policy" "psrd_agentcode"         "Agent Code"          "Text"     -MaxLength 20
Add-Column "psrd_policy" "psrd_autodebit"         "Auto Debit"          "Yes/No"

Write-Host "`n[psrd_customer columns]" -ForegroundColor Cyan
Add-Column "psrd_customer" "psrd_customernumber"  "Customer Number"     "Text"     -MaxLength 50
Add-Column "psrd_customer" "psrd_firstname"       "First Name"          "Text"     -MaxLength 100
Add-Column "psrd_customer" "psrd_lastname"        "Last Name"           "Text"     -MaxLength 100
Add-Column "psrd_customer" "psrd_fullname"        "Full Name"           "Text"     -MaxLength 200
Add-Column "psrd_customer" "psrd_dateofbirth"     "Date of Birth"       "DateOnly"
Add-Column "psrd_customer" "psrd_email"           "Email"               "Email"
Add-Column "psrd_customer" "psrd_mobile"          "Mobile"              "Phone"
Add-Column "psrd_customer" "psrd_kycstatus"       "KYC Status"          "Choice"   -OptionSetName "psrd_kycstatus"
Add-Column "psrd_customer" "psrd_addressline1"    "Address Line 1"      "Text"     -MaxLength 200
Add-Column "psrd_customer" "psrd_addressline2"    "Address Line 2"      "Text"     -MaxLength 200
Add-Column "psrd_customer" "psrd_city"            "City"                "Text"     -MaxLength 100
Add-Column "psrd_customer" "psrd_state"           "State"               "Text"     -MaxLength 100
Add-Column "psrd_customer" "psrd_pincode"         "Pincode"             "Text"     -MaxLength 10

Write-Host "`n[psrd_requestcatalog columns]" -ForegroundColor Cyan
Add-Column "psrd_requestcatalog" "psrd_requestcode"         "Request Code"            "Text"    -MaxLength 30
Add-Column "psrd_requestcatalog" "psrd_requestname"         "Request Name"            "Text"    -MaxLength 200
Add-Column "psrd_requestcatalog" "psrd_description"         "Description"             "Multiline Text" -MaxLength 2000
Add-Column "psrd_requestcatalog" "psrd_category"            "Category"                "Text"    -MaxLength 100
Add-Column "psrd_requestcatalog" "psrd_slahours"            "SLA Hours"               "WholeNumber"
Add-Column "psrd_requestcatalog" "psrd_requiresapproval"    "Requires Approval"       "Yes/No"
Add-Column "psrd_requestcatalog" "psrd_approvallevels"      "Approval Levels"         "WholeNumber"
Add-Column "psrd_requestcatalog" "psrd_isactive"            "Is Active"               "Yes/No"
Add-Column "psrd_requestcatalog" "psrd_displayorder"        "Display Order"           "WholeNumber"
Add-Column "psrd_requestcatalog" "psrd_formschema"          "Form Schema (JSON)"      "Multiline Text" -MaxLength 1048576
Add-Column "psrd_requestcatalog" "psrd_eligibilityrulesjson""Eligibility Rules (JSON)""Multiline Text" -MaxLength 1048576
Add-Column "psrd_requestcatalog" "psrd_requireddocsjson"    "Required Docs (JSON)"    "Multiline Text" -MaxLength 1048576
Add-Column "psrd_requestcatalog" "psrd_icon"                "Icon"                    "Text"    -MaxLength 50

Write-Host "`n[psrd_servicerequest columns]" -ForegroundColor Cyan
Add-Column "psrd_servicerequest" "psrd_requestnumber"          "Request Number"      "Text"       -MaxLength 30
Add-Column "psrd_servicerequest" "psrd_requesttypecode"        "Request Type Code"   "Text"       -MaxLength 30
Add-Column "psrd_servicerequest" "psrd_policynumber"           "Policy Number"       "Text"       -MaxLength 50
Add-Column "psrd_servicerequest" "psrd_customername"           "Customer Name"       "Text"       -MaxLength 200
Add-Column "psrd_servicerequest" "psrd_status"                 "Status"              "Choice"     -OptionSetName "psrd_requeststatus"
Add-Column "psrd_servicerequest" "psrd_priority"               "Priority"            "Choice"     -OptionSetName "psrd_priority"
Add-Column "psrd_servicerequest" "psrd_submittedon"            "Submitted On"        "DateTime"
Add-Column "psrd_servicerequest" "psrd_sladeadline"            "SLA Deadline"        "DateTime"
Add-Column "psrd_servicerequest" "psrd_slabreached"            "SLA Breached"        "Yes/No"
Add-Column "psrd_servicerequest" "psrd_requestdata"            "Request Data (JSON)" "Multiline Text" -MaxLength 1048576
Add-Column "psrd_servicerequest" "psrd_oldvalues"              "Old Values (JSON)"   "Multiline Text" -MaxLength 1048576
Add-Column "psrd_servicerequest" "psrd_newvalues"              "New Values (JSON)"   "Multiline Text" -MaxLength 1048576
Add-Column "psrd_servicerequest" "psrd_source"                 "Source"              "Choice"     -OptionSetName "psrd_requestsource"
Add-Column "psrd_servicerequest" "psrd_completedon"            "Completed On"        "DateTime"
Add-Column "psrd_servicerequest" "psrd_internalnotes"          "Internal Notes"      "Multiline Text" -MaxLength 1048576
Add-Column "psrd_servicerequest" "psrd_currentapprovallevel"   "Current Approval Level" "WholeNumber"
Add-Column "psrd_servicerequest" "psrd_totalapprovallevels"    "Total Approval Levels"  "WholeNumber"
Add-Column "psrd_servicerequest" "psrd_correlationid"          "Correlation ID"      "Text"       -MaxLength 50

Write-Host "`n[psrd_approval columns]" -ForegroundColor Cyan
Add-Column "psrd_approval" "psrd_approvallevel"   "Approval Level"      "WholeNumber"
Add-Column "psrd_approval" "psrd_approverrole"    "Approver Role"       "Text"    -MaxLength 50
Add-Column "psrd_approval" "psrd_status"          "Status"              "Choice"  -OptionSetName "psrd_approvalstatus"
Add-Column "psrd_approval" "psrd_requestedon"     "Requested On"        "DateTime"
Add-Column "psrd_approval" "psrd_respondedon"     "Responded On"        "DateTime"
Add-Column "psrd_approval" "psrd_remarks"         "Remarks"             "Multiline Text" -MaxLength 2000
Add-Column "psrd_approval" "psrd_ismandatory"     "Is Mandatory"        "Yes/No"

Write-Host "`n[psrd_auditlog columns]" -ForegroundColor Cyan
Add-Column "psrd_auditlog" "psrd_entityname"      "Entity Name"         "Text"    -MaxLength 100
Add-Column "psrd_auditlog" "psrd_recordid"        "Record ID"           "Text"    -MaxLength 50
Add-Column "psrd_auditlog" "psrd_action"          "Action"              "Text"    -MaxLength 100
Add-Column "psrd_auditlog" "psrd_oldvalues"       "Old Values (JSON)"   "Multiline Text" -MaxLength 1048576
Add-Column "psrd_auditlog" "psrd_newvalues"       "New Values (JSON)"   "Multiline Text" -MaxLength 1048576
Add-Column "psrd_auditlog" "psrd_ipaddress"       "IP Address"          "Text"    -MaxLength 50

Write-Host "`nAll columns processed." -ForegroundColor Green
Write-Host "Next: run .\create-dataverse-relationships.ps1 to add lookups.`n"
