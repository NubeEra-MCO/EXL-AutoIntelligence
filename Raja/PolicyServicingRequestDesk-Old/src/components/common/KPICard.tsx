// ============================================================
// KPI CARD COMPONENT
// ============================================================
import React from 'react';
import {
  Card,
  Text,
  makeStyles,
  tokens,
  Skeleton,
  SkeletonItem,
  mergeClasses,
} from '@fluentui/react-components';
import { ArrowTrending20Regular, Subtract20Regular } from '@fluentui/react-icons';
import { designTokens } from '../../theme/tokens';

const useStyles = makeStyles({
  card: {
    padding: '20px 24px',
    borderRadius: designTokens.borderRadius.lg,
    boxShadow: designTokens.shadows.card,
    transition: `all ${designTokens.transitions.medium}`,
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    ':hover': {
      boxShadow: designTokens.shadows.cardHover,
      transform: 'translateY(-2px)',
    },
    '::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      backgroundColor: tokens.colorBrandBackground,
    },
  },
  cardDanger: {
    '::before': {
      backgroundColor: tokens.colorPaletteRedBackground3,
    },
  },
  cardWarning: {
    '::before': {
      backgroundColor: tokens.colorPaletteYellowBackground3,
    },
  },
  cardSuccess: {
    '::before': {
      backgroundColor: tokens.colorPaletteGreenBackground3,
    },
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  iconWrapper: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
  },
  label: {
    color: tokens.colorNeutralForeground3,
    fontSize: '12px',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  value: {
    fontSize: '32px',
    fontWeight: 700,
    color: tokens.colorNeutralForeground1,
    lineHeight: 1,
    marginBottom: '8px',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  trendUp: {
    color: tokens.colorPaletteGreenForeground1,
  },
  trendDown: {
    color: tokens.colorPaletteRedForeground1,
  },
  trendNeutral: {
    color: tokens.colorNeutralForeground3,
  },
  trendText: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
  },
  subtitle: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
    marginTop: '4px',
  },
});

export interface KPICardProps {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  subtitle?: string;
  variant?: 'default' | 'danger' | 'warning' | 'success';
  isLoading?: boolean;
  onClick?: () => void;
  formatter?: (value: number | string) => string;
}

export const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  icon,
  trend,
  trendLabel,
  subtitle,
  variant = 'default',
  isLoading = false,
  onClick,
  formatter,
}) => {
  const styles = useStyles();

  const cardClass = mergeClasses(
    styles.card,
    variant === 'danger' && styles.cardDanger,
    variant === 'warning' && styles.cardWarning,
    variant === 'success' && styles.cardSuccess
  );

  const displayValue = formatter
    ? formatter(value)
    : typeof value === 'number'
    ? value.toLocaleString('en-IN')
    : value;

  if (isLoading) {
    return (
      <Card className={cardClass}>
        <Skeleton>
          <SkeletonItem size={12} style={{ width: '60%', marginBottom: '12px' }} />
          <SkeletonItem size={40} style={{ width: '40%', marginBottom: '8px' }} />
          <SkeletonItem size={12} style={{ width: '50%' }} />
        </Skeleton>
      </Card>
    );
  }

  return (
    <Card className={cardClass} onClick={onClick} role={onClick ? 'button' : undefined}>
      <div className={styles.header}>
        <Text className={styles.label}>{label}</Text>
        {icon && <div className={styles.iconWrapper}>{icon}</div>}
      </div>
      
      <Text className={styles.value}>{displayValue}</Text>
      
      {subtitle && <Text className={styles.subtitle}>{subtitle}</Text>}
      
      {trend !== undefined && (
        <div className={styles.footer}>
          {trend > 0 ? (
            <ArrowTrending20Regular className={styles.trendUp} />
          ) : trend < 0 ? (
            <ArrowTrending20Regular className={styles.trendDown} />
          ) : (
            <Subtract20Regular className={styles.trendNeutral} />
          )}
          <Text className={styles.trendText}>
            {Math.abs(trend)}% {trendLabel || 'vs last period'}
          </Text>
        </div>
      )}
    </Card>
  );
};
