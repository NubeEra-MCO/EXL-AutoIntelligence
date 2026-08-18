// ============================================================
// HEADER COMPONENT
// ============================================================
import React, { memo } from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Button,
  Avatar,
  Badge,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  MenuDivider,
  Persona,
} from '@fluentui/react-components';
import {
  Navigation24Regular,
  Alert24Regular,
  WeatherMoon24Regular,
  WeatherSunny24Regular,
  SignOut24Regular,
  Settings24Regular,
  Person24Regular,
  QuestionCircle24Regular,
  ChevronRight16Regular,
} from '@fluentui/react-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { designTokens } from '../../theme/tokens';
import { ROUTES } from '../../utils/constants';

const useStyles = makeStyles({
  header: {
    height: designTokens.layout.headerHeight,
    backgroundColor: tokens.colorNeutralBackground1,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    position: 'sticky',
    top: 0,
    zIndex: designTokens.zIndex.sticky,
    flexShrink: 0,
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  breadcrumbItem: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground3,
  },
  breadcrumbActive: {
    fontSize: '14px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: '4px',
    right: '4px',
  },
  separator: {
    width: '1px',
    height: '24px',
    backgroundColor: tokens.colorNeutralStroke2,
    margin: '0 4px',
  },
  userAvatar: {
    cursor: 'pointer',
  },
  envBadge: {
    padding: '2px 8px',
    borderRadius: '4px',
    backgroundColor: tokens.colorPaletteYellowBackground1,
    border: `1px solid ${tokens.colorPaletteYellowBorder1}`,
    fontSize: '11px',
    fontWeight: 600,
    color: tokens.colorPaletteYellowForeground1,
    display: 'flex',
    alignItems: 'center',
  },
  menuHeader: {
    padding: '12px 16px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
});

const PAGE_TITLES: Record<string, { title: string; subtitle?: string }> = {
  [ROUTES.DASHBOARD]: { title: 'Dashboard', subtitle: 'Overview' },
  [ROUTES.POLICY_SEARCH]: { title: 'Policy Search', subtitle: 'Find Policies' },
  [ROUTES.REQUEST_CATALOGUE]: { title: 'Request Catalogue', subtitle: 'Services' },
  [ROUTES.REQUEST_TRACKING]: { title: 'My Requests', subtitle: 'Track Requests' },
  [ROUTES.OPERATIONS_WORKBENCH]: { title: 'Operations Workbench', subtitle: 'Manage Queue' },
  [ROUTES.CUSTOMER_VIEW]: { title: 'Self Service', subtitle: 'Customer Portal' },
  [ROUTES.AUDIT_COMPLIANCE]: { title: 'Audit & Compliance', subtitle: 'Regulatory' },
  [ROUTES.NOTIFICATIONS]: { title: 'Notifications', subtitle: 'Alerts' },
  [ROUTES.ADMINISTRATION]: { title: 'Administration', subtitle: 'Settings' },
  [ROUTES.AGENT]: { title: 'AI Policy Assistant', subtitle: 'Copilot Studio' },
  [ROUTES.REPORTS]: { title: 'Reports & Analytics', subtitle: 'Insights' },
  [ROUTES.KNOWLEDGE_BASE]: { title: 'Knowledge Base', subtitle: 'Articles' },
};

const HeaderInner: React.FC = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentUser,
    themeMode,
    toggleTheme,
    toggleSidebar,
    unreadNotificationCount,
  } = useAppStore();

  const pageInfo = PAGE_TITLES[location.pathname] || { title: 'Policy Servicing' };

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <Button
          appearance="subtle"
          icon={<Navigation24Regular />}
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
        />

        <div className={styles.breadcrumb}>
          <Text className={styles.breadcrumbItem}>PSRD</Text>
          <ChevronRight16Regular style={{ color: tokens.colorNeutralForeground3 }} />
          <Text className={styles.breadcrumbActive}>{pageInfo.title}</Text>
          {pageInfo.subtitle && (
            <>
              <ChevronRight16Regular style={{ color: tokens.colorNeutralForeground3 }} />
              <Text className={styles.breadcrumbItem}>{pageInfo.subtitle}</Text>
            </>
          )}
        </div>
      </div>

      <div className={styles.rightSection}>
        {/* Environment Indicator */}
        {import.meta.env.DEV && (
          <span className={styles.envBadge}>DEV</span>
        )}

        {/* Theme Toggle */}
        <Button
          appearance="subtle"
          icon={themeMode === 'light' ? <WeatherMoon24Regular /> : <WeatherSunny24Regular />}
          onClick={toggleTheme}
          aria-label={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}
        />

        {/* Help */}
        <Button
          appearance="subtle"
          icon={<QuestionCircle24Regular />}
          aria-label="Help & Documentation"
          title="Help & Documentation"
        />

        {/* Notifications */}
        <div className={styles.notificationButton}>
          <Button
            appearance="subtle"
            icon={<Alert24Regular />}
            onClick={() => navigate(ROUTES.NOTIFICATIONS)}
            aria-label={`Notifications${unreadNotificationCount ? ` (${unreadNotificationCount} unread)` : ''}`}
            title={`Notifications${unreadNotificationCount ? ` (${unreadNotificationCount} unread)` : ''}`}
          />
          {unreadNotificationCount > 0 && (
            <Badge
              className={styles.notificationBadge}
              appearance="filled"
              color="danger"
              size="extra-small"
            >
              {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
            </Badge>
          )}
        </div>

        <div className={styles.separator} />

        {/* User Menu */}
        <Menu>
          <MenuTrigger disableButtonEnhancement>
            <Avatar
              className={styles.userAvatar}
              name={currentUser?.displayName || 'User'}
              size={32}
              color="brand"
              badge={{ status: 'available', 'aria-label': 'Online' }}
              aria-label="User menu"
              role="button"
              tabIndex={0}
            />
          </MenuTrigger>

          <MenuPopover>
            <div className={styles.menuHeader}>
              <Persona
                name={currentUser?.displayName || 'Current User'}
                secondaryText={currentUser?.email || ''}
                tertiaryText={currentUser?.primaryRole || ''}
                size="medium"
                avatar={{ color: 'brand' }}
              />
            </div>

            <MenuList>
              <MenuItem icon={<Person24Regular />} onClick={() => navigate(ROUTES.SETTINGS)}>
                My Profile
              </MenuItem>
              <MenuItem icon={<Settings24Regular />} onClick={() => navigate(ROUTES.SETTINGS)}>
                Preferences
              </MenuItem>
              <MenuDivider />
              <MenuItem icon={<SignOut24Regular />} onClick={() => { useAppStore.getState().reset(); navigate('/'); }}>
                Sign Out
              </MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>
      </div>
    </header>
  );
};

export const Header = memo(HeaderInner);
