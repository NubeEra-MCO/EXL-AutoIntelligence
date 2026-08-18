import React from 'react';
import { Text, tokens, Card, makeStyles, ProgressBar } from '@fluentui/react-components';
import { KPICard } from '../../components/common/KPICard';
import { designTokens } from '../../theme/tokens';

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1400px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' },
  card: { padding: '20px', border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: designTokens.borderRadius.lg },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  chartBar: { display: 'flex', flexDirection: 'column', gap: '8px' },
  barItem: { display: 'flex', alignItems: 'center', gap: '8px' },
  barLabel: { minWidth: '160px', fontSize: '13px', color: tokens.colorNeutralForeground2 },
  barCount: { minWidth: '40px', fontSize: '13px', fontWeight: 600, textAlign: 'right' as const },
});

const TYPE_DATA = [
  { label: 'Address Change', count: 185, pct: 0.73 },
  { label: 'Mobile Update', count: 127, pct: 0.50 },
  { label: 'Nominee Change', count: 142, pct: 0.56 },
  { label: 'Premium Mode', count: 98, pct: 0.39 },
  { label: 'Bank Account', count: 76, pct: 0.30 },
  { label: 'Reinstatement', count: 45, pct: 0.18 },
];

export const ReportsPage: React.FC = () => {
  const styles = useStyles();
  return (
    <div className={styles.page}>
      <div>
        <Text size={600} weight="bold" style={{ color: tokens.colorNeutralForeground1 }}>Reports & Analytics</Text>
        <Text size={300} style={{ color: tokens.colorNeutralForeground3, display: 'block', marginTop: 4 }}>Operational insights and performance metrics</Text>
      </div>

      <div className={styles.grid}>
        <KPICard label="Total Requests (MTD)" value={847} trend={12} />
        <KPICard label="SLA Compliance" value="88.5%" variant="success" />
        <KPICard label="Avg TAT (Days)" value="2.4" subtitle="Target: 3 days" />
        <KPICard label="Customer Satisfaction" value="4.2/5" variant="success" />
        <KPICard label="Deflection Rate" value="34%" subtitle="By AI Agent" variant="success" />
        <KPICard label="SLA Breaches (MTD)" value={12} variant="danger" trend={-8} />
      </div>

      <div className={styles.twoCol}>
        <Card className={styles.card}>
          <Text size={400} weight="semibold" style={{ display: 'block', marginBottom: 16 }}>Requests by Type (This Month)</Text>
          <div className={styles.chartBar}>
            {TYPE_DATA.map((d) => (
              <div key={d.label} className={styles.barItem}>
                <Text className={styles.barLabel}>{d.label}</Text>
                <div style={{ flex: 1 }}><ProgressBar value={d.pct} thickness="large" /></div>
                <Text className={styles.barCount}>{d.count}</Text>
              </div>
            ))}
          </div>
        </Card>

        <Card className={styles.card}>
          <Text size={400} weight="semibold" style={{ display: 'block', marginBottom: 16 }}>SLA Performance (Last 7 Days)</Text>
          <div className={styles.chartBar}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
              const compliance = [92, 88, 95, 87, 91, 96, 89][i];
              return (
                <div key={day} className={styles.barItem}>
                  <Text className={styles.barLabel} style={{ minWidth: 40 }}>{day}</Text>
                  <div style={{ flex: 1 }}>
                    <ProgressBar value={compliance / 100} color={compliance >= 90 ? 'success' : 'warning'} thickness="large" />
                  </div>
                  <Text className={styles.barCount}>{compliance}%</Text>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};
