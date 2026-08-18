// ============================================================
// POLICY SEARCH PAGE - Module 1
// ============================================================
import React, { useState, useCallback } from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Input,
  Button,
  Card,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  TableCellLayout,
  Skeleton,
  SkeletonItem,
  Badge,
  Spinner,
  Field,
} from '@fluentui/react-components';
import {
  Search24Regular,
  DocumentSearch24Regular,
  ArrowRight20Regular,
  Person20Regular,
  Phone20Regular,
  Mail20Regular,
  CalendarLtr20Regular,
  ChevronLeft20Regular,
  ChevronRight20Regular,
} from '@fluentui/react-icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { policyService } from '../../services/policy.service';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  formatDate,
  formatCurrency,
  formatPhoneNumber,
  truncateText,
} from '../../utils/formatters';
import { QUERY_KEYS, APP_CONFIG } from '../../utils/constants';
import { designTokens } from '../../theme/tokens';
import type { PolicySearchParams } from '../../types/policy.types';

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
  },
  pageTitle: {
    fontSize: '22px',
    fontWeight: 700,
    color: tokens.colorNeutralForeground1,
  },
  pageSubtitle: {
    fontSize: '13px',
    color: tokens.colorNeutralForeground3,
    marginTop: '2px',
  },
  searchCard: {
    padding: '20px',
    borderRadius: designTokens.borderRadius.lg,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  searchGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '16px',
    marginBottom: '16px',
  },
  searchActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  activeFilters: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    padding: '8px 0',
  },
  resultsHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultsCount: {
    fontSize: '13px',
    color: tokens.colorNeutralForeground3,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
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
  policyNumber: {
    fontSize: '13px',
    fontWeight: 600,
    color: tokens.colorBrandForeground1,
    fontFamily: "'Cascadia Code', monospace",
  },
  holderName: {
    fontSize: '14px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
  },
  holderDetails: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    marginTop: '2px',
  },
  detailChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
  premiumAmount: {
    fontSize: '14px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
  },
  premiumMode: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
  requestBadge: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  paginationInfo: {
    fontSize: '13px',
    color: tokens.colorNeutralForeground3,
  },
  paginationControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '64px 24px',
    gap: '12px',
  },
  emptyIcon: {
    width: '64px',
    height: '64px',
    color: tokens.colorNeutralForeground3,
  },
  skeletonRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
});

  // Status filter options kept for future filter UI
  // const POLICY_STATUS_OPTIONS = [...]

export const PolicySearch: React.FC = () => {
  const styles = useStyles();
  const navigate = useNavigate();

  const [params, setParams] = useState<PolicySearchParams>({
    page: 1,
    pageSize: 10,
    sortBy: 'policyNumber',
    sortOrder: 'asc',
  });

  const [searchInput, setSearchInput] = useState({
    policyNumber: '',
    mobile: '',
    email: '',
    customerId: '',
  });

  const [hasSearched, setHasSearched] = useState(false);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [QUERY_KEYS.POLICIES, params],
    queryFn: () => policyService.searchPolicies(params),
    enabled: hasSearched,
    staleTime: APP_CONFIG.CACHE_DURATION_MS,
  });

  const handleSearch = useCallback(() => {
    const newParams: PolicySearchParams = {
      ...params,
      page: 1,
      policyNumber: searchInput.policyNumber || undefined,
      mobile: searchInput.mobile || undefined,
      email: searchInput.email || undefined,
      customerId: searchInput.customerId || undefined,
    };
    setParams(newParams);
    setHasSearched(true);
  }, [searchInput, params]);

  const handleClear = () => {
    setSearchInput({ policyNumber: '', mobile: '', email: '', customerId: '' });
    setParams({ page: 1, pageSize: 10, sortBy: 'policyNumber', sortOrder: 'asc' });
    setHasSearched(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const totalPages = data ? Math.ceil(data.totalCount / (params.pageSize || 10)) : 0;

  const SkeletonRows = () => (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={styles.skeletonRow}>
          <Skeleton>
            <SkeletonItem size={16} style={{ width: '140px' }} />
          </Skeleton>
          <Skeleton>
            <SkeletonItem size={16} style={{ width: '180px' }} />
          </Skeleton>
          <Skeleton>
            <SkeletonItem size={16} style={{ width: '100px' }} />
          </Skeleton>
          <Skeleton>
            <SkeletonItem size={16} style={{ width: '120px' }} />
          </Skeleton>
        </div>
      ))}
    </>
  );

  return (
    <div className={styles.page}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <Text className={styles.pageTitle}>Policy Search</Text>
          <Text className={styles.pageSubtitle}>
            Search policies by number, customer ID, mobile, or email
          </Text>
        </div>
      </div>

      {/* Search Panel */}
      <Card className={styles.searchCard}>
        <div className={styles.searchGrid}>
          <Field label="Policy Number">
            <Input
              placeholder="e.g. LI-2021-00147832"
              value={searchInput.policyNumber}
              onChange={(_, d) => setSearchInput((s) => ({ ...s, policyNumber: d.value }))}
              onKeyDown={handleKeyPress}
              contentBefore={<DocumentSearch24Regular style={{ width: 16, height: 16 }} />}
            />
          </Field>

          <Field label="Customer ID">
            <Input
              placeholder="e.g. CUST00147832"
              value={searchInput.customerId}
              onChange={(_, d) => setSearchInput((s) => ({ ...s, customerId: d.value }))}
              onKeyDown={handleKeyPress}
              contentBefore={<Person20Regular style={{ width: 16, height: 16 }} />}
            />
          </Field>

          <Field label="Mobile Number">
            <Input
              placeholder="e.g. 9876543210"
              value={searchInput.mobile}
              onChange={(_, d) => setSearchInput((s) => ({ ...s, mobile: d.value }))}
              onKeyDown={handleKeyPress}
              contentBefore={<Phone20Regular style={{ width: 16, height: 16 }} />}
              maxLength={10}
            />
          </Field>

          <Field label="Email Address">
            <Input
              placeholder="e.g. customer@email.com"
              value={searchInput.email}
              onChange={(_, d) => setSearchInput((s) => ({ ...s, email: d.value }))}
              onKeyDown={handleKeyPress}
              contentBefore={<Mail20Regular style={{ width: 16, height: 16 }} />}
              type="email"
            />
          </Field>
        </div>

        <div className={styles.searchActions}>
          <Button
            appearance="primary"
            icon={<Search24Regular />}
            onClick={handleSearch}
            disabled={
              !searchInput.policyNumber &&
              !searchInput.mobile &&
              !searchInput.email &&
              !searchInput.customerId
            }
          >
            Search Policies
          </Button>
          <Button appearance="outline" onClick={handleClear}>
            Clear
          </Button>
          {isFetching && !isLoading && <Spinner size="tiny" label="Refreshing..." />}
        </div>
      </Card>

      {/* Results */}
      {hasSearched && (
        <>
          <div className={styles.resultsHeader}>
            <Text className={styles.resultsCount}>
              {isLoading ? 'Searching...' : `${data?.totalCount || 0} policies found`}
            </Text>
          </div>

          <div className={styles.tableContainer}>
            {isLoading ? (
              <SkeletonRows />
            ) : !data?.policies.length ? (
              <div className={styles.emptyState}>
                <DocumentSearch24Regular className={styles.emptyIcon} />
                <Text size={500} weight="semibold">No policies found</Text>
                <Text style={{ color: tokens.colorNeutralForeground3, textAlign: 'center' }}>
                  Try adjusting your search criteria
                </Text>
              </div>
            ) : (
              <>
                <Table aria-label="Policy search results">
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell>Policy Number</TableHeaderCell>
                      <TableHeaderCell>Policy Holder</TableHeaderCell>
                      <TableHeaderCell>Product</TableHeaderCell>
                      <TableHeaderCell>Status</TableHeaderCell>
                      <TableHeaderCell>Premium</TableHeaderCell>
                      <TableHeaderCell>Maturity Date</TableHeaderCell>
                      <TableHeaderCell>Requests</TableHeaderCell>
                      <TableHeaderCell></TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.policies.map((policy) => (
                      <TableRow
                        key={policy.id}
                        className={styles.tableRow}
                        onClick={() => navigate(`/policies/${policy.id}`)}
                        aria-label={`Policy ${policy.policyNumber}`}
                      >
                        <TableCell>
                          <TableCellLayout>
                            <Text className={styles.policyNumber}>{policy.policyNumber}</Text>
                          </TableCellLayout>
                        </TableCell>

                        <TableCell>
                          <TableCellLayout>
                            <Text className={styles.holderName}>{policy.policyHolder.fullName}</Text>
                            <div className={styles.holderDetails}>
                              <span className={styles.detailChip}>
                                <Phone20Regular style={{ width: 11, height: 11 }} />
                                {formatPhoneNumber(policy.policyHolder.mobile)}
                              </span>
                              <span className={styles.detailChip}>
                                <Mail20Regular style={{ width: 11, height: 11 }} />
                                {truncateText(policy.policyHolder.email, 24)}
                              </span>
                            </div>
                          </TableCellLayout>
                        </TableCell>

                        <TableCell>
                          <TableCellLayout>
                            <Text style={{ fontSize: 13 }}>{policy.productName}</Text>
                            <Text style={{ fontSize: 11, color: tokens.colorNeutralForeground3 }}>
                              {policy.policyType}
                            </Text>
                          </TableCellLayout>
                        </TableCell>

                        <TableCell>
                          <StatusBadge status={policy.status} />
                        </TableCell>

                        <TableCell>
                          <TableCellLayout>
                            <Text className={styles.premiumAmount}>
                              {formatCurrency(policy.premiumDetails.modalPremium)}
                            </Text>
                            <Text className={styles.premiumMode}>
                              {policy.premiumDetails.premiumMode}
                            </Text>
                          </TableCellLayout>
                        </TableCell>

                        <TableCell>
                          <TableCellLayout>
                            <span className={styles.detailChip}>
                              <CalendarLtr20Regular style={{ width: 13, height: 13 }} />
                              {formatDate(policy.maturityDate)}
                            </span>
                          </TableCellLayout>
                        </TableCell>

                        <TableCell>
                          <div className={styles.requestBadge}>
                            {policy.openRequests > 0 ? (
                              <Badge appearance="filled" color="warning" size="small">
                                {policy.openRequests} Open
                              </Badge>
                            ) : (
                              <Badge appearance="tint" color="subtle" size="small">
                                None
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <Button
                            appearance="subtle"
                            size="small"
                            icon={<ArrowRight20Regular />}
                            aria-label="View policy details"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/policies/${policy.id}`);
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className={styles.pagination}>
                  <Text className={styles.paginationInfo}>
                    Showing {((params.page! - 1) * params.pageSize!) + 1}–
                    {Math.min(params.page! * params.pageSize!, data.totalCount)} of {data.totalCount}
                  </Text>
                  <div className={styles.paginationControls}>
                    <Button
                      appearance="outline"
                      size="small"
                      icon={<ChevronLeft20Regular />}
                      disabled={params.page === 1}
                      onClick={() => setParams((p) => ({ ...p, page: (p.page || 1) - 1 }))}
                      aria-label="Previous page"
                    />
                    <Text style={{ fontSize: 13 }}>
                      Page {params.page} of {totalPages}
                    </Text>
                    <Button
                      appearance="outline"
                      size="small"
                      icon={<ChevronRight20Regular />}
                      disabled={!data.hasMore}
                      onClick={() => setParams((p) => ({ ...p, page: (p.page || 1) + 1 }))}
                      aria-label="Next page"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* Initial State */}
      {!hasSearched && (
        <Card className={styles.searchCard}>
          <div className={styles.emptyState}>
            <DocumentSearch24Regular
              style={{ width: 64, height: 64, color: tokens.colorNeutralForeground3 }}
            />
            <Text size={500} weight="semibold" style={{ color: tokens.colorNeutralForeground2 }}>
              Search for a Policy
            </Text>
            <Text style={{ color: tokens.colorNeutralForeground3, textAlign: 'center', maxWidth: 400 }}>
              Enter a policy number, customer ID, mobile number, or email address to search policies
            </Text>
          </div>
        </Card>
      )}
    </div>
  );
};
