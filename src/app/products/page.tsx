'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { formatPoints } from '@/lib/utils';
import { 
  Search, 
  Filter, 
  ShoppingCart, 
  Star, 
  MapPin,
  Package,
  AlertCircle,
  CheckCircle,
  Zap,
  TrendingUp
} from 'lucide-react';
import { Product, ProductFilters, ProductRecommendation } from '@/types';

const ProductsPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [minPoints, setMinPoints] = useState<number | null>(null);
  const [maxPoints, setMaxPoints] = useState<number | null>(null);
  const [redeeming, setRedeeming] = useState<number | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const filters: ProductFilters = {};
      
      if (searchTerm) filters.search = searchTerm;
      if (minPoints) filters.min_points = minPoints;
      if (maxPoints) filters.max_points = maxPoints;
      if (user?.company) filters.company = user.company.id;

      const [productsResponse, recommendationsResponse] = await Promise.all([
        apiClient.getProducts(filters),
        apiClient.getProductRecommendations(user?.id).catch(() => [])
      ]);
      
      setProducts(productsResponse.results || []);
      setRecommendations(recommendationsResponse || []);
    } catch (err) {
      setError('Failed to load products');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm, minPoints, maxPoints, user]);

  const handleRedeem = async (productId: number) => {
    try {
      setRedeeming(productId);
      await apiClient.redeemProduct({ product_id: productId, quantity: 1 });
      
      // Show success message and refresh data
      alert('Product redeemed successfully! You can collect it from any participating store.');
      fetchData();
    } catch (err) {
      console.error('Redemption failed:', err);
      alert('Failed to redeem product. Please try again.');
    } finally {
      setRedeeming(null);
    }
  };

  const canRedeem = (product: Product) => {
    return user && user.balance >= product.points_cost;
  };

  const getRecommendationIcon = (reason: string) => {
    switch (reason) {
      case 'affordable':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'popular':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'new':
        return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'frequent_customer':
        return <Star className="h-4 w-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const getRecommendationText = (reason: string) => {
    switch (reason) {
      case 'affordable':
        return 'Within your budget';
      case 'popular':
        return 'Popular choice';
      case 'new':
        return 'New arrival';
      case 'frequent_customer':
        return 'Frequent customer bonus';
      default:
        return '';
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
            onClick={fetchData}
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Catalog</h1>
        <p className="text-gray-600">Redeem your points for amazing products from {user?.company?.name}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="bg-blue-50 px-4 py-2 rounded-lg">
            <p className="text-sm text-blue-700">
              Your Balance: <span className="font-bold">{formatPoints(user?.balance || 0)} points</span>
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Min Points */}
          <div>
            <input
              type="number"
              placeholder="Min points"
              value={minPoints || ''}
              onChange={(e) => setMinPoints(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Max Points */}
          <div>
            <input
              type="number"
              placeholder="Max points"
              value={maxPoints || ''}
              onChange={(e) => setMaxPoints(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Recommendations Toggle */}
        <div className="mt-4 flex items-center">
          <input
            type="checkbox"
            id="show-recommendations"
            checked={showRecommendations}
            onChange={(e) => setShowRecommendations(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="show-recommendations" className="ml-2 text-sm font-medium text-gray-700">
            Show recommendations for you
          </label>
        </div>
      </div>

      {/* Recommendations Section */}
      {showRecommendations && recommendations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Star className="h-5 w-5 text-yellow-500 mr-2" />
            Recommended for You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.slice(0, 3).map((rec) => (
              <div key={rec.product.id} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-sm overflow-hidden border-2 border-blue-200">
                {/* Product Image */}
                <div className="aspect-square bg-white flex items-center justify-center">
                  <Package className="h-16 w-16 text-blue-400" />
                </div>

                {/* Product Details */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg text-gray-900">{rec.product.name}</h3>
                    <div className="flex items-center text-sm text-blue-600">
                      {getRecommendationIcon(rec.reason)}
                      <span className="ml-1">{getRecommendationText(rec.reason)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{rec.product.description}</p>

                  {/* Company Info */}
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{rec.product.company_name}</span>
                  </div>

                  {/* Pricing */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-lg font-bold text-blue-600">
                        {formatPoints(rec.product.points_cost)} points
                      </div>
                      {rec.discount_percentage && (
                        <div className="text-sm text-green-600 font-medium">
                          {rec.discount_percentage}% off for you!
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Stock</div>
                      <div className="font-semibold">{rec.product.inventory}</div>
                    </div>
                  </div>

                  {/* Redeem Button */}
                  <button
                    onClick={() => handleRedeem(rec.product.id)}
                    disabled={!canRedeem(rec.product) || rec.product.inventory <= 0 || redeeming === rec.product.id}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                      canRedeem(rec.product) && rec.product.inventory > 0
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {redeeming === rec.product.id ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Redeeming...
                      </div>
                    ) : rec.product.inventory <= 0 ? (
                      'Out of Stock'
                    ) : !canRedeem(rec.product) ? (
                      'Insufficient Points'
                    ) : (
                      <div className="flex items-center justify-center">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Redeem Now
                      </div>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Products Section */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">All Products</h2>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Product Image */}
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <Package className="h-16 w-16 text-gray-400" />
              </div>

              {/* Product Details */}
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{product.description}</p>

                {/* Company Info */}
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{product.company_name}</span>
                </div>

                {/* Pricing */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-lg font-bold text-blue-600">
                      {formatPoints(product.points_cost)} points
                    </div>
                    <div className="text-sm text-gray-500">
                      Earn {formatPoints(product.points_value)} points
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Stock</div>
                    <div className="font-semibold">{product.inventory}</div>
                  </div>
                </div>

                {/* Redeem Button */}
                <button
                  onClick={() => handleRedeem(product.id)}
                  disabled={!canRedeem(product) || product.inventory <= 0 || redeeming === product.id}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    canRedeem(product) && product.inventory > 0
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {redeeming === product.id ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Redeeming...
                    </div>
                  ) : product.inventory <= 0 ? (
                    'Out of Stock'
                  ) : !canRedeem(product) ? (
                    'Insufficient Points'
                  ) : (
                    <div className="flex items-center justify-center">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Redeem
                    </div>
                  )}
                </button>

                {/* Balance Check */}
                {user && user.balance < product.points_cost && (
                  <div className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Need {formatPoints(product.points_cost - user.balance)} more points
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage; 