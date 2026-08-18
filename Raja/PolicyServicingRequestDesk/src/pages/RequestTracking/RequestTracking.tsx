// ============================================================
// REQUEST TRACKING PAGE - Module 5
// ============================================================
import React, { useState } from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Button,
  Input,
  Spinner,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  TableCellLayout,
  Dropdown,
  Option,
  Divider,
  ProgressBar,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  DialogActions,
  Textarea,
  Tab,
  TabList,
  Field,
} from '@fluentui/react-components';
import {
  Search24Regular,
  ChevronLeft20Regular,
  ChevronRight20Regular,
  ArrowRight20Regular,
  Clock20Regular,
  DocumentSearch24Regular,
  Dismiss20Regular,
  Checkmark20Regular,
  CommentAdd20Regular,
  DocumentBulletList20Regular,
} from '@fluentui/react-icons';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requestService } from '../../services/request.service';
import { StatusBadge, PriorityBadge } from '../../components/common/StatusBadge';
import { Timeline } from '../../components/common/Timeline';
import {
  formatDateTime,
  formatRelativeTime,
  getSLAProgressPercent,
  getSLAStatus,
} from '../../utils/formatters';
import { QUERY_KEYS, ROUTES } from '../../utils/constants';
import { designTokens } from '../../theme/tokens';
import type { RequestFilters, ServiceRequest, RequestStatus } from '../../types/request.types';
import { useAppStore } from '../../store/appStore';

const useStyles = makeStyles({
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    maxWidth: '1400px',
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap',
  },
  filterRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  tableContainer: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: designTokens.borderRadius.lg,
    overflow: 'hidden',
  },
  tableRow: {
    cursor: 'pointer',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground2,
    },
  },
  requestNumber: {
    fontSize: '13px',
    fontWeight: 600,
    color: tokens.colorBrandForeground1,
    fontFamily: "'Cascadia Code', monospace",
  },
  policyNumber: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
    fontFamily: "'Cascadia Code', monospace",
  },
  slaContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: '100px',
  },
  slaText: {
    fontSize: '11px',
    display: 'flex',
    justifyContent: 'space-between',
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  detailPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  detailSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  detailLabel: {
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: tokens.colorNeutralForeground3,
  },
  detailValue: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground1,
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  commentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  comment: {
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: tokens.colorNeutralBackground2,
  },
  commentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '6px',
  },
  commentAuthor: {
    fontSize: '13px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
  },
  commentTime: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
  commentText: {
    fontSize: '13px',
    color: tokens.colorNeutralForeground2,
    lineHeight: 1.5,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '64px 24px',
    gap: '12px',
  },
});

const STATUS_FILTER_OPTIONS: { label: string; value: RequestStatus }[] = [
  { label: 'Submitted', value: 'Submitted' },
  { label: 'Validation Pending', value: 'ValidationPending' },
  { label: 'Pending Approval', value: 'PendingApproval' },
  { label: 'Approved', value: 'Approved' },
  { label: 'In Progress', value: 'InProgress' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Rejected', value: 'Rejected' },
  { label: 'Cancelled', value: 'Cancelled' },
];

export const RequestTracking: React.FC = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);

  const [filters, setFilters] = useState<RequestFilters>({
    page: 1,
    pageSize: 10,
    sortBy: 'createdOn',
    sortOrder: 'desc',
  });

  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [activeTab, setActiveTab] = useState('timeline');
  const [commentText, setCommentText] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.REQUESTS, filters],
    queryFn: () => requestService.getRequests(filters),
    staleTime: 30 * 1000,
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, remarks }: { id: string; remarks?: string }) =>
      requestService.approveRequest(id, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REQUESTS] });
      addToast({ type: 'success', title: 'Request Approved', message: 'Request has been approved successfully.' });
      setSelectedRequest(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, remarks }: { id: string; remarks: string }) =>
      requestService.rejectRequest(id, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REQUESTS] });
      addToast({ type: 'warning', title: 'Request Rejected', message: 'Request has been rejected.' });
      setSelectedRequest(null);
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      requestService.addComment(id, text, false),
    onSuccess: () => {
      setCommentText('');
      addToast({ type: 'success', title: 'Comment Added' });
    },
  });

  const totalPages = data ? Math.ceil(data.totalCount / (filters.pageSize || 10)) : 0;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <Text size={600} weight="bold" style={{ color: tokens.colorNeutralForeground1 }}>
            Request Tracking
          </Text>
          <Text size={300} style={{ color: tokens.colorNeutralForeground3, display: 'block', marginTop: 4 }}>
            Track and manage all policy servicing requests
          </Text>
        </div>
        <Button
          appearance="primary"
          icon={<DocumentSearch24Regular />}
          onClick={() => navigate(ROUTES.REQUEST_CATALOGUE)}
        >
          New Request
        </Button>
      </div>

      {/* Filters */}
      <div className={styles.filterRow}>
        <Input
          placeholder="Search by request # or policy..."
          value={filters.searchText || ''}
          onChange={(_, d) => setFilters((f) => ({ ...f, searchText: d.value, page: 1 }))}
          contentBefore={<Search24Regular style={{ width: 16, height: 16 }} />}
          style={{ minWidth: 280 }}
          aria-label="Search requests"
        />
        <Dropdown
          placeholder="Filter by status"
          onOptionSelect={(_, d) =>
            setFilters((f) => ({
              ...f,
              status: d.selectedOptions.length ? d.selectedOptions as RequestStatus[] : undefined,
              page: 1,
            }))
          }
          multiselect
          style={{ minWidth: 180 }}
        >
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <Option key={opt.value} value={opt.value}>{opt.label}</Option>
          ))}
        </Dropdown>
        {isLoading && <Spinner size="tiny" />}
        <Text size={200} style={{ color: tokens.colorNeutralForeground3, marginLeft: 'auto' }}>
          {data?.totalCount || 0} requests
        </Text>
      </div>

      {/* Table */}
      <div className={styles.tableContainer}>
        {isLoading ? (
          <div style={{ padding: 32, display: 'flex', justifyContent: 'center' }}>
            <Spinner label="Loading requests..." />
          </div>
        ) : !data?.requests.length ? (
          <div className={styles.emptyState}>
            <DocumentSearch24Regular style={{ width: 64, height: 64, color: tokens.colorNeutralForeground3 }} />
            <Text size={500} weight="semibold">No requests found</Text>
            <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>
              {filters.status?.length ? 'Try changing filters' : 'Create your first servicing request'}
            </Text>
            <Button
              appearance="primary"
              onClick={() => navigate(ROUTES.REQUEST_CATALOGUE)}
            >
              Browse Request Catalogue
            </Button>
          </div>
        ) : (
          <>
            <Table aria-label="Service requests">
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Request #</TableHeaderCell>
                  <TableHeaderCell>Type</TableHeaderCell>
                  <TableHeaderCell>Policy Holder</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Priority</TableHeaderCell>
                  <TableHeaderCell>SLA</TableHeaderCell>
                  <TableHeaderCell>Submitted</TableHeaderCell>
                  <TableHeaderCell>Assigned To</TableHeaderCell>
                  <TableHeaderCell></TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.requests.map((request) => {
                  const slaPercent =
                    request.slaDeadline && request.submittedOn
                      ? getSLAProgressPercent(request.submittedOn, request.slaDeadline)
                      : 0;
                  const slaStatus = getSLAStatus(request.slaDeadline, request.status === 'Completed');

                  return (
                    <TableRow
                      key={request.id}
                      className={styles.tableRow}
                      onClick={() => setSelectedRequest(request)}
                    >
                      <TableCell>
                        <TableCellLayout>
                          <Text className={styles.requestNumber}>{request.requestNumber}</Text>
                          <Text className={styles.policyNumber}>{request.policyNumber}</Text>
                        </TableCellLayout>
                      </TableCell>
                      <TableCell>{request.requestTypeName}</TableCell>
                      <TableCell>{request.policyHolderName}</TableCell>
                      <TableCell><StatusBadge status={request.status} /></TableCell>
                      <TableCell><PriorityBadge priority={request.priority} /></TableCell>
                      <TableCell>
                        {request.slaDeadline ? (
                          <div className={styles.slaContainer}>
                            <div className={styles.slaText}>
                              <Text size={200}>{slaStatus === 'breached' ? 'BREACHED' : `${slaPercent}%`}</Text>
                              <Text size={200} style={{
                                color: slaStatus === 'breached' ? tokens.colorPaletteRedForeground1 :
                                  slaStatus === 'warning' ? tokens.colorPaletteYellowForeground1 :
                                  tokens.colorPaletteGreenForeground1
                              }}>
                                {request.slaHoursRemaining !== undefined
                                  ? `${request.slaHoursRemaining}h left`
                                  : ''}
                              </Text>
                            </div>
                            <ProgressBar
                              value={slaPercent / 100}
                              color={slaStatus === 'breached' ? 'error' : slaStatus === 'warning' ? 'warning' : 'success'}
                              thickness="medium"
                            />
                          </div>
                        ) : (
                          <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>—</Text>
                        )}
                      </TableCell>
                      <TableCell>
                        <Text size={200}>{formatRelativeTime(request.submittedOn)}</Text>
                      </TableCell>
                      <TableCell>
                        <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
                          {request.assignedToName || '—'}
                        </Text>
                      </TableCell>
                      <TableCell>
                        <Button
                          appearance="subtle"
                          size="small"
                          icon={<ArrowRight20Regular />}
                          aria-label="View request details"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className={styles.pagination}>
              <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                Page {filters.page} of {totalPages} ({data.totalCount} total)
              </Text>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button
                  appearance="outline"
                  size="small"
                  icon={<ChevronLeft20Regular />}
                  disabled={filters.page === 1}
                  onClick={() => setFilters((f) => ({ ...f, page: (f.page || 1) - 1 }))}
                  aria-label="Previous page"
                />
                <Button
                  appearance="outline"
                  size="small"
                  icon={<ChevronRight20Regular />}
                  disabled={!data.hasMore}
                  onClick={() => setFilters((f) => ({ ...f, page: (f.page || 1) + 1 }))}
                  aria-label="Next page"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Request Detail Dialog */}
      {selectedRequest && (
        <Dialog open onOpenChange={(_, d) => !d.open && setSelectedRequest(null)}>
          <DialogSurface style={{ maxWidth: 720, width: '100%' }}>
            <DialogTitle>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text size={500} weight="bold">{selectedRequest.requestTypeName}</Text>
                  <Text size={200} style={{ display: 'block', color: tokens.colorBrandForeground1, fontFamily: 'monospace' }}>
                    {selectedRequest.requestNumber}
                  </Text>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <StatusBadge status={selectedRequest.status} />
                  <PriorityBadge priority={selectedRequest.priority} />
                </div>
              </div>
            </DialogTitle>

            <DialogBody>
              <DialogContent>
                <div className={styles.detailPanel}>
                  {/* Summary */}
                  <div className={styles.detailGrid}>
                    <div className={styles.detailSection}>
                      <Text className={styles.detailLabel}>Policy Number</Text>
                      <Text className={styles.detailValue} style={{ fontFamily: 'monospace', color: tokens.colorBrandForeground1 }}>
                        {selectedRequest.policyNumber}
                      </Text>
                    </div>
                    <div className={styles.detailSection}>
                      <Text className={styles.detailLabel}>Policy Holder</Text>
                      <Text className={styles.detailValue}>{selectedRequest.policyHolderName}</Text>
                    </div>
                    <div className={styles.detailSection}>
                      <Text className={styles.detailLabel}>Submitted On</Text>
                      <Text className={styles.detailValue}>{formatDateTime(selectedRequest.submittedOn)}</Text>
                    </div>
                    <div className={styles.detailSection}>
                      <Text className={styles.detailLabel}>Assigned To</Text>
                      <Text className={styles.detailValue}>{selectedRequest.assignedToName || 'Unassigned'}</Text>
                    </div>
                    {selectedRequest.slaDeadline && (
                      <div className={styles.detailSection}>
                        <Text className={styles.detailLabel}>SLA Deadline</Text>
                        <Text className={styles.detailValue}>{formatDateTime(selectedRequest.slaDeadline)}</Text>
                      </div>
                    )}
                    {selectedRequest.completedOn && (
                      <div className={styles.detailSection}>
                        <Text className={styles.detailLabel}>Completed On</Text>
                        <Text className={styles.detailValue}>{formatDateTime(selectedRequest.completedOn)}</Text>
                      </div>
                    )}
                  </div>

                  <Divider />

                  {/* Tabs */}
                  <TabList
                    selectedValue={activeTab}
                    onTabSelect={(_, d) => setActiveTab(d.value as string)}
                  >
                    <Tab value="timeline" icon={<Clock20Regular />}>Timeline</Tab>
                    <Tab value="data" icon={<DocumentBulletList20Regular />}>Request Data</Tab>
                    <Tab value="comments" icon={<CommentAdd20Regular />}>Comments ({selectedRequest.comments.length})</Tab>
                  </TabList>

                  {activeTab === 'timeline' && (
                    <Timeline entries={selectedRequest.statusHistory} />
                  )}

                  {activeTab === 'data' && (
                    <div className={styles.detailGrid}>
                      {Object.entries(selectedRequest.requestData).map(([key, value]) => (
                        <div key={key} className={styles.detailSection}>
                          <Text className={styles.detailLabel}>
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </Text>
                          <Text className={styles.detailValue}>{String(value)}</Text>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'comments' && (
                    <div className={styles.commentsList}>
                      {selectedRequest.comments.map((comment) => (
                        <div key={comment.id} className={styles.comment}>
                          <div className={styles.commentHeader}>
                            <Text className={styles.commentAuthor}>{comment.commentedByName}</Text>
                            <Text className={styles.commentTime}>{formatRelativeTime(comment.commentedOn)}</Text>
                          </div>
                          <Text className={styles.commentText}>{comment.commentText}</Text>
                        </div>
                      ))}

                      {selectedRequest.comments.length === 0 && (
                        <Text size={300} style={{ color: tokens.colorNeutralForeground3, textAlign: 'center', padding: '16px 0' }}>
                          No comments yet
                        </Text>
                      )}

                      <Field label="Add Comment">
                        <Textarea
                          value={commentText}
                          onChange={(_, d) => setCommentText(d.value)}
                          placeholder="Add a comment..."
                          rows={3}
                        />
                      </Field>
                      <Button
                        appearance="outline"
                        size="small"
                        disabled={!commentText.trim() || addCommentMutation.isPending}
                        onClick={() => addCommentMutation.mutate({ id: selectedRequest.id, text: commentText })}
                      >
                        Add Comment
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </DialogBody>

            <DialogActions>
              {selectedRequest.status === 'PendingApproval' && (
                <>
                  <Dialog>
                    <DialogTrigger disableButtonEnhancement>
                      <Button appearance="outline" icon={<Dismiss20Regular />}>Reject</Button>
                    </DialogTrigger>
                    <DialogSurface style={{ maxWidth: 480 }}>
                      <DialogTitle>Reject Request</DialogTitle>
                      <DialogBody>
                        <DialogContent>
                          <Field label="Rejection Reason" required>
                            <Textarea
                              value={rejectReason}
                              onChange={(_, d) => setRejectReason(d.value)}
                              placeholder="Please provide a reason for rejection..."
                              rows={4}
                            />
                          </Field>
                        </DialogContent>
                        <DialogActions>
                          <DialogTrigger disableButtonEnhancement>
                            <Button appearance="outline">Cancel</Button>
                          </DialogTrigger>
                          <Button
                            appearance="primary"
                            style={{ backgroundColor: tokens.colorPaletteRedBackground3 }}
                            disabled={!rejectReason.trim() || rejectMutation.isPending}
                            onClick={() => rejectMutation.mutate({ id: selectedRequest.id, remarks: rejectReason })}
                          >
                            {rejectMutation.isPending ? <Spinner size="tiny" /> : 'Confirm Reject'}
                          </Button>
                        </DialogActions>
                      </DialogBody>
                    </DialogSurface>
                  </Dialog>

                  <Button
                    appearance="primary"
                    icon={<Checkmark20Regular />}
                    disabled={approveMutation.isPending}
                    onClick={() => approveMutation.mutate({ id: selectedRequest.id })}
                  >
                    {approveMutation.isPending ? <Spinner size="tiny" /> : 'Approve'}
                  </Button>
                </>
              )}
              <Button appearance="outline" onClick={() => setSelectedRequest(null)}>
                Close
              </Button>
            </DialogActions>
          </DialogSurface>
        </Dialog>
      )}
    </div>
  );
};
