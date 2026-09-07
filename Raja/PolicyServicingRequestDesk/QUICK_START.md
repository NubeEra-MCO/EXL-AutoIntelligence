# Quick Start Guide - Get Running in 30 Minutes

Fast-track setup for Policy Servicing Request Desk MVP. Follow this for rapid deployment.

---

## Pre-Requisites (5 minutes)

✅ **Required Software:**
- Power Platform CLI installed: `pac --version`
- PowerShell 5.1+: `$PSVersionTable.PSVersion`
- Browser (Chrome, Edge, or Firefox)

✅ **Account Requirements:**
- Microsoft 365 account with Power Platform license
- Power Platform Administrator role
- Admin access to Office 365 (for email)

---

## Step 1: Authentication (5 minutes)

Open PowerShell and run:

```powershell
# Navigate to deployment folder
cd C:\Users\vmuser\Desktop\PolicyServicingRequestDesk\DEPLOYMENT

# Authenticate (browser will open for login)
pac auth create --url https://admin.powerplatform.com

# Verify authentication worked
pac admin list
```

**Expected Output:**
You'll see list of your current Power Platform environments.

---

## Step 2: Create Environment (10 minutes)

```powershell
# Create development environment
pac admin create `
  --name "InsuranceDemo" `
  --region "unitedstates" `
  --type Sandbox `
  --currency USD `
  --language 1033

# Wait 5-10 minutes for environment to be provisioned
# Check status with:
pac admin list
```

**Expected Output:**
Environment appears in list with status "Ready"

---

## Step 3: Create Solution (5 minutes)

```powershell
# Set active environment
pac auth select --environment InsuranceDemo

# Create solution directory
mkdir C:\Users\vmuser\Desktop\PolicyServicingRequestDesk\SOLUTION\PolicyServicingRequestDesk
cd C:\Users\vmuser\Desktop\PolicyServicingRequestDesk\SOLUTION\PolicyServicingRequestDesk

# Initialize solution
pac solution create `
  --publisher-name "InsuranceTeam" `
  --publisher-prefix "ins"
```

**Expected Output:**
cdsproj file created in directory, ready for components.

---

## Step 4: Add Components via Power Apps UI (20 minutes)

### 4a. Create Dataverse Tables (10 min)

1. Go to: https://make.powerapps.com
2. Environment: Select **InsuranceDemo**
3. Solutions → Select **PolicyServicingRequestDesk**
4. New → Table → Create from blank

**Create 4 Tables** (with columns from CONFIGURATION/dataverse-schema.md):

| Table | Columns | Time |
|---|---|---|
| **ins_policy** | Policy#, Customer, Status, Premium, Address, Nominee | 3 min |
| **ins_request** | Request#, Policy(Link), Type, Status, Details, IsEligible | 3 min |
| **ins_statushistory** | Status#, Request(Link), OldStatus, NewStatus, ChangedBy, Date | 2 min |
| **ins_auditlog** | Audit#, Action, OldValue, NewValue, ModifiedBy, Date | 2 min |

**Quick Column Setup Tips:**
- Hover over column type icons for quick help
- Required fields: Bold in schema
- Use "Lookup" for links between tables
- Save each table to solution immediately

### 4b. Create Canvas App (5 min)

1. Still in **PolicyServicingRequestDesk** solution
2. New → App → Canvas
3. Name: **PolicyRequestDesk**
4. Format: **Tablet**
5. Create blank app

**Basic Screen Structure** (detailed in POWER-APPS/):
```
Screen 1: Home/Dashboard
- Title, quick stats buttons

Screen 2: Policy Search  
- Input policy#, search button
- Display policy details

Screen 3: Request Form
- Request type dropdown
- Eligibility check button
- Submit button

Screen 4: Status Dashboard
- List of requests with status
- Select to view details & history
```

Save app to solution.

### 4c. Create Power Automate Flows (5 min)

1. Go to: https://make.powerautomate.com
2. Environment: **InsuranceDemo**
3. Create → Cloud flow → Automated cloud flow

**Create 4 Flows** (save each to solution):

| Flow | Trigger | Actions |
|---|---|---|
| **Create Request** | When app calls | Create request record, call eligibility check |
| **Eligibility Check** | Manual trigger | Check policy rules, return eligible/not |
| **Status Update** | Manual trigger | Update request, create history, send email |
| **Audit Log** | When request updated | Log changes to audit table |

**Flow Details:**
- See POWER-AUTOMATE/ for templates
- Flows can be very simple for MVP
- Start basic, enhance later

---

## Step 5: Configure Copilot Agent (5 minutes)

1. Go to: https://copilotstudio.microsoft.com
2. Environment: **InsuranceDemo**
3. Create → New bot
4. Name: **PolicyServiceAgent**

**Add Topics** (basic setup):

Topic 1: **Status Inquiry**
- Trigger: "What's my status?"
- Message: "Ask for request ID"
- Action: Query Dataverse for status

Topic 2: **Help**
- Trigger: "Help" or "What can I do?"
- Message: List available request types
- Action: Link to Power Apps

**Note:** Copilot can be simple for MVP. Enhance later with more capabilities.

---

## Step 6: Test Everything (5 minutes)

### Quick Test Checklist

- [ ] **Test Policy Creation:**
  - Go to PowerApps → PolicyRequestDesk
  - Create test policy manually in policy table first
  - Verify it appears

- [ ] **Test Request Creation:**
  - Search for test policy
  - Fill form for address change
  - Check eligibility
  - Submit request

- [ ] **Test Flows:**
  - Go to Power Automate → Cloud flows
  - Open "Create Request" flow
  - Click Test → Provide test data → Run
  - Check for errors

- [ ] **Test Status Tracking:**
  - Go to "Track Request" in app
  - Find your test request
  - Verify status and history visible

- [ ] **Test Copilot:**
  - Go to Copilot Studio
  - Click "Test" button
  - Ask "What's the status?"
  - Verify agent responds

---

## Step 7: Export Solution (2 minutes)

```powershell
# Export for backup/deployment
cd C:\Users\vmuser\Desktop\PolicyServicingRequestDesk\DEPLOYMENT

pac auth select --environment InsuranceDemo

pac solution export `
  --path ".\PolicyServicingRequestDesk.zip" `
  --name "PolicyServicingRequestDesk" `
  --managed

# File created: PolicyServicingRequestDesk_managed.zip
```

---

## Step 8: Share with Team (2 minutes)

### Add Users to App

1. https://make.powerapps.com → Apps
2. PolicyRequestDesk → Share
3. Add team member emails
4. Permission: "Can use" or "Can edit"
5. Share

### Send Access Email

```
Subject: Policy Servicing Request Desk - Access Ready

Hi Team,

The new Policy Request Desk is ready for testing!

Go here to use the app:
[Link from Share dialog]

For help, see:
- User Guide: DOCUMENTATION/user-guide.md
- FAQ: See bottom of user guide

Questions? Contact [Your Email]

Thanks!
```

---

## Done! 🎉

Your MVP solution is now live and ready to test. 

### Next Steps

**Immediately:**
- [ ] Test with sample data
- [ ] Gather feedback from team
- [ ] Fix any issues found

**This Week:**
- [ ] Enhanced flows (add more logic)
- [ ] Better UI (design more screens)
- [ ] Email templates (customize messages)

**Next Sprint:**
- [ ] Security roles & permissions
- [ ] Advanced Copilot capabilities
- [ ] Mobile optimization
- [ ] Performance optimization
- [ ] Production deployment

---

## Troubleshooting Quick Fixes

| Problem | Quick Fix |
|---|---|
| Environment creation fails | Try different region: `--region europe` |
| Can't see PolicyRequestDesk solution | Refresh page (F5) or check correct environment selected |
| Flow won't run | Make sure all connections authorized (e.g., Dataverse, Office 365 Mail) |
| App loads slowly | It's normal first load. Wait 10-15 seconds. |
| Email not sending | Verify Office 365 mailbox connected and authorized in flow |
| Copilot doesn't respond | Check topics are published, not in draft mode |

---

## Full Documentation

For detailed info, see:
- **Setup Steps:** IMPLEMENTATION_GUIDE.md
- **System Design:** ARCHITECTURE.md
- **Database Schema:** CONFIGURATION/dataverse-schema.md
- **User Help:** DOCUMENTATION/user-guide.md
- **Admin Help:** DOCUMENTATION/admin-guide.md

---

## Support

**Need Help?**
- Check DOCUMENTATION/user-guide.md for user FAQs
- Check DOCUMENTATION/admin-guide.md for admin troubleshooting
- See TROUBLESHOOTING section in guides
- Contact your Power Platform admin

---

**Estimated Total Time:** 30-45 minutes ⏱️

**Complexity:** Easy - Just follow steps above!

**Result:** Fully functional MVP ready for team testing

---

**Created:** September 2024  
**Status:** Ready to Deploy  
**Version:** 1.0 MVP
