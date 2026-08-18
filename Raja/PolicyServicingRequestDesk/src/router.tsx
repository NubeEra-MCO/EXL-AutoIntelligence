// ============================================================
// APPLICATION ROUTER
// ============================================================
import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spinner, makeStyles } from '@fluentui/react-components';
import { ROUTES } from './utils/constants';
import { AppLayout } from './components/layout/AppLayout';

// Lazy-loaded page components
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard').then((m) => ({ default: m.Dashboard })));
const PolicySearch = lazy(() => import('./pages/PolicySearch/PolicySearch').then((m) => ({ default: m.PolicySearch })));
const RequestCatalogue = lazy(() => import('./pages/RequestCatalogue/RequestCatalogue').then((m) => ({ default: m.RequestCatalogue })));
const RequestTracking = lazy(() => import('./pages/RequestTracking/RequestTracking').then((m) => ({ default: m.RequestTracking })));
const RequestCreation = lazy(() => import('./pages/RequestCreation/RequestCreation').then((m) => ({ default: m.RequestCreation })));
const OperationsWorkbench = lazy(() => import('./pages/OperationsWorkbench/OperationsWorkbench').then((m) => ({ default: m.OperationsWorkbench })));
const AgentPage = lazy(() => import('./pages/Agent/AgentPage').then((m) => ({ default: m.AgentPage })));
const AuditPage = lazy(() => import('./pages/Audit/AuditPage').then((m) => ({ default: m.AuditPage })));
const NotificationsPage = lazy(() => import('./pages/Notifications/NotificationsPage').then((m) => ({ default: m.NotificationsPage })));
const AdministrationPage = lazy(() => import('./pages/Administration/AdministrationPage').then((m) => ({ default: m.AdministrationPage })));
const KnowledgeBasePage = lazy(() => import('./pages/KnowledgeBase/KnowledgeBasePage').then((m) => ({ default: m.KnowledgeBasePage })));
const ReportsPage = lazy(() => import('./pages/Reports/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const SettingsPage = lazy(() => import('./pages/Settings/SettingsPage').then((m) => ({ default: m.SettingsPage })));

const useStyles = makeStyles({
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    minHeight: '300px',
  },
});

const PageLoader: React.FC = () => {
  const styles = useStyles();
  return (
    <div className={styles.loadingContainer}>
      <Spinner size="medium" label="Loading page..." />
    </div>
  );
};

export const AppRouter: React.FC = () => {
  return (
    <AppLayout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTES.POLICY_SEARCH} element={<PolicySearch />} />
          <Route path="/policies/:policyId" element={<PolicySearch />} />
          <Route path={ROUTES.REQUEST_CATALOGUE} element={<RequestCatalogue />} />
          <Route path={ROUTES.REQUEST_CREATE} element={<RequestCreation />} />
          <Route path={ROUTES.REQUEST_TRACKING} element={<RequestTracking />} />
          <Route path="/requests/:requestId" element={<RequestTracking />} />
          <Route path={ROUTES.OPERATIONS_WORKBENCH} element={<OperationsWorkbench />} />
          <Route path={ROUTES.CUSTOMER_VIEW} element={<RequestTracking />} />
          <Route path={ROUTES.AGENT} element={<AgentPage />} />
          <Route path={ROUTES.AUDIT_COMPLIANCE} element={<AuditPage />} />
          <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
          <Route path={ROUTES.ADMINISTRATION} element={<AdministrationPage />} />
          <Route path={ROUTES.KNOWLEDGE_BASE} element={<KnowledgeBasePage />} />
          <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
};
