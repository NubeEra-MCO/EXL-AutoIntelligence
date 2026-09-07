// ============================================================
// COMMON / SHARED TYPES
// ============================================================

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: ApiError[];
  metadata?: ResponseMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: unknown;
}

export interface ResponseMetadata {
  timestamp: string;
  requestId: string;
  version: string;
  page?: number;
  pageSize?: number;
  totalCount?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'between';
  value: unknown;
}

export interface SelectOption {
  label: string;
  value: string;
  description?: string;
  icon?: string;
  disabled?: boolean;
  metadata?: Record<string, unknown>;
}

export interface TableColumn<T = unknown> {
  key: string;
  label: string;
  width?: number | string;
  minWidth?: number;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  frozen?: 'left' | 'right';
  hidden?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  badge?: number | string;
  children?: NavigationItem[];
  requiredRoles?: string[];
  isActive?: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  actions?: ToastAction[];
}

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ModalConfig {
  id: string;
  title: string;
  content: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  onClose?: () => void;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  isDangerous?: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  loadingText?: string;
}

export interface ErrorState {
  hasError: boolean;
  errorCode?: string;
  errorMessage?: string;
  retryable?: boolean;
}

export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface AppConfig {
  environmentUrl: string;
  userId: string;
  userRoles: string;
  themeMode: 'light' | 'dark';
  enableAI: boolean;
  appInsightsKey?: string;
  dataverseApiVersion?: string;
  maxFileUploadSizeMB?: number;
  sessionTimeoutMinutes?: number;
}

// Re-export React for use in type definitions
import type React from 'react';
