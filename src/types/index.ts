// User and Authentication Types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  balance: number;
  company: Company;
  created_at: string;
  is_staff?: boolean;
}

export interface Company {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
}

// Store and Product Types
export interface Store {
  id: number;
  name: string;
  location: string;
  company: number;
  company_name: string;
  points_balance: number;
  total_sales: number;
  email?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: number;
  store: number;
  store_name: string;
  name: string;
  description?: string;
  base_cost: number;
  margin_percentage: number;
  retail_price: number;
  inventory: number;
  is_active: boolean;
  created_at: string;
  margin_amount: number;
  points_earned: number;
}

// Invoice and Transaction Types
export interface Invoice {
  id: number;
  image_url: string;
  extracted_data: {
    store?: string;
    total?: number;
    items?: Array<{
      name: string;
      price: number;
      quantity: number;
    }>;
    date?: string;
  };
  reliability_score: number;
  status: 'pending' | 'approved' | 'rejected';
  total_amount: number;
  store_name: string;
  products: string[];
  created_at: string;
  upload_timestamp: string;
  points_earned?: number;
  rejection_reason?: string;
}

export interface Transaction {
  id: number;
  type: 'earn' | 'redeem';
  points: string; // Backend returns as string
  product_name?: string;
  store_name?: string;
  description?: string;
  created_at: string;
  expiration_date?: string;
  is_expired: boolean;
}

export interface ReimbursementRequest {
  id: number;
  store: number;
  redemption_transaction: number;
  amount: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  details: {
    product_name: string;
    customer_username: string;
    redemption_date: string;
  };
  admin_notes?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
  product_name: string;
  customer_username: string;
}

// API Request/Response Types
export interface InvoiceUploadRequest {
  image: File;
}

export interface RedemptionRequest {
  product_id: number;
  quantity: number;
}

export interface RedemptionResponse {
  message: string;
  transaction: Transaction;
  reimbursement_request: ReimbursementRequest;
  new_balance: number;
}

// Updated to match Django backend response
export interface WalletBalance {
  balance: string; // Backend returns as string
  recent_transactions: Transaction[];
  total_earned: string; // Backend returns as string
  total_redeemed: string; // Backend returns as string
}

// Dashboard and Analytics Types
export interface DashboardStats {
  total_users: number;
  total_stores: number;
  total_products: number;
  total_transactions: number;
  total_points_issued: number;
  total_points_redeemed: number;
  pending_invoices: number;
  pending_reimbursements: number;
  recent_transactions: Transaction[];
  top_stores: Array<{
    store: Store;
    transaction_count: number;
    points_earned: number;
  }>;
}

export interface SystemConfiguration {
  [key: string]: {
    value: string;
    description: string;
  };
}

// API Response Wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

// Updated to match Django backend pagination response
export interface PaginatedResponse<T> {
  transactions?: T[]; // For transaction history
  results?: T[]; // For other paginated endpoints
  total_count: number;
  page: number;
  page_size: number;
  has_next: boolean;
}

// Filter and Search Types
export interface StoreFilters {
  location?: string;
  search?: string;
}

export interface ProductFilters {
  store?: number;
  search?: string;
  min_points?: number;
  max_points?: number;
}

export interface TransactionFilters {
  type?: 'earn' | 'redeem';
  start_date?: string;
  end_date?: string;
  page?: number;
  page_size?: number;
}

// Health Check
export interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  database: string;
  version: string;
  error?: string;
} 