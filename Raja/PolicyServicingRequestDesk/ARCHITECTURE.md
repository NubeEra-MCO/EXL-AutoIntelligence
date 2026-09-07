# Architecture & System Design

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INTERFACE LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  Power Apps      │  │  Copilot Studio  │  │  Teams Bot   │  │
│  │  Canvas App      │  │  Agent           │  │  Integration │  │
│  │  (Request Desk)  │  │  (Request Status)│  │              │  │
│  └────────┬─────────┘  └────────┬─────────┘  └──────┬───────┘  │
│           │                     │                    │           │
└───────────┼─────────────────────┼────────────────────┼───────────┘
            │                     │                    │
┌───────────┼─────────────────────┼────────────────────┼───────────┐
│           ▼                     ▼                    ▼           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │          BUSINESS LOGIC & ORCHESTRATION LAYER          │   │
│  │           (Power Automate Flows)                       │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │ Create Request Flow                             │  │   │
│  │  │ ├─ Validate Input                               │  │   │
│  │  │ ├─ Trigger Eligibility Check                    │  │   │
│  │  │ ├─ Create Request Record                        │  │   │
│  │  │ └─ Send Confirmation Email                      │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │ Eligibility Validation Flow                     │  │   │
│  │  │ ├─ Check Policy Status                          │  │   │
│  │  │ ├─ Apply Request-Type Rules                     │  │   │
│  │  │ ├─ Verify Conditions                            │  │   │
│  │  │ └─ Return Eligibility Result                    │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │ Status Update & Approval Flow                   │  │   │
│  │  │ ├─ Receive Approval/Rejection                   │  │   │
│  │  │ ├─ Update Request Status                        │  │   │
│  │  │ ├─ Execute Policy Change (if approved)          │  │   │
│  │  │ ├─ Create Status History                        │  │   │
│  │  │ └─ Send Notifications                           │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │ Audit Logging Flow                              │  │   │
│  │  │ ├─ Capture Change Details                       │  │   │
│  │  │ ├─ Record User & Timestamp                      │  │   │
│  │  │ └─ Log to Audit Table                           │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │ Email Notification Flow                         │  │   │
│  │  │ ├─ Determine Recipients                         │  │   │
│  │  │ ├─ Format Notification Message                  │  │   │
│  │  │ ├─ Send via Office 365 Mail                     │  │   │
│  │  │ └─ Log Send Attempt                             │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
            │
            │
┌───────────┼─────────────────────────────────────────────────────┐
│           ▼            DATA ACCESS LAYER                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │          Microsoft Dataverse                           │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  ┌──────────────┐  ┌──────────────────────────────────┐ │   │
│  │  │ Policy Table │  │ Request Table                  │ │   │
│  │  │              │  │                                  │ │   │
│  │  │ • Policy#    │  │ • Request ID                     │ │   │
│  │  │ • Customer   │  │ • Policy Reference               │ │   │
│  │  │ • Status     │  │ • Request Type                   │ │   │
│  │  │ • Premium    │  │ • Status                         │ │   │
│  │  │ • Address    │  │ • Created Date                   │ │   │
│  │  │ • Nominee    │  │ • Details                        │ │   │
│  │  └──────────────┘  └──────────────────────────────────┘ │   │
│  │  ┌──────────────────────┐  ┌──────────────────────────┐ │   │
│  │  │ Status History Table │  │ Audit Log Table        │ │   │
│  │  │                      │  │                          │ │   │
│  │  │ • History ID         │  │ • Audit ID              │ │   │
│  │  │ • Request Ref        │  │ • Action                │ │   │
│  │  │ • Previous Status    │  │ • Old/New Value         │ │   │
│  │  │ • Current Status     │  │ • Modified By/Date      │ │   │
│  │  │ • Changed By/Date    │  │ • Details               │ │   │
│  │  └──────────────────────┘  └──────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Flow 1: Request Creation & Eligibility Check

```
User (Power Apps)
    │
    ├─ Enter Policy#
    ├─ Enter Request Type
    ├─ Enter Request Details
    │
    ▼
Power App validates input
    │
    ▼
Calls Create Request Flow
    │
    ├─ Creates Request record (Draft status)
    │
    ▼
Calls Eligibility Check Flow
    │
    ├─ Query Policy data
    │
    ├─ Apply Request-Type Rules
    │   ├─ If AddressChange: Check Status ≠ Suspended/Lapsed
    │   ├─ If NomineeChange: Check Status = Active AND no claims
    │   ├─ If PremiumMode: Check Annual AND no defaults
    │   └─ If InfoUpdate: Check Status ≠ Lapsed
    │
    ▼
Returns: {eligible: true/false, reason: string}
    │
    ▼
Update Request record
    │
    ├─ Set: IsEligible = true/false
    ├─ Set: EligibilityCheckResult = reason
    ├─ Set: Status = "Eligible" or "Rejected"
    │
    ▼
Create Status History entry
    │
    ├─ Status: Draft → Eligible/Rejected
    ├─ Reason: System eligibility check
    │
    ▼
Send Confirmation Email to Requester
    │
    └─ Include: Request ID, Status, Next Steps
```

### Flow 2: Approval & Execution

```
Eligible Request submitted
    │
    ▼
Create Approval Task (if required)
    │
    ├─ Assign to Insurance Manager
    ├─ Include Request Details
    │
    ▼
Approver Reviews
    │
    ├─ Option 1: APPROVE
    │   │
    │   ▼
    │   Trigger Execution Flow
    │   │
    │   ├─ Update Policy record
    │   │   ├─ If AddressChange: Update Address field
    │   │   ├─ If NomineeChange: Update Nominee field
    │   │   ├─ If PremiumMode: Update Premium Mode field
    │   │   └─ If InfoUpdate: Update specific field
    │   │
    │   ▼
    │   Create Audit Log entry
    │   │
    │   ├─ Action: "Policy Updated"
    │   ├─ Old Value: [previous value]
    │   ├─ New Value: [new value]
    │   ├─ Modified By: [User]
    │   ├─ Modified On: [DateTime]
    │   │
    │   ▼
    │   Update Request Status → "Completed"
    │   │
    │   ▼
    │   Create Status History entry
    │   │
    │   ▼
    │   Send Completion Email
    │
    ├─ Option 2: REJECT
    │   │
    │   ▼
    │   Update Request Status → "Rejected"
    │   │
    │   ▼
    │   Create Status History entry
    │   │
    │   ├─ Reason: [Approver feedback]
    │   │
    │   ▼
    │   Send Rejection Email
    │
    └─ Option 3: ON HOLD
        │
        ▼
        Update Request Status → "OnHold"
        │
        ▼
        Send On-Hold Notification
```

### Flow 3: Status Inquiry (Copilot Agent)

```
User asks Copilot Agent
    │
    ├─ "What's the status of my request?"
    │
    ▼
Agent triggers Status Inquiry Topic
    │
    ├─ Asks for: Request ID or Policy Number
    │
    ▼
User provides ID
    │
    ▼
Agent calls Dataverse
    │
    ├─ Query Request table
    ├─ Match by ID or Policy#
    ├─ Retrieve Request details
    │
    ▼
Agent calls Status History table
    │
    ├─ Get all history entries for Request
    ├─ Sort by date (newest first)
    │
    ▼
Agent formats response
    │
    ├─ Current Status: [Status with icon]
    ├─ Last Updated: [Date]
    ├─ Recent Changes: [Timeline]
    ├─ Expected Completion: [If available]
    │
    ▼
Agent presents to User
    │
    ├─ In Chat window
    ├─ With formatted timeline
    └─ Option to start new request
```

---

## Table Relationships

```
┌─────────────────────────┐
│      POLICY             │
│ (ins_policy)            │
├─────────────────────────┤
│ • Policy Number (PK)    │
│ • Customer Name         │
│ • Policy Status         │
│ • Premium Amount        │
│ • Premium Mode          │
│ • Billing Address       │
│ • Registered Nominee    │
│ • Coverage Type         │
│ • Last Payment Date     │
└────────┬────────────────┘
         │ 1
         │
         │ N
         │
┌────────▼──────────────────┐
│     REQUEST                │
│  (ins_request)             │
├────────────────────────────┤
│ • Request ID (PK)          │
│ • Policy Reference (FK)    │◄──┐
│ • Request Type             │   │
│ • Request Status           │   │
│ • Requested Date           │   │
│ • Request Details          │   │
│ • Eligibility Result       │   │
│ • Is Eligible              │   │
│ • Assigned To (FK-User)    │   │
│ • Target Completion Date   │   │
│ • Actual Completion Date   │   │
└────────┬───────────────────┘   │
         │                        │
         │ 1                      │
         │                        │
         │ N                      │
         │                        │
┌────────▼────────────────────────┐
│   STATUS HISTORY                │
│ (ins_statushistory)             │
├─────────────────────────────────┤
│ • Status Entry ID (PK)          │
│ • Request Reference (FK)        │◄──┐
│ • Previous Status               │   │
│ • Current Status                │   │
│ • Status Change Reason          │   │
│ • Changed By                    │   │
│ • Changed On                    │   │
│ • Internal Notes                │   │
│ • Customer Notification Sent    │   │
└─────────────────────────────────┘   │
                                      │
                                      │
        ┌─────────────────────────────┤
        │                             │
        │                             │
┌───────┴────────────────────────────┐│
│      AUDIT LOG                      ││
│   (ins_auditlog)                    ││
├─────────────────────────────────────┘│
│ • Audit ID (PK)                     │
│ • Request Reference (FK) [Optional] │
│ • Policy Reference (FK) [Optional]  │
│ • Action Type                       │
│ • Old Value                         │
│ • New Value                         │
│ • Modified By                       │
│ • Modified On                       │
│ • Action Details                    │
└─────────────────────────────────────┘
```

---

## Request Processing States & Transitions

```
                    ┌─────────┐
                    │ DRAFT   │ ◄──── Initial state when created
                    └────┬────┘
                         │ User submits
                         ▼
                    ┌──────────────┐
                    │ SUBMITTED    │
                    └────┬─────────┘
                         │ System runs eligibility check
                         ▼
             ┌───────────┴───────────┐
             │                       │
             ▼                       ▼
        ┌─────────┐         ┌──────────┐
        │ELIGIBLE │         │ REJECTED │ ◄──── Not eligible, cannot proceed
        └────┬────┘         └──────────┘
             │ Assigned to approver
             ▼
        ┌─────────┐
        │ PENDING │
        │APPROVAL │
        └────┬────┘
             │ Approver reviews
             ├────────────────────────────────┐
             │                                │
             ▼                                ▼
        ┌──────────┐                   ┌────────────┐
        │APPROVED  │                   │  REJECTED  │
        └────┬─────┘                   └────────────┘
             │ System executes change
             ▼
        ┌───────────┐
        │ COMPLETED │ ◄──── Final state, request fulfilled
        └───────────┘

Alternative paths:
- DRAFT → SUBMITTED → ON_HOLD → SUBMITTED (resubmit after hold)
- Any state → ON_HOLD (pending more info)
- ELIGIBLE → CANCELLED (customer withdraws)
```

---

## Eligibility Rules Matrix

| Request Type | Policy Status | Conditions | SLA | Approval |
|---|---|---|---|---|
| **Address Change** | ✓ Active ✓ Inactive ✗ Suspended ✗ Lapsed | • Valid address • ID verification | 2 days | No |
| **Nominee Change** | ✓ Active only ✗ All others | • No pending claims • Nominee verification • Relationship proof | 3 days | Yes |
| **Premium Mode Change** | ✓ Active + Annual ✗ Others | • No payment defaults in 12mo • Effective date > today | 5 days | Yes |
| **Info Update** | ✓ Active ✓ Inactive ✓ Suspended ✗ Lapsed | • Specific field to update • Verification if needed | 1 day | No |

---

## Integration Points

### 1. Power Apps ↔ Dataverse
- **Direction:** Bidirectional
- **Trigger:** Form submissions, status queries
- **Data:** Request creation, policy lookup, status retrieval

### 2. Power Automate ↔ Power Apps
- **Direction:** Power Apps calls flows via action buttons
- **Trigger:** User interactions in app
- **Data:** Form submission, approval request, status updates

### 3. Copilot Studio ↔ Power Automate
- **Direction:** Agent calls flows for data operations
- **Trigger:** User conversations in agent
- **Data:** Policy lookup, request creation, status query

### 4. Copilot Studio ↔ Dataverse
- **Direction:** Agent reads from Dataverse via flows
- **Trigger:** User inquiries
- **Data:** Request status, policy details, history

### 5. Power Automate ↔ Email
- **Direction:** Flows send notifications
- **Trigger:** Request creation, status change, completion
- **Data:** Notification templates with request details

### 6. Power Automate ↔ Dataverse (Audit)
- **Direction:** All changes logged to Dataverse
- **Trigger:** Any data modification
- **Data:** Action details, before/after values, user info

---

## Security & Access Control

### Current (MVP - No Roles)
- All users: Full read/write access to all records
- Focus: Functionality validation

### Future (Production - Add These)
```
Role: Insurance Agent
├─ Create Request: Own requests only
├─ View Request: Own + assigned requests
├─ Update Status: Own assigned requests
└─ Create new requests: ✓

Role: Insurance Manager
├─ Create Request: All
├─ View Request: All
├─ Approve Request: All
├─ Update Status: All
├─ View Audit Log: ✓
└─ Generate Reports: ✓

Role: Customer (Future Web Portal)
├─ Create Request: Own policy only
├─ View Request: Own requests only
├─ Update Request: Draft status only
└─ View Status: ✓
```

---

## Performance Considerations

### Data Volume Estimates (MVP)
- Policies: 100-500 records
- Requests: 50-200 records/month
- Status History: 100-500 entries/month
- Audit Log: 200-1000 entries/month

### Query Optimization
- Index Policy.PolicyNumber for fast lookup
- Index Request.Status for filtering
- Index StatusHistory.RequestRef for timeline retrieval
- Limit status history display to last 30 days

### Scalability
- Current design supports ~10K policies
- For production, archive old requests (>1 year) to separate table
- Implement pagination in list views
- Add data refresh caching in Power Apps

---

## Error Handling & Rollback

| Error Scenario | Handling Strategy | Rollback Action |
|---|---|---|
| Eligibility check fails | Log error, mark request as "Error" | Manual review required |
| Policy update fails | Catch error in flow, send alert | Rollback via audit log trail |
| Email delivery fails | Retry 3 times, log failure | Manual notification needed |
| Status history create fails | Log error, flag for admin | Manual history entry |

---

## Monitoring & Alerts

### Key Metrics to Track
- Request creation rate
- Eligibility pass/fail ratio
- Approval turnaround time
- Request completion SLA compliance
- Email delivery success rate
- System error rate

### Alert Conditions
- Flow failure
- Email delivery failure
- SLA breach (>7 days without completion)
- Approval pending >3 days
- High error rate (>5% in last hour)

---

**Last Updated:** September 2024  
**Document Version:** 1.0
