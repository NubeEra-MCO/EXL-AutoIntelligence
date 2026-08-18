// ============================================================
// DASHBOARD PAGE
// ============================================================
import React from 'react';
import type { ServiceRequest } from '../../types/request.types';
import {
  makeStyles,
  tokens,
  Text,
  Card,
  Button,
  ProgressBar,
} from '@fluentui/react-components';
import {
  DocumentMultiple20Regular,
  Clock20Regular,
  Warning20Regular,
  CheckmarkCircle20Regular,
  ArrowRight20Regular,
  People20Regular,
  Timer20Regular,
  Trophy20Regular,
} from '@fluentui/react-icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { KPICard } from '../../components/common/KPICard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/StatusBadge';
import { requestService } from '../../services/request.service';
import { formatRelativeTime, getSLAProgressPercent } from '../../utils/formatters';
import { QUERY_KEYS, ROUTES } from '../../utils/constants';
import { designTokens } from '../../theme/tokens';
import { mockRequests } from '../../services/mock-data';

const useStyles = makeStyles({
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    maxWidth: '1400px',
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: 700,
    color: tokens.colorNeutralForeground1,
    lineHeight: 1.2,
  },
  pageSubtitle: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground3,
    marginTop: '4px',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '16px',
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    '@media (max-width: 900px)': {
      gridTemplateColumns: '1fr',
    },
  },
  threeCol: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '16px',
    '@media (max-width: 1100px)': {
      gridTemplateColumns: '1fr',
    },
  },
  card: {
    padding: '20px',
    borderRadius: designTokens.borderRadius.lg,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  cardTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
  },
  requestList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },
  requestItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 0',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    cursor: 'pointer',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground2,
    },
    ':last-child': {
      borderBottom: 'none',
    },
  },
  requestInfo: {
    flex: 1,
    minWidth: 0,
  },
  requestNumber: {
    fontSize: '13px',
    fontWeight: 600,
    color: tokens.colorBrandForeground1,
  },
  requestType: {
    fontSize: '13px',
    color: tokens.colorNeutralForeground1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  requestMeta: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
  slaBar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  slaText: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
  quickActionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  quickAction: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '16px',
    borderRadius: '10px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    cursor: 'pointer',
    ':hover': {
      backgroundColor: tokens.colorBrandBackground2,
      border: `1px solid ${tokens.colorBrandBackground}`,
    },
  },
  quickActionIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: tokens.colorBrandBackground2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: tokens.colorBrandForeground1,
  },
  quickActionLabel: {
    fontSize: '12px',
    fontWeight: '500',
    textAlign: 'center',
    color: tokens.colorNeutralForeground2,
  },
  statusBreakdown: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  statusItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 0',
  },
  statusItemLabel: {
    flex: 1,
    fontSize: '13px',
    color: tokens.colorNeutralForeground2,
  },
  statusItemCount: {
    fontSize: '13px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    minWidth: '32px',
    textAlign: 'right',
  },
  statusBar: {
    flex: 2,
  },
  welcomeCard: {
    padding: '24px',
    background: `linear-gradient(135deg, #0E4DA4 0%, #1A7EEE 100%)`,
    borderRadius: designTokens.borderRadius.lg,
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
  },
  welcomeText: {
    color: 'white',
    fontSize: '22px',
    fontWeight: 700,
  },
  welcomeSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: '14px',
    marginTop: '4px',
  },
});

export const Dashboard: React.FC = () => {
  const styles = useStyles();
  const navigate = useNavigate();

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_METRICS],
    queryFn: () => requestService.getDashboardMetrics(),
    staleTime: 2 * 60 * 1000,
  });

  const recentRequests = mockRequests.slice(0, 5);

  const getHourOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const statusItems = [
    { label: 'Submitted', count: metrics?.byStatus?.Submitted || 42, color: '#3B82F6', pct: 34 },
    { label: 'Pending Approval', count: metrics?.byStatus?.PendingApproval || 38, color: '#A855F7', pct: 31 },
    { label: 'In Progress', count: metrics?.byStatus?.InProgress || 27, color: '#F59E0B', pct: 22 },
    { label: 'Escalated', count: metrics?.byStatus?.Escalated || 4, color: '#EF4444', pct: 3 },
  ];

  return (
    <div className={styles.page}>
      {/* Welcome Banner */}
      <div className={styles.welcomeCard}>
        <div>
          <Text className={styles.welcomeText}>{getHourOfDay()}, Operations Team 👋</Text>
          <Text className={styles.welcomeSub}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
        </div>
        <Button
          appearance="outline"
          style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
          icon={<DocumentMultiple20Regular />}
          onClick={() => navigate(ROUTES.REQUEST_TRACKING)}
        >
          View All Requests
        </Button>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <KPICard
          label="Total Requests"
          value={metrics?.total || 847}
          icon={<DocumentMultiple20Regular />}
          trend={12}
          trendLabel="vs last month"
          isLoading={metricsLoading}
          onClick={() => navigate(ROUTES.REQUEST_TRACKING)}
        />
        <KPICard
          label="Open Requests"
          value={metrics?.open || 124}
          icon={<Clock20Regular />}
          subtitle="Requires attention"
          variant="default"
          isLoading={metricsLoading}
          onClick={() => navigate(ROUTES.OPERATIONS_WORKBENCH)}
        />
        <KPICard
          label="Pending Approval"
          value={metrics?.pendingApproval || 38}
          icon={<Timer20Regular />}
          variant="warning"
          trend={-5}
          trendLabel="vs yesterday"
          isLoading={metricsLoading}
        />
        <KPICard
          label="SLA Breaches"
          value={metrics?.slaBreached || 12}
          icon={<Warning20Regular />}
          variant="danger"
          subtitle="Needs immediate action"
          isLoading={metricsLoading}
        />
        <KPICard
          label="Completed Today"
          value={metrics?.completedToday || 45}
          icon={<CheckmarkCircle20Regular />}
          variant="success"
          trend={8}
          trendLabel="vs yesterday"
          isLoading={metricsLoading}
        />
        <KPICard
          label="Avg TAT (Days)"
          value={metrics?.averageTAT || 2.4}
          icon={<Trophy20Regular />}
          subtitle="Target: 3 days"
          formatter={(v) => `${v}d`}
          isLoading={metricsLoading}
        />
      </div>

      {/* Main Content Grid */}
      <div className={styles.threeCol}>
        {/* Recent Requests */}
        <Card className={styles.card}>
          <div className={styles.cardHeader}>
            <Text className={styles.cardTitle}>Recent Requests</Text>
            <Button
              appearance="transparent"
              size="small"
              icon={<ArrowRight20Regular />}
              iconPosition="after"
              onClick={() => navigate(ROUTES.REQUEST_TRACKING)}
            >
              View All
            </Button>
          </div>

          <div className={styles.requestList}>
            {recentRequests.map((request: ServiceRequest) => {
              const slaPercent = request.slaDeadline && request.submittedOn
                ? getSLAProgressPercent(request.submittedOn, request.slaDeadline)
                : 0;

              return (
                <div
                  key={request.id}
                  className={styles.requestItem}
                  onClick={() => navigate(`/requests/${request.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/requests/${request.id}`)}
                >
                  <div className={styles.requestInfo}>
                    <Text className={styles.requestNumber}>{request.requestNumber}</Text>
                    <Text className={styles.requestType}>{request.requestTypeName}</Text>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                      <Text className={styles.requestMeta}>{request.policyHolderName}</Text>
                      <Text className={styles.requestMeta}>•</Text>
                      <Text className={styles.requestMeta}>{formatRelativeTime(request.submittedOn)}</Text>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <StatusBadge status={request.status} size="small" />
                    <PriorityBadge priority={request.priority} />
                    {request.slaDeadline && (
                      <div className={styles.slaBar} style={{ width: 80 }}>
                        <ProgressBar
                          value={slaPercent / 100}
                          color={slaPercent > 80 ? 'error' : slaPercent > 60 ? 'warning' : 'success'}
                          thickness="medium"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Quick Actions */}
          <Card className={styles.card}>
            <div className={styles.cardHeader}>
              <Text className={styles.cardTitle}>Quick Actions</Text>
            </div>
            <div className={styles.quickActionGrid}>
              {[
                { icon: <DocumentMultiple20Regular />, label: 'New Request', path: ROUTES.REQUEST_CATALOGUE },
                { icon: <People20Regular />, label: 'Policy Search', path: ROUTES.POLICY_SEARCH },
                { icon: <Clock20Regular />, label: 'My Queue', path: ROUTES.OPERATIONS_WORKBENCH },
                { icon: <Warning20Regular />, label: 'SLA Alerts', path: ROUTES.OPERATIONS_WORKBENCH },
              ].map((action) => (
                <div
                  key={action.label}
                  className={styles.quickAction}
                  onClick={() => navigate(action.path)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(action.path)}
                >
                  <div className={styles.quickActionIcon}>{action.icon}</div>
                  <Text className={styles.quickActionLabel}>{action.label}</Text>
                </div>
              ))}
            </div>
          </Card>

          {/* Status Breakdown */}
          <Card className={styles.card}>
            <div className={styles.cardHeader}>
              <Text className={styles.cardTitle}>Status Breakdown</Text>
            </div>
            <div className={styles.statusBreakdown}>
              {statusItems.map((item) => (
                <div key={item.label} className={styles.statusItem}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: item.color,
                      flexShrink: 0,
                    }}
                  />
                  <Text className={styles.statusItemLabel}>{item.label}</Text>
                  <div className={styles.statusBar}>
                    <ProgressBar
                      value={item.pct / 100}
                      thickness="medium"
                    />
                  </div>
                  <Text className={styles.statusItemCount}>{item.count}</Text>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
