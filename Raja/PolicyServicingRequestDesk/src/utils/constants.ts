// ============================================================
// APPLICATION CONSTANTS
// ============================================================

export const APP_CONFIG = {
  APP_NAME: 'Policy Servicing Request Desk',
  APP_SHORT_NAME: 'PSRD',
  VERSION: '1.0.0',
  DATAVERSE_API_VERSION: 'v9.2',
  MAX_FILE_SIZE_MB: 10,
  ALLOWED_FILE_TYPES: ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.xls', '.xlsx'],
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  CACHE_DURATION_MS: 5 * 60 * 1000, // 5 minutes
  DEBOUNCE_DELAY_MS: 300,
  SEARCH_MIN_CHARS: 3,
  MAX_UPLOAD_FILES: 5,
  SESSION_TIMEOUT_MINUTES: 60,
  NOTIFICATION_POLL_INTERVAL_MS: 30 * 1000,
  SLA_WARNING_THRESHOLD_PERCENT: 80,
};

export const ROUTES = {
  ROOT: '/',
  DASHBOARD: '/dashboard',
  POLICY_SEARCH: '/policies',
  POLICY_DETAIL: '/policies/:policyId',
  REQUEST_CATALOGUE: '/catalogue',
  REQUEST_CREATE: '/requests/new',
  REQUEST_DETAIL: '/requests/:requestId',
  REQUEST_TRACKING: '/requests',
  OPERATIONS_WORKBENCH: '/operations',
  CUSTOMER_VIEW: '/my-requests',
  AUDIT_COMPLIANCE: '/audit',
  NOTIFICATIONS: '/notifications',
  ADMINISTRATION: '/admin',
  KNOWLEDGE_BASE: '/knowledge',
  REPORTS: '/reports',
  AGENT: '/agent',
  SETTINGS: '/settings',
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '/404',
};

export const REQUEST_STATUS_LABELS: Record<string, string> = {
  Draft: 'Draft',
  Submitted: 'Submitted',
  ValidationPending: 'Validation Pending',
  EligibilityCheckPassed: 'Eligibility Passed',
  EligibilityCheckFailed: 'Eligibility Failed',
  PendingApproval: 'Pending Approval',
  Approved: 'Approved',
  Rejected: 'Rejected',
  InProgress: 'In Progress',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
  Escalated: 'Escalated',
  OnHold: 'On Hold',
};

export const REQUEST_TYPE_LABELS: Record<string, string> = {
  ADDR_CHG: 'Address Change',
  NOM_CHG: 'Nominee Change',
  PREM_MODE_CHG: 'Premium Mode Change',
  MOB_UPD: 'Mobile Number Update',
  EMAIL_UPD: 'Email Update',
  COMM_PREF: 'Communication Preference',
  BANK_CHG: 'Bank Account Change',
  POLICY_REINSTATE: 'Policy Reinstatement',
  ASSIGNMENT_REQ: 'Assignment Request',
  BENE_CHG: 'Beneficiary Change',
  PAN_UPD: 'PAN Update',
  NAME_CORR: 'Name Correction',
  DOB_CORR: 'Date of Birth Correction',
  RIDER_ADD: 'Rider Addition',
  RIDER_REMOVE: 'Rider Removal',
  SIGNATURE_UPD: 'Signature Update',
};

export const PRIORITY_LABELS: Record<string, string> = {
  Low: 'Low',
  Medium: 'Medium',
  High: 'High',
  Critical: 'Critical',
};

export const POLICY_STATUS_LABELS: Record<string, string> = {
  Active: 'Active',
  Lapsed: 'Lapsed',
  Surrendered: 'Surrendered',
  Matured: 'Matured',
  PaidUp: 'Paid Up',
  Cancelled: 'Cancelled',
};

export const PREMIUM_MODE_LABELS: Record<string, string> = {
  Monthly: 'Monthly',
  Quarterly: 'Quarterly',
  HalfYearly: 'Half-Yearly',
  Yearly: 'Yearly',
  SinglePremium: 'Single Premium',
};

export const DATAVERSE_TABLES = {
  POLICIES: 'psrd_policies',
  CUSTOMERS: 'psrd_customers',
  REQUEST_CATALOG: 'psrd_requestcatalog',
  SERVICE_REQUESTS: 'psrd_servicerequests',
  STATUS_HISTORY: 'psrd_requeststatushistory',
  ELIGIBILITY_RULES: 'psrd_eligibilityrules',
  RULE_CONDITIONS: 'psrd_ruleconditions',
  APPROVALS: 'psrd_approvals',
  ATTACHMENTS: 'psrd_attachments',
  NOTIFICATIONS: 'psrd_notifications',
  NOTIFICATION_TEMPLATES: 'psrd_notificationtemplates',
  AUDIT_LOGS: 'psrd_auditlogs',
  KNOWLEDGE_ARTICLES: 'psrd_knowledgearticles',
  COMMENTS: 'psrd_comments',
  ESCALATIONS: 'psrd_escalations',
  AGENT_INTERACTIONS: 'psrd_agentinteractions',
  SYSTEM_CONFIG: 'psrd_systemconfig',
  USER_ROLES: 'psrd_userroles',
};

export const INDIC_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli',
  'Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

export const RELATIONSHIP_OPTIONS = [
  'Spouse', 'Son', 'Daughter', 'Father', 'Mother',
  'Brother', 'Sister', 'Father-in-Law', 'Mother-in-Law',
  'Son-in-Law', 'Daughter-in-Law', 'Grandfather', 'Grandmother',
  'Grandson', 'Granddaughter', 'Uncle', 'Aunt', 'Nephew', 'Niece',
  'Friend', 'Business Partner', 'Other',
];

export const QUERY_KEYS = {
  POLICIES: 'policies',
  POLICY_DETAIL: 'policy-detail',
  REQUESTS: 'requests',
  REQUEST_DETAIL: 'request-detail',
  REQUEST_CATALOGUE: 'request-catalogue',
  ELIGIBILITY: 'eligibility',
  NOTIFICATIONS: 'notifications',
  DASHBOARD_METRICS: 'dashboard-metrics',
  AUDIT_LOGS: 'audit-logs',
  KNOWLEDGE_ARTICLES: 'knowledge-articles',
  USERS: 'users',
  SYSTEM_CONFIG: 'system-config',
};
