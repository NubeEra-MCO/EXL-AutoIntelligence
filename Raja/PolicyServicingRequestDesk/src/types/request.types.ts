// ============================================================
// SERVICING REQUEST TYPES
// ============================================================

export type RequestStatus =
  | 'Draft'
  | 'Submitted'
  | 'ValidationPending'
  | 'EligibilityCheckPassed'
  | 'EligibilityCheckFailed'
  | 'PendingApproval'
  | 'Approved'
  | 'Rejected'
  | 'InProgress'
  | 'Completed'
  | 'Cancelled'
  | 'Escalated'
  | 'OnHold';

export type RequestPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected' | 'Escalated';
export type DocumentStatus = 'Pending' | 'Received' | 'Verified' | 'Rejected';

export type RequestTypeCode =
  | 'ADDR_CHG'
  | 'NOM_CHG'
  | 'PREM_MODE_CHG'
  | 'MOB_UPD'
  | 'EMAIL_UPD'
  | 'COMM_PREF'
  | 'BANK_CHG'
  | 'POLICY_REINSTATE'
  | 'ASSIGNMENT_REQ'
  | 'BENE_CHG'
  | 'PAN_UPD'
  | 'NAME_CORR'
  | 'DOB_CORR'
  | 'RIDER_ADD'
  | 'RIDER_REMOVE'
  | 'SIGNATURE_UPD';

export interface RequestCatalogItem {
  id: string;
  requestCode: RequestTypeCode;
  requestName: string;
  description: string;
  category: string;
  slaHours: number;
  slaDays: number;
  requiresApproval: boolean;
  approvalLevels: number;
  eligibilityRules: EligibilityRule[];
  requiredDocuments: RequiredDocument[];
  formSchema: FormSchema;
  isActive: boolean;
  displayOrder: number;
  icon: string;
  estimatedTime: string;
  tags: string[];
}

export interface EligibilityRule {
  id: string;
  ruleCode: string;
  ruleName: string;
  ruleDescription: string;
  ruleType: 'PolicyStatus' | 'KYCStatus' | 'PremiumStatus' | 'DateBased' | 'BusinessRule' | 'Custom';
  operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'in' | 'notIn' | 'contains';
  fieldName: string;
  expectedValue: string | string[] | number | boolean;
  errorMessage: string;
  isMandatory: boolean;
  sequence: number;
}

export interface EligibilityCondition {
  id: string;
  ruleId: string;
  conditionType: 'AND' | 'OR';
  fieldPath: string;
  operator: string;
  value: unknown;
  errorMessage: string;
  sequence: number;
}

export interface EligibilityCheckResult {
  isEligible: boolean;
  policyNumber: string;
  requestTypeCode: RequestTypeCode;
  checkedAt: string;
  results: EligibilityRuleResult[];
  failedRules: EligibilityRuleResult[];
  passedRules: EligibilityRuleResult[];
}

export interface EligibilityRuleResult {
  ruleCode: string;
  ruleName: string;
  isPassed: boolean;
  message: string;
  severity: 'Error' | 'Warning' | 'Info';
}

export interface RequiredDocument {
  id: string;
  documentCode: string;
  documentName: string;
  description: string;
  isMandatory: boolean;
  acceptedFormats: string[];
  maxSizeInMB: number;
  instructions?: string;
}

export interface FormField {
  id: string;
  fieldName: string;
  fieldLabel: string;
  fieldType:
    | 'text'
    | 'email'
    | 'phone'
    | 'number'
    | 'date'
    | 'select'
    | 'multiselect'
    | 'radio'
    | 'checkbox'
    | 'textarea'
    | 'file'
    | 'address'
    | 'bankAccount';
  placeholder?: string;
  helpText?: string;
  isRequired: boolean;
  isReadOnly?: boolean;
  defaultValue?: unknown;
  options?: { label: string; value: string; description?: string }[];
  validationRules?: ValidationRule[];
  conditionalDisplay?: ConditionalDisplay;
  section?: string;
  displayOrder: number;
  columnSpan?: 1 | 2 | 3 | 4;
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'min' | 'max' | 'custom';
  value?: string | number | RegExp;
  message: string;
}

export interface ConditionalDisplay {
  dependsOn: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan';
  value: unknown;
}

export interface FormSchema {
  sections: FormSection[];
  totalSteps?: number;
  isMultiStep?: boolean;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  step?: number;
  fields: FormField[];
}

export interface ServiceRequest {
  id: string;
  requestNumber: string;
  requestTypeCode: RequestTypeCode;
  requestTypeName: string;
  policyId: string;
  policyNumber: string;
  policyHolderId: string;
  policyHolderName: string;
  status: RequestStatus;
  priority: RequestPriority;
  submittedBy: string;
  submittedByName: string;
  submittedOn?: string;
  assignedTo?: string;
  assignedToName?: string;
  assignedOn?: string;
  currentApprovalLevel: number;
  totalApprovalLevels: number;
  slaDeadline?: string;
  slaBreached: boolean;
  slaHoursRemaining?: number;
  requestData: Record<string, unknown>;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  attachments: Attachment[];
  statusHistory: StatusHistoryEntry[];
  approvals: ApprovalEntry[];
  comments: Comment[];
  eligibilityResult?: EligibilityCheckResult;
  executionResult?: ExecutionResult;
  correlationId: string;
  source: 'Portal' | 'CopilotAgent' | 'API' | 'Bulk' | 'Operations';
  channel: 'Customer' | 'Agent' | 'Operations' | 'System';
  escalations?: Escalation[];
  tags?: string[];
  internalNotes?: string;
  completedOn?: string;
  createdOn: string;
  modifiedOn: string;
}

export interface StatusHistoryEntry {
  id: string;
  requestId: string;
  fromStatus: RequestStatus;
  toStatus: RequestStatus;
  changedBy: string;
  changedByName: string;
  changedOn: string;
  remarks?: string;
  isSystemGenerated: boolean;
}

export interface ApprovalEntry {
  id: string;
  requestId: string;
  approvalLevel: number;
  approverRole: string;
  approverId?: string;
  approverName?: string;
  status: ApprovalStatus;
  requestedOn: string;
  respondedOn?: string;
  remarks?: string;
  delegatedTo?: string;
  isMandatory: boolean;
}

export interface Attachment {
  id: string;
  requestId: string;
  documentCode: string;
  documentName: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedOn: string;
  status: DocumentStatus;
  verifiedBy?: string;
  verifiedOn?: string;
  storageUrl: string;
  thumbnailUrl?: string;
  isDeleted: boolean;
}

export interface Comment {
  id: string;
  requestId: string;
  commentText: string;
  commentedBy: string;
  commentedByName: string;
  commentedByRole: string;
  commentedOn: string;
  isInternal: boolean;
  isEdited: boolean;
  editedOn?: string;
  parentCommentId?: string;
  replies?: Comment[];
}

export interface Escalation {
  id: string;
  requestId: string;
  escalationType: 'SLABreach' | 'Manual' | 'ApprovalDelay' | 'CustomerRequest';
  escalatedTo: string;
  escalatedToName: string;
  escalatedBy: string;
  escalatedOn: string;
  reason: string;
  resolvedOn?: string;
  resolutionNotes?: string;
  isResolved: boolean;
}

export interface ExecutionResult {
  isSuccessful: boolean;
  executedBy: string;
  executedOn: string;
  executionReference: string;
  fieldChanges: FieldChange[];
  errors?: string[];
  rollbackReference?: string;
}

export interface FieldChange {
  fieldName: string;
  displayLabel: string;
  oldValue: unknown;
  newValue: unknown;
  changedAt: string;
  changedBy: string;
}

export interface RequestCreatePayload {
  policyNumber: string;
  requestTypeCode: RequestTypeCode;
  requestData: Record<string, unknown>;
  attachments?: File[];
  remarks?: string;
  priority?: RequestPriority;
}

export interface RequestFilters {
  status?: RequestStatus[];
  requestTypeCode?: RequestTypeCode[];
  priority?: RequestPriority[];
  assignedTo?: string;
  dateFrom?: string;
  dateTo?: string;
  slaBreached?: boolean;
  policyNumber?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  searchText?: string;
}

export interface RequestListResult {
  requests: ServiceRequest[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  metrics?: RequestMetrics;
}

export interface RequestMetrics {
  total: number;
  open: number;
  pendingApproval: number;
  slaBreached: number;
  completedToday: number;
  averageTAT: number;
  byStatus: Record<RequestStatus, number>;
  byType: Record<string, number>;
  byPriority: Record<RequestPriority, number>;
}
