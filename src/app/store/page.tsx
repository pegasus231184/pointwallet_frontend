'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { formatPoints, formatDate } from '@/lib/utils';
import { 
  Store as StoreIcon, 
  Package, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle,
  BarChart3,
  Users,
  ShoppingCart,
  Award,
  Calendar,
  RefreshCw,
  Eye,
  FileText,
  Truck,
  XCircle
} from 'lucide-react';
import { 
  StoreAnalytics, 
  ProductReimbursementRequest, 
  StoreCommission,
  Product,
  Transaction 
} from '@/types';

const StoreDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<StoreAnalytics | null>(null);
  const [reimbursementRequests, setReimbursementRequests] = useState<ProductReimbursementRequest[]>([]);
  const [commissions, setCommissions] = useState<StoreCommission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'reimbursements' | 'commissions' | 'products'>('overview');
  const [processingRequest, setProcessingRequest] = useState<number | null>(null);

  const storeId = user?.id; // In a real app, this would come from the user's store association

  const fetchStoreData = async () => {
    if (!storeId) return;
    
    try {
      setLoading(true);
      const [analyticsResponse, reimbursementsResponse, commissionsResponse] = await Promise.all([
        apiClient.getStoreAnalytics(storeId).catch(() => null),
        apiClient.getProductReimbursementRequests(storeId).catch(() => ({ results: [] })),
        apiClient.getStoreCommissions(storeId).catch(() => ({ results: [] }))
      ]);
      
      setAnalytics(analyticsResponse);
      setReimbursementRequests(reimbursementsResponse.results || []);
      setCommissions(commissionsResponse.results || []);
    } catch (err) {
      setError('Failed to load store data');
      console.error('Error loading store data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, [storeId]);

  const handleReimbursementAction = async (
    requestId: number, 
    action: 'approved' | 'shipped' | 'rejected',
    notes?: string
  ) => {
    try {
      setProcessingRequest(requestId);
      await apiClient.updateProductReimbursementRequest(requestId, action, notes);
      
      // Refresh data
      fetchStoreData();
      alert(`Reimbursement request ${action} successfully!`);
    } catch (err) {
      console.error(`Failed to ${action} reimbursement:`, err);
      alert(`Failed to ${action} reimbursement. Please try again.`);
    } finally {
      setProcessingRequest(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-blue-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchStoreData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Store Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.first_name}! Here's your store overview.</p>
          </div>
          <button
            onClick={fetchStoreData}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Commission</p>
                <p className="text-2xl font-bold text-gray-900">{formatPoints(analytics.total_commission)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Store Points</p>
                <p className="text-2xl font-bold text-gray-900">{formatPoints(analytics.total_store_points)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Package className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Products Redeemed</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.products_redeemed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Clock className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.pending_reimbursements}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('reimbursements')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reimbursements'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Reimbursement Requests
              {reimbursementRequests.filter(r => r.status === 'pending').length > 0 && (
                <span className="ml-2 bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs">
                  {reimbursementRequests.filter(r => r.status === 'pending').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('commissions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'commissions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Commissions
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'products'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Top Products
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && analytics && (
          <div className="space-y-6">
            {/* Recent Transactions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
              {analytics.recent_transactions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No recent transactions</p>
              ) : (
                <div className="space-y-3">
                  {analytics.recent_transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-3 ${
                          transaction.type === 'earn' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-gray-500">{formatDate(transaction.created_at)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          transaction.type === 'earn' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'earn' ? '+' : '-'}{formatPoints(parseFloat(transaction.points))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Commission History Chart Placeholder */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Commission Trends</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Commission analytics coming soon</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reimbursement Requests Tab */}
        {activeTab === 'reimbursements' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Product Reimbursement Requests</h3>
              <div className="text-sm text-gray-500">
                {reimbursementRequests.filter(r => r.status === 'pending').length} pending requests
              </div>
            </div>
            
            {reimbursementRequests.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">No reimbursement requests yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reimbursementRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(request.status)}
                        <div>
                          <div className="font-medium text-gray-900">
                            {request.quantity}x {request.product_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Customer: {request.customer_username}
                          </div>
                          <div className="text-sm text-gray-500">
                            Requested: {formatDate(request.requested_at)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                        <div className="text-sm text-gray-600 mt-1">
                          {formatPoints(request.total_points_cost)} points
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    {request.status === 'pending' && (
                      <div className="mt-4 flex space-x-2">
                        <button
                          onClick={() => handleReimbursementAction(request.id, 'approved', 'Approved by store manager')}
                          disabled={processingRequest === request.id}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReimbursementAction(request.id, 'rejected', 'Rejected - insufficient inventory')}
                          disabled={processingRequest === request.id}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    
                    {request.status === 'approved' && (
                      <div className="mt-4">
                        <button
                          onClick={() => handleReimbursementAction(request.id, 'shipped', 'Product shipped to store')}
                          disabled={processingRequest === request.id}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                        >
                          Mark as Shipped
                        </button>
                      </div>
                    )}
                    
                    {request.admin_notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                        <strong>Notes:</strong> {request.admin_notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Commissions Tab */}
        {activeTab === 'commissions' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Commission History</h3>
            
            {commissions.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">No commissions earned yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {commissions.map((commission) => (
                  <div key={commission.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {commission.transaction_type === 'redemption' ? 'Redemption' : 'Sale'} Commission
                        </div>
                        <div className="text-sm text-gray-500">
                          Product: {commission.product_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(commission.created_at)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          +{formatPoints(commission.commission_amount)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {commission.commission_percentage}% commission
                        </div>
                      </div>
                    </div>
                    
                    {commission.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                        {commission.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Top Products Tab */}
        {activeTab === 'products' && analytics && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Most Redeemed Products</h3>
            
            {analytics.most_redeemed_products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">No product redemptions yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.most_redeemed_products.map((item, index) => (
                  <div key={item.product.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold">#{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{item.product.name}</div>
                          <div className="text-sm text-gray-500">{item.product.description}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          {item.total_quantity} redeemed
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatPoints(item.total_points)} points total
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreDashboard; 