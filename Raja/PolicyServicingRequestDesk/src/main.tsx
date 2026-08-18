// ============================================================
// DEVELOPMENT ENTRY POINT (Vite dev server)
// ============================================================
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/global.css';

const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App
      environmentUrl={import.meta.env.VITE_DATAVERSE_URL || 'https://dev.crm.dynamics.com'}
      userId="dev-user-001"
      userRoles="OperationsManager,ServicingAgent"
      themeMode="light"
      enableAI={true}
    />
  </React.StrictMode>
);
