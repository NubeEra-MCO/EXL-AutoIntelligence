# Testing Guide - Policy Servicing Request Desk

## Testing Strategy

**Three-Tier Testing Approach:**
1. **Unit Tests** - Component, service, and utility testing
2. **Integration Tests** - API, state management, cross-component flows
3. **End-to-End Tests** - Full user workflows in browser

---

## Unit Testing

### Test Framework Setup

```bash
# Tests use Vitest + React Testing Library
npm run test           # Run tests
npm run test:ui        # Interactive UI
npm run test:coverage  # Coverage report
```

### Component Testing

**File:** `src/components/KPICard/KPICard.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { KPICard } from './KPICard';

describe('KPICard', () => {
  it('should render title and value', () => {
    render(
      <KPICard
        title="Total Policies"
        value="1,234"
        icon={<ChartLine24Regular />}
        trend={12}
      />
    );

    expect(screen.getByText('Total Policies')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('+12%')).toBeInTheDocument();
  });

  it('should display negative trend in red', () => {
    const { container } = render(
      <KPICard
        title="Failed Requests"
        value="45"
        trend={-5}
      />
    );

    const trendElement = container.querySelector('[data-trend="negative"]');
    expect(trendElement).toHaveClass('text-error');
  });
});
```

### Service Testing

**File:** `src/services/policy.service.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { policyService } from './policy.service';
import * as dataverseService from './dataverse.service';

vi.mock('./dataverse.service');

describe('policyService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should search policies by policy number', async () => {
    const mockResponse = [{ policyId: '1', policyNumber: 'POL001' }];
    vi.spyOn(dataverseService, 'query').mockResolvedValue(mockResponse);

    const result = await policyService.searchPolicies({
      policyNumber: 'POL001',
    });

    expect(result).toEqual(mockResponse);
    expect(dataverseService.query).toHaveBeenCalledWith(
      expect.stringContaining('psrd_policynumber')
    );
  });

  it('should handle search errors gracefully', async () => {
    vi.spyOn(dataverseService, 'query').mockRejectedValue(
      new Error('Network error')
    );

    const result = await policyService.searchPolicies({
      policyNumber: 'POL001',
    });

    expect(result).toEqual([]);
  });

  it('should mask sensitive fields in policy data', async () => {
    const policy = {
      policyId: '1',
      customerPan: '1234567890123456',
      aadhaar: '123456789012',
    };

    const masked = policyService.maskSensitiveData(policy);

    expect(masked.customerPan).toBe('****7890');
    expect(masked.aadhaar).toBe('****9012');
  });
});
```

### Coverage Targets

```
┌──────────────────┬────────┬────────┬─────────┐
│ Category         │ Target │ Status │ Notes   │
├──────────────────┼────────┼────────┼─────────┤
│ Services         │  90%   │   ✅   │ Critical|
│ Utilities        │  95%   │   ✅   │ Formatters
│ Components       │  80%   │   ✅   │ Optional
│ Pages            │  70%   │   ✅   │ E2E focus|
│ Stores           │  85%   │   ✅   │ State    |
│ Overall          │  85%   │   ✅   │ Minimum  |
└──────────────────┴────────┴────────┴─────────┘
```

---

## Integration Testing

### Service Integration Tests

**File:** `src/services/integration.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { policyService } from './policy.service';
import { requestService } from './request.service';

describe('Service Integration', () => {
  let queryClient: QueryClient;

  beforeAll(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  it('should create request and update policy open count', async () => {
    // 1. Get policy
    const policy = await policyService.getPolicy('POL001');
    const initialRequestCount = policy.openRequests;

    // 2. Create request for policy
    const request = await requestService.createRequest({
      policyId: 'POL001',
      requestTypeCode: 'ADDRESS_CHANGE',
      priority: 'Normal',
    });

    // 3. Verify policy request count updated
    const updatedPolicy = await policyService.getPolicy('POL001');
    expect(updatedPolicy.openRequests).toBe(initialRequestCount + 1);

    // 4. Verify request has correct status
    expect(request.status).toBe('Submitted');
  });

  it('should not create request for inactive policy', async () => {
    const inactivePolicy = await policyService.getPolicy('POL002');

    const result = await requestService.createRequest({
      policyId: 'POL002',
      requestTypeCode: 'SURRENDER',
      priority: 'High',
    });

    expect(result).toEqual({ success: false, error: 'Policy is inactive' });
  });

  it('should cascade delete requests when policy is deleted', async () => {
    // 1. Create request for policy
    await requestService.createRequest({
      policyId: 'POL003',
      requestTypeCode: 'NOMINEE_CHANGE',
    });

    // 2. Delete policy
    await policyService.deletePolicy('POL003');

    // 3. Verify requests are deleted
    const requests = await requestService.getRequestsByPolicy('POL003');
    expect(requests).toHaveLength(0);
  });
});
```

### State Management Tests

**File:** `src/store/appStore.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { useAppStore } from './appStore';

describe('appStore', () => {
  beforeEach(() => {
    useAppStore.setState({
      user: null,
      filters: {},
      notifications: [],
    });
  });

  it('should set current user', () => {
    useAppStore.setState({
      user: { id: '1', email: 'user@company.com', role: 'Agent' },
    });

    const { user } = useAppStore.getState();
    expect(user?.email).toBe('user@company.com');
  });

  it('should add notification and auto-remove after timeout', async () => {
    const { addNotification, notifications } = useAppStore.getState();

    addNotification({
      id: 'n1',
      title: 'Success',
      message: 'Policy updated',
      type: 'success',
    });

    expect(notifications).toHaveLength(1);

    // Wait for auto-remove timeout
    await new Promise(resolve => setTimeout(resolve, 5100));

    expect(useAppStore.getState().notifications).toHaveLength(0);
  });
});
```

---

## End-to-End Testing

### E2E Test Framework

```bash
# Using Playwright for E2E tests
npm install -D @playwright/test

# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui

# Run specific test file
npm run test:e2e -- tests/policy-search.spec.ts
```

### Key E2E Test Scenarios

#### Test 1: Policy Search Workflow

**File:** `tests/e2e/policy-search.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Policy Search', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('http://localhost:3000');
    // Wait for app to load
    await page.waitForSelector('[data-testid="app-ready"]');
  });

  test('should search by policy number and display results', async ({
    page,
  }) => {
    // 1. Click Policy Search nav
    await page.click('a:has-text("Policy Search")');

    // 2. Wait for search page
    await page.waitForSelector('[data-testid="policy-search-form"]');

    // 3. Enter policy number
    await page.fill('[name="policyNumber"]', 'POL001');

    // 4. Click search
    await page.click('button:has-text("Search")');

    // 5. Verify results display
    await page.waitForSelector('[data-testid="policy-results-table"]');
    const rows = await page.locator('table tbody tr').count();
    expect(rows).toBeGreaterThan(0);

    // 6. Verify first result matches search
    const firstRow = page.locator('table tbody tr').first();
    await expect(firstRow).toContainText('POL001');
  });

  test('should display policy details in panel on select', async ({
    page,
  }) => {
    // 1. Search for policy
    await page.click('a:has-text("Policy Search")');
    await page.fill('[name="policyNumber"]', 'POL001');
    await page.click('button:has-text("Search")');

    // 2. Click first result
    await page.click('table tbody tr:first-child');

    // 3. Verify detail panel opens
    await page.waitForSelector('[data-testid="policy-detail-panel"]');

    // 4. Verify data displayed
    await expect(page.locator('text=POL001')).toBeVisible();
    await expect(page.locator('text=Active')).toBeVisible();
  });

  test('should filter results by policy type', async ({ page }) => {
    // 1. Search page
    await page.click('a:has-text("Policy Search")');

    // 2. Select filter
    await page.selectOption('[name="policyType"]', 'Life');

    // 3. Search
    await page.click('button:has-text("Search")');

    // 4. Verify all results are Life policies
    const policyTypes = await page.locator('table tbody tr td:nth-child(2)').allTextContents();
    policyTypes.forEach(type => {
      expect(type).toBe('Life');
    });
  });
});
```

#### Test 2: Request Creation Workflow

**File:** `tests/e2e/request-creation.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Request Creation', () => {
  test('should create address change request', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // 1. Navigate to Request Creation
    await page.click('a:has-text("Create Request")');
    await page.waitForSelector('[data-testid="request-wizard"]');

    // STEP 1: Policy Selection
    await page.fill('[name="policyNumber"]', 'POL001');
    await page.click('button:has-text("Next")');

    // STEP 2: Eligibility Check
    await page.waitForText('Eligibility Check Passed');
    await page.click('button:has-text("Next")');

    // STEP 3: Request Type
    await page.click('text=Address Change');
    await page.click('button:has-text("Next")');

    // STEP 4: Form Filling
    await page.fill('[name="newAddress"]', '123 Main Street');
    await page.fill('[name="city"]', 'New York');
    await page.fill('[name="state"]', 'NY');
    await page.fill('[name="zipcode"]', '10001');
    await page.click('button:has-text("Next")');

    // STEP 5: Document Upload
    await page.setInputFiles('[type="file"]', 'tests/fixtures/address-proof.pdf');
    await page.click('button:has-text("Next")');

    // STEP 6: Review
    await expect(page.locator('text=Address Change')).toBeVisible();
    await expect(page.locator('text=123 Main Street')).toBeVisible();
    await page.click('button:has-text("Submit")');

    // VERIFICATION
    await page.waitForText('Request Created Successfully');
    await expect(page.locator('[data-testid="request-confirmation"]')).toBeVisible();
  });
});
```

#### Test 3: Request Tracking Workflow

**File:** `tests/e2e/request-tracking.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Request Tracking', () => {
  test('should display request status and timeline', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // 1. Navigate to Tracking
    await page.click('a:has-text("Track Request")');

    // 2. Search for request
    await page.fill('[name="requestNumber"]', 'REQ001');
    await page.click('button:has-text("Search")');

    // 3. Verify status displays
    await expect(page.locator('text=In Progress')).toBeVisible();

    // 4. Verify timeline
    const timelineEvents = await page.locator('[data-testid="timeline-event"]').count();
    expect(timelineEvents).toBeGreaterThan(0);

    // 5. Verify SLA information
    await expect(page.locator('text=SLA')).toBeVisible();
  });

  test('should allow comment addition', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('a:has-text("Track Request")');

    // Search for request
    await page.fill('[name="requestNumber"]', 'REQ001');
    await page.click('button:has-text("Search")');

    // Add comment
    await page.fill('[name="comment"]', 'Waiting for document verification');
    await page.click('button:has-text("Add Comment")');

    // Verify comment added
    await expect(page.locator('text=Waiting for document')).toBeVisible();
  });
});
```

---

## Performance Testing

### Load Testing

**File:** `tests/performance/load-test.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
  test('dashboard should load in under 3 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000); // 3 seconds
    expect(loadTime).toBeGreaterThan(500); // At least 500ms
  });

  test('policy search should return results in under 1 second', async ({
    page,
  }) => {
    await page.goto('http://localhost:3000');
    await page.click('a:has-text("Policy Search")');

    const startTime = Date.now();

    await page.fill('[name="policyNumber"]', 'POL001');
    await page.click('button:has-text("Search")');

    await page.waitForSelector('table tbody tr');

    const searchTime = Date.now() - startTime;

    expect(searchTime).toBeLessThan(1000); // 1 second
  });

  test('should handle 100 concurrent requests without errors', async ({
    page,
  }) => {
    const promises = [];

    for (let i = 0; i < 100; i++) {
      promises.push(
        page.evaluate(() =>
          fetch('/api/policies/search?query=POL001').then(r => r.json())
        )
      );
    }

    const results = await Promise.all(promises);

    expect(results).toHaveLength(100);
    results.forEach(result => {
      expect(result.success).toBe(true);
    });
  });
});
```

---

## Security Testing

### Security Test Checklist

- [ ] **SQL Injection**: OData parameters sanitized
- [ ] **XSS Attack**: User input escaped in React
- [ ] **CSRF**: Anti-CSRF tokens in forms
- [ ] **Authentication**: Entra ID token validation
- [ ] **Authorization**: Role-based access verified
- [ ] **Data Masking**: PAN/Aadhaar fields masked
- [ ] **Encryption**: Sensitive data in transit encrypted

**File:** `tests/security/auth.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { sanitizeInput } from '../../utils/sanitize';

describe('Security', () => {
  it('should prevent XSS injection', () => {
    const malicious = '<script>alert("XSS")</script>';
    const sanitized = sanitizeInput(malicious);

    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
  });

  it('should validate OData queries', () => {
    const query = "'; DROP TABLE policies; --";
    const valid = validateODataQuery(query);

    expect(valid).toBe(false);
  });

  it('should mask PAN numbers', () => {
    const pan = '1234567890123456';
    const masked = maskPAN(pan);

    expect(masked).toBe('****7890');
    expect(masked).not.toContain('1234');
  });
});
```

---

## UAT Testing (User Acceptance Testing)

### UAT Test Plan

**Phase 1: Functional Verification** (Week 1)
- [ ] Dashboard displays all KPIs
- [ ] Policy search works for all criteria
- [ ] Request creation wizard functions
- [ ] Request tracking shows accurate status
- [ ] Notifications deliver correctly
- [ ] Reports generate accurate data

**Phase 2: Performance Validation** (Week 1)
- [ ] Dashboard loads in <3 seconds
- [ ] Search returns results in <1 second
- [ ] Bulk operations complete in <5 minutes
- [ ] No memory leaks over 1-hour session

**Phase 3: Security Validation** (Week 2)
- [ ] Users can only access assigned policies
- [ ] Sensitive data is masked appropriately
- [ ] Audit trail logs all actions
- [ ] No unauthorized API access

**Phase 4: Browser/Device Compatibility** (Week 2)
- [ ] Chrome latest
- [ ] Edge latest
- [ ] Safari latest
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)
- [ ] Tablet devices

### UAT Execution Checklist

```
Date: _______________
Tester: ______________
Environment: DEV / TEST / PROD

Test Case: _________________________
Expected Result: _____________________
Actual Result: ________________________
Status: PASS / FAIL / BLOCKED
Comments: _____________________________

Sign-off: ______________________
```

---

## Running All Tests

```bash
# Run entire test suite
npm run test:all

# With coverage report
npm run test:coverage

# Generate HTML coverage report
npm run test:coverage -- --reporter=html
# Open coverage/index.html
```

**Expected Output:**
```
✓ Unit Tests: 150+ tests passing
✓ Integration Tests: 25+ tests passing
✓ E2E Tests: 15+ tests passing
✓ Coverage: 85%+ overall
```

---

## CI/CD Testing

Tests automatically run in Azure DevOps pipeline:

```yaml
# azure-pipelines.yml
- task: Npm@1
  inputs:
    command: 'install'

- task: Npm@1
  inputs:
    command: 'custom'
    customCommand: 'run type-check'

- task: Npm@1
  inputs:
    command: 'custom'
    customCommand: 'run lint'

- task: Npm@1
  inputs:
    command: 'custom'
    customCommand: 'run test -- --run'

- task: PublishCodeCoverageResults@1
  inputs:
    codeCoverageTool: 'cobertura'
    summaryFileLocation: 'coverage/cobertura-coverage.xml'
```

Pipeline fails if:
- Type check fails
- ESLint finds errors
- Tests fail
- Coverage drops below 85%

---

## Resources

- [Vitest Documentation](https://vitest.dev)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Testing](https://playwright.dev)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
