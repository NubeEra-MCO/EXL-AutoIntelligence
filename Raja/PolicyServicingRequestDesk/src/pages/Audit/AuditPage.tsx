// Audit Page
import React from 'react';
import { Text, makeStyles, tokens, Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell, TableCellLayout, Badge, Input } from '@fluentui/react-components';
import { Search24Regular } from '@fluentui/react-icons';
import { designTokens } from '../../theme/tokens';
import { formatDateTime } from '../../utils/formatters';

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1400px' },
  tableContainer: { border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: designTokens.borderRadius.lg, overflow: 'hidden' },
});

const MOCK_AUDIT_LOGS = [
  { id: '1', entityType: 'ServiceRequest', entityReference: 'SR20240847123', action: 'Status Changed', performedByName: 'Priya Verma', performedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), oldValues: { status: 'Submitted' }, newValues: { status: 'PendingApproval' } },
  { id: '2', entityType: 'Policy', entityReference: 'LI-2021-00147832', action: 'Address Updated', performedByName: 'System', performedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), oldValues: { city: 'Dwarka' }, newValues: { city: 'Green Park' } },
  { id: '3', entityType: 'ServiceRequest', entityReference: 'SR20240612456', action: 'Request Completed', performedByName: 'Rahul Kumar', performedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), oldValues: {}, newValues: { status: 'Completed' } },
];

export const AuditPage: React.FC = () => {
  const styles = useStyles();
  return (
    <div className={styles.page}>
      <div>
        <Text size={600} weight="bold" style={{ color: tokens.colorNeutralForeground1 }}>Audit & Compliance</Text>
        <Text size={300} style={{ color: tokens.colorNeutralForeground3, display: 'block', marginTop: 4 }}>Complete audit trail of all system activities</Text>
      </div>
      <Input placeholder="Search audit logs..." contentBefore={<Search24Regular style={{ width: 16, height: 16 }} />} style={{ maxWidth: 400 }} aria-label="Search audit logs" />
      <div className={styles.tableContainer}>
        <Table aria-label="Audit logs">
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Entity</TableHeaderCell>
              <TableHeaderCell>Action</TableHeaderCell>
              <TableHeaderCell>Performed By</TableHeaderCell>
              <TableHeaderCell>Date & Time</TableHeaderCell>
              <TableHeaderCell>Old Value</TableHeaderCell>
              <TableHeaderCell>New Value</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_AUDIT_LOGS.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <TableCellLayout>
                    <Badge appearance="tint" color="informative" size="small">{log.entityType}</Badge>
                    <Text size={200} style={{ display: 'block', fontFamily: 'monospace', color: tokens.colorBrandForeground1 }}>{log.entityReference}</Text>
                  </TableCellLayout>
                </TableCell>
                <TableCell><Text size={300} weight="semibold">{log.action}</Text></TableCell>
                <TableCell><Text size={300}>{log.performedByName}</Text></TableCell>
                <TableCell><Text size={200}>{formatDateTime(log.performedAt)}</Text></TableCell>
                <TableCell><Text size={200} style={{ color: tokens.colorPaletteRedForeground1, fontFamily: 'monospace' }}>{JSON.stringify(log.oldValues)}</Text></TableCell>
                <TableCell><Text size={200} style={{ color: tokens.colorPaletteGreenForeground1, fontFamily: 'monospace' }}>{JSON.stringify(log.newValues)}</Text></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
