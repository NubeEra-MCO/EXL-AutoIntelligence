// ============================================================
// DATAVERSE API SERVICE - Base Layer
// ============================================================
import axios, { AxiosInstance, AxiosError } from 'axios';
import { APP_CONFIG } from '../utils/constants';

export interface DataverseQueryOptions {
  select?: string[];
  filter?: string;
  expand?: string[];
  orderby?: string;
  top?: number;
  skip?: number;
  count?: boolean;
  search?: string;
}

export interface DataverseResponse<T> {
  value: T[];
  '@odata.count'?: number;
  '@odata.nextLink'?: string;
}

class DataverseService {
  private client: AxiosInstance;
  private baseUrl: string;
  private token: string = '';

  constructor() {
    this.baseUrl = '';
    this.client = axios.create({
      headers: {
        'Content-Type': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        Prefer: 'odata.include-annotations="*"',
      },
    });

    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers['Authorization'] = `Bearer ${this.token}`;
      }
      config.headers['x-correlation-id'] = crypto.randomUUID();
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Re-authenticate via Power Platform context
          console.warn('Authentication required');
        }
        if (error.response?.status === 429) {
          // Rate limit - retry after delay
          const retryAfter = parseInt(error.response.headers['retry-after'] || '5');
          await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
          return this.client.request(error.config!);
        }
        return Promise.reject(this.parseError(error));
      }
    );
  }

  initialize(environmentUrl: string, token?: string): void {
    this.baseUrl = `${environmentUrl}/api/data/${APP_CONFIG.DATAVERSE_API_VERSION}`;
    this.client.defaults.baseURL = this.baseUrl;
    if (token) this.token = token;
  }

  setToken(token: string): void {
    this.token = token;
  }

  buildODataUrl(table: string, options: DataverseQueryOptions = {}): string {
    const params: string[] = [];

    if (options.select?.length) params.push(`$select=${options.select.join(',')}`);
    if (options.filter) params.push(`$filter=${options.filter}`);
    if (options.expand?.length) params.push(`$expand=${options.expand.join(',')}`);
    if (options.orderby) params.push(`$orderby=${options.orderby}`);
    if (options.top) params.push(`$top=${options.top}`);
    if (options.skip) params.push(`$skip=${options.skip}`);
    if (options.count) params.push(`$count=true`);
    if (options.search) params.push(`$search=${encodeURIComponent(options.search)}`);

    const queryString = params.length ? `?${params.join('&')}` : '';
    return `/${table}${queryString}`;
  }

  async getList<T>(table: string, options: DataverseQueryOptions = {}): Promise<DataverseResponse<T>> {
    const url = this.buildODataUrl(table, options);
    const response = await this.client.get<DataverseResponse<T>>(url);
    return response.data;
  }

  async getById<T>(table: string, id: string, options: DataverseQueryOptions = {}): Promise<T> {
    const params: string[] = [];
    if (options.select?.length) params.push(`$select=${options.select.join(',')}`);
    if (options.expand?.length) params.push(`$expand=${options.expand.join(',')}`);
    const queryString = params.length ? `?${params.join('&')}` : '';
    const response = await this.client.get<T>(`/${table}(${id})${queryString}`);
    return response.data;
  }

  async create<T>(table: string, data: Partial<T>): Promise<T> {
    const response = await this.client.post<T>(`/${table}`, data, {
      headers: { Prefer: 'return=representation' },
    });
    return response.data;
  }

  async update<T>(table: string, id: string, data: Partial<T>): Promise<void> {
    await this.client.patch(`/${table}(${id})`, data);
  }

  async delete(table: string, id: string): Promise<void> {
    await this.client.delete(`/${table}(${id})`);
  }

  async executeAction<TInput, TOutput>(
    actionName: string,
    input: TInput,
    entitySetName?: string,
    entityId?: string
  ): Promise<TOutput> {
    const url = entitySetName && entityId
      ? `/${entitySetName}(${entityId})/Microsoft.Dynamics.CRM.${actionName}`
      : `/Microsoft.Dynamics.CRM.${actionName}`;
    const response = await this.client.post<TOutput>(url, input);
    return response.data;
  }

  async executeFetch<T>(fetchXml: string): Promise<DataverseResponse<T>> {
    const encoded = encodeURIComponent(fetchXml);
    const response = await this.client.get<DataverseResponse<T>>(`/psrd_servicerequests?fetchXml=${encoded}`);
    return response.data;
  }

  private parseError(error: AxiosError): Error {
    const responseData = error.response?.data as Record<string, unknown> | undefined;
    const errorObj = responseData?.error as Record<string, unknown> | undefined;
    const message = errorObj?.message as string | undefined;
    if (message) {
      return new Error(message);
    }
    if (error.message === 'Network Error') {
      return new Error('Network connection failed. Please check your connection.');
    }
    return new Error(error.message || 'An unexpected error occurred');
  }

  // Batch operations
  async executeBatch(requests: BatchRequest[]): Promise<BatchResponse[]> {
    const batchId = `batch_${Date.now()}`;
    const changesetId = `changeset_${Date.now()}`;
    
    const batchBody = this.buildBatchBody(requests, batchId, changesetId);
    
    const response = await this.client.post('/$batch', batchBody, {
      headers: {
        'Content-Type': `multipart/mixed;boundary=${batchId}`,
      },
    });
    
    return this.parseBatchResponse(response.data);
  }

  private buildBatchBody(requests: BatchRequest[], batchId: string, _changesetId: string): string {
    let body = '';
    requests.forEach((req, _index) => {
      body += `--${batchId}\r\nContent-Type: application/http\r\nContent-Transfer-Encoding: binary\r\n\r\n`;
      body += `${req.method} ${req.url} HTTP/1.1\r\n`;
      body += `Content-Type: application/json\r\n\r\n`;
      if (req.body) body += JSON.stringify(req.body);
      body += '\r\n';
    });
    body += `--${batchId}--`;
    return body;
  }

  private parseBatchResponse(_responseData: unknown): BatchResponse[] {
    // Parse multipart batch response - simplified implementation
    return [];
  }
}

export interface BatchRequest {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  url: string;
  body?: unknown;
}

export interface BatchResponse {
  statusCode: number;
  body: unknown;
}

export const dataverseService = new DataverseService();
