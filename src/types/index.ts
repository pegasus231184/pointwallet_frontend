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
  password2: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'customer' | 'store_admin';
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
  store_points_balance: number;
  total_sales: number;
  email?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

// Updated Product model to match backend structure
export interface Product {
  id: number;
  company: number;
  company_name: string;
  name: string;
  description?: string;
  points_value: number;
  points_cost: number;
  store_points_earned: number;
  inventory: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Store Commission model
export interface StoreCommission {
  id: number;
  store: number;
  store_name: string;
  transaction: number;
  commission_amount: number;
  commission_percentage: number;
  transaction_type: 'sale' | 'redemption';
  notes?: string;
  created_at: string;
  product_name?: string;
}

// Product Reimbursement Request model
export interface ProductReimbursementRequest {
  id: number;
  store: number;
  store_name: string;
  product: number;
  product_name: string;
  customer_transaction: number;
  quantity: number;
  total_points_cost: number;
  status: 'pending' | 'approved' | 'shipped' | 'rejected';
  requested_at: string;
  processed_at?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  customer_username: string;
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
  store_id?: number;
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

// Store Analytics Types
export interface StoreAnalytics {
  store_id: number;
  total_commission: number;
  total_store_points: number;
  total_reimbursement_requests: number;
  pending_reimbursements: number;
  products_redeemed: number;
  most_redeemed_products: Array<{
    product: Product;
    total_quantity: number;
    total_points: number;
  }>;
  commission_history: StoreCommission[];
  recent_transactions: Transaction[];
}

// Product Recommendation Types
export interface ProductRecommendation {
  product: Product;
  recommendation_score: number;
  reason: 'affordable' | 'popular' | 'new' | 'frequent_customer';
  discount_percentage?: number;
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
  search?: string;
  company?: number;
  min_points?: number;
  max_points?: number;
  is_active?: boolean;
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

// Mobile and Camera Types
export interface CameraCapture {
  file: File;
  preview: string;
  timestamp: string;
}

export interface InvoiceProcessingStatus {
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
  invoice?: Invoice;
} 