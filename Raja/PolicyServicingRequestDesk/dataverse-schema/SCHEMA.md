# Dataverse Schema - Policy Servicing Request Desk
# Complete table definitions for Power Platform deployment

## Publisher Details
- Publisher Prefix: psrd
- Publisher Name: PolicyServicingRequestDesk
- Solution Name: PolicyServicingRequestDeskSolution

## Tables

### 1. psrd_policy (Policy)
| Column | Type | Description |
|--------|------|-------------|
| psrd_policyid | PrimaryKey (GUID) | Unique identifier |
| psrd_policynumber | Text(50) | Policy number - Alternate Key |
| psrd_productcode | Text(50) | Product code |
| psrd_productname | Text(200) | Product name |
| psrd_policytype | OptionSet | Life, Health, Motor, Home, Travel, Endowment, ULIP, Term |
| psrd_status | OptionSet | Active, Lapsed, Surrendered, Matured, PaidUp, Cancelled |
| psrd_issuedate | Date | Policy issue date |
| psrd_commencementdate | Date | Policy commencement date |
| psrd_maturitydate | Date | Policy maturity date |
| psrd_policyterm | WholeNumber | Policy term |
| psrd_policytermunit | OptionSet | Years, Age |
| psrd_customerid | Lookup(psrd_customer) | Policy holder reference |
| psrd_branchcode | Text(20) | Branch code |
| psrd_agentcode | Text(20) | Agent code |
| psrd_channeltype | Text(50) | Channel type |
| psrd_annualpremium | Currency | Annual premium |
| psrd_premiummode | OptionSet | Monthly, Quarterly, HalfYearly, Yearly, SinglePremium |
| psrd_modalpremium | Currency | Modal premium |
| psrd_sumassured | Currency | Sum assured |
| psrd_deathbenefit | Currency | Death benefit |
| psrd_maturitybenefit | Currency | Maturity benefit |
| psrd_nextpremiumduedate | Date | Next premium due date |
| psrd_lastpremiumpaiddate | Date | Last premium paid date |
| psrd_totalpremiumpaid | Currency | Total premium paid |
| psrd_premiumpaingterm | WholeNumber | Premium paying term |
| psrd_autodebit | TwoOptions | Auto debit enabled |
| psrd_isassigned | TwoOptions | Policy assigned flag |
| psrd_assigneename | Text(200) | Assignee name |
| psrd_openrequests | WholeNumber | Count of open requests (rollup) |
| psrd_totalrequests | WholeNumber | Total requests (rollup) |
| createdon | DateTime | System - created on |
| modifiedon | DateTime | System - modified on |

**Indexes:** psrd_policynumber (unique), psrd_status, psrd_customerid
**Security:** Read - all authenticated; Write - ServicingAgent, Supervisor, Admin

---

### 2. psrd_customer (Customer)
| Column | Type | Description |
|--------|------|-------------|
| psrd_customerid | PrimaryKey (GUID) | Unique identifier |
| psrd_customernumber | Text(50) | Customer number - Alternate Key |
| psrd_salutation | OptionSet | Mr, Ms, Mrs, Dr |
| psrd_firstname | Text(100) | First name |
| psrd_lastname | Text(100) | Last name |
| psrd_fullname | Text(200) | Full name (calculated) |
| psrd_dateofbirth | Date | Date of birth |
| psrd_gender | OptionSet | Male, Female, Other |
| psrd_pan | Text(10) | PAN number (encrypted) |
| psrd_aadhaar | Text(12) | Aadhaar (encrypted, masked in display) |
| psrd_email | Text(200) | Email address |
| psrd_mobile | Text(15) | Mobile number |
| psrd_alternatephone | Text(15) | Alternate phone |
| psrd_kycstatus | OptionSet | Verified, Pending, Rejected, Expired |
| psrd_kycverifiedon | DateTime | KYC verified date |
| psrd_addressline1 | Text(200) | Address line 1 |
| psrd_addressline2 | Text(200) | Address line 2 |
| psrd_city | Text(100) | City |
| psrd_state | Text(100) | State |
| psrd_pincode | Text(10) | Pincode |
| psrd_country | Text(100) | Country |
| psrd_prefferemail | TwoOptions | Email communication preference |
| psrd_prefersms | TwoOptions | SMS communication preference |
| psrd_preferwhatsapp | TwoOptions | WhatsApp preference |
| psrd_bankaccountid | Lookup(psrd_bankaccount) | Primary bank account |
| createdon | DateTime | System |
| modifiedon | DateTime | System |

**Security Roles:**
- Customer: Read own only (row-level security via psrd_customerid = current user's linked customer)
- ServicingAgent: Read all, Update with approval
- Admin: Full access

**Field-Level Security:**
- psrd_pan: Encrypted, visible only to Supervisor/Admin
- psrd_aadhaar: Encrypted, visible only to Supervisor/Admin
- psrd_email: Visible to Agent+

---

### 3. psrd_requestcatalog (Request Catalog)
| Column | Type | Description |
|--------|------|-------------|
| psrd_requestcatalogid | PrimaryKey (GUID) | Unique identifier |
| psrd_requestcode | Text(30) | Request type code - Alternate Key |
| psrd_requestname | Text(200) | Display name |
| psrd_description | Text(2000) | Description |
| psrd_category | Text(100) | Category |
| psrd_slahours | WholeNumber | SLA in hours |
| psrd_sladays | Decimal | SLA in days |
| psrd_requiresapproval | TwoOptions | Approval required flag |
| psrd_approvallevels | WholeNumber | Number of approval levels |
| psrd_isactive | TwoOptions | Active status |
| psrd_displayorder | WholeNumber | Sort order |
| psrd_icon | Text(50) | Icon identifier |
| psrd_estimatedtime | Text(100) | Estimated processing time |
| psrd_formschema | Memo | Form definition JSON |
| psrd_eligibilityrulesjson | Memo | Eligibility rules JSON |
| psrd_requireddocsjson | Memo | Required documents JSON |
| psrd_tags | Text(500) | Comma-separated tags |

---

### 4. psrd_servicerequest (Service Request)
| Column | Type | Description |
|--------|------|-------------|
| psrd_servicerequestid | PrimaryKey (GUID) | Unique identifier |
| psrd_requestnumber | Text(30) | Request number - Alternate Key, auto-generated |
| psrd_requesttypecode | Text(30) | Request type code |
| psrd_requestcatalogid | Lookup(psrd_requestcatalog) | Request catalog reference |
| psrd_policyid | Lookup(psrd_policy) | Policy reference |
| psrd_policynumber | Text(50) | Policy number (denormalized for query) |
| psrd_customerid | Lookup(psrd_customer) | Customer reference |
| psrd_customername | Text(200) | Customer name (denormalized) |
| psrd_status | OptionSet | Draft, Submitted, ValidationPending, EligibilityCheckPassed, EligibilityCheckFailed, PendingApproval, Approved, Rejected, InProgress, Completed, Cancelled, Escalated, OnHold |
| psrd_priority | OptionSet | Low, Medium, High, Critical |
| psrd_submittedby | Lookup(systemuser) | Submitted by user |
| psrd_submittedon | DateTime | Submission timestamp |
| psrd_assignedto | Lookup(systemuser) | Assigned to user |
| psrd_assignedon | DateTime | Assignment timestamp |
| psrd_currentapprovallevel | WholeNumber | Current approval level |
| psrd_totalapprovallevels | WholeNumber | Total approval levels required |
| psrd_sladeadline | DateTime | SLA deadline |
| psrd_slabreached | TwoOptions | SLA breached flag |
| psrd_slahoursremaining | Decimal | SLA hours remaining (calculated) |
| psrd_requestdata | Memo | Request form data JSON |
| psrd_oldvalues | Memo | Old field values JSON |
| psrd_newvalues | Memo | New field values JSON |
| psrd_correlationid | Text(50) | Correlation ID for tracking |
| psrd_source | OptionSet | Portal, CopilotAgent, API, Bulk, Operations |
| psrd_channel | OptionSet | Customer, Agent, Operations, System |
| psrd_completedon | DateTime | Completion timestamp |
| psrd_internalnotes | Memo | Internal notes (not visible to customer) |
| createdon | DateTime | System |
| modifiedon | DateTime | System |

**Indexes:** psrd_requestnumber (unique), psrd_status, psrd_policyid, psrd_customerid, psrd_assignedto, psrd_sladeadline, psrd_slabreached
**Row-Level Security:** Customer sees only own requests; Agent sees team requests; Manager sees all

---

### 5. psrd_requeststatushistory (Status History)
| Column | Type | Description |
|--------|------|-------------|
| psrd_requeststatushistoryid | PrimaryKey (GUID) | Unique identifier |
| psrd_requestid | Lookup(psrd_servicerequest) | Parent request |
| psrd_fromstatus | OptionSet | Previous status |
| psrd_tostatus | OptionSet | New status |
| psrd_changedby | Lookup(systemuser) | Changed by user |
| psrd_changedon | DateTime | Change timestamp |
| psrd_remarks | Memo | Change remarks |
| psrd_issystemgenerated | TwoOptions | System vs user change |

---

### 6. psrd_approval (Approval)
| Column | Type | Description |
|--------|------|-------------|
| psrd_approvalid | PrimaryKey (GUID) | Unique identifier |
| psrd_requestid | Lookup(psrd_servicerequest) | Parent request |
| psrd_approvallevel | WholeNumber | Approval level number |
| psrd_approverrole | Text(50) | Required approver role |
| psrd_approverid | Lookup(systemuser) | Specific approver (optional) |
| psrd_status | OptionSet | Pending, Approved, Rejected, Escalated |
| psrd_requestedon | DateTime | Approval requested timestamp |
| psrd_respondedon | DateTime | Response timestamp |
| psrd_remarks | Memo | Approval remarks |
| psrd_delegatedto | Lookup(systemuser) | Delegated approver |
| psrd_ismandatory | TwoOptions | Mandatory approval flag |

---

### 7. psrd_eligibilityrule (Eligibility Rule)
| Column | Type | Description |
|--------|------|-------------|
| psrd_eligibilityruleid | PrimaryKey (GUID) | Unique identifier |
| psrd_rulecode | Text(50) | Rule code - Alternate Key |
| psrd_rulename | Text(200) | Rule name |
| psrd_ruledescription | Text(2000) | Rule description |
| psrd_requestcatalogid | Lookup(psrd_requestcatalog) | Applicable request type |
| psrd_ruletype | OptionSet | PolicyStatus, KYCStatus, PremiumStatus, DateBased, BusinessRule, Custom |
| psrd_operator | Text(30) | Comparison operator |
| psrd_fieldname | Text(100) | Field to evaluate |
| psrd_expectedvalue | Text(500) | Expected value |
| psrd_errormessage | Text(500) | Error message on failure |
| psrd_ismandatory | TwoOptions | Mandatory rule |
| psrd_sequence | WholeNumber | Evaluation order |
| psrd_isactive | TwoOptions | Active flag |

---

### 8. psrd_attachment (Attachment)
| Column | Type | Description |
|--------|------|-------------|
| psrd_attachmentid | PrimaryKey (GUID) | Unique identifier |
| psrd_requestid | Lookup(psrd_servicerequest) | Parent request |
| psrd_documentcode | Text(50) | Document type code |
| psrd_documentname | Text(200) | Document display name |
| psrd_filename | Text(255) | Original file name |
| psrd_filesize | WholeNumber | File size in bytes |
| psrd_mimetype | Text(100) | MIME type |
| psrd_uploadedby | Lookup(systemuser) | Uploaded by |
| psrd_uploadedon | DateTime | Upload timestamp |
| psrd_status | OptionSet | Pending, Received, Verified, Rejected |
| psrd_verifiedby | Lookup(systemuser) | Verified by |
| psrd_verifiedon | DateTime | Verification timestamp |
| psrd_storageurl | Text(500) | Azure Blob Storage URL (encrypted) |
| psrd_isdeleted | TwoOptions | Soft delete flag |

---

### 9. psrd_auditlog (Audit Log)
| Column | Type | Description |
|--------|------|-------------|
| psrd_auditlogid | PrimaryKey (GUID) | Unique identifier |
| psrd_correlationid | Text(50) | Correlation ID |
| psrd_entitytype | Text(100) | Entity type name |
| psrd_entityid | Text(50) | Entity ID |
| psrd_entityreference | Text(100) | Human-readable reference |
| psrd_action | Text(100) | Action performed |
| psrd_performedby | Lookup(systemuser) | Performed by |
| psrd_performedat | DateTime | Action timestamp |
| psrd_ipaddress | Text(50) | IP address |
| psrd_oldvalues | Memo | Old values JSON |
| psrd_newvalues | Memo | New values JSON |
| psrd_fieldchanges | Memo | Field-level changes JSON |
| psrd_requestid | Lookup(psrd_servicerequest) | Related request |
| psrd_approvalreference | Text(50) | Approval reference |
| psrd_systemgenerated | TwoOptions | System vs user action |
| psrd_remarks | Memo | Action remarks |

**Retention:** 7 years (insurance regulatory requirement)
**Security:** Read - Supervisor, Admin; Write - System only

---

### 10. psrd_notification (Notification)
| Column | Type | Description |
|--------|------|-------------|
| psrd_notificationid | PrimaryKey (GUID) | Unique identifier |
| psrd_type | OptionSet | RequestSubmitted, ApprovalRequired, Approved, Rejected, Completed, SLAWarning, SLABreached |
| psrd_title | Text(200) | Notification title |
| psrd_message | Memo | Notification body |
| psrd_channel | OptionSet | Email, SMS, Teams, InApp, Push |
| psrd_status | OptionSet | Pending, Sent, Delivered, Failed, Read |
| psrd_recipientid | Lookup(systemuser) | Recipient user |
| psrd_recipientemail | Text(200) | Recipient email |
| psrd_recipientmobile | Text(15) | Recipient mobile |
| psrd_relatedentityid | Text(50) | Related entity ID |
| psrd_relatedentitytype | Text(100) | Related entity type |
| psrd_relatedentitynumber | Text(50) | Related entity number |
| psrd_sentat | DateTime | Sent timestamp |
| psrd_deliveredat | DateTime | Delivery timestamp |
| psrd_readat | DateTime | Read timestamp |
| psrd_retrycount | WholeNumber | Retry attempts |
| psrd_errormessage | Text(500) | Error message |
| psrd_templatecode | Text(50) | Template code used |
| psrd_templatedata | Memo | Template variables JSON |
| createdon | DateTime | System |

---

### 11. psrd_comment (Comment)
| Column | Type | Description |
|--------|------|-------------|
| psrd_commentid | PrimaryKey (GUID) | Unique identifier |
| psrd_requestid | Lookup(psrd_servicerequest) | Parent request |
| psrd_commenttext | Memo | Comment text |
| psrd_commentedby | Lookup(systemuser) | Author |
| psrd_commentedbyname | Text(200) | Author name (denormalized) |
| psrd_commentedbyrole | Text(50) | Author role |
| psrd_commentedon | DateTime | Comment timestamp |
| psrd_isinternal | TwoOptions | Internal flag (not visible to customer) |
| psrd_isedited | TwoOptions | Edit flag |
| psrd_editedon | DateTime | Edit timestamp |
| psrd_parentcommentid | Lookup(psrd_comment) | Parent comment (for replies) |

---

### 12. psrd_escalation (Escalation)
| Column | Type | Description |
|--------|------|-------------|
| psrd_escalationid | PrimaryKey (GUID) | Unique identifier |
| psrd_requestid | Lookup(psrd_servicerequest) | Related request |
| psrd_escalationtype | OptionSet | SLABreach, Manual, ApprovalDelay, CustomerRequest |
| psrd_escalatedto | Lookup(systemuser) | Escalated to |
| psrd_escalatedby | Lookup(systemuser) | Escalated by |
| psrd_escalatedon | DateTime | Escalation timestamp |
| psrd_reason | Memo | Escalation reason |
| psrd_resolvedon | DateTime | Resolution timestamp |
| psrd_resolutionnotes | Memo | Resolution notes |
| psrd_isresolved | TwoOptions | Resolution flag |

---

### 13. psrd_knowledgearticle (Knowledge Article)
| Column | Type | Description |
|--------|------|-------------|
| psrd_knowledgearticleid | PrimaryKey (GUID) | Unique identifier |
| psrd_articlenumber | Text(30) | Article number - Alternate Key |
| psrd_title | Text(500) | Article title |
| psrd_summary | Text(2000) | Article summary |
| psrd_content | Memo | Full article content (HTML) |
| psrd_category | Text(100) | Category |
| psrd_subcategory | Text(100) | Sub-category |
| psrd_tags | Text(500) | Tags |
| psrd_relatedrequesttypes | Text(500) | Related request type codes |
| psrd_ispublished | TwoOptions | Published flag |
| psrd_publishedat | DateTime | Publication date |
| psrd_author | Lookup(systemuser) | Author |
| psrd_lastreviewed | DateTime | Last review date |
| psrd_viewcount | WholeNumber | View count |
| psrd_rating | Decimal | Average rating |

---

## Relationships

```
psrd_customer (1) ---- (N) psrd_policy
psrd_policy (1) ---- (N) psrd_servicerequest
psrd_requestcatalog (1) ---- (N) psrd_servicerequest
psrd_requestcatalog (1) ---- (N) psrd_eligibilityrule
psrd_servicerequest (1) ---- (N) psrd_requeststatushistory
psrd_servicerequest (1) ---- (N) psrd_approval
psrd_servicerequest (1) ---- (N) psrd_attachment
psrd_servicerequest (1) ---- (N) psrd_comment
psrd_servicerequest (1) ---- (N) psrd_escalation
psrd_servicerequest (1) ---- (N) psrd_notification
psrd_servicerequest (1) ---- (N) psrd_auditlog
```

## Security Model

### Business Unit Structure
- Root BU: Insurance Company
  - Operations BU
    - Branch BU (per branch)
  - Customer BU
  - Admin BU

### Row-Level Security via OwnerId / TeamId
- Customers see only their own policies and requests
- Agents see requests assigned to them or their team
- Supervisors see all requests in their branch
- Managers see all requests

### Column Security Profiles
- **Sensitive Customer Data** (PAN, Aadhaar): Supervisor, Admin only
- **Internal Notes**: Agent, Supervisor, Admin (not Customer)
- **Financial Data**: Agent+
