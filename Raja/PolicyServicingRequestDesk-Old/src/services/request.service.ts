// ============================================================
// REQUEST SERVICE
// ============================================================
import { dataverseService } from './dataverse.service';
import type {
  ServiceRequest, RequestFilters, RequestListResult,
  RequestCreatePayload, EligibilityCheckResult, RequestCatalogItem,
  RequestTypeCode, RequestMetrics,
} from '../types/request.types';
import { DATAVERSE_TABLES, APP_CONFIG } from '../utils/constants';
import { mockRequests, mockRequestCatalogue } from './mock-data';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

class RequestService {
  async getRequestCatalogue(): Promise<RequestCatalogItem[]> {
    if (USE_MOCK) return mockRequestCatalogue;

    const response = await dataverseService.getList<Record<string, unknown>>(
      DATAVERSE_TABLES.REQUEST_CATALOG,
      {
        filter: 'psrd_isactive eq true',
        orderby: 'psrd_displayorder asc',
        expand: ['psrd_eligibilityrules', 'psrd_requireddocuments'],
      }
    );

    return response.value as unknown as RequestCatalogItem[];
  }

  async getCatalogItemByCode(requestTypeCode: RequestTypeCode): Promise<RequestCatalogItem> {
    if (USE_MOCK) {
      const item = mockRequestCatalogue.find((c) => c.requestCode === requestTypeCode);
      if (!item) throw new Error(`Request type ${requestTypeCode} not found`);
      return item;
    }

    const response = await dataverseService.getList<Record<string, unknown>>(
      DATAVERSE_TABLES.REQUEST_CATALOG,
      {
        filter: `psrd_requestcode eq '${requestTypeCode}'`,
        top: 1,
        expand: ['psrd_eligibilityrules', 'psrd_requireddocuments'],
      }
    );

    if (!response.value.length) throw new Error(`Request type ${requestTypeCode} not found`);
    return response.value[0] as unknown as RequestCatalogItem;
  }

  async checkEligibility(
    policyId: string,
    requestTypeCode: RequestTypeCode
  ): Promise<EligibilityCheckResult> {
    if (USE_MOCK) {
      return {
        isEligible: true,
        policyNumber: policyId,
        requestTypeCode,
        checkedAt: new Date().toISOString(),
        results: [
          { ruleCode: 'POLICY_ACTIVE', ruleName: 'Policy Active', isPassed: true, message: 'Policy is active', severity: 'Info' },
          { ruleCode: 'KYC_VALID', ruleName: 'KYC Valid', isPassed: true, message: 'KYC is verified', severity: 'Info' },
        ],
        failedRules: [],
        passedRules: [
          { ruleCode: 'POLICY_ACTIVE', ruleName: 'Policy Active', isPassed: true, message: 'Policy is active', severity: 'Info' },
          { ruleCode: 'KYC_VALID', ruleName: 'KYC Valid', isPassed: true, message: 'KYC is verified', severity: 'Info' },
        ],
      };
    }

    const result = await dataverseService.executeAction<
      { policyId: string; requestTypeCode: string },
      EligibilityCheckResult
    >('CheckEligibility', { policyId, requestTypeCode });

    return result;
  }

  async createRequest(payload: RequestCreatePayload): Promise<ServiceRequest> {
    if (USE_MOCK) {
      const requestNumber = `SR${Date.now()}`;
      const newRequest: ServiceRequest = {
        id: `req-${Date.now()}`,
        requestNumber,
        requestTypeCode: payload.requestTypeCode,
        requestTypeName: payload.requestTypeCode,
        policyId: payload.policyNumber,
        policyNumber: payload.policyNumber,
        policyHolderId: 'cust-001',
        policyHolderName: 'Mock Customer',
        status: 'Submitted',
        priority: payload.priority || 'Medium',
        submittedBy: 'current-user',
        submittedByName: 'Current User',
        submittedOn: new Date().toISOString(),
        currentApprovalLevel: 0,
        totalApprovalLevels: 0,
        slaBreached: false,
        requestData: payload.requestData,
        attachments: [],
        statusHistory: [
          {
            id: `hist-${Date.now()}`,
            requestId: `req-${Date.now()}`,
            fromStatus: 'Draft',
            toStatus: 'Submitted',
            changedBy: 'current-user',
            changedByName: 'Current User',
            changedOn: new Date().toISOString(),
            isSystemGenerated: false,
          },
        ],
        approvals: [],
        comments: [],
        correlationId: crypto.randomUUID(),
        source: 'Portal',
        channel: 'Customer',
        createdOn: new Date().toISOString(),
        modifiedOn: new Date().toISOString(),
      };
      mockRequests.unshift(newRequest);
      return newRequest;
    }

    // For real implementation - create request then upload attachments
    const createdRequest = await dataverseService.create<ServiceRequest>(
      DATAVERSE_TABLES.SERVICE_REQUESTS,
      {
        psrd_requesttypecode: payload.requestTypeCode,
        psrd_policynumber: payload.policyNumber,
        psrd_requestdata: JSON.stringify(payload.requestData),
        psrd_remarks: payload.remarks,
        psrd_priority: payload.priority || 'Medium',
        psrd_status: 'Submitted',
        psrd_source: 'Portal',
        psrd_channel: 'Customer',
        psrd_correlationid: crypto.randomUUID(),
      } as Partial<ServiceRequest>
    );

    // Upload attachments if any
    if (payload.attachments?.length) {
      await this.uploadAttachments(createdRequest.id, payload.attachments);
    }

    return createdRequest;
  }

  private async uploadAttachments(requestId: string, files: File[]): Promise<void> {
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('requestId', requestId);
      formData.append('documentCode', file.name);
      // Upload via Power Platform file upload API
    }
  }

  async getRequests(filters: RequestFilters): Promise<RequestListResult> {
    if (USE_MOCK) {
      return this.mockGetRequests(filters);
    }

    const filterConditions: string[] = [];

    if (filters.status?.length) {
      const statusFilter = filters.status.map((s) => `psrd_status eq '${s}'`).join(' or ');
      filterConditions.push(`(${statusFilter})`);
    }
    if (filters.requestTypeCode?.length) {
      const typeFilter = filters.requestTypeCode.map((t) => `psrd_requesttypecode eq '${t}'`).join(' or ');
      filterConditions.push(`(${typeFilter})`);
    }
    if (filters.policyNumber) {
      filterConditions.push(`psrd_policynumber eq '${filters.policyNumber}'`);
    }
    if (filters.slaBreached !== undefined) {
      filterConditions.push(`psrd_slabreached eq ${filters.slaBreached}`);
    }
    if (filters.dateFrom) {
      filterConditions.push(`psrd_submittedon ge ${filters.dateFrom}`);
    }
    if (filters.dateTo) {
      filterConditions.push(`psrd_submittedon le ${filters.dateTo}`);
    }

    const page = filters.page || 1;
    const pageSize = filters.pageSize || APP_CONFIG.DEFAULT_PAGE_SIZE;

    const response = await dataverseService.getList<Record<string, unknown>>(
      DATAVERSE_TABLES.SERVICE_REQUESTS,
      {
        filter: filterConditions.join(' and ') || undefined,
        top: pageSize,
        skip: (page - 1) * pageSize,
        count: true,
        orderby: filters.sortBy
          ? `${filters.sortBy} ${filters.sortOrder || 'desc'}`
          : 'psrd_createdon desc',
        expand: ['psrd_statushistory', 'psrd_approvals'],
      }
    );

    return {
      requests: response.value as unknown as ServiceRequest[],
      totalCount: response['@odata.count'] || 0,
      page,
      pageSize,
      hasMore: !!response['@odata.nextLink'],
    };
  }

  async getRequestById(requestId: string): Promise<ServiceRequest> {
    if (USE_MOCK) {
      const request = mockRequests.find((r) => r.id === requestId || r.requestNumber === requestId);
      if (!request) throw new Error(`Request ${requestId} not found`);
      return request;
    }

    return await dataverseService.getById<ServiceRequest>(
      DATAVERSE_TABLES.SERVICE_REQUESTS,
      requestId,
      {
        expand: ['psrd_statushistory', 'psrd_approvals', 'psrd_attachments', 'psrd_comments'],
      }
    );
  }

  async approveRequest(requestId: string, remarks?: string): Promise<void> {
    if (USE_MOCK) {
      const request = mockRequests.find((r) => r.id === requestId);
      if (request) {
        request.status = 'Approved';
        request.modifiedOn = new Date().toISOString();
      }
      return;
    }

    await dataverseService.executeAction('ApproveServiceRequest', { requestId, remarks });
  }

  async rejectRequest(requestId: string, remarks: string): Promise<void> {
    if (USE_MOCK) {
      const request = mockRequests.find((r) => r.id === requestId);
      if (request) {
        request.status = 'Rejected';
        request.modifiedOn = new Date().toISOString();
      }
      return;
    }

    await dataverseService.executeAction('RejectServiceRequest', { requestId, remarks });
  }

  async cancelRequest(requestId: string, reason: string): Promise<void> {
    if (USE_MOCK) {
      const request = mockRequests.find((r) => r.id === requestId);
      if (request) {
        request.status = 'Cancelled';
        request.modifiedOn = new Date().toISOString();
      }
      return;
    }

    await dataverseService.executeAction('CancelServiceRequest', { requestId, reason });
  }

  async addComment(requestId: string, commentText: string, isInternal: boolean): Promise<void> {
    if (USE_MOCK) return;

    await dataverseService.create(DATAVERSE_TABLES.COMMENTS, {
      psrd_requestid: requestId,
      psrd_commenttext: commentText,
      psrd_isinternal: isInternal,
    });
  }

  async getDashboardMetrics(): Promise<RequestMetrics> {
    if (USE_MOCK) {
      return {
        total: 847,
        open: 124,
        pendingApproval: 38,
        slaBreached: 12,
        completedToday: 45,
        averageTAT: 2.4,
        byStatus: {
          Draft: 5,
          Submitted: 42,
          ValidationPending: 18,
          EligibilityCheckPassed: 15,
          EligibilityCheckFailed: 3,
          PendingApproval: 38,
          Approved: 22,
          Rejected: 15,
          InProgress: 27,
          Completed: 648,
          Cancelled: 10,
          Escalated: 4,
          OnHold: 2,
        },
        byType: {
          'Address Change': 185,
          'Nominee Change': 142,
          'Premium Mode Change': 98,
          'Mobile Update': 127,
          'Bank Account Change': 76,
          'Policy Reinstatement': 45,
          'Other': 174,
        },
        byPriority: {
          Low: 210,
          Medium: 450,
          High: 162,
          Critical: 25,
        },
      };
    }

    return await dataverseService.executeAction<Record<string, never>, RequestMetrics>(
      'GetDashboardMetrics', {}
    );
  }

  private mockGetRequests(filters: RequestFilters): RequestListResult {
    let filtered = [...mockRequests];

    if (filters.status?.length) {
      filtered = filtered.filter((r) => filters.status!.includes(r.status));
    }
    if (filters.policyNumber) {
      filtered = filtered.filter((r) =>
        r.policyNumber.includes(filters.policyNumber!)
      );
    }
    if (filters.slaBreached !== undefined) {
      filtered = filtered.filter((r) => r.slaBreached === filters.slaBreached);
    }

    const page = filters.page || 1;
    const pageSize = filters.pageSize || APP_CONFIG.DEFAULT_PAGE_SIZE;
    const start = (page - 1) * pageSize;

    return {
      requests: filtered.slice(start, start + pageSize),
      totalCount: filtered.length,
      page,
      pageSize,
      hasMore: start + pageSize < filtered.length,
    };
  }
}

export const requestService = new RequestService();
