# Development Guide - Policy Servicing Request Desk

## Local Development Setup

### Prerequisites
- Node.js 20+ ([Download](https://nodejs.org/))
- Power Platform CLI (pac) ([Install](https://learn.microsoft.com/power-platform/developer/cli/introduction))
- TypeScript 5.9+
- Visual Studio Code ([Download](https://code.visualstudio.com/))

### Initial Setup

```bash
# 1. Clone and navigate to project
cd PolicyServicingRequestDesk

# 2. Install dependencies
npm install

# 3. Create local environment file
cp .env.example .env.local

# 4. Edit .env.local with your settings
# At minimum, set:
# VITE_USE_MOCK=true (for development without Dataverse)
# VITE_DATAVERSE_URL=https://your-org.crm.dynamics.com (for Dataverse integration)

# 5. Start development server
npm run dev
# App available at http://localhost:3000
```

### Environment Configuration

**`.env.local` Variables:**
| Variable | Example | Required | Purpose |
|----------|---------|----------|---------|
| `VITE_DATAVERSE_URL` | `https://org123.crm.dynamics.com` | Yes | Dataverse environment URL |
| `VITE_USE_MOCK` | `true` or `false` | No | Use mock data (dev mode) |
| `VITE_APP_INSIGHTS_CONNECTION_STRING` | `InstrumentationKey=...` | No | Application Insights telemetry |
| `VITE_AZURE_OPENAI_ENDPOINT` | `https://xxx.openai.azure.com` | No | Azure OpenAI for AI features |
| `VITE_AZURE_OPENAI_DEPLOYMENT` | `gpt-4o` | No | OpenAI model deployment name |
| `VITE_COPILOT_DIRECTLINE_SECRET` | `xxx` | No | Copilot Studio integration |
| `VITE_ENABLE_AI_AGENT` | `true` | No | Enable/disable AI copilot |

---

## Development Workflow

### Running the Application

```bash
# Development mode (with hot reload)
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build

# Test mode with UI
npm run test:ui

# Test coverage
npm run test:coverage
```

### Project Structure

```
src/
├── App.tsx                 # Root component
├── main.tsx                # Vite entry point
├── router.tsx              # Route definitions
├── components/
│   ├── layout/            # AppLayout, Sidebar, Header
│   └── common/            # Reusable components (KPICard, Badge, etc.)
├── pages/
│   ├── Dashboard/         # Main dashboard
│   ├── PolicySearch/      # Policy search module
│   ├── RequestCatalogue/  # Request types listing
│   ├── RequestCreation/   # Multi-step wizard
│   ├── RequestTracking/   # Request status tracking
│   ├── OperationsWorkbench/  # Queue management
│   ├── Agent/            # AI Copilot chat interface
│   ├── Audit/            # Audit log viewer
│   ├── Notifications/    # Notification center
│   ├── Administration/   # Admin settings
│   ├── KnowledgeBase/   # FAQ/Help documentation
│   └── Reports/         # Analytics and reporting
├── services/
│   ├── dataverse.service.ts    # OData API client
│   ├── policy.service.ts       # Policy business logic
│   ├── request.service.ts      # Request business logic
│   └── mock-data.ts            # Development mock data
├── store/
│   └── appStore.ts             # Zustand global state
├── types/
│   ├── policy.types.ts         # Policy type definitions
│   ├── request.types.ts        # Request type definitions
│   └── user.types.ts           # User type definitions
├── theme/
│   └── tokens.ts               # Design tokens + Fluent themes
└── utils/
    ├── constants.ts            # App constants and routes
    └── formatters.ts           # Date/currency formatters
```

---

## Code Standards

### TypeScript Configuration
- **Target**: ES2020
- **Module**: ESNext with bundler resolution
- **Strict Mode**: Enabled (null checks, no implicit any, etc.)
- **Path Aliases**: `@/*`, `@components/*`, `@pages/*`, etc.

### Component Structure

**Functional Component Pattern:**
```typescript
import React from 'react';
import { useStyles, makeStyles, Text, Button } from '@fluentui/react-components';
import { Search24Regular } from '@fluentui/react-icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { myService } from '../../services/my.service';
import type { MyType } from '../../types/my.types';

const useStyles = makeStyles({
  root: { display: 'flex', gap: '16px' },
  // ... more styles
});

interface MyComponentProps {
  id: string;
  onSelect?: (id: string) => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ id, onSelect }) => {
  const styles = useStyles();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['item', id],
    queryFn: () => myService.getItem(id),
  });

  return (
    <div className={styles.root}>
      {/* JSX */}
    </div>
  );
};
```

### Naming Conventions
- **Components**: PascalCase (`Dashboard.tsx`)
- **Hooks**: camelCase starting with `use` (`useAppStore.ts`)
- **Services**: camelCase ending with `.service.ts` (`policy.service.ts`)
- **Types**: PascalCase in `.types.ts` files
- **Constants**: UPPER_SNAKE_CASE (`QUERY_KEYS`, `ROUTES`)
- **CSS Classes**: kebab-case via Griffel styles

### ESLint & Formatting

```bash
# Run linter
npm run lint

# Run linter with auto-fix
npm run lint --fix

# Format code (Prettier)
npm run format
```

**Key Rules:**
- No unused variables (`noUnusedLocals`, `noUnusedParameters`)
- No implicit `any` types
- No console statements in production
- Components in separate files (one component per file)

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage

# Test a specific file
npm test -- PolicySearch
```

### Test Structure

Tests are co-located with source files:
```
src/
├── services/
│   ├── policy.service.ts
│   └── policy.service.test.ts
├── utils/
│   ├── formatters.ts
│   └── formatters.test.ts
└── components/
    ├── KPICard.tsx
    └── KPICard.test.ts
```

### Example Test

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { policyService } from './policy.service';
import { mockPolicies } from './mock-data';

describe('policyService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should search policies by number', async () => {
    const result = await policyService.searchPolicies({ policyNumber: 'POL001' });
    expect(result).toHaveLength(1);
    expect(result[0].policyNumber).toBe('POL001');
  });
});
```

**Coverage Targets:**
- Services: 90%+
- Utils: 95%+
- Components: 80%+
- Pages: 70%+

---

## Debugging

### VS Code Debugging

**`.vscode/launch.json`:**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/src",
      "sourceMapPathOverride": {
        "/src/*": "${webspaceFolder}/src/*"
      }
    }
  ]
}
```

**Press F5 to start debugging.**

### React DevTools

1. Install [React DevTools Chrome Extension](https://chrome.google.com/webstore/detail/react-developer-tools)
2. Open DevTools (F12)
3. Go to "Components" tab to inspect React component tree

### React Query DevTools

Enabled in development mode. Access via DevTools panel to:
- View query state
- Debug request/response
- Manually trigger refetch
- Track query history

---

## Performance Optimization

### Code Splitting

All pages are lazy-loaded:
```typescript
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const PolicySearch = lazy(() => import('./pages/PolicySearch/PolicySearch'));
```

### Caching Strategy

**React Query cache times:**
- Policy data: 5 minutes
- Request status: 1 minute
- Catalogue: 10 minutes
- Search results: 2 minutes

```typescript
useQuery({
  queryKey: ['policy', policyId],
  queryFn: () => policyService.getPolicy(policyId),
  staleTime: 5 * 60 * 1000,  // 5 min
  cacheTime: 10 * 60 * 1000, // 10 min
});
```

### Component Optimization

- Use `React.memo` for expensive re-renders
- Use `useCallback` for event handlers passed to children
- Implement virtual scrolling for large lists (react-virtuoso)
- Lazy load images with Intersection Observer

---

## Common Tasks

### Add a New Page

1. Create folder: `src/pages/MyPage/`
2. Create component: `src/pages/MyPage/MyPage.tsx`
3. Add route in `src/router.tsx`
4. Add nav item in `src/components/layout/Sidebar.tsx`

### Add a New Service

1. Create: `src/services/my.service.ts`
2. Implement service methods with proper typing
3. Use `import.meta.env.VITE_USE_MOCK` to conditionally return mock data
4. Export service instance

### Add a New Type

1. Create/edit: `src/types/my.types.ts`
2. Define interface with JSDoc comments
3. Export for use in components and services

### Add Global State

1. Add store to `src/store/appStore.ts` using Zustand
2. Export hook: `export const useAppStore = create(...)`
3. Use in components: `const { state, setState } = useAppStore()`

---

## Troubleshooting

### Port 3000 Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>
```

### Module Not Found Errors
- Check import paths use correct aliases (`@/*`)
- Verify file extensions (`.ts`, `.tsx`)
- Run `npm install` to ensure dependencies are installed

### TypeScript Errors
```bash
# Rebuild type definitions
npm run type-check

# Clear cache
rm -rf node_modules/.cache
npm install
```

### Dataverse Connection Issues
- Verify `VITE_DATAVERSE_URL` is correct
- Check authentication token is valid
- Enable CORS for development
- Use `VITE_USE_MOCK=true` to test without Dataverse

---

## Useful Resources

- [React 18 Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Fluent UI v9](https://react.fluentui.dev)
- [React Router v6](https://reactrouter.com/en/main)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand](https://github.com/pmndrs/zustand)
- [Vite Guide](https://vitejs.dev/guide/)
