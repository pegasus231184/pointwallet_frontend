'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { formatPoints } from '@/lib/utils';
import { 
  Star, 
  ShoppingCart, 
  TrendingUp, 
  CheckCircle, 
  Zap, 
  Package,
  MapPin,
  AlertCircle,
  Gift,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { ProductRecommendation } from '@/types';

interface ProductRecommendationsProps {
  maxItems?: number;
  showHeader?: boolean;
  className?: string;
}

const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({
  maxItems = 6,
  showHeader = true,
  className = ''
}) => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [redeeming, setRedeeming] = useState<number | null>(null);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiClient.getProductRecommendations(user?.id);
      setRecommendations(response.slice(0, maxItems));
    } catch (err) {
      setError('Failed to load recommendations');
      console.error('Error loading recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchRecommendations();
    }
  }, [user?.id, maxItems]);

  const handleRedeem = async (productId: number) => {
    try {
      setRedeeming(productId);
      await apiClient.redeemProduct({ product_id: productId, quantity: 1 });
      
      // Show success message and refresh recommendations
      alert('Product redeemed successfully! You can collect it from any participating store.');
      fetchRecommendations();
    } catch (err) {
      console.error('Redemption failed:', err);
      alert('Failed to redeem product. Please try again.');
    } finally {
      setRedeeming(null);
    }
  };

  const canRedeem = (recommendation: ProductRecommendation) => {
    const effectiveCost = recommendation.discount_percentage 
      ? recommendation.product.points_cost * (1 - recommendation.discount_percentage / 100)
      : recommendation.product.points_cost;
    
    return user && user.balance >= effectiveCost;
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
        return <Gift className="h-4 w-4 text-gray-500" />;
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
        return 'Recommended';
    }
  };

  const getRecommendationColor = (reason: string) => {
    switch (reason) {
      case 'affordable':
        return 'bg-green-50 border-green-200';
      case 'popular':
        return 'bg-blue-50 border-blue-200';
      case 'new':
        return 'bg-yellow-50 border-yellow-200';
      case 'frequent_customer':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        {showHeader && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Sparkles className="h-5 w-5 text-yellow-500 mr-2" />
              Recommended for You
            </h2>
          </div>
        )}
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        {showHeader && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Sparkles className="h-5 w-5 text-yellow-500 mr-2" />
              Recommended for You
            </h2>
          </div>
        )}
        <div className="text-center py-8">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchRecommendations}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mx-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className={`${className}`}>
        {showHeader && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Sparkles className="h-5 w-5 text-yellow-500 mr-2" />
              Recommended for You
            </h2>
          </div>
        )}
        <div className="text-center py-8">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600">No recommendations available right now</p>
          <p className="text-sm text-gray-500 mt-1">
            Keep earning points and we'll find great products for you!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Sparkles className="h-5 w-5 text-yellow-500 mr-2" />
            Recommended for You
          </h2>
          <button
            onClick={fetchRecommendations}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Refresh
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((recommendation) => {
          const effectiveCost = recommendation.discount_percentage 
            ? recommendation.product.points_cost * (1 - recommendation.discount_percentage / 100)
            : recommendation.product.points_cost;

          return (
            <div 
              key={recommendation.product.id} 
              className={`bg-white rounded-lg shadow-sm overflow-hidden border-2 ${getRecommendationColor(recommendation.reason)} hover:shadow-md transition-shadow`}
            >
              {/* Recommendation Badge */}
              <div className="relative">
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  <Package className="h-16 w-16 text-gray-400" />
                </div>
                <div className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-sm">
                  {getRecommendationIcon(recommendation.reason)}
                </div>
                {recommendation.discount_percentage && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                    {recommendation.discount_percentage}% OFF
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg text-gray-900 flex-1">
                    {recommendation.product.name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 ml-2">
                    {getRecommendationIcon(recommendation.reason)}
                    <span className="ml-1 text-xs">{getRecommendationText(recommendation.reason)}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3">
                  {recommendation.product.description}
                </p>

                {/* Company Info */}
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{recommendation.product.company_name}</span>
                </div>

                {/* Pricing */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-lg font-bold text-blue-600">
                      {formatPoints(effectiveCost)} points
                    </div>
                    {recommendation.discount_percentage && (
                      <div className="text-sm text-gray-500 line-through">
                        {formatPoints(recommendation.product.points_cost)} points
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Stock</div>
                    <div className="font-semibold">{recommendation.product.inventory}</div>
                  </div>
                </div>

                {/* Redeem Button */}
                <button
                  onClick={() => handleRedeem(recommendation.product.id)}
                  disabled={!canRedeem(recommendation) || recommendation.product.inventory <= 0 || redeeming === recommendation.product.id}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    canRedeem(recommendation) && recommendation.product.inventory > 0
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {redeeming === recommendation.product.id ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Redeeming...
                    </div>
                  ) : recommendation.product.inventory <= 0 ? (
                    'Out of Stock'
                  ) : !canRedeem(recommendation) ? (
                    'Insufficient Points'
                  ) : (
                    <div className="flex items-center justify-center">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {recommendation.discount_percentage ? 'Redeem with Discount' : 'Redeem Now'}
                    </div>
                  )}
                </button>

                {/* Balance Check */}
                {user && user.balance < effectiveCost && (
                  <div className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Need {formatPoints(effectiveCost - user.balance)} more points
                  </div>
                )}

                {/* Recommendation Score */}
                <div className="mt-2 text-xs text-gray-500 text-center">
                  Recommendation score: {Math.round(recommendation.recommendation_score * 100)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductRecommendations; 