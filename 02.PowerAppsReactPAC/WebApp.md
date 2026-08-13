# Power Apps Code Apps :

Use the current **Power Apps Code Apps** approach: Vite + React + Power Apps client library, then `pac code push`. This runs inside Power Apps and can connect directly to Dataverse; no separate Azure deployment or MSAL app registration is required. ([Microsoft Learn][1])

```powershell
# ============================================================
# 1. PREREQUISITES
# ============================================================

node --version
npm --version
pac --version

# Install/update Power Platform CLI if required:
dotnet tool install --global Microsoft.PowerApps.CLI.Tool
# or
dotnet tool update --global Microsoft.PowerApps.CLI.Tool


# ============================================================
# 2. CREATE REACT + VITE POWER APPS CODE APP
# ============================================================

npx degit github:microsoft/PowerAppsCodeApps/templates/vite employee-code-app
cd employee-code-app

npm install

pac auth create --url https://orgc95f3fe8.crm8.dynamics.com

pac env select --environment https://orgc95f3fe8.crm8.dynamics.com

pac code init --displayname "Employee Dataverse App"


# ============================================================
# 3. ADD DATAVERSE TABLE
# ============================================================
# IMPORTANT:
# crd3a_employee must be the Dataverse TABLE LOGICAL NAME.
# If the actual logical name is crd3a_employee, run:

pac code add-data-source -a dataverse -t crd3a_employee


# ============================================================
# 4. CHECK GENERATED DATAVERSE FILES
# ============================================================

Get-ChildItem .\src\generated -Recurse


# ============================================================
# 5. INSTALL DEPENDENCIES
# ============================================================

npm install


# ============================================================
# 6. RUN LOCALLY
# ============================================================

npm run dev


# ============================================================
# 7. BUILD
# ============================================================

npm run build


# ============================================================
# 8. DEPLOY DIRECTLY TO POWER APPS
# ============================================================

pac code push


# ============================================================
# 9. SHOW THE DEPLOYED POWER APPS CODE APPS
# ============================================================

pac code list --environment https://orgc95f3fe8.crm8.dynamics.com


# ============================================================
# 10. FUTURE UPDATES
# ============================================================

npm run build
pac code push
```

For the React code, use the generated `EmployeeService` under `src/generated/services/` rather than calling the Dataverse Web API manually; the Power Apps client library generates the typed model/service when the Dataverse table is added. ([Microsoft Learn][2])

```powershell
# Verify the generated service/model names
Get-ChildItem .\src\generated\services
Get-ChildItem .\src\generated\models
```

The deployment command is:

```powershell
npm run build
pac code push
```

A successful `pac code push` returns the **Power Apps URL** for the deployed code app. ([Microsoft Learn][1])

**Important:** `crd3a_employee` must be the table's **logical name**, not merely its display name. The documented Dataverse command is `pac code add-data-source -a dataverse -t <table-logical-name>`. ([Microsoft Learn][2])

[Microsoft Learn — Power Apps Code Apps](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/?utm_source=chatgpt.com)
[Microsoft Learn — Connect a Code App to Dataverse](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-dataverse?utm_source=chatgpt.com) 

[1]: https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/create-an-app-from-scratch?utm_source=chatgpt.com "Quickstart: Create a code app from scratch - Power Apps | Microsoft Learn"
[2]: https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-dataverse?utm_source=chatgpt.com "How to: Connect your code app to Dataverse - Power Apps | Microsoft Learn"
