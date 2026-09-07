// ============================================================
// USER SETTINGS / PROFILE PAGE
// ============================================================
import React, { useState } from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Button,
  Input,
  Label,
  Switch,
  Select,
  TabList,
  Tab,
  Divider,
  Avatar,
  Badge,
} from '@fluentui/react-components';
import {
  Person24Regular,
  Settings24Regular,
  Alert24Regular,
  ShieldCheckmark24Regular,
  Save24Regular,
} from '@fluentui/react-icons';
import { useAppStore } from '../../store/appStore';
import { designTokens } from '../../theme/tokens';

const useStyles = makeStyles({
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    maxWidth: '900px',
  },
  pageHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: tokens.colorNeutralForeground1,
  },
  pageSubtitle: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground3,
  },
  tabContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    paddingTop: '20px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '20px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: designTokens.borderRadius.lg,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  sectionTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    '@media (max-width: 600px)': {
      gridTemplateColumns: '1fr',
    },
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    paddingBottom: '16px',
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  profileName: {
    fontSize: '18px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
  },
  profileEmail: {
    fontSize: '13px',
    color: tokens.colorNeutralForeground3,
  },
  profileRole: {
    fontSize: '12px',
    fontWeight: 500,
    color: tokens.colorBrandForeground1,
    backgroundColor: tokens.colorBrandBackground2,
    padding: '2px 8px',
    borderRadius: '4px',
    display: 'inline-block',
    marginTop: '4px',
  },
  switchRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    ':last-child': { borderBottom: 'none' },
  },
  switchLabel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  switchLabelText: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground1,
  },
  switchLabelSub: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    paddingTop: '8px',
  },
});

export const SettingsPage: React.FC = () => {
  const styles = useStyles();
  const { currentUser, themeMode, setThemeMode } = useAppStore();
  const [activeTab, setActiveTab] = useState('profile');

  // Local editable state
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [email] = useState(currentUser?.email || '');
  const [language, setLanguage] = useState(currentUser?.preferences?.language || 'en-IN');
  const [timezone, setTimezone] = useState(currentUser?.preferences?.timezone || 'Asia/Kolkata');
  const [dateFormat, setDateFormat] = useState(currentUser?.preferences?.dateFormat || 'dd/MM/yyyy');
  const [emailNotif, setEmailNotif] = useState(currentUser?.preferences?.emailNotifications ?? true);
  const [pushNotif, setPushNotif] = useState(currentUser?.preferences?.pushNotifications ?? true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In production this would persist to Dataverse
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <Text className={styles.pageTitle}>Settings</Text>
        <Text className={styles.pageSubtitle}>Manage your profile, preferences and notifications</Text>
      </div>

      <TabList
        selectedValue={activeTab}
        onTabSelect={(_, d) => setActiveTab(d.value as string)}
      >
        <Tab value="profile" icon={<Person24Regular />}>My Profile</Tab>
        <Tab value="preferences" icon={<Settings24Regular />}>Preferences</Tab>
        <Tab value="notifications" icon={<Alert24Regular />}>Notifications</Tab>
        <Tab value="security" icon={<ShieldCheckmark24Regular />}>Security</Tab>
      </TabList>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className={styles.tabContent}>
          <div className={styles.section}>
            <div className={styles.profileHeader}>
              <Avatar
                name={currentUser?.displayName || 'User'}
                size={64}
                color="brand"
                badge={{ status: 'available', 'aria-label': 'Online' }}
              />
              <div className={styles.profileInfo}>
                <Text className={styles.profileName}>{currentUser?.displayName || 'Current User'}</Text>
                <Text className={styles.profileEmail}>{currentUser?.email || ''}</Text>
                <span className={styles.profileRole}>{currentUser?.primaryRole || 'Agent'}</span>
              </div>
            </div>
            <Divider />
            <div className={styles.twoCol}>
              <div className={styles.field}>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(_, d) => setDisplayName(d.value)}
                />
              </div>
              <div className={styles.field}>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" value={email} readOnly appearance="filled-lighter" />
              </div>
              <div className={styles.field}>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" defaultValue={currentUser?.firstName || ''} />
              </div>
              <div className={styles.field}>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" defaultValue={currentUser?.lastName || ''} />
              </div>
            </div>
          </div>
          <div className={styles.actions}>
            <Button appearance="primary" icon={<Save24Regular />} onClick={handleSave}>
              {saved ? 'Saved!' : 'Save Changes'}
            </Button>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className={styles.tabContent}>
          <div className={styles.section}>
            <Text className={styles.sectionTitle}>Display</Text>
            <div className={styles.field}>
              <Label htmlFor="theme">Theme</Label>
              <Select
                id="theme"
                value={themeMode}
                onChange={(_, d) => setThemeMode(d.value as 'light' | 'dark')}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </Select>
            </div>
            <div className={styles.twoCol}>
              <div className={styles.field}>
                <Label htmlFor="language">Language</Label>
                <Select id="language" value={language} onChange={(_, d) => setLanguage(d.value)}>
                  <option value="en-IN">English (India)</option>
                  <option value="en-US">English (US)</option>
                  <option value="hi-IN">Hindi</option>
                </Select>
              </div>
              <div className={styles.field}>
                <Label htmlFor="timezone">Timezone</Label>
                <Select id="timezone" value={timezone} onChange={(_, d) => setTimezone(d.value)}>
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                </Select>
              </div>
              <div className={styles.field}>
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select id="dateFormat" value={dateFormat} onChange={(_, d) => setDateFormat(d.value)}>
                  <option value="dd/MM/yyyy">DD/MM/YYYY</option>
                  <option value="MM/dd/yyyy">MM/DD/YYYY</option>
                  <option value="yyyy-MM-dd">YYYY-MM-DD</option>
                </Select>
              </div>
            </div>
          </div>
          <div className={styles.actions}>
            <Button appearance="primary" icon={<Save24Regular />} onClick={handleSave}>
              {saved ? 'Saved!' : 'Save Changes'}
            </Button>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className={styles.tabContent}>
          <div className={styles.section}>
            <Text className={styles.sectionTitle}>Notification Channels</Text>
            <div className={styles.switchRow}>
              <div className={styles.switchLabel}>
                <Text className={styles.switchLabelText}>Email Notifications</Text>
                <Text className={styles.switchLabelSub}>Receive updates via email</Text>
              </div>
              <Switch checked={emailNotif} onChange={(_, d) => setEmailNotif(d.checked)} />
            </div>
            <div className={styles.switchRow}>
              <div className={styles.switchLabel}>
                <Text className={styles.switchLabelText}>Push Notifications</Text>
                <Text className={styles.switchLabelSub}>In-browser notifications</Text>
              </div>
              <Switch checked={pushNotif} onChange={(_, d) => setPushNotif(d.checked)} />
            </div>
            <div className={styles.switchRow}>
              <div className={styles.switchLabel}>
                <Text className={styles.switchLabelText}>SLA Breach Alerts</Text>
                <Text className={styles.switchLabelSub}>Get alerted when SLA is near breach</Text>
              </div>
              <Switch defaultChecked />
            </div>
            <div className={styles.switchRow}>
              <div className={styles.switchLabel}>
                <Text className={styles.switchLabelText}>Request Status Updates</Text>
                <Text className={styles.switchLabelSub}>Notify when request status changes</Text>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
          <div className={styles.actions}>
            <Button appearance="primary" icon={<Save24Regular />} onClick={handleSave}>
              {saved ? 'Saved!' : 'Save Changes'}
            </Button>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className={styles.tabContent}>
          <div className={styles.section}>
            <Text className={styles.sectionTitle}>Active Session</Text>
            <div className={styles.twoCol}>
              <div className={styles.field}>
                <Label>Roles</Label>
                <Input readOnly value={(currentUser?.roles || []).join(', ')} appearance="filled-lighter" />
              </div>
              <div className={styles.field}>
                <Label>User ID</Label>
                <Input readOnly value={currentUser?.id || ''} appearance="filled-lighter" />
              </div>
            </div>
          </div>
          <div className={styles.section}>
            <Text className={styles.sectionTitle}>Access & Permissions</Text>
            {(currentUser?.roles || ['OperationsManager', 'ServicingAgent']).map((role) => (
              <div key={role} className={styles.switchRow}>
                <div className={styles.switchLabel}>
                  <Text className={styles.switchLabelText}>{role}</Text>
                  <Text className={styles.switchLabelSub}>Assigned role — managed by administrator</Text>
                </div>
                <Badge appearance="filled" color="success">Active</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
