import React from 'react';
import { Text, tokens, Card, Tab, TabList, Button, Badge, Input, Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell, makeStyles } from '@fluentui/react-components';
import { Settings24Regular, People24Regular, DocumentText24Regular } from '@fluentui/react-icons';
import { designTokens } from '../../theme/tokens';

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1200px' },
  card: { padding: '20px', border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: designTokens.borderRadius.lg },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' },
});

const MOCK_USERS = [
  { id: '1', name: 'Priya Verma', email: 'priya.v@company.com', role: 'ServicingAgent', status: 'Active' },
  { id: '2', name: 'Rahul Kumar', email: 'rahul.k@company.com', role: 'Supervisor', status: 'Active' },
  { id: '3', name: 'Sneha Patel', email: 'sneha.p@company.com', role: 'ServicingAgent', status: 'Active' },
  { id: '4', name: 'Amit Singh', email: 'amit.s@company.com', role: 'OperationsManager', status: 'Inactive' },
];

const ROLE_COLOR: Record<string, 'informative' | 'success' | 'warning' | 'important'> = {
  ServicingAgent: 'informative', Supervisor: 'success', OperationsManager: 'warning', Admin: 'important',
};

export const AdministrationPage: React.FC = () => {
  const styles = useStyles();
  const [tab, setTab] = React.useState('users');

  return (
    <div className={styles.page}>
      <div>
        <Text size={600} weight="bold" style={{ color: tokens.colorNeutralForeground1 }}>Administration</Text>
        <Text size={300} style={{ color: tokens.colorNeutralForeground3, display: 'block', marginTop: 4 }}>System configuration and user management</Text>
      </div>

      <TabList selectedValue={tab} onTabSelect={(_, d) => setTab(d.value as string)}>
        <Tab value="users" icon={<People24Regular />}>User Management</Tab>
        <Tab value="config" icon={<Settings24Regular />}>System Configuration</Tab>
        <Tab value="roles" icon={<DocumentText24Regular />}>Security Roles</Tab>
      </TabList>

      {tab === 'users' && (
        <Card className={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text size={400} weight="semibold">Users ({MOCK_USERS.length})</Text>
            <Button appearance="primary" size="small">Add User</Button>
          </div>
          <Table aria-label="Users">
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Role</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_USERS.map((user) => (
                <TableRow key={user.id}>
                  <TableCell><Text weight="semibold">{user.name}</Text></TableCell>
                  <TableCell><Text size={300}>{user.email}</Text></TableCell>
                  <TableCell><Badge appearance="tint" color={ROLE_COLOR[user.role] || 'informative'} size="small">{user.role}</Badge></TableCell>
                  <TableCell><Badge appearance="tint" color={user.status === 'Active' ? 'success' : 'subtle'} size="small">{user.status}</Badge></TableCell>
                  <TableCell><Button size="small" appearance="outline">Edit</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {tab === 'config' && (
        <div className={styles.grid}>
          {[
            { key: 'DEFAULT_SLA_HOURS', value: '48', group: 'SLA', desc: 'Default SLA hours for requests' },
            { key: 'MAX_FILE_SIZE_MB', value: '10', group: 'Upload', desc: 'Maximum file upload size in MB' },
            { key: 'SESSION_TIMEOUT_MIN', value: '60', group: 'Security', desc: 'Session timeout in minutes' },
            { key: 'ENABLE_AI_AGENT', value: 'true', group: 'Features', desc: 'Enable Copilot Studio agent' },
            { key: 'NOTIFICATION_EMAIL', value: 'true', group: 'Notifications', desc: 'Enable email notifications' },
            { key: 'AUDIT_RETENTION_DAYS', value: '365', group: 'Compliance', desc: 'Audit log retention in days' },
          ].map((cfg) => (
            <Card key={cfg.key} className={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Badge appearance="tint" color="informative" size="small">{cfg.group}</Badge>
              </div>
              <Text size={300} weight="semibold" style={{ display: 'block', fontFamily: 'monospace' }}>{cfg.key}</Text>
              <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: 'block', marginBottom: 12 }}>{cfg.desc}</Text>
              <Input value={cfg.value} size="small" />
            </Card>
          ))}
        </div>
      )}

      {tab === 'roles' && (
        <Card className={styles.card}>
          <Text size={400} weight="semibold" style={{ display: 'block', marginBottom: 16 }}>Permission Matrix</Text>
          <Table aria-label="Permission matrix">
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Permission</TableHeaderCell>
                <TableHeaderCell>Customer</TableHeaderCell>
                <TableHeaderCell>Agent</TableHeaderCell>
                <TableHeaderCell>Supervisor</TableHeaderCell>
                <TableHeaderCell>Manager</TableHeaderCell>
                <TableHeaderCell>Admin</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                ['Policy Search', '✅ Own', '✅ All', '✅ All', '✅ All', '✅ All'],
                ['Create Request', '✅', '✅', '✅', '✅', '✅'],
                ['View Requests', '✅ Own', '✅ Team', '✅ All', '✅ All', '✅ All'],
                ['Approve Requests', '❌', '✅ L1', '✅ L1+L2', '✅ All', '✅ All'],
                ['Bulk Operations', '❌', '❌', '✅', '✅', '✅'],
                ['Audit View', '❌', '❌', '✅', '✅', '✅'],
                ['User Management', '❌', '❌', '❌', '❌', '✅'],
              ].map(([perm, ...vals], i) => (
                <TableRow key={i}>
                  <TableCell><Text weight="semibold">{perm}</Text></TableCell>
                  {vals.map((v, j) => (
                    <TableCell key={j}><Text size={300}>{v}</Text></TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};
