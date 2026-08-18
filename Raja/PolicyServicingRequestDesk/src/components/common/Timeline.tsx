// ============================================================
// TIMELINE COMPONENT - Request Status History
// ============================================================
import React from 'react';
import { Text, makeStyles, tokens, Tooltip } from '@fluentui/react-components';
import {
  CheckmarkCircle20Filled,
  DismissCircle20Filled,
  Clock20Regular,
  Info20Regular,
  ArrowClockwise20Regular,
  Person20Regular,
  Bot20Regular,
} from '@fluentui/react-icons';
import type { StatusHistoryEntry } from '../../types/request.types';
import { formatDateTime, formatRelativeTime } from '../../utils/formatters';
import { StatusBadge } from './StatusBadge';
import type { RequestStatus } from '../../types/request.types';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  entry: {
    display: 'flex',
    gap: '16px',
    position: 'relative',
  },
  iconColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '32px',
    flexShrink: 0,
  },
  iconWrapper: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colorNeutralBackground3,
    flexShrink: 0,
    zIndex: 1,
  },
  connector: {
    width: '2px',
    flex: 1,
    backgroundColor: tokens.colorNeutralStroke2,
    marginTop: '2px',
    marginBottom: '2px',
    minHeight: '20px',
  },
  contentBox: {
    flex: 1,
    paddingBottom: '20px',
    paddingTop: '4px',
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '4px',
  },
  arrow: {
    color: tokens.colorNeutralForeground3,
    fontSize: '14px',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  remarks: {
    marginTop: '6px',
    padding: '8px 12px',
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: '6px',
    borderLeft: `3px solid ${tokens.colorNeutralStroke1}`,
  },
  remarksText: {
    fontSize: '13px',
    color: tokens.colorNeutralForeground2,
    fontStyle: 'italic',
  },
});

interface TimelineProps {
  entries: StatusHistoryEntry[];
}

const getStatusIcon = (status: string): React.ReactElement => {
  switch (status) {
    case 'Completed':
    case 'Approved':
    case 'EligibilityCheckPassed':
      return <CheckmarkCircle20Filled style={{ color: '#22C55E' }} />;
    case 'Rejected':
    case 'Cancelled':
    case 'EligibilityCheckFailed':
      return <DismissCircle20Filled style={{ color: '#EF4444' }} />;
    case 'PendingApproval':
      return <ArrowClockwise20Regular style={{ color: '#A855F7' }} />;
    case 'InProgress':
    case 'ValidationPending':
      return <Clock20Regular style={{ color: '#F59E0B' }} />;
    default:
      return <Info20Regular style={{ color: '#3B82F6' }} />;
  }
};

export const Timeline: React.FC<TimelineProps> = ({ entries }) => {
  const styles = useStyles();

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.changedOn).getTime() - new Date(a.changedOn).getTime()
  );

  return (
    <div className={styles.container}>
      {sortedEntries.map((entry, index) => (
        <div key={entry.id} className={styles.entry}>
          <div className={styles.iconColumn}>
            <div className={styles.iconWrapper}>
              {getStatusIcon(entry.toStatus)}
            </div>
            {index < sortedEntries.length - 1 && <div className={styles.connector} />}
          </div>

          <div className={styles.contentBox}>
            <div className={styles.statusRow}>
              <StatusBadge status={entry.fromStatus as RequestStatus} size="small" />
              <Text className={styles.arrow}>→</Text>
              <StatusBadge status={entry.toStatus as RequestStatus} size="small" />
            </div>

            <div className={styles.metaRow}>
              <Text className={styles.metaText}>
                {entry.isSystemGenerated ? (
                  <Bot20Regular style={{ width: 12, height: 12 }} />
                ) : (
                  <Person20Regular style={{ width: 12, height: 12 }} />
                )}
                {entry.changedByName}
              </Text>
              <Tooltip content={formatDateTime(entry.changedOn)} relationship="label">
                <Text className={styles.metaText}>
                  <Clock20Regular style={{ width: 12, height: 12 }} />
                  {formatRelativeTime(entry.changedOn)}
                </Text>
              </Tooltip>
            </div>

            {entry.remarks && (
              <div className={styles.remarks}>
                <Text className={styles.remarksText}>&quot;{entry.remarks}&quot;</Text>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
