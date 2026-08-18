// ============================================================
// STATUS BADGE COMPONENT
// ============================================================
import React from 'react';
import { Badge, makeStyles } from '@fluentui/react-components';
import type { RequestStatus } from '../../types/request.types';
import type { PolicyStatus } from '../../types/policy.types';

const useStyles = makeStyles({
  badge: {
    fontWeight: 600,
    fontSize: '11px',
    letterSpacing: '0.3px',
    borderRadius: '4px',
  },
});

interface StatusBadgeProps {
  status: RequestStatus | PolicyStatus;
  size?: 'small' | 'medium' | 'large';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'medium' }) => {
  const styles = useStyles();

  const getAppearance = (): 'filled' | 'outline' | 'tint' => 'tint';

  const getColor = (): 'informative' | 'success' | 'warning' | 'danger' | 'important' | 'severe' | 'subtle' => {
    switch (status) {
      case 'Active':
      case 'Approved':
      case 'Completed':
      case 'EligibilityCheckPassed':
        return 'success';
      case 'Lapsed':
      case 'ValidationPending':
      case 'OnHold':
      case 'Escalated':
        return 'warning';
      case 'Rejected':
      case 'EligibilityCheckFailed':
      case 'Surrendered':
      case 'Cancelled':
        return 'danger';
      case 'PendingApproval':
      case 'InProgress':
        return 'informative';
      case 'Submitted':
        return 'important';
      case 'Draft':
      default:
        return 'subtle';
    }
  };

  const getLabel = (): string => {
    const labels: Record<string, string> = {
      Active: 'Active',
      Lapsed: 'Lapsed',
      Surrendered: 'Surrendered',
      Matured: 'Matured',
      PaidUp: 'Paid Up',
      Cancelled: 'Cancelled',
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
      Escalated: 'Escalated',
      OnHold: 'On Hold',
    };
    return labels[status] || status;
  };

  return (
    <Badge
      className={styles.badge}
      appearance={getAppearance()}
      color={getColor()}
      size={size}
    >
      {getLabel()}
    </Badge>
  );
};

interface PriorityBadgeProps {
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  size?: 'small' | 'medium' | 'large';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'small' }) => {
  const styles = useStyles();

  const getColor = (): 'informative' | 'success' | 'warning' | 'danger' | 'important' | 'severe' | 'subtle' => {
    switch (priority) {
      case 'Low': return 'success';
      case 'Medium': return 'informative';
      case 'High': return 'warning';
      case 'Critical': return 'danger';
      default: return 'subtle';
    }
  };

  return (
    <Badge
      className={styles.badge}
      appearance="tint"
      color={getColor()}
      size={size}
    >
      {priority}
    </Badge>
  );
};
