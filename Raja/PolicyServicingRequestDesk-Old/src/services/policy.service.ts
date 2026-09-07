// ============================================================
// POLICY SERVICE
// ============================================================
import { dataverseService } from './dataverse.service';
import type {
  Policy, PolicySearchParams, PolicySearchResult,
} from '../types/policy.types';
import { DATAVERSE_TABLES, APP_CONFIG } from '../utils/constants';
import { mockPolicies } from './mock-data';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

class PolicyService {
  private cache = new Map<string, { data: unknown; expiresAt: number }>();

  private getCached<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  private setCache<T>(key: string, data: T, ttlMs = APP_CONFIG.CACHE_DURATION_MS): void {
    this.cache.set(key, { data, expiresAt: Date.now() + ttlMs });
  }

  async searchPolicies(params: PolicySearchParams): Promise<PolicySearchResult> {
    const cacheKey = `search:${JSON.stringify(params)}`;
    const cached = this.getCached<PolicySearchResult>(cacheKey);
    if (cached) return cached;

    if (USE_MOCK) {
      const result = this.mockSearch(params);
      this.setCache(cacheKey, result);
      return result;
    }

    const filters: string[] = [];

    if (params.policyNumber) {
      filters.push(`psrd_policynumber eq '${params.policyNumber}'`);
    }
    if (params.customerId) {
      filters.push(`psrd_customerid eq '${params.customerId}'`);
    }
    if (params.mobile) {
      filters.push(`psrd_mobile eq '${params.mobile}'`);
    }
    if (params.email) {
      filters.push(`psrd_email eq '${params.email}'`);
    }
    if (params.status?.length) {
      const statusFilter = params.status.map((s) => `psrd_status eq '${s}'`).join(' or ');
      filters.push(`(${statusFilter})`);
    }

    const response = await dataverseService.getList<Record<string, unknown>>(DATAVERSE_TABLES.POLICIES, {
      filter: filters.join(' and ') || undefined,
      top: params.pageSize || APP_CONFIG.DEFAULT_PAGE_SIZE,
      skip: ((params.page || 1) - 1) * (params.pageSize || APP_CONFIG.DEFAULT_PAGE_SIZE),
      count: true,
      orderby: params.sortBy
        ? `${params.sortBy} ${params.sortOrder || 'asc'}`
        : 'psrd_policynumber asc',
      expand: ['psrd_customer', 'psrd_nominees'],
    });

    const result: PolicySearchResult = {
      policies: response.value.map(this.mapToPolicyModel),
      totalCount: response['@odata.count'] || 0,
      page: params.page || 1,
      pageSize: params.pageSize || APP_CONFIG.DEFAULT_PAGE_SIZE,
      hasMore: !!response['@odata.nextLink'],
    };

    this.setCache(cacheKey, result);
    return result;
  }

  async getPolicyById(policyId: string): Promise<Policy> {
    const cacheKey = `policy:${policyId}`;
    const cached = this.getCached<Policy>(cacheKey);
    if (cached) return cached;

    if (USE_MOCK) {
      const policy = mockPolicies.find((p) => p.id === policyId || p.policyNumber === policyId);
      if (!policy) throw new Error('Policy not found');
      this.setCache(cacheKey, policy, 60 * 1000);
      return policy;
    }

    const data = await dataverseService.getById<Record<string, unknown>>(
      DATAVERSE_TABLES.POLICIES,
      policyId,
      {
        expand: ['psrd_customer', 'psrd_nominees', 'psrd_bankaccounts', 'psrd_riders'],
      }
    );

    const policy = this.mapToPolicyModel(data);
    this.setCache(cacheKey, policy, 60 * 1000);
    return policy;
  }

  async getPolicyByNumber(policyNumber: string): Promise<Policy> {
    if (USE_MOCK) {
      const policy = mockPolicies.find((p) => p.policyNumber === policyNumber);
      if (!policy) throw new Error(`Policy ${policyNumber} not found`);
      return policy;
    }

    const response = await dataverseService.getList<Record<string, unknown>>(
      DATAVERSE_TABLES.POLICIES,
      {
        filter: `psrd_policynumber eq '${policyNumber}'`,
        top: 1,
        expand: ['psrd_customer', 'psrd_nominees'],
      }
    );

    if (!response.value.length) {
      throw new Error(`Policy ${policyNumber} not found`);
    }

    return this.mapToPolicyModel(response.value[0]);
  }

  invalidateCache(policyId?: string): void {
    if (policyId) {
      this.cache.delete(`policy:${policyId}`);
      // Also clear search caches as they may contain this policy
      [...this.cache.keys()].filter((k) => k.startsWith('search:')).forEach((k) => this.cache.delete(k));
    } else {
      this.cache.clear();
    }
  }

  private mockSearch(params: PolicySearchParams): PolicySearchResult {
    let filtered = [...mockPolicies];

    if (params.policyNumber) {
      filtered = filtered.filter((p) =>
        p.policyNumber.toLowerCase().includes(params.policyNumber!.toLowerCase())
      );
    }
    if (params.mobile) {
      filtered = filtered.filter((p) =>
        p.policyHolder.mobile.includes(params.mobile!)
      );
    }
    if (params.email) {
      filtered = filtered.filter((p) =>
        p.policyHolder.email.toLowerCase().includes(params.email!.toLowerCase())
      );
    }
    if (params.status?.length) {
      filtered = filtered.filter((p) => params.status!.includes(p.status));
    }

    const page = params.page || 1;
    const pageSize = params.pageSize || APP_CONFIG.DEFAULT_PAGE_SIZE;
    const start = (page - 1) * pageSize;
    const paginated = filtered.slice(start, start + pageSize);

    return {
      policies: paginated,
      totalCount: filtered.length,
      page,
      pageSize,
      hasMore: start + pageSize < filtered.length,
    };
  }

  private mapToPolicyModel(data: Record<string, unknown>): Policy {
    // Map Dataverse fields to domain model
    return data as unknown as Policy;
  }
}

export const policyService = new PolicyService();
