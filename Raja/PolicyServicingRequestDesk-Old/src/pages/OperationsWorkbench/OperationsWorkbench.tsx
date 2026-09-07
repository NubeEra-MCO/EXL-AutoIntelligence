// ============================================================
// OPERATIONS WORKBENCH - Module 6
// ============================================================
import React, { useState } from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Card,
  Button,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  TableCellLayout,
  Badge,
  ProgressBar,
  Dropdown,
  Option,
  Checkbox,
  Tab,
  TabList,
  Spinner,
  Avatar,
  Tooltip,
} from '@fluentui/react-components';
import {
  Warning20Regular,
  Clock20Regular,
  Checkmark20Regular,
  ArrowRight20Regular,
  PersonTag20Regular,
  Filter20Regular,
  ArrowClockwise20Regular,
  DocumentMultiple20Regular,
} from '@fluentui/react-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requestService } from '../../services/request.service';
import { StatusBadge, PriorityBadge } from '../../components/common/StatusBadge';
import { KPICard } from '../../components/common/KPICard';
import { formatRelativeTime, getSLAProgressPercent, getSLAStatus } from '../../utils/formatters';
import { QUERY_KEYS } from '../../utils/constants';
import { designTokens } from '../../theme/tokens';
import type { RequestFilters, RequestStatus, ServiceRequest } from '../../types/request.types';
import { mockRequests } from '../../services/mock-data';
import { useAppStore } from '../../store/appStore';

const useStyles = makeStyles({
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    maxWidth: '1400px',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '12px',
  },
  filterBar: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: '8px',
    flexWrap: 'wrap',
  },
  tableContainer: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: designTokens.borderRadius.lg,
    overflow: 'hidden',
  },
  tableRow: {
    ':hover': { backgroundColor: tokens.colorNeutralBackground2 },
  },
  slaCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    minWidth: '90px',
  },
  bulkActions: {
    display: 'flex',
    gap: '8px',
    padding: '8px 16px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground2,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  agentAvatar: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  slaBreached: {
    backgroundColor: '#FFF1F2',
    animation: 'pulse 2s infinite',
  },
});

const MOCK_AGENTS = [
  { id: 'agent-001', name: 'Priya Verma', initials: 'PV', load: 8 },
  { id: 'agent-002', name: 'Rahul Kumar', initials: 'RK', load: 5 },
  { id: 'agent-003', name: 'Sneha Patel', initials: 'SP', load: 12 },
  { id: 'agent-004', name: 'Amit Singh', initials: 'AS', load: 3 },
];

export const OperationsWorkbench: React.FC = () => {
  const styles = useStyles();
  const queryClient = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);

  const [activeTab, setActiveTab] = useState('queue');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<RequestFilters>({
    page: 1,
    pageSize: 20,
    sortBy: 'priority',
    sortOrder: 'desc',
  });

  const { data: metrics } = useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_METRICS],
    queryFn: () => requestService.getDashboardMetrics(),
    refetchInterval: 60 * 1000,
  });

  const { data: requestData, isLoading, refetch } = useQuery({
    queryKey: [QUERY_KEYS.REQUESTS, 'workbench', filters],
    queryFn: () => requestService.getRequests(filters),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => requestService.approveRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REQUESTS] });
      addToast({ type: 'success', title: 'Request Approved' });
      setSelectedRows(new Set());
    },
  });

  const toggleRowSelection = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = (checked: boolean) => {
    setSelectedRows(checked ? new Set(requestData?.requests.map((r: ServiceRequest) => r.id) || []) : new Set());
  };

  const requests = requestData?.requests || mockRequests;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Text size={600} weight="bold" style={{ color: tokens.colorNeutralForeground1 }}>
            Operations Workbench
          </Text>
          <Text size={300} style={{ color: tokens.colorNeutralForeground3, display: 'block', marginTop: 4 }}>
            Manage and process servicing requests queue
          </Text>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            appearance="outline"
            icon={<ArrowClockwise20Regular />}
            onClick={() => refetch()}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className={styles.metricsGrid}>
        <KPICard
          label="Open Queue"
          value={metrics?.open || 124}
          icon={<DocumentMultiple20Regular />}
          isLoading={!metrics}
        />
        <KPICard
          label="Pending Approval"
          value={metrics?.pendingApproval || 38}
          icon={<Clock20Regular />}
          variant="warning"
          isLoading={!metrics}
        />
        <KPICard
          label="SLA Breached"
          value={metrics?.slaBreached || 12}
          icon={<Warning20Regular />}
          variant="danger"
          isLoading={!metrics}
        />
        <KPICard
          label="Completed Today"
          value={metrics?.completedToday || 45}
          icon={<Checkmark20Regular />}
          variant="success"
          isLoading={!metrics}
        />
        <KPICard
          label="Avg TAT"
          value={`${metrics?.averageTAT || 2.4}d`}
          icon={<Clock20Regular />}
          isLoading={!metrics}
        />
      </div>

      {/* Tabs */}
      <TabList selectedValue={activeTab} onTabSelect={(_, d) => setActiveTab(d.value as string)}>
        <Tab value="queue">Request Queue</Tab>
        <Tab value="approval">Pending Approval</Tab>
        <Tab value="sla">SLA Breaches</Tab>
        <Tab value="agents">Agent Load</Tab>
      </TabList>

      {activeTab === 'agents' ? (
        /* Agent Load View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {MOCK_AGENTS.map((agent) => (
            <Card key={agent.id} style={{ padding: 20, border: `1px solid ${tokens.colorNeutralStroke2}` }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                <Avatar name={agent.name} size={40} color="brand" />
                <div>
                  <Text weight="semibold">{agent.name}</Text>
                  <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: 'block' }}>
                    {agent.load} active requests
                  </Text>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text size={200}>Workload</Text>
                  <Text size={200}>{Math.round((agent.load / 15) * 100)}%</Text>
                </div>
                <ProgressBar
                  value={agent.load / 15}
                  color={agent.load > 12 ? 'error' : agent.load > 8 ? 'warning' : 'success'}
                />
              </div>
              <Button
                appearance="outline"
                size="small"
                icon={<PersonTag20Regular />}
                style={{ marginTop: 12, width: '100%' }}
              >
                Assign Requests
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        /* Request Table */
        <div className={styles.tableContainer}>
          {/* Bulk Actions Bar */}
          {selectedRows.size > 0 && (
            <div className={styles.bulkActions}>
              <Text size={300} weight="semibold">{selectedRows.size} selected</Text>
              <Button
                size="small"
                appearance="primary"
                icon={<Checkmark20Regular />}
                onClick={() => selectedRows.forEach((id) => approveMutation.mutate(id))}
                disabled={approveMutation.isPending}
              >
                Bulk Approve
              </Button>
              <Button
                size="small"
                appearance="outline"
                icon={<PersonTag20Regular />}
              >
                Reassign
              </Button>
              <Button
                size="small"
                appearance="outline"
                onClick={() => setSelectedRows(new Set())}
              >
                Clear Selection
              </Button>
            </div>
          )}

          {/* Filter Bar */}
          <div className={styles.filterBar}>
            <Filter20Regular />
            <Dropdown
              placeholder="Filter by status"
              size="small"
              onOptionSelect={(_, d) =>
                setFilters((f) => ({
                  ...f,
                  status: d.selectedOptions.length ? d.selectedOptions as RequestStatus[] : undefined,
                  page: 1,
                }))
              }
              multiselect
              style={{ minWidth: 160 }}
            >
              <Option value="Submitted">Submitted</Option>
              <Option value="PendingApproval">Pending Approval</Option>
              <Option value="InProgress">In Progress</Option>
              <Option value="Escalated">Escalated</Option>
            </Dropdown>
            <Dropdown
              placeholder="Priority"
              size="small"
              style={{ minWidth: 120 }}
            >
              <Option value="Critical">Critical</Option>
              <Option value="High">High</Option>
              <Option value="Medium">Medium</Option>
              <Option value="Low">Low</Option>
            </Dropdown>
            <Dropdown
              placeholder="Assigned To"
              size="small"
              style={{ minWidth: 160 }}
            >
              {MOCK_AGENTS.map((a) => (
                <Option key={a.id} value={a.id}>{a.name}</Option>
              ))}
            </Dropdown>
            {isLoading && <Spinner size="tiny" />}
          </div>

          <Table aria-label="Operations queue">
            <TableHeader>
              <TableRow>
                <TableHeaderCell style={{ width: 40 }}>
                  <Checkbox
                    checked={selectedRows.size === requests.length && requests.length > 0}
                    onChange={(_, d) => selectAll(Boolean(d.checked))}
                    aria-label="Select all"
                  />
                </TableHeaderCell>
                <TableHeaderCell>Request</TableHeaderCell>
                <TableHeaderCell>Type</TableHeaderCell>
                <TableHeaderCell>Policy Holder</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Priority</TableHeaderCell>
                <TableHeaderCell>SLA</TableHeaderCell>
                <TableHeaderCell>Assigned</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests
                .filter((r: ServiceRequest) => {
                  if (activeTab === 'approval') return r.status === 'PendingApproval';
                  if (activeTab === 'sla') return r.slaBreached;
                  return true;
                })
                .map((request: ServiceRequest) => {
                  const slaPercent =
                    request.slaDeadline && request.submittedOn
                      ? getSLAProgressPercent(request.submittedOn, request.slaDeadline)
                      : 0;
                  const slaStatus = getSLAStatus(request.slaDeadline, request.status === 'Completed');
                  const isSelected = selectedRows.has(request.id);

                  return (
                    <TableRow
                      key={request.id}
                      className={styles.tableRow}
                      style={{
                        backgroundColor: slaStatus === 'breached' ? '#FFF1F2' :
                          isSelected ? tokens.colorBrandBackground2 : undefined,
                      }}
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onChange={() => toggleRowSelection(request.id)}
                          aria-label={`Select ${request.requestNumber}`}
                        />
                      </TableCell>
                      <TableCell>
                        <TableCellLayout>
                          <Text size={300} weight="semibold" style={{ fontFamily: 'monospace', color: tokens.colorBrandForeground1 }}>
                            {request.requestNumber}
                          </Text>
                          <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                            {formatRelativeTime(request.submittedOn)}
                          </Text>
                        </TableCellLayout>
                      </TableCell>
                      <TableCell>
                        <Text size={300}>{request.requestTypeName}</Text>
                      </TableCell>
                      <TableCell>
                        <TableCellLayout>
                          <Text size={300}>{request.policyHolderName}</Text>
                          <Text size={200} style={{ color: tokens.colorNeutralForeground3, fontFamily: 'monospace' }}>
                            {request.policyNumber}
                          </Text>
                        </TableCellLayout>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={request.status} />
                      </TableCell>
                      <TableCell>
                        <PriorityBadge priority={request.priority} />
                      </TableCell>
                      <TableCell>
                        {request.slaDeadline ? (
                          <div className={styles.slaCell}>
                            <ProgressBar
                              value={slaPercent / 100}
                              color={slaStatus === 'breached' ? 'error' : slaStatus === 'warning' ? 'warning' : 'success'}
                              thickness="medium"
                            />
                            <Text size={200} style={{
                              color: slaStatus === 'breached' ? tokens.colorPaletteRedForeground1 :
                                slaStatus === 'warning' ? '#B45309' : tokens.colorNeutralForeground3
                            }}>
                              {slaStatus === 'breached' ? 'BREACHED' :
                                request.slaHoursRemaining !== undefined ? `${request.slaHoursRemaining}h left` : ''}
                            </Text>
                          </div>
                        ) : '—'}
                      </TableCell>
                      <TableCell>
                        {request.assignedToName ? (
                          <div className={styles.agentAvatar}>
                            <Avatar name={request.assignedToName} size={24} />
                            <Text size={200}>{request.assignedToName}</Text>
                          </div>
                        ) : (
                          <Badge appearance="tint" color="warning" size="small">Unassigned</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {request.status === 'PendingApproval' && (
                            <Tooltip content="Approve" relationship="label">
                              <Button
                                size="small"
                                appearance="subtle"
                                icon={<Checkmark20Regular />}
                                onClick={() => approveMutation.mutate(request.id)}
                                aria-label="Approve request"
                              />
                            </Tooltip>
                          )}
                          <Tooltip content="View Details" relationship="label">
                            <Button
                              size="small"
                              appearance="subtle"
                              icon={<ArrowRight20Regular />}
                              aria-label="View details"
                            />
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
