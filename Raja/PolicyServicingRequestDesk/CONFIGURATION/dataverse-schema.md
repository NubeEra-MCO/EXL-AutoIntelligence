# Dataverse Schema Documentation

Complete table schema definitions for the Policy Servicing Request Desk solution.

---

## Table 1: Policy (ins_policy)

### Purpose
Stores insurance policy master data. This is the central reference for all policy information and the foundation for request eligibility checks.

### Primary Key
- **Policy Number** (Text, 50 chars) - Unique identifier

### Schema

| Column Name | Display Name | Type | Length | Required | Unique | Description |
|---|---|---|---|---|---|
| ins_policynumber | Policy Number | Text | 50 | Yes | Yes | Unique policy identifier |
| ins_customername | Customer Name | Text | 200 | Yes | No | Full name of policy holder |
| ins_customeremail | Customer Email | Email | N/A | Yes | No | Email address for notifications |
| ins_customerphone | Customer Phone | Phone | 20 | No | No | Phone number of policy holder |
| ins_policystatus | Policy Status | Choice | N/A | Yes | No | Current status: Active, Inactive, Suspended, Lapsed |
| ins_premiumamount | Premium Amount | Currency | N/A | No | No | Monthly/Annual premium in USD |
| ins_premiummode | Premium Mode | Choice | N/A | Yes | No | Payment frequency: Monthly, Quarterly, Annual |
| ins_billingaddress | Billing Address | MultilineText | 1000 | No | No | Policy address for billing |
| ins_registerednom | Registered Nominee | Lookup | N/A | No | No | Link to Contact (Dataverse contact table) |
| ins_coveragetype | Coverage Type | Choice | N/A | No | No | Type: Life, Health, Auto, Home |
| ins_policystartdate | Policy Start Date | Date | N/A | No | No | Policy effective date |
| ins_policyenddate | Policy End Date | Date | N/A | No | No | Policy expiry date |
| ins_lastpaymentdate | Last Payment Date | Date | N/A | No | No | Most recent payment received |
| ins_paymentdefaults | Payment Defaults (12mo) | Whole Number | N/A | No | No | Count of defaults in last 12 months |
| ins_outstandingclaims | Outstanding Claims | Yes/No | N/A | No | No | Whether policy has pending claims |
| ins_notes | Internal Notes | MultilineText | 2000 | No | No | Admin notes on policy |

### Indexes
- **Index 1:** ins_policynumber (Primary)
- **Index 2:** ins_policystatus
- **Index 3:** ins_customeremail

### Relationships
- **One-to-Many** → Request (ins_request)
  - A policy can have many requests
  - Cascade delete: No (keep request history)

---

## Table 2: Request (ins_request)

### Purpose
Stores all policy servicing requests submitted by customers. Tracks the entire lifecycle of each request from creation to completion.

### Primary Key
- **Request ID** (Autonumber) - Auto-generated unique identifier

### Schema

| Column Name | Display Name | Type | Length | Required | Description |
|---|---|---|---|---|
| ins_requestid | Request ID | Autonumber | N/A | Yes | Auto-generated, primary key |
| ins_policy | Policy Reference | Lookup (ins_policy) | N/A | Yes | Link to Policy record |
| ins_requesttype | Request Type | Choice | N/A | Yes | AddressChange, NomineeChange, PremiumModeChange, InfoUpdate |
| ins_requeststatus | Request Status | Choice | N/A | Yes | Draft, Submitted, Eligible, Rejected, Approved, Completed, OnHold, Cancelled |
| ins_priority | Priority | Choice | N/A | No | Low, Medium, High, Urgent |
| ins_requestedby | Requested By | Text | 100 | No | Requester name or ID |
| ins_requesteddate | Requested Date | DateTime | N/A | Yes | Timestamp when request created |
| ins_requestdetails | Request Details | MultilineText | 3000 | Yes | Description of requested change and supporting details |
| ins_eligibilityres | Eligibility Check Result | MultilineText | 2000 | No | Detailed eligibility validation report |
| ins_iseligible | Is Eligible | Yes/No | N/A | Yes | Flag indicating eligibility (true/false) |
| ins_assignedto | Assigned To | Lookup (User) | N/A | No | Team member assigned to handle request |
| ins_targetcompl | Target Completion Date | Date | N/A | No | SLA deadline for completion |
| ins_actualcompl | Actual Completion Date | Date | N/A | No | Date request was actually completed |
| ins_approvercomments | Approver Comments | MultilineText | 1000 | No | Feedback from approval step |
| ins_rejectionreason | Rejection Reason | MultilineText | 1000 | No | If rejected, reason why |

### Indexes
- **Index 1:** ins_requestid (Primary)
- **Index 2:** ins_policy (Lookup)
- **Index 3:** ins_requeststatus
- **Index 4:** ins_requesteddate
- **Index 5:** ins_requesttype

### Relationships
- **Many-to-One** → Policy (ins_policy)
  - Many requests reference one policy
- **One-to-Many** → Status History (ins_statushistory)
  - A request has many status history entries
- **One-to-Many** → Audit Log (ins_auditlog)
  - Changes to a request are logged

---

## Table 3: Status History (ins_statushistory)

### Purpose
Maintains a complete audit trail of all status changes for each request. Enables customers and agents to track the progress of their requests without needing to contact support.

### Primary Key
- **Status Entry ID** (Autonumber) - Auto-generated unique identifier

### Schema

| Column Name | Display Name | Type | Length | Required | Description |
|---|---|---|---|---|
| ins_statusentryid | Status Entry ID | Autonumber | N/A | Yes | Auto-generated, primary key |
| ins_request | Request Reference | Lookup (ins_request) | N/A | Yes | Link to Request record |
| ins_previousstatus | Previous Status | Text | 50 | No | Former status before change |
| ins_currentstatus | Current Status | Text | 50 | Yes | New status after change |
| ins_statuschange | Status Change Reason | Text | 200 | No | Explanation of why status changed |
| ins_changedby | Changed By | Text | 100 | Yes | User who made the status change |
| ins_changedon | Changed On | DateTime | N/A | Yes | Timestamp of status change |
| ins_internalnotes | Internal Notes | MultilineText | 500 | No | Handler notes (not shown to customer) |
| ins_custnotification | Customer Notification Sent | Yes/No | N/A | No | Whether customer was notified of this change |
| ins_notificationmethod | Notification Method | Choice | N/A | No | How customer was notified: Email, SMS, InApp, None |

### Indexes
- **Index 1:** ins_statusentryid (Primary)
- **Index 2:** ins_request (Lookup)
- **Index 3:** ins_changedon (Time-series data)

### Relationships
- **Many-to-One** → Request (ins_request)
  - Many status history entries for one request
  - Cascade delete: Yes (delete history when request deleted)

---

## Table 4: Audit Log (ins_auditlog)

### Purpose
Records all changes made to policies and requests for compliance, auditing, and troubleshooting purposes. Provides complete traceability of who changed what, when, and why.

### Primary Key
- **Audit ID** (Autonumber) - Auto-generated unique identifier

### Schema

| Column Name | Display Name | Type | Length | Required | Description |
|---|---|---|---|---|
| ins_auditid | Audit ID | Autonumber | N/A | Yes | Auto-generated, primary key |
| ins_request | Request Reference | Lookup (ins_request) | N/A | No | Link to Request (if change is request-related) |
| ins_policy | Policy Reference | Lookup (ins_policy) | N/A | No | Link to Policy (if change is policy-related) |
| ins_actiontype | Action Type | Text | 100 | Yes | Type of action: Created, Updated, Deleted, Approved, Rejected, etc. |
| ins_fieldname | Field Name | Text | 100 | No | Name of field that was changed |
| ins_oldvalue | Old Value | MultilineText | 1000 | No | Previous value before change |
| ins_newvalue | New Value | MultilineText | 1000 | No | New value after change |
| ins_modifiedby | Modified By | Text | 100 | Yes | User who made the change |
| ins_modifiedon | Modified On | DateTime | N/A | Yes | Timestamp of change |
| ins_actiondetails | Action Details | MultilineText | 2000 | No | Additional context about the change |
| ins_ipaddress | IP Address | Text | 50 | No | Source IP address (if captured) |
| ins_failurereasons | Failure Reasons | MultilineText | 500 | No | If action failed, reason why |

### Indexes
- **Index 1:** ins_auditid (Primary)
- **Index 2:** ins_modifiedon (Time-series)
- **Index 3:** ins_modifiedby
- **Index 4:** ins_actiontype
- **Index 5:** ins_request (Lookup)
- **Index 6:** ins_policy (Lookup)

### Relationships
- **Many-to-One** → Request (ins_request) [Optional]
- **Many-to-One** → Policy (ins_policy) [Optional]
- Cascade delete: No (keep audit history even if request/policy deleted)

---

## Data Types Reference

### Choice Columns

**Policy Status (ins_policystatus):**
- Active (1)
- Inactive (2)
- Suspended (3)
- Lapsed (4)

**Request Type (ins_requesttype):**
- AddressChange (1)
- NomineeChange (2)
- PremiumModeChange (3)
- InfoUpdate (4)

**Request Status (ins_requeststatus):**
- Draft (1)
- Submitted (2)
- Eligible (3)
- Rejected (4)
- Approved (5)
- Completed (6)
- OnHold (7)
- Cancelled (8)

**Priority (ins_priority):**
- Low (1)
- Medium (2)
- High (3)
- Urgent (4)

**Premium Mode (ins_premiummode):**
- Monthly (1)
- Quarterly (2)
- Annual (3)

**Coverage Type (ins_coveragetype):**
- Life (1)
- Health (2)
- Auto (3)
- Home (4)

**Notification Method (ins_notificationmethod):**
- Email (1)
- SMS (2)
- InApp (3)
- None (4)

---

## Business Rules by Table

### Policy Table Rules
```
1. Policy Number is required and must be unique
2. Customer Email must be valid email format
3. Policy Status can only be changed by authorized users
4. Last Payment Date cannot be in the future
5. Policy Start Date cannot be after Policy End Date
```

### Request Table Rules
```
1. Request Type cannot be changed after submission
2. If Is Eligible = true, Status must be "Eligible"
3. If Is Eligible = false, Status must be "Rejected"
4. Once Status = "Completed" or "Rejected", cannot be edited
5. Priority defaults to "Medium" if not specified
6. Actual Completion Date cannot be before Requested Date
7. Requested Date defaults to current date/time
```

### Status History Rules
```
1. Changed On defaults to current date/time
2. Changed By is required (cannot be empty)
3. New entries can only be created (no edit/delete)
4. Current Status cannot be same as Previous Status
5. Status transitions must follow state machine rules
```

### Audit Log Rules
```
1. Action Type is required
2. Modified On defaults to current date/time
3. Modified By is required
4. Entries are immutable (no edit/delete after creation)
5. Either Request Reference OR Policy Reference required (or both)
```

---

## Security & Permissions

### Current MVP Setup (No Restrictions)
All users have full read/write access to all records.

### Recommended for Production

**Table-Level Permissions:**

| Role | ins_policy | ins_request | ins_statushistory | ins_auditlog |
|---|---|---|---|---|
| Insurance Agent | Read Own | Read Own | Read Own | Read Own |
| Insurance Manager | Read All | Read All | Read All | Read All |
| Customer | Read Own | Read Own | Read Own | None |
| System Admin | Full | Full | Full | Full |

**Field-Level Permissions:**

| Role | Can Edit | Can View |
|---|---|---|
| Customer | Request Details (Draft only) | Status, History, Current Status |
| Agent | Most fields | All |
| Manager | All | All |

---

## Sample Data Structure

### Sample Policy
```json
{
  "ins_policynumber": "POL-2024-001234",
  "ins_customername": "John Smith",
  "ins_customeremail": "john.smith@example.com",
  "ins_customerphone": "+1-555-0123",
  "ins_policystatus": "Active",
  "ins_premiumamount": 150.00,
  "ins_premiummode": "Annual",
  "ins_billingaddress": "123 Main St, Anytown, ST 12345",
  "ins_coveragetype": "Life",
  "ins_policystartdate": "2023-01-15",
  "ins_policyenddate": "2025-01-14",
  "ins_lastpaymentdate": "2024-01-10",
  "ins_paymentdefaults": 0,
  "ins_outstandingclaims": false
}
```

### Sample Request
```json
{
  "ins_policy": "POL-2024-001234",
  "ins_requesttype": "AddressChange",
  "ins_requeststatus": "Submitted",
  "ins_priority": "Medium",
  "ins_requestedby": "Customer Portal",
  "ins_requesteddate": "2024-09-05T14:30:00Z",
  "ins_requestdetails": "New address: 456 Oak Ave, Elsewhere, ST 54321. Moving to new location.",
  "ins_iseligible": true,
  "ins_eligibilityres": "Policy status is Active. Address change is eligible.",
  "ins_targetcompl": "2024-09-07"
}
```

---

## Performance Optimization Tips

1. **Indexes:** Primary indexes are automatically created on primary names. Create additional indexes on frequently queried fields:
   - `ins_policystatus` (Policy table)
   - `ins_requeststatus` (Request table)
   - `ins_modifiedon` (Audit Log table)

2. **Data Archival:** Archive requests older than 1 year to separate table to improve performance

3. **View Limitations:** Limit views to last 30 days of data when possible

4. **Query Optimization:** Use FetchXML filters in Power Automate to reduce data transfer

---

## Migration Notes (If Migrating from Legacy System)

1. Migrate policies first
2. Map legacy request types to new types
3. Migrate requests with historical status
4. Create initial audit log entries from legacy audit trail
5. Update request status history based on historical data
6. Validate data integrity after migration

---

**Last Updated:** September 2024  
**Version:** 1.0
