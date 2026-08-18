// ============================================================
// ROOT APP COMPONENT
// ============================================================
import React, { useEffect } from 'react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { FluentProvider, makeStyles } from '@fluentui/react-components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { lightTheme, darkTheme } from './theme/tokens';
import { AppRouter } from './router';
import { useAppStore } from './store/appStore';
import { dataverseService } from './services/dataverse.service';
import type { AppConfig } from './types/common.types';

// Create QueryClient with enterprise settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: (failureCount, error) => {
        if ((error as Error)?.message?.includes('not found')) return false;
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const useStyles = makeStyles({
  root: {
    height: '100%',
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  },
});

interface AppProps extends AppConfig {
  context?: unknown;
}

export const App: React.FC<AppProps> = ({
  environmentUrl,
  userId,
  themeMode: initialThemeMode,
  enableAI,
}) => {
  const styles = useStyles();
  const {
    themeMode,
    setThemeMode,
    setEnvironmentUrl,
    setEnableAI,
    setCurrentUser,
    setAuthenticated,
  } = useAppStore();

  // Initialize app configuration
  useEffect(() => {
    if (initialThemeMode && (initialThemeMode === 'light' || initialThemeMode === 'dark')) {
      setThemeMode(initialThemeMode);
    }
    if (environmentUrl) {
      setEnvironmentUrl(environmentUrl);
      dataverseService.initialize(environmentUrl);
    }
    setEnableAI(enableAI);

    // Set mock user for development
    if (!userId || import.meta.env.DEV) {
      setCurrentUser({
        id: userId || 'dev-user-001',
        email: 'operations@insurance.com',
        displayName: 'Operations Manager',
        firstName: 'Operations',
        lastName: 'Manager',
        roles: ['OperationsManager', 'ServicingAgent'],
        primaryRole: 'OperationsManager',
        isActive: true,
        preferences: {
          themeMode: themeMode,
          language: 'en-IN',
          timezone: 'Asia/Kolkata',
          dateFormat: 'dd/MM/yyyy',
          currencyFormat: 'INR',
          itemsPerPage: 20,
          emailNotifications: true,
          pushNotifications: true,
          defaultDashboard: '/dashboard',
        },
        permissions: [],
      });
      setAuthenticated(true);
    }
  }, [environmentUrl, userId, enableAI, initialThemeMode]);

  const activeTheme = themeMode === 'dark' ? darkTheme : lightTheme;

  // Use MemoryRouter in PCF context (no URL manipulation), BrowserRouter in dev
  const RouterComponent = import.meta.env.DEV ? BrowserRouter : MemoryRouter;

  return (
    <QueryClientProvider client={queryClient}>
      <FluentProvider theme={activeTheme} className={styles.root}>
        <RouterComponent>
          <AppRouter />
        </RouterComponent>
      </FluentProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};
