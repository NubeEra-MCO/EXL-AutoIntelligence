import React from 'react';
import { Text, tokens, Badge, Button, makeStyles } from '@fluentui/react-components';
import { Alert24Regular, Checkmark20Regular } from '@fluentui/react-icons';
import { designTokens } from '../../theme/tokens';
import { formatRelativeTime } from '../../utils/formatters';

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px' },
  notif: { padding: '16px', border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: designTokens.borderRadius.lg, display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer', ':hover': { backgroundColor: tokens.colorNeutralBackground2 } },
  unread: { borderLeft: `3px solid ${tokens.colorBrandBackground}`, backgroundColor: tokens.colorBrandBackground2 },
});

const MOCK_NOTIFS = [
  { id: '1', title: 'Address Change Request Pending Approval', message: 'Request SR20240847123 is pending your approval. SLA: 6 hours remaining.', type: 'warning', isRead: false, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: '2', title: 'Nominee Change Request Completed', message: 'Request SR20240612456 has been completed successfully.', type: 'success', isRead: false, createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '3', title: 'Premium Mode Change Submitted', message: 'Your premium mode change request SR20240923789 has been submitted.', type: 'info', isRead: true, createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
  { id: '4', title: 'SLA Breach Alert', message: '3 requests have exceeded their SLA deadline. Immediate action required.', type: 'error', isRead: true, createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
];

const TYPE_COLORS: Record<string, 'informative' | 'success' | 'warning' | 'danger'> = {
  info: 'informative', success: 'success', warning: 'warning', error: 'danger',
};

export const NotificationsPage: React.FC = () => {
  const styles = useStyles();
  return (
    <div className={styles.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Text size={600} weight="bold" style={{ color: tokens.colorNeutralForeground1 }}>Notifications</Text>
          <Text size={300} style={{ color: tokens.colorNeutralForeground3, display: 'block', marginTop: 4 }}>
            {MOCK_NOTIFS.filter((n) => !n.isRead).length} unread notifications
          </Text>
        </div>
        <Button appearance="outline" icon={<Checkmark20Regular />} size="small">Mark All Read</Button>
      </div>
      {MOCK_NOTIFS.map((n) => (
        <div key={n.id} className={`${styles.notif} ${!n.isRead ? styles.unread : ''}`}>
          <Alert24Regular style={{ color: n.type === 'error' ? tokens.colorPaletteRedForeground1 : n.type === 'warning' ? '#B45309' : n.type === 'success' ? tokens.colorPaletteGreenForeground1 : tokens.colorBrandForeground1, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text size={300} weight={n.isRead ? 'regular' : 'semibold'}>{n.title}</Text>
              <Badge appearance="tint" color={TYPE_COLORS[n.type]} size="small">{n.type}</Badge>
            </div>
            <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>{n.message}</Text>
            <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: 'block', marginTop: 4 }}>{formatRelativeTime(n.createdAt)}</Text>
          </div>
        </div>
      ))}
    </div>
  );
};
