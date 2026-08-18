# Power Automate Flows - Policy Servicing Request Desk
# Complete flow designs for all automation scenarios

## Flow 1: Request Submission Handler
**Trigger:** When a row is created in psrd_servicerequest  
**Purpose:** Initialize request, run eligibility check, assign work item

```
TRIGGER: Dataverse - When a row is added (psrd_servicerequest)
│
├── ACTION: Initialize Correlation ID
│   Set psrd_correlationid = guid()
│
├── ACTION: Get Request Catalog
│   Query psrd_requestcatalog where requestcode = triggerBody.requesttypecode
│
├── CONDITION: Request requires eligibility check?
│   ├── YES → ACTION: Call Custom Connector (EligibilityEngine)
│   │   Input: policyId, requestTypeCode
│   │   Output: isEligible, failedRules
│   │
│   ├── IF Eligible → Update Status = EligibilityCheckPassed
│   └── IF Not Eligible → Update Status = EligibilityCheckFailed
│       └── ACTION: Send Notification (eligibility failed)
│
├── CONDITION: Status = EligibilityCheckPassed?
│   ├── YES → ACTION: Check if approval required (from catalog)
│   │   ├── IF requires approval → Update Status = PendingApproval
│   │   │   └── ACTION: Create Approval records for each level
│   │   │       └── ACTION: Notify approvers (Teams + Email)
│   │   └── IF no approval → Update Status = InProgress
│   │       └── Trigger Execution Flow
│   └── NO → END
│
├── ACTION: Calculate SLA Deadline
│   slaDeadline = submittedOn + (slaHours * hours)
│   (Excluding weekends and holidays)
│
├── ACTION: Create Status History Entry
│   fromStatus = Draft, toStatus = Submitted
│
└── ACTION: Send Confirmation Notification
    Channels: Email + SMS (if mobile available)
    Template: REQUEST_SUBMITTED
```

---

## Flow 2: Approval Workflow
**Trigger:** When a row is updated in psrd_servicerequest (status = PendingApproval)  
**Purpose:** Route approvals, handle approval/rejection, escalate on delays

```
TRIGGER: Dataverse - When a row is modified (psrd_servicerequest, status = PendingApproval)
│
├── ACTION: Get Current Approval Level
│   Query psrd_approval where requestId = requestId AND status = Pending
│
├── ACTION: Check Approval Due Date
│   approvalDue = currentTime + 24 hours
│
├── ACTION: Get Eligible Approvers
│   Query users in approver role
│
├── ACTION: Start Approval (Power Automate Approval)
│   Type: First to respond
│   Assign to: eligible approvers
│   Timeout: 24 hours
│
├── CONDITION: Approval received?
│   ├── APPROVED →
│   │   ├── Update psrd_approval.status = Approved
│   │   ├── CONDITION: More approval levels?
│   │   │   ├── YES → Move to next level (recursive)
│   │   │   └── NO → Update Request Status = Approved
│   │   │       └── Trigger Execution Flow
│   │
│   ├── REJECTED →
│   │   ├── Update psrd_approval.status = Rejected
│   │   ├── Update Request Status = Rejected
│   │   └── Send Rejection Notification to customer
│   │
│   └── TIMEOUT →
│       ├── Create Escalation record
│       ├── Update Request Status = Escalated
│       └── Notify Supervisor
│
└── ACTION: Add to Audit Log
```

---

## Flow 3: Policy Update Execution Engine
**Trigger:** When a row is updated in psrd_servicerequest (status = Approved)  
**Purpose:** Execute the actual policy change in core systems

```
TRIGGER: Dataverse - When a row is modified (psrd_servicerequest, status = Approved)
│
├── ACTION: Get Request Details
│   - Request Type Code
│   - Request Data (JSON)
│   - Policy ID
│   - Approval Reference
│
├── ACTION: Capture Old Values (for audit)
│   Get current field values from psrd_policy / psrd_customer
│
├── SWITCH on RequestTypeCode:
│   ├── ADDR_CHG → 
│   │   Update psrd_customer address fields
│   │   Record old/new values
│   │
│   ├── NOM_CHG →
│   │   Upsert psrd_nominee record
│   │   Validate total share = 100%
│   │
│   ├── PREM_MODE_CHG →
│   │   Update psrd_policy.premiumMode
│   │   Recalculate modal premium
│   │
│   ├── MOB_UPD →
│   │   Update psrd_customer.mobile
│   │   Trigger OTP verification (optional)
│   │
│   ├── EMAIL_UPD →
│   │   Update psrd_customer.email
│   │
│   ├── BANK_CHG →
│   │   Update psrd_bankaccount record
│   │   Set as primary if specified
│   │
│   └── POLICY_REINSTATE →
│       Update psrd_policy.status = Active
│       Update nextPremiumDueDate
│       Record reinstatement endorsement
│
├── ACTION: Update Request Status = Completed
│   Set completedOn = now()
│
├── ACTION: Create Audit Log Entry
│   Entity: Policy/Customer
│   Old Values: captured above
│   New Values: updated values
│   Action: RequestTypeCode
│   ApprovalReference: approvalId
│   CorrelationId: request.correlationId
│
├── ACTION: Create Status History Entry
│   fromStatus = Approved, toStatus = Completed
│
└── ACTION: Send Completion Notification
    Channels: Email + SMS
    Template: REQUEST_COMPLETED
```

---

## Flow 4: SLA Monitoring & Escalation
**Trigger:** Recurrence - Every 30 minutes  
**Purpose:** Monitor SLA deadlines, warn, breach, escalate

```
TRIGGER: Recurrence (Every 30 minutes)
│
├── ACTION: Get Requests Near SLA
│   Query: status in (Submitted, ValidationPending, PendingApproval, InProgress)
│         AND slaDeadline between now() AND now()+4hours
│         AND slaBreached = false
│
├── FOR EACH request:
│   ├── Calculate: hoursRemaining = slaDeadline - now()
│   ├── Update: slaHoursRemaining = hoursRemaining
│   │
│   └── CONDITION: hoursRemaining <= 0?
│       ├── YES → Update slaBreached = true
│       │       Create Escalation (type = SLABreach)
│       │       Notify Supervisor + Manager
│       │       Add to Audit Log
│       └── NO → CONDITION: hoursRemaining <= 4?
│               └── YES → Send SLA Warning notification
│
└── ACTION: Update Dashboard Metrics
    (rollup fields will auto-calculate)
```

---

## Flow 5: Notification Dispatcher
**Trigger:** When a row is created in psrd_notification  
**Purpose:** Route and send notifications via appropriate channels

```
TRIGGER: Dataverse - When a row is added (psrd_notification)
│
├── SWITCH on psrd_notification.channel:
│   │
│   ├── Email →
│   │   ├── Get Template (psrd_notificationtemplate)
│   │   ├── Build email body (substitute template variables)
│   │   ├── ACTION: Send Email (Office 365 Outlook)
│   │   │   To: recipientEmail
│   │   │   Subject: title
│   │   │   Body: rendered template
│   │   ├── Update status = Sent
│   │   └── ON ERROR → Update status = Failed, retryCount++
│   │
│   ├── SMS →
│   │   ├── ACTION: Call SMS Gateway HTTP Connector
│   │   ├── Update status = Sent
│   │   └── ON ERROR → Update status = Failed
│   │
│   ├── Teams →
│   │   ├── ACTION: Post to Teams Channel / Direct Message
│   │   ├── Include Adaptive Card with request details
│   │   └── Update status = Sent
│   │
│   └── InApp →
│       └── (Notification is already in Dataverse, UI polls)
│
└── ACTION: Update notification record with delivery status
```

---

## Flow 6: Bulk Request Assignment
**Trigger:** Manual trigger with input parameters  
**Purpose:** Bulk assign requests to agents

```
TRIGGER: Manual (input: agentId, requestIds[])
│
├── FOR EACH requestId:
│   ├── Update psrd_servicerequest.assignedto = agentId
│   ├── Update psrd_servicerequest.assignedon = now()
│   ├── Create Status History Entry
│   └── Notify agent of new assignment (Teams)
│
└── ACTION: Return summary (assigned count, failed count)
```

---

## Flow 7: Reminder Notifications
**Trigger:** Recurrence - Daily 9 AM  
**Purpose:** Send daily digests, pending reminders

```
TRIGGER: Recurrence (Daily 9 AM IST)
│
├── ACTION: Get Pending Approvals (>24 hours old)
│   Query approvers with pending approvals
│
├── FOR EACH approver:
│   └── Send Daily Digest Email
│       - Number of pending approvals
│       - Oldest pending request
│       - SLA status summary
│
├── ACTION: Get Customers with requests in processing >SLA
│   Notify customers with update
│
└── ACTION: Send Management Summary to Operations Manager
    - Daily metrics
    - SLA compliance
    - Team performance
```

---

## Power Automate Custom Connector: PSRD Eligibility Engine
**Base URL:** Function App or Azure API Management endpoint

**Actions:**
1. **CheckEligibility** - POST /eligibility/check
   - Input: { policyId, requestTypeCode }
   - Output: { isEligible, results[], failedRules[] }

2. **GetEligibilityRules** - GET /eligibility/rules/{requestTypeCode}
   - Output: { rules[] }

3. **ExecutePolicyUpdate** - POST /execution/execute
   - Input: { requestId, requestData, approvalReference }
   - Output: { isSuccessful, fieldChanges[], executionReference }
