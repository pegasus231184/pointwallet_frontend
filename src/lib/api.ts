import axios, { AxiosInstance, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  Store,
  Product,
  Invoice,
  Transaction,
  ReimbursementRequest,
  ProductReimbursementRequest,
  StoreCommission,
  StoreAnalytics,
  ProductRecommendation,
  RedemptionRequest,
  RedemptionResponse,
  WalletBalance,
  DashboardStats,
  SystemConfiguration,
  PaginatedResponse,
  StoreFilters,
  ProductFilters,
  TransactionFilters,
  HealthCheck,
  InvoiceProcessingStatus,
} from '@/types';

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    // Use environment variable or default to relative path for Docker
    // In Docker, frontend and backend are behind the same nginx proxy
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';
    
    // If the baseURL doesn't start with http, assume it's a relative path
    if (!this.baseURL.startsWith('http')) {
      // In production/Docker, use relative path
      this.baseURL = this.baseURL;
    }
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            await this.refreshToken();
            const token = this.getAccessToken();
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Token management
  private getAccessToken(): string | null {
    return Cookies.get('access_token') || null;
  }

  private getRefreshToken(): string | null {
    return Cookies.get('refresh_token') || null;
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    Cookies.set('access_token', accessToken, { expires: 1 }); // 1 day
    Cookies.set('refresh_token', refreshToken, { expires: 7 }); // 7 days
  }

  private clearTokens(): void {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login/', credentials);
    const { tokens } = response.data;
    this.setTokens(tokens.access, tokens.refresh);
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/register/', userData);
    const { tokens } = response.data;
    this.setTokens(tokens.access, tokens.refresh);
    return response.data;
  }

  async refreshToken(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.client.post<{ access: string }>('/auth/token/refresh/', {
      refresh: refreshToken,
    });

    const newAccessToken = response.data.access;
    const currentRefreshToken = this.getRefreshToken();
    
    if (currentRefreshToken) {
      this.setTokens(newAccessToken, currentRefreshToken);
    }
  }

  logout(): void {
    this.clearTokens();
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  // User endpoints
  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<User>('/auth/profile/');
    return response.data;
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await this.client.patch<User>('/auth/profile/', userData);
    return response.data;
  }

  // Wallet endpoints
  async getWalletBalance(): Promise<WalletBalance> {
    const response = await this.client.get<WalletBalance>('/auth/wallet/balance/');
    return response.data;
  }

  async getTransactionHistory(filters?: TransactionFilters): Promise<PaginatedResponse<Transaction>> {
    const response = await this.client.get<PaginatedResponse<Transaction>>('/auth/wallet/transactions/', {
      params: filters,
    });
    return response.data;
  }

  // Store endpoints
  async getStores(filters?: StoreFilters): Promise<PaginatedResponse<Store>> {
    const response = await this.client.get<PaginatedResponse<Store>>('/wallet/stores/', {
      params: filters,
    });
    return response.data;
  }

  async getStore(id: number): Promise<Store> {
    const response = await this.client.get<Store>(`/wallet/stores/${id}/`);
    return response.data;
  }

  // Store Analytics endpoints
  async getStoreAnalytics(storeId: number): Promise<StoreAnalytics> {
    const response = await this.client.get<StoreAnalytics>(`/stores/${storeId}/analytics/`);
    return response.data;
  }

  async getStoreCommissions(storeId: number): Promise<PaginatedResponse<StoreCommission>> {
    const response = await this.client.get<PaginatedResponse<StoreCommission>>(`/stores/${storeId}/commissions/`);
    return response.data;
  }

  // Product endpoints
  async getProducts(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
    const response = await this.client.get<PaginatedResponse<Product>>('/wallet/products/', {
      params: filters,
    });
    return response.data;
  }

  async getProduct(id: number): Promise<Product> {
    const response = await this.client.get<Product>(`/wallet/products/${id}/`);
    return response.data;
  }

  // Product Recommendations
  async getProductRecommendations(userId?: number): Promise<ProductRecommendation[]> {
    const response = await this.client.get<ProductRecommendation[]>('/wallet/products/recommendations/', {
      params: userId ? { user_id: userId } : {},
    });
    return response.data;
  }

  async redeemProduct(request: RedemptionRequest): Promise<RedemptionResponse> {
    const response = await this.client.post<RedemptionResponse>('/invoices/redeem/', request);
    return response.data;
  }

  // Product Reimbursement Management
  async getProductReimbursementRequests(storeId?: number): Promise<PaginatedResponse<ProductReimbursementRequest>> {
    const response = await this.client.get<PaginatedResponse<ProductReimbursementRequest>>('/stores/product-reimbursements/', {
      params: storeId ? { store_id: storeId } : {},
    });
    return response.data;
  }

  async updateProductReimbursementRequest(
    id: number, 
    status: 'approved' | 'shipped' | 'rejected',
    adminNotes?: string
  ): Promise<void> {
    await this.client.patch(`/stores/product-reimbursements/${id}/`, {
      status,
      admin_notes: adminNotes,
    });
  }

  // Invoice endpoints
  async uploadInvoice(file: File): Promise<Invoice> {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await this.client.post<{ invoice: Invoice }>('/invoices/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.invoice;
  }

  async getInvoices(): Promise<PaginatedResponse<Invoice>> {
    const response = await this.client.get<PaginatedResponse<Invoice>>('/invoices/list/');
    return response.data;
  }

  async getInvoiceProcessingStatus(invoiceId: number): Promise<InvoiceProcessingStatus> {
    const response = await this.client.get<InvoiceProcessingStatus>(`/invoices/${invoiceId}/status/`);
    return response.data;
  }

  // Admin endpoints
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.client.get<DashboardStats>('/wallet/stats/');
    return response.data;
  }

  async getSystemConfiguration(): Promise<SystemConfiguration> {
    const response = await this.client.get<{ configurations: SystemConfiguration }>('/wallet/configuration/');
    return response.data.configurations;
  }

  async updateSystemConfiguration(key: string, value: string, description?: string): Promise<void> {
    await this.client.post('/wallet/configuration/', {
      key,
      value,
      description,
    });
  }

  async getReimbursementRequests(): Promise<PaginatedResponse<ReimbursementRequest>> {
    const response = await this.client.get<PaginatedResponse<ReimbursementRequest>>('/invoices/reimbursements/');
    return response.data;
  }

  async approveReimbursement(id: number, adminNotes?: string): Promise<void> {
    await this.client.post('/invoices/reimbursements/approve/', {
      reimbursement_id: id,
      admin_notes: adminNotes,
    });
  }

  // Health Check
  async healthCheck(): Promise<HealthCheck> {
    const response = await this.client.get<HealthCheck>('/health/');
    return response.data;
  }

  // File Upload Helper
  async uploadFile(file: File, endpoint: string): Promise<unknown> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await this.client.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }

  // Generic API call method
  async apiCall<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    data?: unknown,
    config?: Record<string, unknown>
  ): Promise<T> {
    const response = await this.client.request({
      method,
      url: endpoint,
      data,
      ...config,
    });
    
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient; 