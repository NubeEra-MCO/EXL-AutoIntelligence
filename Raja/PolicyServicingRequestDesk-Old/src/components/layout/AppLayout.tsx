// ============================================================
// APP LAYOUT
// ============================================================
import React from 'react';
import { makeStyles, tokens, Toast, ToastTitle, ToastBody, Toaster, useToastController } from '@fluentui/react-components';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAppStore, useToasts } from '../../store/appStore';
import { designTokens } from '../../theme/tokens';

const useStyles = makeStyles({
  shell: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: tokens.colorNeutralBackground2,
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
    minWidth: 0,
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: designTokens.layout.contentPadding,
    position: 'relative',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: designTokens.zIndex.modal,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingSpinner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    color: 'white',
  },
});

interface ToastManagerProps {
  children: React.ReactNode;
}

const ToastManager: React.FC<ToastManagerProps> = ({ children }) => {
  const toasts = useToasts();
  const removeToast = useAppStore((s) => s.removeToast);
  const { dispatchToast } = useToastController('psrd-toaster');

  React.useEffect(() => {
    toasts.forEach((toast) => {
      dispatchToast(
        <Toast>
          <ToastTitle>{toast.title}</ToastTitle>
          {toast.message && <ToastBody>{toast.message}</ToastBody>}
        </Toast>,
        {
          intent: toast.type === 'error' ? 'error' : toast.type === 'warning' ? 'warning' : toast.type === 'success' ? 'success' : 'info',
          timeout: toast.duration || 4000,
        }
      );
      // Remove from store after dispatching
      setTimeout(() => removeToast(toast.id), 100);
    });
  }, [toasts.length]);

  return <>{children}</>;
};

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const styles = useStyles();
  const { globalLoading, globalLoadingText } = useAppStore();

  return (
    <div className={styles.shell}>
      <Sidebar />
      
      <div className={styles.main}>
        <Header />
        
        <main className={styles.content} role="main" id="main-content">
          <Toaster toasterId="psrd-toaster" position="top-end" limit={5} />
          <ToastManager>
            {children}
          </ToastManager>
        </main>
      </div>

      {/* Global Loading Overlay */}
      {globalLoading && (
        <div className={styles.overlay} role="status" aria-live="polite">
          <div className={styles.loadingSpinner}>
            <div
              style={{
                width: 48,
                height: 48,
                border: '4px solid rgba(255,255,255,0.3)',
                borderTopColor: 'white',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            {globalLoadingText && (
              <span style={{ fontSize: 16, fontWeight: 500 }}>{globalLoadingText}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
