// ============================================================
// USER & SECURITY TYPES
// ============================================================

export type UserRole = 'Customer' | 'ServicingAgent' | 'Supervisor' | 'OperationsManager' | 'Admin' | 'Auditor';

export interface User {
  id: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];
  primaryRole: UserRole;
  teamId?: string;
  teamName?: string;
  branchCode?: string;
  isActive: boolean;
  lastLoginAt?: string;
  preferences: UserPreferences;
  permissions: Permission[];
}

export interface UserPreferences {
  themeMode: 'light' | 'dark';
  language: string;
  timezone: string;
  dateFormat: string;
  currencyFormat: string;
  itemsPerPage: number;
  emailNotifications: boolean;
  pushNotifications: boolean;
  defaultDashboard: string;
}

export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'approve' | 'execute';
  scope: 'own' | 'team' | 'all';
  conditions?: Record<string, unknown>;
}

export interface RolePermissionMatrix {
  role: UserRole;
  permissions: {
    policySearch: PermissionLevel;
    requestCreate: PermissionLevel;
    requestView: PermissionLevel;
    requestApprove: PermissionLevel;
    requestExecute: PermissionLevel;
    requestAssign: PermissionLevel;
    requestBulkOperation: PermissionLevel;
    auditView: PermissionLevel;
    reportView: PermissionLevel;
    adminAccess: PermissionLevel;
    userManagement: PermissionLevel;
  };
}

export type PermissionLevel = 'none' | 'own' | 'team' | 'all';

// Notification Types
export type NotificationType =
  | 'RequestSubmitted'
  | 'RequestApprovalRequired'
  | 'RequestApproved'
  | 'RequestRejected'
  | 'RequestCompleted'
  | 'RequestCancelled'
  | 'SLAWarning'
  | 'SLABreached'
  | 'EscalationCreated'
  | 'AssignmentChanged'
  | 'CommentAdded'
  | 'DocumentRequired'
  | 'SystemAlert';

export type NotificationChannel = 'Email' | 'SMS' | 'Teams' | 'InApp' | 'Push';
export type NotificationStatus = 'Pending' | 'Sent' | 'Delivered' | 'Failed' | 'Read';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  recipientId: string;
  recipientEmail?: string;
  recipientMobile?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  relatedEntityNumber?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  retryCount: number;
  errorMessage?: string;
  templateCode: string;
  templateData: Record<string, unknown>;
  createdAt: string;
  expiresAt?: string;
}

export interface NotificationTemplate {
  id: string;
  templateCode: string;
  notificationType: NotificationType;
  channel: NotificationChannel;
  subject?: string;
  bodyTemplate: string;
  isActive: boolean;
  language: string;
  variables: string[];
}

// Audit Types
export interface AuditLog {
  id: string;
  correlationId: string;
  entityType: string;
  entityId: string;
  entityReference: string;
  action: string;
  performedBy: string;
  performedByName: string;
  performedByRole: string;
  performedAt: string;
  ipAddress?: string;
  userAgent?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  fieldChanges?: FieldChangeAudit[];
  requestId?: string;
  approvalReference?: string;
  systemGenerated: boolean;
  remarks?: string;
}

export interface FieldChangeAudit {
  fieldName: string;
  displayLabel: string;
  oldValue: unknown;
  newValue: unknown;
  dataType: string;
}

// Knowledge Base Types
export interface KnowledgeArticle {
  id: string;
  articleNumber: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  subCategory?: string;
  tags: string[];
  relatedRequestTypes: string[];
  isPublished: boolean;
  publishedAt?: string;
  author: string;
  lastReviewedAt?: string;
  viewCount: number;
  rating?: number;
  attachments?: string[];
}

// Agent Interaction Types
export interface AgentInteraction {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  startedAt: string;
  endedAt?: string;
  topic: string;
  intent: string;
  messages: AgentMessage[];
  actionsTaken: AgentAction[];
  requestsCreated: string[];
  satisfactionScore?: number;
  resolutionStatus: 'Resolved' | 'Escalated' | 'Abandoned' | 'InProgress';
}

export interface AgentMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
  isRichContent?: boolean;
  adaptiveCard?: Record<string, unknown>;
}

export interface AgentAction {
  actionName: string;
  actionType: string;
  inputs: Record<string, unknown>;
  outputs?: Record<string, unknown>;
  executedAt: string;
  isSuccessful: boolean;
  errorMessage?: string;
}

// Dashboard Types
export interface DashboardMetrics {
  totalRequests: number;
  openRequests: number;
  pendingApproval: number;
  slaBreached: number;
  completedToday: number;
  averageTAT: number;
  customerSatisfaction?: number;
  deflectionRate?: number;
  requestsByStatus: { status: string; count: number }[];
  requestsByType: { type: string; count: number }[];
  requestsByPriority: { priority: string; count: number }[];
  slaCompliance: number;
  weeklyTrend: TrendDataPoint[];
  monthlyTrend: TrendDataPoint[];
}

export interface TrendDataPoint {
  date: string;
  submitted: number;
  completed: number;
  slaBreached: number;
}

// System Configuration
export interface SystemConfiguration {
  id: string;
  configKey: string;
  configValue: string;
  configGroup: string;
  description: string;
  dataType: 'String' | 'Number' | 'Boolean' | 'JSON';
  isEncrypted: boolean;
  isEditable: boolean;
  lastModifiedBy: string;
  lastModifiedAt: string;
}
