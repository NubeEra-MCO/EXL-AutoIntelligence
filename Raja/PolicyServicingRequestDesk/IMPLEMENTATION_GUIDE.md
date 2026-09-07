# Implementation Guide - Policy Servicing Request Desk

Complete step-by-step guide to implement the Power Platform solution.

## Phase 1: Environment Setup

### Step 1.1: Prerequisites
- Power Platform Administrator access
- Power Platform CLI (pac) installed
- Visual Studio Code with Power Platform Extensions
- Git (optional, for version control)

### Step 1.2: Create Developer Environment using pac

```powershell
# 1. Authenticate to Power Platform
pac auth create --url https://admin.powerplatform.com

# 2. List available environments
pac admin list

# 3. Create new developer environment
pac admin create --name "InsuranceDemo" --location "United States" --type Sandbox

# 4. Set environment for future commands
pac auth select --environment InsuranceDemo
```

**Output:** Your environment URL will be something like:
`https://org1234567.crm.dynamics.com`

### Step 1.3: Create Solution Container

```powershell
# Create solution in the environment
pac solution create --publisher-name "InsuranceTeam" --publisher-prefix "ins"

# Name your solution: PolicyServicingRequestDesk
# Publisher: InsuranceTeam
# Prefix: ins
```

---

## Phase 2: Dataverse Tables Setup

### Step 2.1: Create Tables via Power Apps Portal

1. Go to https://make.powerapps.com
2. Select your InsuranceDemo environment
3. Click "Solutions" → "New solution"
4. Name: **PolicyServicingRequestDesk**
5. Publisher: Create new or select "InsuranceTeam"

### Step 2.2: Create Table 1 - Policy

**Table Name:** `ins_policy`

| Column Name | Type | Required | Details |
|---|---|---|---|
| Policy Number | Text | Yes | Primary Name field, unique identifier |
| Customer Name | Text | Yes | Policy holder name |
| Customer Email | Email | Yes | Contact email |
| Customer Phone | Phone | No | Contact phone |
| Policy Status | Choice | Yes | Values: Active, Inactive, Suspended, Lapsed |
| Premium Amount | Currency | No | Monthly/Annual premium |
| Premium Mode | Choice | Yes | Values: Monthly, Quarterly, Annual |
| Billing Address | MultilineText | No | Current address |
| Registered Nominee | Lookup | No | Link to contact table |
| Coverage Type | Choice | No | Values: Life, Health, Auto, Home |
| Policy Start Date | Date | No | Policy effective date |
| Policy End Date | Date | No | Policy expiry date |
| Last Payment Date | Date | No | Most recent payment date |
| Notes | MultilineText | No | Internal notes |

### Step 2.3: Create Table 2 - Request

**Table Name:** `ins_request`

| Column Name | Type | Required | Details |
|---|---|---|---|
| Request ID | Text | Yes | Auto-generated, Primary Name |
| Policy Reference | Lookup | Yes | Link to ins_policy |
| Request Type | Choice | Yes | Values: AddressChange, NomineeChange, PremiumModeChange, InfoUpdate |
| Request Status | Choice | Yes | Values: Draft, Submitted, Eligible, Rejected, Approved, Completed, OnHold |
| Priority | Choice | No | Values: Low, Medium, High, Urgent |
| Requested By | Text | No | Requester name/ID |
| Requested Date | DateTime | Yes | When request was created |
| Request Details | MultilineText | Yes | Request description/new values |
| Eligibility Check Result | MultilineText | No | Eligibility validation notes |
| Is Eligible | Yes/No | Yes | Eligibility flag |
| Assigned To | Lookup | No | Responsible agent |
| Target Completion Date | Date | No | SLA deadline |
| Actual Completion Date | Date | No | When request was completed |
| Approver Comments | MultilineText | No | Approval feedback |

### Step 2.4: Create Table 3 - Status History

**Table Name:** `ins_statushistory`

| Column Name | Type | Required | Details |
|---|---|---|---|
| Status Entry ID | Text | Yes | Auto-generated, Primary Name |
| Request Reference | Lookup | Yes | Link to ins_request |
| Previous Status | Text | No | Former status |
| Current Status | Text | Yes | New status |
| Status Change Reason | Text | No | Why status changed |
| Changed By | Text | Yes | User who made change |
| Changed On | DateTime | Yes | Timestamp of change |
| Internal Notes | MultilineText | No | Handler notes |
| Customer Notification Sent | Yes/No | No | If customer was notified |
| Notification Method | Choice | No | Values: Email, SMS, InApp |

### Step 2.5: Create Table 4 - Audit Log

**Table Name:** `ins_auditlog`

| Column Name | Type | Required | Details |
|---|---|---|---|
| Audit ID | Text | Yes | Auto-generated, Primary Name |
| Request Reference | Lookup | No | Link to ins_request |
| Policy Reference | Lookup | No | Link to ins_policy |
| Action Type | Text | Yes | What was changed |
| Old Value | MultilineText | No | Previous value |
| New Value | MultilineText | No | Updated value |
| Modified By | Text | Yes | User who made change |
| Modified On | DateTime | Yes | Timestamp |
| Action Details | MultilineText | No | Additional context |
| IP Address | Text | No | Source IP |

---

## Phase 3: Power Apps Canvas App

### Step 3.1: Create Canvas App

1. In PowerApps (make.powerapps.com), click **Create** → **Canvas app**
2. Name it: `PolicyRequestDesk`
3. Format: **Tablet** (better for desktop use)
4. Click **Create**

### Step 3.2: Add Screens to App

**Screen 1: Home/Dashboard**
- Title: "Policy Servicing Request Desk"
- Quick stats: Total requests, Pending, Completed
- Navigation buttons to Request Creation and Status Board

**Screen 2: Policy Search**
- Input field for Policy Number
- Search button
- Display found policy details
- Show policy status and last payment date
- Button to proceed to request creation

**Screen 3: Request Creation Form**
- Policy info display (read-only)
- Request Type dropdown (AddressChange, NomineeChange, PremiumModeChange, InfoUpdate)
- Conditional fields based on request type:
  - **AddressChange:** New address field, verification ID
  - **NomineeChange:** Nominee name, relationship, ID proof
  - **PremiumModeChange:** New mode dropdown, effective date
  - **InfoUpdate:** Field to update dropdown, new value
- Eligibility check button
- Real-time eligibility result display
- Submit button (disabled if not eligible)
- Cancel button

**Screen 4: Request Status Dashboard**
- Request list view with filters:
  - Status filter
  - Date range filter
  - Search by policy or request ID
- Request details on selection:
  - Current status with visual indicator
  - Status history timeline
  - Eligibility details
  - Next steps / Required actions
  - Create new request button

**Screen 5: Agent Chat (Optional initial version)**
- Simple text display showing Copilot Studio integration
- Instructions to use Teams or standalone Copilot

### Step 3.3: App Configuration

**App Settings:**
```json
{
  "appName": "PolicyRequestDesk",
  "theme": "Professional Blue",
  "primaryColor": "#0078D4",
  "accentColor": "#107C10",
  "warningColor": "#FFB900",
  "errorColor": "#D83B01",
  "language": "English",
  "timezone": "UTC"
}
```

**Security:**
- Set Environment: InsuranceDemo
- Data permissions: Dataverse
- Initial users: Admin + Insurance Team

---

## Phase 4: Power Automate Flows

### Flow 1: Create Request with Eligibility Check

**Trigger:** When a Power Apps app confirms/creates a record

**Actions:**
1. Create new request record in Dataverse
2. Trigger eligibility check (call separate flow)
3. Update request with eligibility result
4. Create initial status history entry
5. Send confirmation email to requester

### Flow 2: Eligibility Validation

**Trigger:** Manual trigger from Create Request flow

**Logic:**
```
IF RequestType == "AddressChange"
  - Check if PolicyStatus != "Suspended" AND != "Lapsed"
  - Result: ELIGIBLE if true
  
IF RequestType == "NomineeChange"
  - Check if PolicyStatus == "Active"
  - Check if OutstandingClaims == false
  - Result: ELIGIBLE if both true
  
IF RequestType == "PremiumModeChange"
  - Check if PolicyStatus == "Active"
  - Check if PolicyPremiumMode == "Annual"
  - Check if LastPaymentDefaultsIn12Months < 1
  - Result: ELIGIBLE if all true
  
IF RequestType == "InfoUpdate"
  - Check if PolicyStatus != "Lapsed"
  - Result: ELIGIBLE if true
```

### Flow 3: Status Update Flow

**Trigger:** Manual approval or status change from app

**Actions:**
1. Update request status
2. Create status history entry
3. Determine if customer notification needed
4. Send email notification with request status
5. Log to audit log

### Flow 4: Approval Workflow

**Trigger:** Request marked as "Approved" status

**Actions:**
1. Execute policy change (based on request type)
2. Update policy record with new values
3. Create audit log entry
4. Update request to "Completed"
5. Send completion email
6. Archive request to completed bucket

---

## Phase 5: Copilot Studio Agent Setup

### Step 5.1: Create Copilot Studio Agent

1. Go to https://copilotstudio.microsoft.com
2. Click **Create** → **New bot**
3. Name: `PolicyServiceAgent`
4. Environment: InsuranceDemo
5. Description: "Agent for policy servicing requests and status inquiries"

### Step 5.2: Create Topics

**Topic 1: Status Inquiry**
```
Trigger phrases:
- "What's the status of my request?"
- "When will my request be completed?"
- "Can you track my request?"

Message: "I can help you track your servicing request. 
Let me get your request details.
[Variable] requestId: What is your request ID or policy number?

[Card with status info]
Current Status: [lookup from database]
Last Update: [date]
Next Steps: [based on status]
"

Action: Lookup request from Dataverse
```

**Topic 2: Address Change Assistance**
```
Trigger phrases:
- "I need to change my address"
- "How do I update my address?"
- "Address change process"

Message: "I'll help you with an address change request.

Are you eligible?
- Your policy must be Active or Inactive (not Suspended/Lapsed)

Process:
1. Confirm your policy number
2. Provide new address
3. Request will be submitted
4. Usually completed in 2 business days

Your policy status: [lookup]
Are you eligible? [YES/NO]

[Button] Start Address Change Request"

Action: Link to Power Apps
```

**Topic 3: Nominee Change Assistance**
```
Trigger phrases:
- "Change nominee"
- "Update nominee details"
- "Nominee change process"

Message: "I can guide you through a nominee change.

Eligibility requirements:
- Policy must be Active
- No outstanding claims
- Nominee verification required

Process:
1. Confirm policy details
2. Provide new nominee information
3. Submit verification
4. Approval required
5. Usually completed in 3 business days

[Button] Start Nominee Change"

Action: Link to Power Apps
```

**Topic 4: Premium Mode Change**
```
Trigger phrases:
- "Change payment mode"
- "Update premium frequency"
- "Change billing frequency"

Message: "I'll help you change your premium payment mode.

Eligibility:
- Policy must be Annual
- No payment failures in last 12 months

Current mode: [lookup]
Eligible to change? [YES/NO]

Available options:
- Monthly
- Quarterly  
- Annual

Processing typically takes 5 business days.

[Button] Request Premium Mode Change"

Action: Link to Power Apps
```

**Topic 5: General Inquiries**
```
Trigger phrases:
- "What services are available?"
- "What can I do here?"
- "What requests can I make?"

Message: "Welcome to the Policy Servicing Desk!

I can help you with:

📍 **Address Change**
   - Update your policy address
   - Processed in 2 business days

👤 **Nominee Change**
   - Modify policy nominee
   - Requires approval
   - 3 business days

💰 **Premium Mode Change**
   - Change payment frequency (Monthly/Quarterly/Annual)
   - 5 business days

📋 **Information Updates**
   - Update other policy details
   - 1 business day

You can also ask about:
- Request status
- Processing timelines
- Eligibility requirements

[Buttons] 
- Create New Request
- Track Existing Request
- View FAQs
"
```

### Step 5.3: Knowledge Base Integration

Create a knowledge base with FAQ:

```
Q: What is the average processing time?
A: Most requests are processed within 1-5 business days depending on type.

Q: Can I change my request after submitting?
A: You can modify requests in "Draft" status before submission.

Q: What documents do I need?
A: Verification ID and supporting documents as requested by the system.

Q: How will I know when it's done?
A: You'll receive email notifications at each status change.

Q: Can I track my request?
A: Yes, all requests are visible in your request dashboard with status history.
```

### Step 5.4: Integration with Power Apps

- Link Copilot Studio agent to Power Apps embedded in request screens
- Configure to pass Policy Number and Request ID to agent
- Enable agent to update request status after approval

---

## Phase 6: Deployment & Publishing

### Step 6.1: Package Solution

```powershell
# Navigate to solution folder
cd C:\Users\vmuser\Desktop\PolicyServicingRequestDesk

# Create solution package
pac solution pack -z PolicyServicingRequestDesk.zip -f PolicyServicingRequestDesk

# This creates a managed solution ready for deployment
```

### Step 6.2: Add Solution to Source Control (Optional)

```powershell
# Initialize git repo
git init

# Add all files
git add .

# Commit
git commit -m "Initial Policy Servicing Request Desk solution"
```

### Step 6.3: Deploy to Environment

```powershell
# Authenticate
pac auth create --url https://admin.powerplatform.com

# Select target environment
pac auth select --environment InsuranceDemo

# Import solution
pac solution import -p PolicyServicingRequestDesk.zip

# Verify import
pac solution list
```

### Step 6.4: Configure Security Roles (Optional - for Production)

Once deployed, add security roles:
1. **Insurance Agent Role** - Can create/view requests, update status
2. **Insurance Manager Role** - Can approve requests, view all requests
3. **Customer Role** - Can only view their own requests

---

## Phase 7: Testing & Validation

### Test Checklist

- [ ] Can create policy records
- [ ] Can create request for active policy
- [ ] Eligibility check correctly identifies ineligible policies
- [ ] Status updates appear in history
- [ ] Email notifications send on status change
- [ ] Copilot agent responds to inquiries
- [ ] Agent correctly identifies eligible vs ineligible requests
- [ ] Approval flow works end-to-end
- [ ] Audit log records all changes
- [ ] Search/filter works in status dashboard

### Sample Test Cases

**Test 1: Address Change - Eligible Policy**
```
1. Create active policy
2. Submit address change request
3. Verify: Status = "Eligible"
4. Complete request via approval flow
5. Verify: Policy address updated, status = "Completed"
```

**Test 2: Nominee Change - Ineligible (Suspended)**
```
1. Create suspended policy
2. Submit nominee change request
3. Verify: Status = "Rejected" with reason
4. Verify: No approval option available
```

**Test 3: Status Inquiry via Copilot**
```
1. Create request (note request ID)
2. Ask Copilot: "What's the status of request [ID]?"
3. Verify: Agent provides current status and history
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|---|---|
| Environment creation fails | Verify admin permissions in Power Platform |
| Dataverse table creation fails | Check solution is selected in context |
| Eligibility check not working | Verify flow logic matches rule definitions |
| Copilot agent not responding | Check Knowledge Base configuration and topics |
| Email notifications not sending | Verify Power Automate approver email configured |

---

## Next Steps After MVP

1. **Add Security Roles** - Implement user-level permissions
2. **Mobile Optimization** - Make canvas app mobile-responsive
3. **Advanced Reporting** - Add Power BI dashboards
4. **Process Analytics** - Track metrics and SLA compliance
5. **Integration** - Connect with external policy management systems
6. **Compliance** - Implement data retention and archival policies

---

**Estimated Implementation Time:** 2-3 days  
**Complexity Level:** Medium  
**Support:** Refer to Power Platform documentation and community forums
