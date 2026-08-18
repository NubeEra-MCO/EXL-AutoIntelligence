// ============================================================
// SIDEBAR NAVIGATION
// ============================================================
import React, { memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  makeStyles,
  tokens,
  Text,
  Badge,
  mergeClasses,
} from '@fluentui/react-components';
import {
  Home24Regular, Home24Filled,
  DocumentSearch24Regular, DocumentSearch24Filled,
  ClipboardTask24Regular, ClipboardTask24Filled,
  Timeline24Regular, Timeline24Filled,
  PersonWalking24Regular,
  PeopleTeam24Regular, PeopleTeam24Filled,
  ShieldCheckmark24Regular, ShieldCheckmark24Filled,
  Alert24Regular, Alert24Filled,
  Settings24Regular, Settings24Filled,
  BookOpen24Regular, BookOpen24Filled,
  DataBarVertical24Regular,
  Bot24Regular, Bot24Filled,
} from '@fluentui/react-icons';
import { ROUTES } from '../../utils/constants';
import { useAppStore } from '../../store/appStore';
import { designTokens } from '../../theme/tokens';

const useStyles = makeStyles({
  sidebar: {
    width: designTokens.layout.sidebarWidth,
    height: '100%',
    backgroundColor: tokens.colorNeutralBackground1,
    borderRight: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    flexDirection: 'column',
    transition: `width ${designTokens.transitions.medium}`,
    overflow: 'hidden',
    flexShrink: 0,
  },
  sidebarCollapsed: {
    width: designTokens.layout.sidebarCollapsedWidth,
  },
  logo: {
    padding: '16px 20px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minHeight: designTokens.layout.headerHeight,
  },
  logoIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #0E4DA4, #1A7EEE)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: 'white',
    fontSize: '14px',
    fontWeight: 700,
  },
  logoText: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  logoTitle: {
    fontSize: '13px',
    fontWeight: 700,
    color: tokens.colorNeutralForeground1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  logoSubtitle: {
    fontSize: '10px',
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
  },
  nav: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: '8px 0',
  },
  section: {
    marginBottom: '4px',
  },
  sectionLabel: {
    padding: '8px 20px 4px',
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '9px 16px',
    margin: '1px 8px',
    borderRadius: '8px',
    cursor: 'pointer',
    // Only transition specific properties — 'all' causes sub-pixel flicker
    transition: `background-color ${designTokens.transitions.fast}, color ${designTokens.transitions.fast}`,
    textDecoration: 'none',
    position: 'relative',
  },
  // Separate hover classes so mergeClasses never combines two :hover rules on the same element
  navItemDefaultHover: {
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3,
    },
  },
  navItemActive: {
    backgroundColor: tokens.colorBrandBackground2,
    ':hover': {
      backgroundColor: tokens.colorBrandBackground2Hover,
    },
    '::before': {
      content: '""',
      position: 'absolute',
      left: '-8px',
      top: '50%',
      transform: 'translateY(-50%)',
      width: '4px',
      height: '20px',
      borderRadius: '0 4px 4px 0',
      backgroundColor: tokens.colorBrandBackground,
    },
  },
  navIcon: {
    width: '24px',
    height: '24px',
    flexShrink: 0,
    color: tokens.colorNeutralForeground2,
  },
  navIconActive: {
    color: tokens.colorBrandForeground1,
  },
  navLabel: {
    fontSize: '14px',
    fontWeight: 400,
    color: tokens.colorNeutralForeground2,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flex: 1,
  },
  navLabelActive: {
    fontWeight: 600,
    color: tokens.colorBrandForeground1,
  },
  badge: {
    flexShrink: 0,
  },
  footer: {
    padding: '12px 8px',
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
  },
});

interface NavItemConfig {
  path: string;
  label: string;
  icon: React.ReactElement;
  activeIcon: React.ReactElement;
  badge?: number;
  requiredRoles?: string[];
}

interface NavSectionConfig {
  label: string;
  items: NavItemConfig[];
}

const navSections: NavSectionConfig[] = [
  {
    label: 'Overview',
    items: [
      {
        path: ROUTES.DASHBOARD,
        label: 'Dashboard',
        icon: <Home24Regular />,
        activeIcon: <Home24Filled />,
      },
      {
        path: ROUTES.AGENT,
        label: 'AI Assistant',
        icon: <Bot24Regular />,
        activeIcon: <Bot24Filled />,
      },
    ],
  },
  {
    label: 'Policy',
    items: [
      {
        path: ROUTES.POLICY_SEARCH,
        label: 'Policy Search',
        icon: <DocumentSearch24Regular />,
        activeIcon: <DocumentSearch24Filled />,
      },
      {
        path: ROUTES.REQUEST_CATALOGUE,
        label: 'Request Catalogue',
        icon: <ClipboardTask24Regular />,
        activeIcon: <ClipboardTask24Filled />,
      },
    ],
  },
  {
    label: 'Servicing',
    items: [
      {
        path: ROUTES.REQUEST_TRACKING,
        label: 'My Requests',
        icon: <Timeline24Regular />,
        activeIcon: <Timeline24Filled />,
      },
      {
        path: ROUTES.CUSTOMER_VIEW,
        label: 'Self Service',
        icon: <PersonWalking24Regular />,
        activeIcon: <PersonWalking24Regular />,
      },
    ],
  },
  {
    label: 'Operations',
    items: [
      {
        path: ROUTES.OPERATIONS_WORKBENCH,
        label: 'Workbench',
        icon: <PeopleTeam24Regular />,
        activeIcon: <PeopleTeam24Filled />,
      },
      {
        path: ROUTES.REPORTS,
        label: 'Reports',
        icon: <DataBarVertical24Regular />,
        activeIcon: <DataBarVertical24Regular />,
      },
    ],
  },
  {
    label: 'Compliance',
    items: [
      {
        path: ROUTES.AUDIT_COMPLIANCE,
        label: 'Audit & Compliance',
        icon: <ShieldCheckmark24Regular />,
        activeIcon: <ShieldCheckmark24Filled />,
      },
      {
        path: ROUTES.KNOWLEDGE_BASE,
        label: 'Knowledge Base',
        icon: <BookOpen24Regular />,
        activeIcon: <BookOpen24Filled />,
      },
    ],
  },
  {
    label: 'System',
    items: [
      {
        path: ROUTES.NOTIFICATIONS,
        label: 'Notifications',
        icon: <Alert24Regular />,
        activeIcon: <Alert24Filled />,
      },
      {
        path: ROUTES.ADMINISTRATION,
        label: 'Administration',
        icon: <Settings24Regular />,
        activeIcon: <Settings24Filled />,
      },
    ],
  },
];

const SidebarInner: React.FC = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarCollapsed, unreadNotificationCount } = useAppStore();

  const isActive = (path: string): boolean => location.pathname === path;

  const renderNavItem = (item: NavItemConfig) => {
    const active = isActive(item.path);

    const navItem = (
      <div
        key={item.path}
        className={mergeClasses(styles.navItem, active ? styles.navItemActive : styles.navItemDefaultHover)}
        onClick={() => navigate(item.path)}
        role="menuitem"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && navigate(item.path)}
        aria-current={active ? 'page' : undefined}
        // Native title avoids Tooltip portal flicker in collapsed mode
        title={sidebarCollapsed ? item.label : undefined}
      >
        <span className={mergeClasses(styles.navIcon, active && styles.navIconActive)}>
          {active ? item.activeIcon : item.icon}
        </span>

        {!sidebarCollapsed && (
          <>
            <Text className={mergeClasses(styles.navLabel, active && styles.navLabelActive)}>
              {item.label}
            </Text>
            {item.label === 'Notifications' && unreadNotificationCount > 0 && (
              <Badge
                className={styles.badge}
                appearance="filled"
                color="danger"
                size="small"
              >
                {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
              </Badge>
            )}
          </>
        )}
      </div>
    );

    return navItem;
  };

  return (
    <aside
      className={mergeClasses(styles.sidebar, sidebarCollapsed && styles.sidebarCollapsed)}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon} aria-hidden="true">PS</div>
        {!sidebarCollapsed && (
          <div className={styles.logoText}>
            <Text className={styles.logoTitle}>Policy Servicing</Text>
            <Text className={styles.logoSubtitle}>Request Desk</Text>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={styles.nav} role="menu">
        {navSections.map((section) => (
          <div key={section.label} className={styles.section}>
            {!sidebarCollapsed && (
              <Text className={styles.sectionLabel}>{section.label}</Text>
            )}
            {section.items.map(renderNavItem)}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export const Sidebar = memo(SidebarInner);
